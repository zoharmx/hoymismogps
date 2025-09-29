#!/usr/bin/env python3
"""
HoyMismoGPS - Generador de Trayectorias GPS Realistas
Genera rutas simuladas para vehículos en múltiples ubicaciones
"""

import random
import math
import json
import datetime
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Dict, Optional
import requests
import time

@dataclass
class Location:
    """Representa una ubicación geográfica"""
    name: str
    lat: float
    lng: float
    radius_km: float = 50  # Radio de operación en km

@dataclass
class GPSPoint:
    """Representa un punto GPS con timestamp"""
    lat: float
    lng: float
    timestamp: datetime.datetime
    speed_kmh: float
    heading: float
    accuracy: float = 5.0
    
    def to_dict(self) -> Dict:
        return {
            "lat": self.lat,
            "lng": self.lng,
            "timestamp": self.timestamp.isoformat(),
            "speed_kmh": self.speed_kmh,
            "heading": self.heading,
            "accuracy": self.accuracy
        }

class GPSTrajectoryGenerator:
    """Generador de trayectorias GPS realistas"""
    
    # Ubicaciones definidas por el usuario
    LOCATIONS = {
        # California
        "los_angeles": Location("Los Ángeles, CA", 34.0522, -118.2437, 80),
        "san_francisco": Location("San Francisco, CA", 37.7749, -122.4194, 60),
        "san_diego": Location("San Diego, CA", 32.7157, -117.1611, 50),
        
        # Texas
        "houston": Location("Houston, TX", 29.7604, -95.3698, 70),
        "dallas": Location("Dallas, TX", 32.7767, -96.7970, 60),
        "austin": Location("Austin, TX", 30.2672, -97.7431, 40),
        
        # Arizona
        "phoenix": Location("Phoenix, AZ", 33.4484, -112.0740, 60),
        "tucson": Location("Tucson, AZ", 32.2226, -110.9747, 30),
        
        # Tamaulipas, México
        "tampico": Location("Tampico, Tamaulipas", 22.2331, -97.8610, 30),
        "reynosa": Location("Reynosa, Tamaulipas", 26.0801, -98.2775, 25),
        "matamoros": Location("Matamoros, Tamaulipas", 25.8695, -97.5030, 25),
        
        # Baja California Norte, México
        "tijuana": Location("Tijuana, BC", 32.5149, -117.0382, 40),
        "mexicali": Location("Mexicali, BC", 32.6245, -115.4523, 35),
        "ensenada": Location("Ensenada, BC", 31.8670, -116.5956, 25),
        
        # Nuevo León, México
        "monterrey": Location("Monterrey, NL", 25.6866, -100.3161, 50),
        "san_nicolas": Location("San Nicolás, NL", 25.7481, -100.2761, 20),
        "guadalupe": Location("Guadalupe, NL", 25.6767, -100.2561, 15)
    }
    
    def __init__(self):
        self.street_patterns = self._initialize_street_patterns()
        
    def _initialize_street_patterns(self) -> Dict:
        """Inicializa patrones de calles para cada ciudad"""
        return {
            # Patrones típicos de calles por ciudad (grid vs orgánico)
            "grid_cities": ["los_angeles", "phoenix", "houston", "dallas"],
            "organic_cities": ["san_francisco", "san_diego", "austin", "tucson"],
            "mixed_cities": ["tampico", "reynosa", "matamoros", "tijuana", "mexicali", 
                           "ensenada", "monterrey", "san_nicolas", "guadalupe"]
        }
    
    def generate_realistic_route(self, 
                                location_key: str, 
                                duration_hours: float = 2.0,
                                avg_speed_kmh: float = 45) -> List[GPSPoint]:
        """
        Genera una ruta realista en una ubicación específica
        
        Args:
            location_key: Clave de la ubicación (ej: 'los_angeles')
            duration_hours: Duración del recorrido en horas
            avg_speed_kmh: Velocidad promedio en km/h
            
        Returns:
            Lista de puntos GPS simulando una ruta realista
        """
        if location_key not in self.LOCATIONS:
            raise ValueError(f"Ubicación '{location_key}' no encontrada")
            
        location = self.LOCATIONS[location_key]
        route = []
        
        # Punto de inicio aleatorio dentro del área
        start_lat, start_lng = self._get_random_point_in_area(location)
        current_time = datetime.datetime.now()
        
        # Configuración de la ruta
        total_distance_km = duration_hours * avg_speed_kmh
        points_count = int(duration_hours * 3600 / 30)  # Un punto cada 30 segundos
        
        current_lat, current_lng = start_lat, start_lng
        current_heading = random.uniform(0, 360)
        
        for i in range(points_count):
            # Variaciones realistas de velocidad
            speed_variation = random.uniform(-15, 15)
            current_speed = max(0, avg_speed_kmh + speed_variation)
            
            # Simular paradas en semáforos/tráfico
            if random.random() < 0.05:  # 5% probabilidad de parada
                current_speed = random.uniform(0, 10)
            
            # Simular autopistas (velocidades más altas)
            if random.random() < 0.15:  # 15% en autopista
                current_speed = random.uniform(70, 110)
            
            # Cambios de dirección realistas
            if random.random() < 0.2:  # 20% probabilidad de cambio de dirección
                heading_change = random.uniform(-45, 45)
                current_heading = (current_heading + heading_change) % 360
            
            # Pequeñas desviaciones continuas
            current_heading += random.uniform(-5, 5)
            current_heading = current_heading % 360
            
            # Calcular nueva posición
            distance_step_km = (current_speed / 3600) * 30 / 1000  # Distancia en 30 seg
            new_lat, new_lng = self._move_point(
                current_lat, current_lng, 
                current_heading, distance_step_km
            )
            
            # Mantener dentro del área de operación
            if self._distance_km(new_lat, new_lng, location.lat, location.lng) > location.radius_km:
                # Regresar hacia el centro
                center_heading = self._calculate_bearing(new_lat, new_lng, location.lat, location.lng)
                current_heading = center_heading + random.uniform(-30, 30)
                new_lat, new_lng = self._move_point(
                    current_lat, current_lng,
                    current_heading, distance_step_km
                )
            
            # Crear punto GPS
            gps_point = GPSPoint(
                lat=new_lat,
                lng=new_lng,
                timestamp=current_time,
                speed_kmh=current_speed,
                heading=current_heading,
                accuracy=random.uniform(3.0, 8.0)
            )
            
            route.append(gps_point)
            
            # Actualizar posición y tiempo
            current_lat, current_lng = new_lat, new_lng
            current_time += datetime.timedelta(seconds=30)
        
        return route
    
    def _get_random_point_in_area(self, location: Location) -> Tuple[float, float]:
        """Genera un punto aleatorio dentro del área de operación"""
        # Convertir radio a grados aproximados
        lat_range = location.radius_km / 111.0  # 1 grado lat ≈ 111 km
        lng_range = location.radius_km / (111.0 * math.cos(math.radians(location.lat)))
        
        lat = location.lat + random.uniform(-lat_range, lat_range)
        lng = location.lng + random.uniform(-lng_range, lng_range)
        
        return lat, lng
    
    def _move_point(self, lat: float, lng: float, 
                   heading_deg: float, distance_km: float) -> Tuple[float, float]:
        """Mueve un punto geográfico en una dirección y distancia específica"""
        # Convertir a radianes
        lat_rad = math.radians(lat)
        lng_rad = math.radians(lng)
        heading_rad = math.radians(heading_deg)
        
        # Radio de la Tierra en km
        R = 6371.0
        
        # Calcular nueva latitud
        new_lat_rad = math.asin(
            math.sin(lat_rad) * math.cos(distance_km / R) +
            math.cos(lat_rad) * math.sin(distance_km / R) * math.cos(heading_rad)
        )
        
        # Calcular nueva longitud
        new_lng_rad = lng_rad + math.atan2(
            math.sin(heading_rad) * math.sin(distance_km / R) * math.cos(lat_rad),
            math.cos(distance_km / R) - math.sin(lat_rad) * math.sin(new_lat_rad)
        )
        
        return math.degrees(new_lat_rad), math.degrees(new_lng_rad)
    
    def _distance_km(self, lat1: float, lng1: float, 
                    lat2: float, lng2: float) -> float:
        """Calcula la distancia entre dos puntos en kilómetros"""
        R = 6371.0  # Radio de la Tierra en km
        
        lat1_rad, lng1_rad = math.radians(lat1), math.radians(lng1)
        lat2_rad, lng2_rad = math.radians(lat2), math.radians(lng2)
        
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        
        a = (math.sin(dlat/2)**2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def _calculate_bearing(self, lat1: float, lng1: float, 
                          lat2: float, lng2: float) -> float:
        """Calcula el rumbo entre dos puntos"""
        lat1_rad, lng1_rad = math.radians(lat1), math.radians(lng1)
        lat2_rad, lng2_rad = math.radians(lat2), math.radians(lng2)
        
        dlng = lng2_rad - lng1_rad
        
        y = math.sin(dlng) * math.cos(lat2_rad)
        x = (math.cos(lat1_rad) * math.sin(lat2_rad) - 
             math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlng))
        
        bearing_rad = math.atan2(y, x)
        bearing_deg = math.degrees(bearing_rad)
        
        return (bearing_deg + 360) % 360

    def generate_multi_vehicle_routes(self, 
                                    vehicle_count: int = 20,
                                    hours_per_route: float = 8.0) -> Dict[str, List[GPSPoint]]:
        """
        Genera rutas para múltiples vehículos distribuidos en todas las ubicaciones
        
        Args:
            vehicle_count: Número total de vehículos a simular
            hours_per_route: Horas de recorrido por vehículo
            
        Returns:
            Diccionario con rutas por vehículo {vehicle_id: [GPSPoint]}
        """
        vehicles_routes = {}
        locations_list = list(self.LOCATIONS.keys())
        
        for i in range(vehicle_count):
            # Distribuir vehículos entre ubicaciones
            location_key = locations_list[i % len(locations_list)]
            
            # Tipos de vehículo con velocidades características
            vehicle_types = {
                "truck": {"avg_speed": 65, "prefix": "TRK"},
                "car": {"avg_speed": 55, "prefix": "CAR"}, 
                "motorcycle": {"avg_speed": 45, "prefix": "MTR"}
            }
            
            vehicle_type = random.choice(list(vehicle_types.keys()))
            type_config = vehicle_types[vehicle_type]
            
            vehicle_id = f"{type_config['prefix']}-{i+1:03d}"
            
            # Generar ruta específica para este vehículo
            route = self.generate_realistic_route(
                location_key=location_key,
                duration_hours=hours_per_route,
                avg_speed_kmh=type_config["avg_speed"] + random.uniform(-10, 10)
            )
            
            vehicles_routes[vehicle_id] = {
                "route": route,
                "location": location_key,
                "type": vehicle_type,
                "organization": f"org_{random.randint(1, 5)}"  # 5 organizaciones
            }
        
        return vehicles_routes
    
    def save_routes_to_files(self, routes: Dict, output_dir: str = "/tmp/gps_routes"):
        """Guarda las rutas generadas en archivos JSON"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        for vehicle_id, vehicle_data in routes.items():
            route_data = {
                "vehicle_id": vehicle_id,
                "location": vehicle_data["location"],
                "type": vehicle_data["type"], 
                "organization": vehicle_data["organization"],
                "route_points": [point.to_dict() for point in vehicle_data["route"]],
                "generated_at": datetime.datetime.now().isoformat()
            }
            
            filename = f"{output_dir}/{vehicle_id}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(route_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Rutas guardadas en {output_dir}")
        print(f"📊 {len(routes)} vehículos generados")

def main():
    """Función principal para generar datos de prueba"""
    print("🚀 Generador de Trayectorias GPS - HoyMismoGPS")
    print("=" * 50)
    
    generator = GPSTrajectoryGenerator()
    
    # Mostrar ubicaciones disponibles
    print("\n📍 Ubicaciones disponibles:")
    for key, location in generator.LOCATIONS.items():
        print(f"  • {location.name} ({key})")
    
    # Generar rutas para múltiples vehículos
    print(f"\n🔄 Generando rutas para 20 vehículos...")
    routes = generator.generate_multi_vehicle_routes(
        vehicle_count=20,
        hours_per_route=8.0
    )
    
    # Guardar rutas
    output_dir = "/home/ubuntu/HoyMismoGPS/data-simulators/generated_routes"
    generator.save_routes_to_files(routes, output_dir)
    
    # Estadísticas
    total_points = sum(len(v["route"]) for v in routes.values())
    print(f"\n📈 Estadísticas generadas:")
    print(f"  • Vehículos: {len(routes)}")
    print(f"  • Puntos GPS totales: {total_points:,}")
    print(f"  • Ubicaciones cubiertas: {len(set(v['location'] for v in routes.values()))}")
    
    return routes

if __name__ == "__main__":
    routes = main()
