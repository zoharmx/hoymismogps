
#!/usr/bin/env python3
"""
Database initialization script for HoyMismoGPS
Creates test data and API keys for development
"""

import asyncio
import logging
from datetime import datetime, timezone
import os
import sys

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from firebase_config import firebase_service
from models import VehicleType, VehicleStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_test_organization():
    """Create test organization"""
    try:
        org_data = {
            "id": "test_org_001",
            "name": "HoyMismoGPS Test Organization",
            "contactEmail": "admin@hoymismogps.com",
            "isActive": True,
            "maxVehicles": 50,
            "createdAt": datetime.now(timezone.utc),
            "subscriptionPlan": "premium"
        }
        
        org_ref = firebase_service.db.collection('organizations').document('test_org_001')
        org_ref.set(org_data)
        
        logger.info("✅ Test organization created")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to create test organization: {e}")
        return False

async def create_api_keys():
    """Create API keys for test devices"""
    try:
        test_devices = [
            {"deviceId": "GPS001", "key": "test_key_gps001"},
            {"deviceId": "GPS002", "key": "test_key_gps002"}, 
            {"deviceId": "GPS003", "key": "test_key_gps003"},
            {"deviceId": "GPS004", "key": "test_key_gps004"},
            {"deviceId": "GPS005", "key": "test_key_gps005"},
            {"deviceId": "GPS006", "key": "test_key_gps006"}
        ]
        
        for device in test_devices:
            api_key_data = {
                "deviceId": device["deviceId"],
                "organizationId": "test_org_001",
                "keyHash": device["key"],  # In production, this should be hashed
                "isActive": True,
                "createdAt": datetime.now(timezone.utc),
                "lastUsed": None
            }
            
            key_ref = firebase_service.db.collection('api_keys').add(api_key_data)
            logger.info(f"✅ API key created for {device['deviceId']}")
        
        logger.info("✅ All API keys created successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to create API keys: {e}")
        return False

async def create_test_vehicles():
    """Create test vehicle metadata"""
    try:
        # Test locations from simulator
        test_locations = {
            "GPS001": {"name": "San Diego Unit", "location": "California", "type": VehicleType.TRUCK},
            "GPS002": {"name": "Houston Unit", "location": "Texas", "type": VehicleType.CAR},
            "GPS003": {"name": "Phoenix Unit", "location": "Arizona", "type": VehicleType.VAN},
            "GPS004": {"name": "Tampico Unit", "location": "Tamaulipas", "type": VehicleType.TRUCK},
            "GPS005": {"name": "Mexicali Unit", "location": "Baja California", "type": VehicleType.MOTORCYCLE},
            "GPS006": {"name": "Monterrey Unit", "location": "Nuevo León", "type": VehicleType.TRUCK}
        }
        
        for device_id, info in test_locations.items():
            vehicle_data = {
                "deviceId": device_id,
                "name": info["name"],
                "vehicleType": info["type"],
                "organizationId": "test_org_001",
                "status": VehicleStatus.ACTIVE,
                "maxSpeed": 120.0,
                "location": info["location"],
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc)
            }
            
            vehicle_ref = firebase_service.db.collection('vehicles').document(device_id)
            vehicle_ref.set(vehicle_data, merge=True)
            
            logger.info(f"✅ Vehicle {device_id} ({info['name']}) created")
        
        logger.info("✅ All test vehicles created")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to create test vehicles: {e}")
        return False

async def create_test_geofences():
    """Create sample geofences"""
    try:
        test_geofences = [
            {
                "name": "Warehouse San Diego",
                "organizationId": "test_org_001",
                "coordinates": [
                    {"latitude": 32.7157, "longitude": -117.1611},
                    {"latitude": 32.7257, "longitude": -117.1511},
                    {"latitude": 32.7257, "longitude": -117.1711},
                    {"latitude": 32.7057, "longitude": -117.1711}
                ],
                "description": "Main warehouse in San Diego",
                "isActive": True,
                "createdAt": datetime.now(timezone.utc),
                "createdBy": "admin_user"
            },
            {
                "name": "Houston Distribution Center",
                "organizationId": "test_org_001",
                "coordinates": [
                    {"latitude": 29.7604, "longitude": -95.3698},
                    {"latitude": 29.7704, "longitude": -95.3598},
                    {"latitude": 29.7704, "longitude": -95.3798},
                    {"latitude": 29.7504, "longitude": -95.3798}
                ],
                "description": "Distribution center in Houston",
                "isActive": True,
                "createdAt": datetime.now(timezone.utc),
                "createdBy": "admin_user"
            }
        ]
        
        for geofence in test_geofences:
            geo_ref = firebase_service.db.collection('geofences').add(geofence)
            logger.info(f"✅ Geofence '{geofence['name']}' created")
        
        logger.info("✅ All test geofences created")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to create test geofences: {e}")
        return False

async def main():
    """Initialize the complete test database"""
    logger.info("🚀 Starting database initialization for HoyMismoGPS...")
    
    # Set required environment variables for Firebase
    os.environ['FIREBASE_PROJECT_ID'] = 'hoymismogps'
    os.environ['DEBUG'] = 'true'
    os.environ['ENVIRONMENT'] = 'development'
    
    try:
        # Initialize Firebase service
        firebase_service._initialize_firebase()
        
        # Create test data
        await create_test_organization()
        await create_api_keys()  
        await create_test_vehicles()
        await create_test_geofences()
        
        logger.info("🎉 Database initialization completed successfully!")
        
        # Print useful information
        print("\n" + "="*60)
        print("🔧 HOYMISMOGPS DEVELOPMENT SETUP COMPLETED")
        print("="*60)
        print("📱 Test API Keys:")
        print("  GPS001: test_key_gps001 (San Diego)")
        print("  GPS002: test_key_gps002 (Houston)")
        print("  GPS003: test_key_gps003 (Phoenix)")
        print("  GPS004: test_key_gps004 (Tampico)")
        print("  GPS005: test_key_gps005 (Mexicali)")
        print("  GPS006: test_key_gps006 (Monterrey)")
        print()
        print("🏢 Organization: test_org_001")
        print("🗄️  Firebase Project: hoymismogps")
        print()
        print("🚀 Ready to start FastAPI server:")
        print("  cd /home/ubuntu/hoymismogps/backend")
        print("  python main.py")
        print("="*60)
        
        return True
        
    except Exception as e:
        logger.error(f"💥 Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(main())
