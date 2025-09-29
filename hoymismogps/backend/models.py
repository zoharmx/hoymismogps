
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class VehicleStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

class VehicleType(str, Enum):
    TRUCK = "truck"
    CAR = "car"
    MOTORCYCLE = "motorcycle"
    VAN = "van"
    BUS = "bus"

class AlertType(str, Enum):
    GEOFENCE_ENTRY = "geofence_entry"
    GEOFENCE_EXIT = "geofence_exit"
    SPEEDING = "speeding"
    OFFLINE = "offline"
    LOW_BATTERY = "low_battery"

# GPS Tracking Models
class GPSLocation(BaseModel):
    """GPS location data from tracking device"""
    deviceId: str = Field(..., min_length=3, max_length=50, description="Unique device identifier")
    timestamp: datetime = Field(..., description="GPS timestamp")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")
    speed: float = Field(default=0.0, ge=0, le=300, description="Speed in km/h")
    heading: float = Field(default=0.0, ge=0, lt=360, description="Heading in degrees (0-359)")
    altitude: Optional[float] = Field(default=None, ge=-500, le=10000, description="Altitude in meters")
    gpsSignalStrength: Optional[int] = Field(default=None, ge=0, le=100, description="GPS signal strength percentage")
    organizationId: str = Field(..., min_length=3, max_length=50, description="Organization ID for multi-tenant")

    @validator('speed')
    def validate_speed(cls, v):
        if v < 0:
            raise ValueError('Speed cannot be negative')
        return round(v, 2)

    @validator('latitude', 'longitude')
    def validate_coordinates(cls, v):
        return round(v, 6)  # 6 decimal places for GPS precision

class VehicleInfo(BaseModel):
    """Vehicle metadata and configuration"""
    deviceId: str
    name: str = Field(..., min_length=1, max_length=100)
    vehicleType: VehicleType
    licensePlate: Optional[str] = None
    driver: Optional[str] = None
    organizationId: str
    status: VehicleStatus = VehicleStatus.ACTIVE
    maxSpeed: Optional[float] = Field(default=120.0, description="Speed limit for this vehicle")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class VehicleWithLocation(VehicleInfo):
    """Vehicle info with current location"""
    lastKnownLocation: Optional[GPSLocation] = None
    batteryLevel: Optional[int] = Field(default=None, ge=0, le=100)
    lastSeen: Optional[datetime] = None

# Geofence Models
class GeofenceCoordinate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class Geofence(BaseModel):
    """Geofence definition"""
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=100)
    organizationId: str
    coordinates: List[GeofenceCoordinate] = Field(..., min_items=3)
    description: Optional[str] = None
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: str  # User ID who created the geofence

# Alert Models
class Alert(BaseModel):
    """Alert/notification model"""
    id: Optional[str] = None
    organizationId: str
    deviceId: str
    vehicleName: Optional[str] = None
    alertType: AlertType
    title: str
    message: str
    location: Optional[GPSLocation] = None
    geofenceId: Optional[str] = None  # If related to geofence
    isRead: bool = False
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    acknowledgedAt: Optional[datetime] = None
    acknowledgedBy: Optional[str] = None

# API Response Models
class TrackingResponse(BaseModel):
    """Response for GPS tracking endpoint"""
    success: bool
    message: str
    deviceId: str
    timestamp: datetime
    processed_at: datetime = Field(default_factory=datetime.utcnow)

class VehicleListResponse(BaseModel):
    """Response for vehicle listing"""
    vehicles: List[VehicleWithLocation]
    total: int
    organizationId: str

class AlertListResponse(BaseModel):
    """Response for alert listing"""
    alerts: List[Alert]
    total: int
    unread: int
    organizationId: str

# Authentication Models
class APIKeyData(BaseModel):
    """API Key validation data"""
    deviceId: str
    organizationId: str
    keyHash: str
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    lastUsed: Optional[datetime] = None

class OrganizationInfo(BaseModel):
    """Organization/tenant information"""
    id: str
    name: str
    contactEmail: str
    isActive: bool = True
    maxVehicles: int = Field(default=50)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    subscription_plan: str = Field(default="basic")

# Historical Data Models
class HistoryQuery(BaseModel):
    """Query parameters for historical data"""
    deviceId: str
    startDate: datetime
    endDate: datetime
    organizationId: str

class LocationHistory(BaseModel):
    """Historical location data response"""
    locations: List[GPSLocation]
    deviceId: str
    totalPoints: int
    distance: Optional[float] = None  # Total distance in km
    duration: Optional[int] = None    # Duration in seconds
