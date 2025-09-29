
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from datetime import datetime, timezone
from typing import Optional, List
import asyncio
from contextlib import asynccontextmanager

from models import (
    GPSLocation, TrackingResponse, VehicleListResponse, 
    AlertListResponse, HistoryQuery, LocationHistory,
    Geofence, Alert
)
from simulator import gps_simulator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import Firebase service based on environment
if os.getenv("USE_MOCK_FIREBASE", "true").lower() == "true":
    from mock_firebase import mock_firebase_service as firebase_service
    logger.info("Using Mock Firebase service for development")
else:
    from firebase_config import firebase_service
    logger.info("Using Real Firebase service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting HoyMismoGPS Backend API")
    
    # Start GPS simulator in background (for development/testing)
    if os.getenv("ENABLE_SIMULATOR", "true").lower() == "true":
        asyncio.create_task(gps_simulator.start_simulation(interval_seconds=10))
        logger.info("GPS simulator started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down HoyMismoGPS Backend API")
    gps_simulator.stop_simulation()

# Create FastAPI app
app = FastAPI(
    title="HoyMismoGPS API",
    description="Real-time GPS fleet tracking platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Dependency for API key authentication
async def validate_api_key(x_api_key: Optional[str] = Header(None)) -> dict:
    """Validate API key and return associated data"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    key_data = await firebase_service.validate_api_key(x_api_key)
    if not key_data:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return key_data

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "HoyMismoGPS API is running",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test service availability (mock or real)
        test_result = await firebase_service.get_vehicles("test_org_001")
        
        return {
            "status": "healthy",
            "service": "Mock Firebase" if hasattr(firebase_service, 'data') else "Real Firebase",
            "vehicles_test": len(test_result),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

@app.post("/api/v1/track", response_model=TrackingResponse)
async def track_vehicle(
    location: GPSLocation,
    api_key_data: dict = Depends(validate_api_key)
):
    """
    Receive GPS tracking data from devices
    
    This endpoint receives real-time GPS data from tracking devices and stores it
    in Firestore for real-time updates to the frontend dashboard.
    """
    try:
        # Verify device belongs to the API key's organization
        if location.organizationId != api_key_data.get('organizationId'):
            raise HTTPException(
                status_code=403, 
                detail="Device does not belong to your organization"
            )
        
        # Convert Pydantic model to dict
        location_dict = location.dict()
        
        # Save location to Firestore
        success = await firebase_service.save_location(location_dict)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save location data")
        
        logger.info(f"Location tracked for device {location.deviceId}")
        
        return TrackingResponse(
            success=True,
            message="Location tracked successfully",
            deviceId=location.deviceId,
            timestamp=location.timestamp
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking vehicle: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/vehicles", response_model=VehicleListResponse)
async def get_vehicles(
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    api_key_data: dict = Depends(validate_api_key)
):
    """Get all vehicles for the authenticated organization"""
    try:
        organization_id = api_key_data['organizationId']
        vehicles = await firebase_service.get_vehicles(organization_id)
        
        # Apply filters if provided
        if status:
            vehicles = [v for v in vehicles if v.get('status') == status]
        
        if vehicle_type:
            vehicles = [v for v in vehicles if v.get('vehicleType') == vehicle_type]
        
        return VehicleListResponse(
            vehicles=vehicles,
            total=len(vehicles),
            organizationId=organization_id
        )
        
    except Exception as e:
        logger.error(f"Error getting vehicles: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/history", response_model=LocationHistory)
async def get_vehicle_history(
    query: HistoryQuery,
    api_key_data: dict = Depends(validate_api_key)
):
    """Get historical location data for a vehicle"""
    try:
        # Verify organization access
        if query.organizationId != api_key_data['organizationId']:
            raise HTTPException(
                status_code=403, 
                detail="Access denied to this organization's data"
            )
        
        history = await firebase_service.get_vehicle_history(
            query.deviceId, 
            query.organizationId,
            query.startDate,
            query.endDate
        )
        
        return LocationHistory(
            locations=history,
            deviceId=query.deviceId,
            totalPoints=len(history)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting vehicle history: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/v1/geofences")
async def create_geofence(
    geofence: Geofence,
    api_key_data: dict = Depends(validate_api_key)
):
    """Create a new geofence"""
    try:
        # Verify organization
        if geofence.organizationId != api_key_data['organizationId']:
            raise HTTPException(
                status_code=403,
                detail="Cannot create geofence for different organization"
            )
        
        geofence_dict = geofence.dict()
        geofence_id = await firebase_service.create_geofence(geofence_dict)
        
        if not geofence_id:
            raise HTTPException(status_code=500, detail="Failed to create geofence")
        
        return {
            "success": True,
            "message": "Geofence created successfully",
            "geofenceId": geofence_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating geofence: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/geofences")
async def get_geofences(api_key_data: dict = Depends(validate_api_key)):
    """Get all geofences for the organization"""
    try:
        organization_id = api_key_data['organizationId']
        geofences = await firebase_service.get_geofences(organization_id)
        
        return {
            "geofences": geofences,
            "total": len(geofences),
            "organizationId": organization_id
        }
        
    except Exception as e:
        logger.error(f"Error getting geofences: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/alerts", response_model=AlertListResponse)
async def get_alerts(
    limit: int = 100,
    unread_only: bool = False,
    api_key_data: dict = Depends(validate_api_key)
):
    """Get alerts for the organization"""
    try:
        organization_id = api_key_data['organizationId']
        alerts = await firebase_service.get_alerts(organization_id, limit)
        
        if unread_only:
            alerts = [a for a in alerts if not a.get('isRead', False)]
        
        unread_count = len([a for a in alerts if not a.get('isRead', False)])
        
        return AlertListResponse(
            alerts=alerts,
            total=len(alerts),
            unread=unread_count,
            organizationId=organization_id
        )
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/simulator/status")
async def get_simulator_status():
    """Get status of GPS simulator (for development)"""
    if os.getenv("DEBUG", "false").lower() == "true":
        return {
            "running": gps_simulator.is_running,
            "vehicles": gps_simulator.get_vehicle_status()
        }
    else:
        raise HTTPException(status_code=404, detail="Simulator not available in production")

@app.post("/api/v1/simulator/control")
async def control_simulator(action: str):
    """Control GPS simulator (for development)"""
    if os.getenv("DEBUG", "false").lower() != "true":
        raise HTTPException(status_code=404, detail="Simulator not available in production")
    
    if action == "start" and not gps_simulator.is_running:
        asyncio.create_task(gps_simulator.start_simulation())
        return {"message": "Simulator started"}
    elif action == "stop":
        gps_simulator.stop_simulation()
        return {"message": "Simulator stopped"}
    else:
        return {"message": "Invalid action or simulator already in requested state"}

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8080, 
        reload=True,
        log_level="info"
    )
