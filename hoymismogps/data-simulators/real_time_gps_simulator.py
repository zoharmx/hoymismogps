#!/usr/bin/env python3
"""
HoyMismoGPS - Simulador GPS en Tiempo Real
Simula 20 dispositivos GPS enviando datos cada 10 segundos al backend
"""

import asyncio
import aiohttp
import json
import random
import datetime
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import math
import time
import signal
import sys
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/ubuntu/HoyMismoGPS/logs/gps_simulator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('GPSSimulator')

@dataclass
class GPSReading:
    """Representa una lectura GPS actual"""
    device_id: str
    organization_id: str
    lat: float
    lng: float
    speed_kmh: float
    heading: float
    timestamp: str
    accuracy: float
    altitude: float
    satellites: int
    battery_level: int
    signal_strength: int
    ignition: bool
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class VehicleState:
    """Estado actual de un vehículo simulado"""
    vehicle_id: str
    organization_id: str
    route_points: List[Dict]
    current_index: int
    is_online: bool
    last_update: datetime.datetime
    speed_kmh: float
    heading: float
    battery_level: int
    ignition: bool
    idle_minutes: int
    daily_distance_km: float

class RealTimeGPSSimulator:
    """Simulador GPS principal"""
    
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.vehicles: Dict[str, VehicleState] = {}
        self.session: Optional[aiohttp.ClientSession] = None
        self.running = False
        self.update_interval = 10  # segundos
        
        # Estadísticas del simulador
        self.stats = {
            "total_readings_sent": 0,
            "successful_transmissions": 0,
            "failed_transmissions": 0,
            "start_time": None,
            "vehicles_active": 0,
            "vehicles_offline": 0
        }
        
        # Configuración de simulación realista
        self.simulation_config = {
            "offline_probability": 0.02,  # 2% probabilidad de desconexión
            "reconnect_probability": 0.3,  # 30% probabilidad de reconexión
            "speed_variation_range": 0.15,  # ±15% variación de velocidad
            "battery_drain_rate": 0.1,  # % por hora
            "signal_strength_variation": 10,  # Variación en señal
            "gps_accuracy_base": 3.0,  # Precisión GPS base en metros
            "idle_threshold_minutes": 5,  # Umbral para considerar idle
        }
        
    async def initialize(self):
        """Inicializa el simulador"""
        logger.info("🚀 Inicializando Simulador GPS HoyMismoGPS")
        
        # Crear sesión HTTP
        connector = aiohttp.TCPConnector(limit=50, limit_per_host=20)
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self.session = aiohttp.ClientSession(
            connector=connector, 
            timeout=timeout,
            headers={"User-Agent": "HoyMismoGPS-Simulator/1.0"}
        )
        
        # Cargar datos de vehículos y rutas
        await self.load_vehicle_routes()
        
        # Verificar conexión con backend
        await self.test_backend_connection()
        
        self.stats["start_time"] = datetime.datetime.now()
        logger.info(f"✅ Simulador inicializado con {len(self.vehicles)} vehículos")
        
    async def load_vehicle_routes(self):
        """Carga las rutas de vehículos generadas previamente"""
        routes_dir = Path("/home/ubuntu/HoyMismoGPS/data-simulators/generated_routes")
        
        if not routes_dir.exists():
            logger.warning("⚠️ Directorio de rutas no encontrado, generando rutas...")
            # Ejecutar el generador de rutas
            from gps_trajectory_generator import GPSTrajectoryGenerator
            generator = GPSTrajectoryGenerator()
            routes = generator.generate_multi_vehicle_routes(20, 8.0)
            generator.save_routes_to_files(routes, str(routes_dir))
        
        # Cargar archivos de rutas
        route_files = list(routes_dir.glob("*.json"))
        logger.info(f"📁 Cargando {len(route_files)} archivos de rutas...")
        
        for route_file in route_files:
            try:
                with open(route_file, 'r', encoding='utf-8') as f:
                    route_data = json.load(f)
                
                vehicle_id = route_data["vehicle_id"]
                
                # Crear estado inicial del vehículo
                vehicle_state = VehicleState(
                    vehicle_id=vehicle_id,
                    organization_id=route_data["organization"],
                    route_points=route_data["route_points"],
                    current_index=0,
                    is_online=random.choice([True, True, True, False]),  # 75% online
                    last_update=datetime.datetime.now(),
                    speed_kmh=0.0,
                    heading=0.0,
                    battery_level=random.randint(20, 100),
                    ignition=random.choice([True, False]),
                    idle_minutes=0,
                    daily_distance_km=0.0
                )
                
                self.vehicles[vehicle_id] = vehicle_state
                
            except Exception as e:
                logger.error(f"❌ Error cargando ruta {route_file}: {e}")
        
        logger.info(f"✅ {len(self.vehicles)} vehículos cargados exitosamente")
    
    async def test_backend_connection(self):
        """Prueba la conexión con el backend"""
        try:
            async with self.session.get(f"{self.backend_url}/health") as response:
                if response.status == 200:
                    logger.info("✅ Conexión con backend establecida")
                else:
                    logger.warning(f"⚠️ Backend responde con status: {response.status}")
        except Exception as e:
            logger.error(f"❌ No se pudo conectar al backend: {e}")
            logger.info("ℹ️ El simulador continuará, pero los datos no se enviarán")
    
    def simulate_vehicle_behavior(self, vehicle: VehicleState) -> Optional[GPSReading]:
        """Simula el comportamiento realista de un vehículo"""
        now = datetime.datetime.now()
        
        # Simular desconexiones/reconexiones
        if vehicle.is_online:
            if random.random() < self.simulation_config["offline_probability"]:
                vehicle.is_online = False
                logger.info(f"📵 Vehículo {vehicle.vehicle_id} desconectado")
                return None
        else:
            if random.random() < self.simulation_config["reconnect_probability"]:
                vehicle.is_online = True
                logger.info(f"📶 Vehículo {vehicle.vehicle_id} reconectado")
            else:
                return None
        
        # Si no tiene puntos de ruta, mantener última posición
        if not vehicle.route_points:
            logger.warning(f"⚠️ Vehículo {vehicle.vehicle_id} sin ruta definida")
            return None
        
        # Obtener punto actual de la ruta
        if vehicle.current_index >= len(vehicle.route_points):
            # Reiniciar ruta (simular ruta circular)
            vehicle.current_index = 0
            vehicle.daily_distance_km = 0.0
            logger.info(f"🔄 Vehículo {vehicle.vehicle_id} reiniciando ruta")
        
        current_point = vehicle.route_points[vehicle.current_index]
        
        # Simular movimiento o parada
        if vehicle.ignition and random.random() > 0.1:  # 90% en movimiento si encendido
            # Avanzar en la ruta
            vehicle.current_index += 1
            vehicle.speed_kmh = current_point.get("speed_kmh", 0) * random.uniform(0.85, 1.15)
            vehicle.heading = current_point.get("heading", vehicle.heading)
            vehicle.idle_minutes = 0
            
            # Calcular distancia recorrida
            if vehicle.current_index > 0:
                prev_point = vehicle.route_points[vehicle.current_index - 1]
                distance_km = self.calculate_distance(
                    prev_point["lat"], prev_point["lng"],
                    current_point["lat"], current_point["lng"]
                )
                vehicle.daily_distance_km += distance_km
        else:
            # Vehículo detenido
            vehicle.speed_kmh = 0.0
            vehicle.idle_minutes += (self.update_interval / 60)
        
        # Simular consumo de batería
        battery_drain = self.simulation_config["battery_drain_rate"] * (self.update_interval / 3600)
        if vehicle.ignition:
            battery_drain *= 0.3  # Menos consumo con motor encendido
        vehicle.battery_level = max(5, vehicle.battery_level - battery_drain)
        
        # Si batería muy baja, desconectar
        if vehicle.battery_level < 10 and random.random() < 0.3:
            vehicle.is_online = False
            logger.warning(f"🔋 Vehículo {vehicle.vehicle_id} offline por batería baja")
            return None
        
        # Crear lectura GPS
        reading = GPSReading(
            device_id=vehicle.vehicle_id,
            organization_id=vehicle.organization_id,
            lat=current_point["lat"] + random.uniform(-0.0001, 0.0001),  # Ruido GPS
            lng=current_point["lng"] + random.uniform(-0.0001, 0.0001),
            speed_kmh=max(0, vehicle.speed_kmh),
            heading=vehicle.heading,
            timestamp=now.isoformat() + "Z",
            accuracy=self.simulation_config["gps_accuracy_base"] + random.uniform(-1, 3),
            altitude=random.uniform(50, 2500),  # Altitud simulada
            satellites=random.randint(4, 12),
            battery_level=int(vehicle.battery_level),
            signal_strength=random.randint(70, 100),
            ignition=vehicle.ignition
        )
        
        vehicle.last_update = now
        return reading
    
    def calculate_distance(self, lat1: float, lng1: float, 
                          lat2: float, lng2: float) -> float:
        """Calcula distancia entre dos puntos en km"""
        R = 6371  # Radio de la Tierra en km
        
        lat1_rad, lng1_rad = math.radians(lat1), math.radians(lng1)
        lat2_rad, lng2_rad = math.radians(lat2), math.radians(lng2)
        
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad
        
        a = (math.sin(dlat/2)**2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    async def send_gps_reading(self, reading: GPSReading) -> bool:
        """Envía una lectura GPS al backend"""
        try:
            endpoint = f"{self.backend_url}/api/v1/gps/location"
            
            async with self.session.post(endpoint, json=reading.to_dict()) as response:
                self.stats["total_readings_sent"] += 1
                
                if response.status == 200:
                    self.stats["successful_transmissions"] += 1
                    return True
                else:
                    self.stats["failed_transmissions"] += 1
                    logger.warning(f"⚠️ Error enviando datos del vehículo {reading.device_id}: HTTP {response.status}")
                    return False
                    
        except asyncio.TimeoutError:
            self.stats["failed_transmissions"] += 1
            logger.error(f"⏰ Timeout enviando datos del vehículo {reading.device_id}")
            return False
        except Exception as e:
            self.stats["failed_transmissions"] += 1
            logger.error(f"❌ Error enviando datos del vehículo {reading.device_id}: {e}")
            return False
    
    async def simulate_all_vehicles(self):
        """Simula todos los vehículos en paralelo"""
        tasks = []
        active_vehicles = 0
        offline_vehicles = 0
        
        for vehicle_id, vehicle in self.vehicles.items():
            # Generar lectura para este vehículo
            reading = self.simulate_vehicle_behavior(vehicle)
            
            if reading:
                active_vehicles += 1
                # Crear tarea asíncrona para enviar datos
                task = asyncio.create_task(self.send_gps_reading(reading))
                tasks.append(task)
            else:
                offline_vehicles += 1
        
        # Actualizar estadísticas
        self.stats["vehicles_active"] = active_vehicles
        self.stats["vehicles_offline"] = offline_vehicles
        
        # Ejecutar todas las transmisiones en paralelo
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    def print_status(self):
        """Imprime el estado actual del simulador"""
        if not self.stats["start_time"]:
            return
            
        uptime = datetime.datetime.now() - self.stats["start_time"]
        success_rate = 0
        if self.stats["total_readings_sent"] > 0:
            success_rate = (self.stats["successful_transmissions"] / self.stats["total_readings_sent"]) * 100
        
        print(f"\n📊 Estado del Simulador GPS - HoyMismoGPS")
        print(f"{'='*50}")
        print(f"⏰ Tiempo activo: {uptime}")
        print(f"📡 Lecturas enviadas: {self.stats['total_readings_sent']:,}")
        print(f"✅ Transmisiones exitosas: {self.stats['successful_transmissions']:,}")
        print(f"❌ Transmisiones fallidas: {self.stats['failed_transmissions']:,}")
        print(f"📈 Tasa de éxito: {success_rate:.1f}%")
        print(f"🚗 Vehículos activos: {self.stats['vehicles_active']}")
        print(f"📵 Vehículos offline: {self.stats['vehicles_offline']}")
        
        # Mostrar algunos vehículos de ejemplo
        print(f"\n🚛 Estado de vehículos (muestra):")
        sample_vehicles = list(self.vehicles.items())[:5]
        for vehicle_id, vehicle in sample_vehicles:
            status = "🟢" if vehicle.is_online else "🔴"
            print(f"  {status} {vehicle_id}: {vehicle.speed_kmh:.1f} km/h, 🔋 {vehicle.battery_level:.0f}%")
    
    async def run(self):
        """Ejecuta el simulador principal"""
        self.running = True
        logger.info("🚀 Iniciando simulador GPS en tiempo real...")
        
        # Contador para mostrar estadísticas cada minuto
        status_counter = 0
        
        try:
            while self.running:
                start_time = time.time()
                
                # Simular todos los vehículos
                await self.simulate_all_vehicles()
                
                # Mostrar estadísticas cada minuto (6 ciclos de 10 segundos)
                status_counter += 1
                if status_counter % 6 == 0:
                    self.print_status()
                
                # Esperar hasta completar el intervalo de 10 segundos
                elapsed = time.time() - start_time
                sleep_time = max(0, self.update_interval - elapsed)
                
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
                else:
                    logger.warning(f"⚠️ Ciclo tardó {elapsed:.2f}s, excede intervalo de {self.update_interval}s")
                    
        except KeyboardInterrupt:
            logger.info("⏹️ Deteniendo simulador por solicitud del usuario...")
        except Exception as e:
            logger.error(f"❌ Error crítico en simulador: {e}")
        finally:
            self.running = False
            await self.cleanup()
    
    async def cleanup(self):
        """Limpia recursos al finalizar"""
        logger.info("🧹 Limpiando recursos del simulador...")
        
        if self.session:
            await self.session.close()
        
        # Imprimir estadísticas finales
        self.print_status()
        logger.info("✅ Simulador detenido correctamente")

def signal_handler(signum, frame):
    """Manejador de señales para detener el simulador"""
    print("\n🛑 Señal de interrupción recibida, deteniendo simulador...")
    sys.exit(0)

async def main():
    """Función principal"""
    # Configurar manejador de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Crear directorio de logs
    Path("/home/ubuntu/HoyMismoGPS/logs").mkdir(parents=True, exist_ok=True)
    
    print("🎯 Simulador GPS Tiempo Real - HoyMismoGPS")
    print("=" * 50)
    print("Simulando 20 dispositivos GPS enviando datos cada 10 segundos")
    print("Presiona Ctrl+C para detener")
    print()
    
    # Inicializar y ejecutar simulador
    simulator = RealTimeGPSSimulator()
    
    try:
        await simulator.initialize()
        await simulator.run()
    except Exception as e:
        logger.error(f"❌ Error fatal: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
