#!/usr/bin/env python3
"""
HoyMismoGPS - Generador de Datos de Prueba
Genera organizaciones, usuarios, geocercas y alertas simuladas
"""

import json
import uuid
import random
import datetime
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
import hashlib
import secrets

@dataclass
class Organization:
    """Representa una organización en el sistema multi-tenant"""
    id: str
    name: str
    email: str
    phone: str
    address: str
    subscription_plan: str
    created_at: str
    settings: Dict[str, Any]
    active: bool = True
    
    def to_firestore(self) -> Dict[str, Any]:
        data = asdict(self)
        # Añadir campos específicos de Firestore
        data['createdAt'] = datetime.datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        data['updatedAt'] = datetime.datetime.now()
        return data

@dataclass  
class User:
    """Representa un usuario del sistema"""
    id: str
    organization_id: str
    email: str
    name: str
    role: str
    permissions: List[str]
    created_at: str
    last_login: str
    active: bool = True
    password_hash: str = ""
    
    def to_firestore(self) -> Dict[str, Any]:
        data = asdict(self)
        data['createdAt'] = datetime.datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        data['lastLogin'] = datetime.datetime.fromisoformat(data['last_login'].replace('Z', '+00:00'))
        data['updatedAt'] = datetime.datetime.now()
        return data

@dataclass
class Geofence:
    """Representa una geocerca"""
    id: str
    organization_id: str
    name: str
    description: str
    type: str  # 'circle', 'polygon'
    coordinates: Dict[str, Any]  # center + radius o vertices
    alerts_enabled: bool
    created_at: str
    active: bool = True
    
    def to_firestore(self) -> Dict[str, Any]:
        data = asdict(self)
        data['createdAt'] = datetime.datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        data['updatedAt'] = datetime.datetime.now()
        return data

@dataclass
class Alert:
    """Representa una alerta del sistema"""
    id: str
    organization_id: str
    vehicle_id: str
    alert_type: str
    message: str
    severity: str
    location: Dict[str, float]
    timestamp: str
    acknowledged: bool = False
    
    def to_firestore(self) -> Dict[str, Any]:
        data = asdict(self)
        data['timestamp'] = datetime.datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        return data

