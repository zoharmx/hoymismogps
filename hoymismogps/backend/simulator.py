
import asyncio
import random
import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple
import httpx
import logging

logger = logging.getLogger(__name__)

class GPSSimulator:
    """GPS data simulator for testing HoyMismoGPS platform"""
    
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.is_running = False
        self.vehicles = []
        
        # Test locations across Mexico and southern US
        self.test_locations = {
            "california": {"lat": 32.7157, "lng": -117.1611, "name": "San Diego, CA"},
            "texas": {"lat": 29.7604, "lng": -95.3698, "name": "Houston, TX"}, 
            "arizona": {"lat": 33.4484, "lng": -112.0740, "name": "Phoenix, AZ"},
            "tamaulipas": {"lat": 22.2311, "lng": -97.8470, "name": "Tampico, Tamaulipas"},
            "baja_california": {"lat": 32.6519, "lng": -115.4683, "name": "Mexicali, BC"},
            "nuevo_leon": {"lat": 25.6866, "lng": -100.3161, "name": "Monterrey, NL"}
        }
        
        # Initialize test vehicles
        self._initialize_vehicles()

    def _initialize_vehicles(self):
        """Initialize test vehicles with realistic data"""
        vehicle_types = ["truck", "car", "motorcycle", "van"]
        organization_id = "test_org_001"
        
        for i, (location_key, location_data) in enumerate(self.test_locations.items()):
            vehicle_id = f"GPS{str(i+1).zfill(3)}"
            
            vehicle = {
                "deviceId": vehicle_id,
                "organizationId": organization_id,
                "apiKey": f"test_key_{vehicle_id.lower()}",
                "vehicleType": random.choice(vehicle_types),
                "name": f"{location_data['name']} Unit",
                "currentLocation": {
                    "lat": location_data["lat"],
                    "lng": location_data["lng"]
                },
                "speed": 0.0,
                "heading": random.randint(0, 359),
                "altitude": random.randint(50, 1500),
                "isMoving": False,
                "route": self._generate_route(location_data["lat"], location_data["lng"]),
                "routeIndex": 0,
                "lastUpdate": datetime.now(timezone.utc)
            }
            
            self.vehicles.append(vehicle)
            
        logger.info(f"Initialized {len(self.vehicles)} test vehicles")

    def _generate_route(self, center_lat: float, center_lng: float, points: int = 20) -> List[Dict[str, float]]:
        """Generate a realistic route around a center point"""
        route = []
        radius = 0.05  # ~5km radius
        
        for i in range(points):
            angle = (2 * math.pi * i) / points
            offset_lat = radius * math.sin(angle) * (0.8 + 0.4 * random.random())
            offset_lng = radius * math.cos(angle) * (0.8 + 0.4 * random.random())
            
            route.append({
                "lat": center_lat + offset_lat,
                "lng": center_lng + offset_lng
            })
        
        return route

    def _calculate_speed(self, vehicle: Dict[str, Any]) -> float:
        """Calculate realistic speed based on vehicle movement"""
        if not vehicle["isMoving"]:
            return 0.0
        
        vehicle_type = vehicle["vehicleType"]
        base_speeds = {
            "truck": {"min": 40, "max": 90},
            "car": {"min": 30, "max": 120},
            "motorcycle": {"min": 25, "max": 100},
            "van": {"min": 35, "max": 95}
        }
        
        speed_range = base_speeds.get(vehicle_type, {"min": 30, "max": 90})
        return random.uniform(speed_range["min"], speed_range["max"])

    def _calculate_heading(self, current: Dict[str, float], next_point: Dict[str, float]) -> float:
        """Calculate heading between two GPS points"""
        lat1 = math.radians(current["lat"])
        lat2 = math.radians(next_point["lat"])
        lng1 = math.radians(current["lng"])
        lng2 = math.radians(next_point["lng"])
        
        dlng = lng2 - lng1
        
        y = math.sin(dlng) * math.cos(lat2)
        x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlng)
        
        heading = math.atan2(y, x)
        heading = math.degrees(heading)
        heading = (heading + 360) % 360
        
        return heading

    async def _send_gps_data(self, vehicle: Dict[str, Any]) -> bool:
        """Send GPS data to the tracking endpoint"""
        try:
            current_time = datetime.now(timezone.utc)
            
            # Prepare GPS payload
            gps_data = {
                "deviceId": vehicle["deviceId"],
                "timestamp": current_time.isoformat(),
                "latitude": vehicle["currentLocation"]["lat"],
                "longitude": vehicle["currentLocation"]["lng"],
                "speed": vehicle["speed"],
                "heading": vehicle["heading"],
                "altitude": vehicle["altitude"],
                "gpsSignalStrength": random.randint(80, 100),
                "organizationId": vehicle["organizationId"]
            }
            
            # Send to tracking endpoint
            headers = {
                "X-API-Key": vehicle["apiKey"],
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/v1/track",
                    json=gps_data,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.debug(f"GPS data sent successfully for {vehicle['deviceId']}")
                    return True
                else:
                    logger.warning(f"Failed to send GPS data for {vehicle['deviceId']}: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending GPS data for {vehicle['deviceId']}: {e}")
            return False

    def _update_vehicle_position(self, vehicle: Dict[str, Any]):
        """Update vehicle position along its route"""
        # Random chance to start/stop moving
        if random.random() < 0.1:  # 10% chance each cycle
            vehicle["isMoving"] = not vehicle["isMoving"]
            
        if not vehicle["isMoving"]:
            vehicle["speed"] = 0.0
            return
            
        # Move along route
        route = vehicle["route"]
        current_index = vehicle["routeIndex"]
        
        if current_index >= len(route):
            vehicle["routeIndex"] = 0
            current_index = 0
            
        target_point = route[current_index]
        current_pos = vehicle["currentLocation"]
        
        # Calculate movement toward target
        lat_diff = target_point["lat"] - current_pos["lat"]
        lng_diff = target_point["lng"] - current_pos["lng"]
        
        distance = math.sqrt(lat_diff**2 + lng_diff**2)
        
        if distance < 0.001:  # Close enough, move to next point
            vehicle["routeIndex"] = (current_index + 1) % len(route)
        else:
            # Move toward target
            movement_factor = 0.1  # Adjust speed of movement
            vehicle["currentLocation"]["lat"] += lat_diff * movement_factor
            vehicle["currentLocation"]["lng"] += lng_diff * movement_factor
            
            # Update heading and speed
            vehicle["heading"] = self._calculate_heading(current_pos, target_point)
            vehicle["speed"] = self._calculate_speed(vehicle)

    async def start_simulation(self, interval_seconds: int = 10):
        """Start the GPS simulation"""
        self.is_running = True
        logger.info(f"Starting GPS simulation with {len(self.vehicles)} vehicles")
        
        while self.is_running:
            try:
                # Update all vehicles
                for vehicle in self.vehicles:
                    self._update_vehicle_position(vehicle)
                    await self._send_gps_data(vehicle)
                    
                    # Small delay between vehicles
                    await asyncio.sleep(0.5)
                
                logger.info(f"Simulation cycle completed for {len(self.vehicles)} vehicles")
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                logger.error(f"Error in simulation cycle: {e}")
                await asyncio.sleep(5)

    def stop_simulation(self):
        """Stop the GPS simulation"""
        self.is_running = False
        logger.info("GPS simulation stopped")

    def get_vehicle_status(self) -> List[Dict[str, Any]]:
        """Get current status of all simulated vehicles"""
        status = []
        for vehicle in self.vehicles:
            status.append({
                "deviceId": vehicle["deviceId"],
                "name": vehicle["name"],
                "location": vehicle["currentLocation"],
                "speed": vehicle["speed"],
                "heading": vehicle["heading"],
                "isMoving": vehicle["isMoving"],
                "lastUpdate": vehicle.get("lastUpdate", datetime.now(timezone.utc))
            })
        return status

# Global simulator instance
gps_simulator = GPSSimulator()
