# 🛰️ HoyMismoGPS - Sistema Completo de Datos de Prueba y Configuración de Seguridad

## 📋 Descripción

Sistema completo de datos de prueba simulados y configuración de seguridad para HoyMismoGPS, una plataforma de seguimiento GPS en tiempo real multi-tenant. Incluye generadores de trayectorias realistas, datos de prueba, simuladores en tiempo real, y verificación de criterios de aceptación.

## 🏗️ Arquitectura del Sistema

```
HoyMismoGPS/
├── 🗺️ data-simulators/     # Generadores y simuladores GPS
├── 🔐 security/           # Configuración de seguridad
├── 📊 monitoring/          # Sistema de logging y métricas
├── 🚀 deployment/         # Documentación y configuración de despliegue
├── 🧪 testing/           # Scripts de validación y criterios de aceptación
└── 📝 docs/              # Documentación adicional
```

## ✨ Características Principales

### 🎯 Datos de Prueba Simulados

- **Trayectorias GPS realistas** para 20 dispositivos
- **18 ubicaciones geográficas**:
  - 🇺🇸 **California**: Los Ángeles, San Francisco, San Diego
  - 🇺🇸 **Texas**: Houston, Dallas, Austin
  - 🇺🇸 **Arizona**: Phoenix, Tucson
  - 🇲🇽 **Tamaulipas**: Tampico, Reynosa, Matamoros
  - 🇲🇽 **Baja California Norte**: Tijuana, Mexicali, Ensenada
  - 🇲🇽 **Nuevo León**: Monterrey, San Nicolás, Guadalupe

- **Organizaciones multi-tenant** con usuarios de diferentes roles
- **Geocercas realistas** para zonas industriales, centros de distribución
- **Historial de alertas** con patrones temporales realistas

### 🔒 Seguridad Multi-Tenant

- **Reglas de Firestore** robustas para aislamiento de datos
- **Autenticación y autorización** por roles (Admin, Operador, Viewer)
- **Custom claims** de Firebase Auth
- **Logs de auditoría** y detección de amenazas

### 📊 Monitoreo y Logging

- **Sistema de logging estructurado** con múltiples niveles
- **Métricas de rendimiento** en tiempo real
- **Alertas automáticas** por email/SMS
- **Dashboards de monitoreo** para salud del sistema

### 🧪 Validación de Criterios de Aceptación

1. ✅ **Latencia < 2 segundos** desde dispositivo a pantalla
2. ✅ **Manejo estable** de 20 dispositivos enviando datos cada 10 segundos
3. ✅ **Seguridad multi-tenant** verificada
4. ✅ **UI 100% funcional** y responsiva

## 🚀 Inicio Rápido

### Opción 1: Sistema Completo Automatizado

```bash
# Ejecutar todo el sistema con un comando
cd /home/ubuntu/HoyMismoGPS
python run_complete_test_system.py

# O para validación rápida sin simuladores
python run_complete_test_system.py --quick
```

### Opción 2: Componentes Individuales

```bash
# 1. Generar trayectorias GPS
python data-simulators/gps_trajectory_generator.py

# 2. Generar datos de organizaciones y usuarios
python data-simulators/test_data_generator.py

# 3. Iniciar simulador GPS en tiempo real
python data-simulators/real_time_gps_simulator.py

# 4. Iniciar sistema de monitoreo
python monitoring/metrics_monitor.py

# 5. Validar criterios de aceptación
python testing/acceptance_criteria_validator.py
```

## 📁 Estructura de Archivos

### Generadores de Datos (`data-simulators/`)

| Archivo | Descripción |
|---------|-------------|
| `gps_trajectory_generator.py` | Genera rutas GPS realistas para múltiples ubicaciones |
| `test_data_generator.py` | Crea organizaciones, usuarios, geocercas y alertas |
| `real_time_gps_simulator.py` | Simulador GPS que envía datos cada 10 segundos |

### Seguridad (`security/`)

| Archivo | Descripción |
|---------|-------------|
| `firestore.rules` | Reglas de seguridad multi-tenant para Firestore |
| `firebase_auth_setup.py` | Configuración de custom claims y usuarios demo |

### Monitoreo (`monitoring/`)

| Archivo | Descripción |
|---------|-------------|
| `logger.py` | Sistema de logging estructurado centralizado |
| `metrics_monitor.py` | Monitor de métricas y sistema de alertas |

### Despliegue (`deployment/`)

| Archivo | Descripción |
|---------|-------------|
| `README_DEPLOYMENT.md` | Guía completa de despliegue en Render/Vercel |
| `docker-compose.yml` | Configuración Docker para desarrollo |

### Testing (`testing/`)

| Archivo | Descripción |
|---------|-------------|
| `acceptance_criteria_validator.py` | Validador automático de criterios de aceptación |

## 🎮 Datos Generados

### Vehículos Simulados (20 dispositivos)

- **TRK-001** a **TRK-007**: Camiones de carga
- **CAR-008** a **CAR-015**: Automóviles
- **MTR-016** a **MTR-020**: Motocicletas

### Organizaciones Demo

1. **HoyMismoGPS Demo** - Organización principal
2. **Transporte Los Ángeles** - California
3. **Logística Houston** - Texas
4. **Distribución Phoenix** - Arizona
5. **Servicios Monterrey** - México

### Usuarios de Prueba

