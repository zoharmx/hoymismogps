
import os
import json
import logging
from typing import Optional, Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class FirebaseService:
    """Firebase service for Firestore operations and authentication"""
    
    def __init__(self):
        self.db: Optional[firestore.Client] = None
        self.app: Optional[firebase_admin.App] = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.app = firebase_admin.get_app()
            else:
                # Initialize with service account (for production) or default credentials
                if os.getenv('FIREBASE_PRIVATE_KEY'):
                    # Use environment variables for service account
                    service_account_info = {
                        "type": "service_account",
                        "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                        "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                        "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL')}"
                    }
                    cred = credentials.Certificate(service_account_info)
                else:
                    # Use default credentials (for local development)
                    cred = credentials.ApplicationDefault()
                
                self.app = firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            logger.info("Firebase initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise

    async def save_location(self, location_data: Dict[str, Any]) -> bool:
        """Save GPS location to Firestore with multi-tenant security"""
        try:
            device_id = location_data['deviceId']
            organization_id = location_data['organizationId']
            timestamp = location_data['timestamp']
            
            # Update current location in vehicles collection
            vehicle_ref = self.db.collection('vehicles').document(device_id)
            
            # Prepare the location data
            location_update = {
                'deviceId': device_id,
                'organizationId': organization_id,
                'lastKnownLocation': location_data,
                'lastSeen': timestamp,
                'updatedAt': datetime.now(timezone.utc)
            }
            
            # Update or create vehicle document
            vehicle_ref.set(location_update, merge=True)
            
            # Save to history subcollection
            history_ref = vehicle_ref.collection('history').document(str(int(timestamp.timestamp() * 1000)))
            history_ref.set(location_data)
            
            logger.debug(f"Location saved for device {device_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save location: {e}")
            return False

    async def get_vehicles(self, organization_id: str) -> List[Dict[str, Any]]:
        """Get all vehicles for an organization"""
        try:
            vehicles_ref = self.db.collection('vehicles')
            query = vehicles_ref.where('organizationId', '==', organization_id)
            
            vehicles = []
            docs = query.stream()
            
            for doc in docs:
                vehicle_data = doc.to_dict()
                vehicle_data['id'] = doc.id
                vehicles.append(vehicle_data)
            
            return vehicles
            
        except Exception as e:
            logger.error(f"Failed to get vehicles: {e}")
            return []

    async def get_vehicle_history(self, device_id: str, organization_id: str, 
                                start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get historical locations for a vehicle"""
        try:
            # Verify vehicle belongs to organization
            vehicle_ref = self.db.collection('vehicles').document(device_id)
            vehicle_doc = vehicle_ref.get()
            
            if not vehicle_doc.exists:
                return []
            
            vehicle_data = vehicle_doc.to_dict()
            if vehicle_data.get('organizationId') != organization_id:
                return []
            
            # Query history collection
            history_ref = vehicle_ref.collection('history')
            
            # Convert timestamps for querying
            start_timestamp = int(start_date.timestamp() * 1000)
            end_timestamp = int(end_date.timestamp() * 1000)
            
            query = history_ref.where(firestore.FieldFilter('timestamp', '>=', start_date))\
                             .where(firestore.FieldFilter('timestamp', '<=', end_date))\
                             .order_by('timestamp')
            
            history = []
            docs = query.stream()
            
            for doc in docs:
                location_data = doc.to_dict()
                history.append(location_data)
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get vehicle history: {e}")
            return []

    async def create_geofence(self, geofence_data: Dict[str, Any]) -> str:
        """Create a new geofence"""
        try:
            geofences_ref = self.db.collection('geofences')
            doc_ref = geofences_ref.add(geofence_data)
            
            logger.info(f"Geofence created with ID: {doc_ref[1].id}")
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"Failed to create geofence: {e}")
            return None

    async def get_geofences(self, organization_id: str) -> List[Dict[str, Any]]:
        """Get all geofences for an organization"""
        try:
            geofences_ref = self.db.collection('geofences')
            query = geofences_ref.where('organizationId', '==', organization_id)\
                                .where('isActive', '==', True)
            
            geofences = []
            docs = query.stream()
            
            for doc in docs:
                geofence_data = doc.to_dict()
                geofence_data['id'] = doc.id
                geofences.append(geofence_data)
            
            return geofences
            
        except Exception as e:
            logger.error(f"Failed to get geofences: {e}")
            return []

    async def create_alert(self, alert_data: Dict[str, Any]) -> str:
        """Create a new alert"""
        try:
            alerts_ref = self.db.collection('alerts')
            doc_ref = alerts_ref.add(alert_data)
            
            logger.info(f"Alert created with ID: {doc_ref[1].id}")
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"Failed to create alert: {e}")
            return None

    async def get_alerts(self, organization_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent alerts for an organization"""
        try:
            alerts_ref = self.db.collection('alerts')
            query = alerts_ref.where('organizationId', '==', organization_id)\
                             .order_by('createdAt', direction=firestore.Query.DESCENDING)\
                             .limit(limit)
            
            alerts = []
            docs = query.stream()
            
            for doc in docs:
                alert_data = doc.to_dict()
                alert_data['id'] = doc.id
                alerts.append(alert_data)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Failed to get alerts: {e}")
            return []

    async def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Validate API key and return associated data"""
        try:
            api_keys_ref = self.db.collection('api_keys')
            query = api_keys_ref.where('keyHash', '==', api_key)\
                              .where('isActive', '==', True)
            
            docs = list(query.stream())
            
            if not docs:
                return None
            
            key_data = docs[0].to_dict()
            
            # Update last used timestamp
            docs[0].reference.update({'lastUsed': datetime.now(timezone.utc)})
            
            return key_data
            
        except Exception as e:
            logger.error(f"Failed to validate API key: {e}")
            return None

# Global Firebase service instance
firebase_service = FirebaseService()