class TestDataGenerator:
    """Generador principal de datos de prueba"""
    
    def __init__(self):
        self.locations = {
            # California
            "los_angeles": {"lat": 34.0522, "lng": -118.2437, "city": "Los Ángeles", "state": "CA"},
            "san_francisco": {"lat": 37.7749, "lng": -122.4194, "city": "San Francisco", "state": "CA"},
            "san_diego": {"lat": 32.7157, "lng": -117.1611, "city": "San Diego", "state": "CA"},
            
            # Texas
            "houston": {"lat": 29.7604, "lng": -95.3698, "city": "Houston", "state": "TX"},
            "dallas": {"lat": 32.7767, "lng": -96.7970, "city": "Dallas", "state": "TX"},
            "austin": {"lat": 30.2672, "lng": -97.7431, "city": "Austin", "state": "TX"},
            
            # Arizona
            "phoenix": {"lat": 33.4484, "lng": -112.0740, "city": "Phoenix", "state": "AZ"},
            "tucson": {"lat": 32.2226, "lng": -110.9747, "city": "Tucson", "state": "AZ"},
            
            # Tamaulipas, México
            "tampico": {"lat": 22.2331, "lng": -97.8610, "city": "Tampico", "state": "Tamaulipas"},
            "reynosa": {"lat": 26.0801, "lng": -98.2775, "city": "Reynosa", "state": "Tamaulipas"},
            "matamoros": {"lat": 25.8695, "lng": -97.5030, "city": "Matamoros", "state": "Tamaulipas"},
            
            # Baja California Norte
            "tijuana": {"lat": 32.5149, "lng": -117.0382, "city": "Tijuana", "state": "BC"},
            "mexicali": {"lat": 32.6245, "lng": -115.4523, "city": "Mexicali", "state": "BC"},
            "ensenada": {"lat": 31.8670, "lng": -116.5956, "city": "Ensenada", "state": "BC"},
            
            # Nuevo León
            "monterrey": {"lat": 25.6866, "lng": -100.3161, "city": "Monterrey", "state": "NL"},
            "san_nicolas": {"lat": 25.7481, "lng": -100.2761, "city": "San Nicolás", "state": "NL"},
            "guadalupe": {"lat": 25.6767, "lng": -100.2561, "city": "Guadalupe", "state": "NL"}
        }
        
        self.company_types = [
            "Transporte de Carga", "Servicios de Entrega", "Logística",
            "Distribución", "Construcción", "Servicios Públicos",
            "Emergencias", "Turismo", "Agricultura", "Minería"
        ]
        
        self.roles_permissions = {
            "super_admin": [
                "manage_organizations", "manage_users", "view_all_data", 
                "manage_billing", "system_config"
            ],
            "admin": [
                "manage_users", "manage_vehicles", "manage_geofences", 
                "view_reports", "manage_alerts", "export_data"
            ],
            "operator": [
                "view_vehicles", "view_geofences", "view_alerts", 
                "acknowledge_alerts", "view_reports"
            ],
            "viewer": [
                "view_vehicles", "view_reports"
            ]
        }

    def generate_organizations(self, count: int = 5) -> List[Organization]:
        """Genera organizaciones de prueba"""
        organizations = []
        
        # Organización demo principal
        demo_org = Organization(
            id="demo_hoymismogps",
            name="HoyMismoGPS Demo",
            email="demo@hoymismogps.com",
            phone="+1-555-0123",
            address="123 Demo Street, Demo City, CA 90210",
            subscription_plan="premium",
            created_at=datetime.datetime.now().isoformat() + "Z",
            settings={
                "timezone": "America/Los_Angeles",
                "language": "es",
                "notification_email": True,
                "notification_sms": True,
                "alert_threshold_speed": 100,
                "alert_threshold_idle": 30,
                "map_default_zoom": 13,
                "data_retention_days": 365
            }
        )
        organizations.append(demo_org)
        
        # Organizaciones adicionales
        for i in range(count - 1):
            company_type = random.choice(self.company_types)
            location_key = random.choice(list(self.locations.keys()))
            location = self.locations[location_key]
            
            org = Organization(
                id=f"org_{i+2:03d}_{secrets.token_hex(4)}",
                name=f"{company_type} {location['city']}",
                email=f"admin{i+2}@{company_type.lower().replace(' ', '')}{location['city'].lower()}.com",
                phone=f"+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}",
                address=f"{random.randint(100,9999)} {random.choice(['Main', 'Oak', 'Pine', 'Cedar'])} St, {location['city']}, {location['state']}",
                subscription_plan=random.choice(["basic", "premium", "enterprise"]),
                created_at=(datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 365))).isoformat() + "Z",
                settings={
                    "timezone": random.choice([
                        "America/Los_Angeles", "America/Denver", 
                        "America/Chicago", "America/Mexico_City"
                    ]),
                    "language": random.choice(["es", "en"]),
                    "notification_email": random.choice([True, False]),
                    "notification_sms": random.choice([True, False]),
                    "alert_threshold_speed": random.randint(80, 120),
                    "alert_threshold_idle": random.randint(15, 60),
                    "map_default_zoom": random.randint(10, 15),
                    "data_retention_days": random.choice([90, 180, 365, 730])
                }
            )
            organizations.append(org)
        
        return organizations
    
    def generate_users(self, organizations: List[Organization]) -> List[User]:
        """Genera usuarios para las organizaciones"""
        users = []
        
        for org in organizations:
            # Admin principal para cada organización
            admin_user = User(
                id=f"user_{secrets.token_hex(8)}",
                organization_id=org.id,
                email=org.email,
                name=f"Admin {org.name}",
                role="admin",
                permissions=self.roles_permissions["admin"],
                created_at=org.created_at,
                last_login=(datetime.datetime.now() - datetime.timedelta(hours=random.randint(1, 48))).isoformat() + "Z",
                password_hash=hashlib.sha256(f"admin123_{org.id}".encode()).hexdigest()
            )
            users.append(admin_user)
            
            # Usuarios adicionales por organización
            user_count = random.randint(2, 8)
            for i in range(user_count):
                role = random.choice(["operator", "viewer", "operator", "operator"])  # Más operadores
                
                user = User(
                    id=f"user_{secrets.token_hex(8)}",
                    organization_id=org.id,
                    email=f"usuario{i+1}@{org.email.split('@')[1]}",
                    name=f"{random.choice(['Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen'])} {random.choice(['García', 'López', 'Martín', 'González', 'Rodríguez'])}",
                    role=role,
                    permissions=self.roles_permissions[role],
                    created_at=(datetime.datetime.fromisoformat(org.created_at.replace('Z', '')) + datetime.timedelta(days=random.randint(1, 30))).isoformat() + "Z",
                    last_login=(datetime.datetime.now() - datetime.timedelta(hours=random.randint(1, 168))).isoformat() + "Z",
                    password_hash=hashlib.sha256(f"user123_{i}_{org.id}".encode()).hexdigest()
                )
                users.append(user)
        
        return users
    
    def generate_geofences(self, organizations: List[Organization]) -> List[Geofence]:
        """Genera geocercas para cada organización"""
        geofences = []
        
        geofence_types = {
            "industrial": {
                "names": ["Centro Industrial", "Zona Industrial", "Parque Industrial"],
                "radius_km": [2.0, 5.0, 3.0]
            },
            "distribution": {
                "names": ["Centro de Distribución", "Almacén Principal", "Hub Logístico"],
                "radius_km": [1.0, 2.0, 1.5]
            },
            "service": {
                "names": ["Zona de Servicio", "Área Comercial", "Centro de Negocios"],
                "radius_km": [0.5, 1.0, 0.8]
            },
            "restricted": {
                "names": ["Zona Restringida", "Área Prohibida", "Zona de Seguridad"],
                "radius_km": [0.3, 0.8, 0.5]
            }
        }
        
        for org in organizations:
            # Determinar ubicaciones para esta organización basado en su nombre/tipo
            org_locations = []
            for loc_key, loc_data in self.locations.items():
                if loc_data["city"].lower() in org.name.lower() or random.random() < 0.3:
                    org_locations.append((loc_key, loc_data))
            
            # Si no hay ubicaciones específicas, usar algunas aleatorias
            if not org_locations:
                org_locations = random.sample(list(self.locations.items()), 
                                           random.randint(2, 5))
            
            # Generar geocercas para esta organización
            geofence_count = random.randint(5, 15)
            
            for i in range(geofence_count):
                loc_key, loc_data = random.choice(org_locations)
                fence_type = random.choice(list(geofence_types.keys()))
                type_config = geofence_types[fence_type]
                
                # Posición aleatoria cerca de la ubicación base
                base_lat, base_lng = loc_data["lat"], loc_data["lng"]
                offset_lat = random.uniform(-0.05, 0.05)  # ~5km radius
                offset_lng = random.uniform(-0.05, 0.05)
                
                geofence = Geofence(
                    id=f"geofence_{secrets.token_hex(8)}",
                    organization_id=org.id,
                    name=f"{random.choice(type_config['names'])} {loc_data['city']} #{i+1}",
                    description=f"Geocerca de tipo {fence_type} en {loc_data['city']}, {loc_data['state']}",
                    type="circle",
                    coordinates={
                        "center": {
                            "lat": base_lat + offset_lat,
                            "lng": base_lng + offset_lng
                        },
                        "radius_km": random.choice(type_config["radius_km"])
                    },
                    alerts_enabled=random.choice([True, True, True, False]),  # 75% con alertas
                    created_at=(datetime.datetime.fromisoformat(org.created_at.replace('Z', '')) + datetime.timedelta(days=random.randint(1, 60))).isoformat() + "Z"
                )
                geofences.append(geofence)
        
        return geofences
    
    def generate_alerts(self, organizations: List[Organization], 
                       geofences: List[Geofence], days_back: int = 30) -> List[Alert]:
        """Genera historial de alertas simuladas"""
        alerts = []
        
        alert_types = {
            "geofence_enter": {
                "message_template": "Vehículo {vehicle} ha ENTRADO en geocerca '{geofence}'",
                "severity": "info",
                "probability": 0.4
            },
            "geofence_exit": {
                "message_template": "Vehículo {vehicle} ha SALIDO de geocerca '{geofence}'",
                "severity": "info", 
                "probability": 0.4
            },
            "speed_violation": {
                "message_template": "Vehículo {vehicle} excede velocidad límite: {speed} km/h",
                "severity": "warning",
                "probability": 0.15
            },
            "extended_idle": {
                "message_template": "Vehículo {vehicle} inactivo por {minutes} minutos",
                "severity": "warning",
                "probability": 0.1
            },
            "panic_button": {
                "message_template": "ALERTA: Botón de pánico activado en vehículo {vehicle}",
                "severity": "critical",
                "probability": 0.02
            },
            "device_offline": {
                "message_template": "Vehículo {vehicle} fuera de línea desde hace {hours} horas",
                "severity": "error",
                "probability": 0.05
            }
        }
        
        # Generar alertas para cada organización
        for org in organizations:
            org_geofences = [g for g in geofences if g.organization_id == org.id]
            
            # Número de alertas por día (más en días laborables)
            for day in range(days_back):
                date = datetime.datetime.now() - datetime.timedelta(days=day)
                is_weekday = date.weekday() < 5
                
                daily_alerts = random.randint(5, 25) if is_weekday else random.randint(1, 8)
                
                for _ in range(daily_alerts):
                    alert_type = random.choices(
                        list(alert_types.keys()),
                        weights=[config["probability"] for config in alert_types.values()]
                    )[0]
                    
                    config = alert_types[alert_type]
                    
                    # Generar datos específicos del alert
                    vehicle_id = f"{random.choice(['TRK', 'CAR', 'MTR'])}-{random.randint(1, 100):03d}"
                    
                    # Ubicación aleatoria de la organización
                    if org_geofences:
                        geofence = random.choice(org_geofences)
                        location = geofence.coordinates["center"]
                    else:
                        # Ubicación aleatoria en las áreas de operación
                        loc_data = random.choice(list(self.locations.values()))
                        location = {"lat": loc_data["lat"], "lng": loc_data["lng"]}
                    
                    # Generar mensaje específico
                    if alert_type in ["geofence_enter", "geofence_exit"] and org_geofences:
                        geofence_name = random.choice(org_geofences).name
                        message = config["message_template"].format(
                            vehicle=vehicle_id, geofence=geofence_name
                        )
                    elif alert_type == "speed_violation":
                        speed = random.randint(85, 150)
                        message = config["message_template"].format(
                            vehicle=vehicle_id, speed=speed
                        )
                    elif alert_type == "extended_idle":
                        minutes = random.randint(35, 180)
                        message = config["message_template"].format(
                            vehicle=vehicle_id, minutes=minutes
                        )
                    elif alert_type == "device_offline":
                        hours = random.randint(2, 48)
                        message = config["message_template"].format(
                            vehicle=vehicle_id, hours=hours
                        )
                    else:
                        message = config["message_template"].format(vehicle=vehicle_id)
                    
                    # Timestamp aleatorio en el día
                    alert_time = date.replace(
                        hour=random.randint(6, 22),
                        minute=random.randint(0, 59),
                        second=random.randint(0, 59)
                    )
                    
                    alert = Alert(
                        id=f"alert_{secrets.token_hex(8)}",
                        organization_id=org.id,
                        vehicle_id=vehicle_id,
                        alert_type=alert_type,
                        message=message,
                        severity=config["severity"],
                        location=location,
                        timestamp=alert_time.isoformat() + "Z",
                        acknowledged=random.random() < 0.7  # 70% acknowledged
                    )
                    alerts.append(alert)
        
        return alerts
    
    def save_test_data(self, output_dir: str = "/home/ubuntu/HoyMismoGPS/data-simulators/test_data"):
        """Genera y guarda todos los datos de prueba"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        print("🔄 Generando datos de prueba...")
        
        # Generar todos los datos
        organizations = self.generate_organizations(5)
        users = self.generate_users(organizations)
        geofences = self.generate_geofences(organizations)
        alerts = self.generate_alerts(organizations, geofences, 30)
        
        # Guardar datos en archivos JSON
        datasets = {
            "organizations": organizations,
            "users": users, 
            "geofences": geofences,
            "alerts": alerts
        }
        
        for dataset_name, data in datasets.items():
            # Versión JSON para desarrollo
            filename = f"{output_dir}/{dataset_name}.json"
            json_data = []
            
            for item in data:
                if hasattr(item, 'to_firestore'):
                    json_data.append(asdict(item))
                else:
                    json_data.append(asdict(item))
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False, default=str)
            
            print(f"✅ {dataset_name.capitalize()}: {len(data)} registros → {filename}")
        
        # Generar archivo de configuración Firestore
        firestore_config = {
            "collections": {
                "organizations": {
                    "indexes": [
                        {"fields": [{"fieldPath": "active"}, {"fieldPath": "createdAt"}]},
                        {"fields": [{"fieldPath": "subscription_plan"}]}
                    ]
                },
                "users": {
                    "indexes": [
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "role"}]},
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "active"}]}
                    ]
                },
                "geofences": {
                    "indexes": [
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "active"}]},
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "alerts_enabled"}]}
                    ]
                },
                "alerts": {
                    "indexes": [
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "timestamp"}]},
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "severity"}]},
                        {"fields": [{"fieldPath": "organization_id"}, {"fieldPath": "acknowledged"}]}
                    ]
                }
            }
        }
        
        with open(f"{output_dir}/firestore_config.json", 'w', encoding='utf-8') as f:
            json.dump(firestore_config, f, indent=2, ensure_ascii=False)
        
        # Estadísticas finales
        print(f"\n📊 Resumen de datos generados:")
        print(f"  • 🏢 Organizaciones: {len(organizations)}")
        print(f"  • 👥 Usuarios: {len(users)}")
        print(f"  • 🗺️ Geocercas: {len(geofences)}")
        print(f"  • 🚨 Alertas (30 días): {len(alerts)}")
        print(f"\n📁 Datos guardados en: {output_dir}")
        
        return {
            "organizations": organizations,
            "users": users,
            "geofences": geofences, 
            "alerts": alerts
        }

def main():
    """Función principal"""
    print("🎯 Generador de Datos de Prueba - HoyMismoGPS")
    print("=" * 55)
    
    generator = TestDataGenerator()
    test_data = generator.save_test_data()
    
    print("\n✅ Generación de datos de prueba completada!")
    return test_data

if __name__ == "__main__":
    main()