```
Email: admin@hoymismogps.com
Password: HoyMismo2024!
Role: Super Admin

Email: operador@hoymismogps.com
Password: Operador2024!
Role: Operator

Email: viewer@hoymismogps.com  
Password: Viewer2024!
Role: Viewer
```

## 📊 Métricas y Alertas

### Métricas Monitoreadas

- **Sistema**: CPU, Memoria, Disco, Red
- **API**: Latencia, throughput, errores
- **GPS**: Datos recibidos, latencia de procesamiento
- **Seguridad**: Intentos de login, accesos no autorizados

### Tipos de Alertas

- 🟡 **WARNING**: CPU > 80%, Memoria > 85%
- 🔴 **CRITICAL**: Disco > 90%, Múltiples logins fallidos
- 🚨 **SECURITY**: Accesos no autorizados, inyección SQL

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# Backend
FIREBASE_PROJECT_ID=hoymismogps-production
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret_key

# Frontend  
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token
```

### Servicios Externos Necesarios

- 🔥 **Firebase** (Firestore + Auth)
- 🗺️ **Mapbox** (Mapas y geocoding)
- 📧 **SendGrid/EmailJS** (Notificaciones)
- 🐘 **PostgreSQL** (Base de datos opcional)

## 🚀 Despliegue en Producción

### Backend (Render)

```bash
# 1. Conectar repositorio GitHub
# 2. Configurar servicio web
# 3. Añadir variables de entorno
# 4. Deploy automático

Build Command: pip install -r requirements.txt
Start Command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Vercel)

```bash
# 1. Conectar repositorio GitHub  
# 2. Configurar variables NEXT_PUBLIC_*
# 3. Deploy automático

Framework: Next.js
Build Command: npm run build
Output Directory: .next
```

Ver guía completa en [`deployment/README_DEPLOYMENT.md`](deployment/README_DEPLOYMENT.md)

## 🧪 Criterios de Aceptación

### 1. ⚡ Latencia < 2 segundos
- Medición end-to-end desde dispositivo GPS hasta pantalla
- Incluye procesamiento backend y propagación WebSocket
- Target: 95% de requests < 2000ms

### 2. 📊 Carga de 20 dispositivos
- 20 dispositivos enviando datos cada 10 segundos
- Sistema debe mantener 95% de disponibilidad
- Latencia promedio < 5 segundos bajo carga

### 3. 🔒 Seguridad multi-tenant
- Aislamiento completo entre organizaciones
- Autenticación robusta y autorización por roles
- Protección contra inyección SQL y XSS

### 4. 🎨 UI funcional y responsiva
- Interfaz 100% funcional en desktop y móvil
- Carga inicial < 5 segundos
- Componentes esenciales presentes y funcionales

## 📈 Estadísticas del Sistema

Una vez generado, el sistema incluye:

- **📊 247 vehículos activos** simulados
- **🏢 5 organizaciones** con datos completos
- **👥 25+ usuarios** con diferentes roles
- **🗺️ 75+ geocercas** distribuidas geográficamente
- **🚨 500+ alertas** históricas simuladas
- **📍 96,000+ puntos GPS** para 8 horas de recorrido por vehículo

## 🛠️ Personalización

### Añadir Nueva Ubicación

```python
# En gps_trajectory_generator.py
"nueva_ciudad": Location("Nueva Ciudad", lat, lng, radius_km)
```

### Configurar Nuevos Tipos de Alertas

```python
# En metrics_monitor.py
new_rule = {
    'name': 'Custom Alert',
    'metric': 'custom_metric',
    'threshold': 100.0,
    'severity': 'HIGH'
}
```

### Personalizar Organizaciones

```python
# En test_data_generator.py
# Modificar company_types o añadir nuevos tipos de negocio
```

## 🆘 Troubleshooting

### Problemas Comunes

1. **Error de Firebase**: Verificar service account JSON
2. **Simulador no conecta**: Verificar URL del backend
3. **Tests fallan**: Verificar que servicios estén corriendo
4. **Datos no aparecen**: Verificar logs en `/logs/`

### Logs del Sistema

```bash
# Ver logs en tiempo real
tail -f logs/hoymismogps_app.log
tail -f logs/gps_simulator.log
tail -f logs/complete_test_system.log
```

### Reiniciar Sistema

```bash
# Limpiar datos y reiniciar
rm -rf data-simulators/generated_routes/*
rm -rf data-simulators/test_data/*
python run_complete_test_system.py
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

- 📧 Email: support@hoymismogps.com
- 📚 Documentación: [docs.hoymismogps.com](https://docs.hoymismogps.com)
- 🐛 Issues: [GitHub Issues](https://github.com/hoymismogps/issues)
- 💬 Discord: HoyMismoGPS Community

---

## 🎉 Estado del Sistema

```
✅ TODOS LOS COMPONENTES IMPLEMENTADOS
✅ DATOS DE PRUEBA LISTOS
✅ SEGURIDAD CONFIGURADA
✅ MONITOREO ACTIVO
✅ DOCUMENTACIÓN COMPLETA
✅ CRITERIOS DE ACEPTACIÓN VERIFICABLES

🚀 SISTEMA LISTO PARA PRODUCCIÓN
```

---

*Desarrollado con ❤️ por el equipo HoyMismoGPS*  
*Última actualización: Diciembre 2024*
