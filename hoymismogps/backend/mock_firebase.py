
"""
Mock Firebase service for development without Firebase credentials
This allows testing the backend API without Firebase setup
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import json
import os

logger = logging.getLogger(__name__)

class MockFirebaseService:
    """Mock Firebase service for development"""
    
    def __init__(self):
        self.data = {
            'vehicles': {},
            'organizations': {},
            'api_keys': {},
            'geofences': {},
            'alerts': {}
        }
        self._load_mock_data()
    
    def _load_mock_data(self):
        """Load mock data for development"""
        # Mock organization
        self.data['organizations']['test_org_001'] = {
            'id': 'test_org_001',
            'name': 'HoyMismoGPS Test Organization',
            'contactEmail': 'admin@hoymismogps.com',
            'isActive': True,
            'maxVehicles': 50,
            'createdAt': datetime.now(timezone.utc),
            'subscriptionPlan': 'premium'
        }
        
        # Mock API keys
        test_keys = [
            'test_key_gps001', 'test_key_gps002', 'test_key_gps003',
            'test_key_gps004', 'test_key_gps005', 'test_key_gps006'
        ]
        
        for i, key in enumerate(test_keys, 1):
            device_id = f'GPS{i:03d}'
            self.data['api_keys'][key] = {
                'deviceId': device_id,
                'organizationId': 'test_org_001',
                'keyHash': key,
                'isActive': True,
                'createdAt': datetime.now(timezone.utc),
                'lastUsed': None
            }
        
        # Mock vehicles
        test_locations = [
            {'name': 'San Diego Unit', 'location': 'California', 'type': 'truck'},
            {'name': 'Houston Unit', 'location': 'Texas', 'type': 'car'},
            {'name': 'Phoenix Unit', 'location': 'Arizona', 'type': 'van'},
            {'name': 'Tampico Unit', 'location': 'Tamaulipas', 'type': 'truck'},
            {'name': 'Mexicali Unit', 'location': 'Baja California', 'type': 'motorcycle'},
            {'name': 'Monterrey Unit', 'location': 'Nuevo León', 'type': 'truck'}
        ]
        
        for i, info in enumerate(test_locations, 1):
            device_id = f'GPS{i:03d}'
            self.data['vehicles'][device_id] = {
                'deviceId': device_id,
                'name': info['name'],
                'vehicleType': info['type'],
                'organizationId': 'test_org_001',
                'status': 'active',
                'maxSpeed': 120.0,
                'location': info['location'],
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc),
                'lastKnownLocation': None,
                'lastSeen': None
            }

    async def save_location(self, location_data: Dict[str, Any]) -> bool:
        """Save GPS location (mock implementation)"""
        try:
            device_id = location_data['deviceId']
            
            # Update vehicle with latest location
            if device_id in self.data['vehicles']:
                self.data['vehicles'][device_id]['lastKnownLocation'] = location_data
                self.data['vehicles'][device_id]['lastSeen'] = datetime.now(timezone.utc)
                self.data['vehicles'][device_id]['updatedAt'] = datetime.now(timezone.utc)
                
                logger.debug(f"Location saved for device {device_id}")
                return True
            else:
                logger.warning(f"Vehicle {device_id} not found")
                return False
                
        except Exception as e:
            logger.error(f"Failed to save location: {e}")
            return False

    async def get_vehicles(self, organization_id: str) -> List[Dict[str, Any]]:
        """Get all vehicles for an organization"""
        try:
            vehicles = []
            for vehicle_data in self.data['vehicles'].values():
                if vehicle_data.get('organizationId') == organization_id:
                    vehicles.append(vehicle_data)
            
            return vehicles
            
        except Exception as e:
            logger.error(f"Failed to get vehicles: {e}")
            return []

    async def get_vehicle_history(self, device_id: str, organization_id: str, 
                                start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get historical locations for a vehicle (mock implementation)"""
        try:
            # Mock history data
            history = []
            current_time = start_date
            
            while current_time <= end_date:
                history.append({
                    'deviceId': device_id,
                    'timestamp': current_time,
                    'latitude': 32.7157 + (len(history) * 0.001),
                    'longitude': -117.1611 + (len(history) * 0.001),
                    'speed': 45.5,
                    'heading': 90,
                    'altitude': 120,
                    'organizationId': organization_id
                })
                current_time += timezone.utc.localize(datetime.fromtimestamp(
                    current_time.timestamp() + 300
                )) - current_time  # 5 minute intervals
                
                if len(history) >= 20:  # Limit for demo
                    break
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get vehicle history: {e}")
            return []

    async def create_geofence(self, geofence_data: Dict[str, Any]) -> str:
        """Create a new geofence"""
        try:
            geofence_id = f"geo_{len(self.data['geofences'])}"
            geofence_data['id'] = geofence_id
            self.data['geofences'][geofence_id] = geofence_data
            
            logger.info(f"Geofence created with ID: {geofence_id}")
            return geofence_id
            
        except Exception as e:
            logger.error(f"Failed to create geofence: {e}")
            return None

    async def get_geofences(self, organization_id: str) -> List[Dict[str, Any]]:
        """Get all geofences for an organization"""
        try:
            geofences = []
            for geofence_data in self.data['geofences'].values():
                if geofence_data.get('organizationId') == organization_id:
                    geofences.append(geofence_data)
            
            return geofences
            
        except Exception as e:
            logger.error(f"Failed to get geofences: {e}")
            return []

    async def create_alert(self, alert_data: Dict[str, Any]) -> str:
        """Create a new alert"""
        try:
            alert_id = f"alert_{len(self.data['alerts'])}"
            alert_data['id'] = alert_id
            self.data['alerts'][alert_id] = alert_data
            
            logger.info(f"Alert created with ID: {alert_id}")
            return alert_id
            
        except Exception as e:
            logger.error(f"Failed to create alert: {e}")
            return None

    async def get_alerts(self, organization_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent alerts for an organization"""
        try:
            alerts = []
            for alert_data in self.data['alerts'].values():
                if alert_data.get('organizationId') == organization_id:
                    alerts.append(alert_data)
            
            # Sort by created time (newest first) and limit
            alerts.sort(key=lambda x: x.get('createdAt', datetime.min), reverse=True)
            return alerts[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get alerts: {e}")
            return []

    async def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Validate API key and return associated data"""
        try:
            key_data = self.data['api_keys'].get(api_key)
            if key_data and key_data.get('isActive'):
                # Update last used timestamp
                key_data['lastUsed'] = datetime.now(timezone.utc)
                return key_data
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to validate API key: {e}")
            return None

# Global mock Firebase service instance
mock_firebase_service = MockFirebaseService()
