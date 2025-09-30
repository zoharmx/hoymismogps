# HoyMismoGPS - Instrucciones de Deployment

## Problema Resuelto
✅ Se corrigió la conexión hardcodeada a `localhost:8080` en el frontend
✅ El frontend ahora usa correctamente `VITE_API_BASE_URL` de las variables de entorno
✅ Código actualizado y pusheado a GitHub

## Estado Actual

### Frontend (Vercel)
- **Repositorio**: Conectado a GitHub
- **Auto-deployment**: Activado
- **Último commit**: `c68e7de` - "fix: Corregir conexión hardcodeada a localhost:8080"
- **Variables de entorno configuradas en vercel.json**

### Backend (Render)
- **Estado**: Deployed pero no responde
- **URL**: `https://hoymismogps-backend.onrender.com`
- **Problema**: El servicio necesita configuración adicional

## Pasos para Completar el Deployment

### 1. Configurar Backend en Render (CRÍTICO)

El backend en Render necesita las siguientes variables de entorno configuradas en el Dashboard de Render:

#### Variables Obligatorias:
```bash
# Entorno
ENVIRONMENT=production
DEBUG=false
USE_MOCK_FIREBASE=true   # Usar "true" para testing sin Firebase real
ENABLE_SIMULATOR=true    # Genera datos de prueba

# CORS (Importante!)
ALLOWED_ORIGINS=https://hoymismogps-zoharmxs-projects.vercel.app,https://hoymismogps.vercel.app

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=HoyMismoGPS

# Security (Generar una clave secreta fuerte)
SECRET_KEY=tu_clave_secreta_super_segura_aqui_cambiar
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Si usas Firebase Real (opcional):
```bash
USE_MOCK_FIREBASE=false
FIREBASE_PROJECT_ID=hoymismogps
FIREBASE_PRIVATE_KEY=<copiar del JSON de Firebase>
FIREBASE_CLIENT_EMAIL=<copiar del JSON de Firebase>
FIREBASE_CLIENT_ID=<copiar del JSON de Firebase>
```

### 2. Verificar Settings de Render

En el Dashboard de Render (https://dashboard.render.com):

1. Ve a tu servicio "hoymismogps-backend"
2. Settings → Build & Deploy
3. Verifica que:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT --timeout 120`
   - **Health Check Path**: `/health`

4. Environment Variables:
   - Añade todas las variables listadas arriba
   - **IMPORTANTE**: Asegúrate de que `ALLOWED_ORIGINS` incluya tu URL de Vercel

5. Después de añadir las variables:
   - Click en "Save Changes"
   - Render automáticamente redesplegará el servicio

### 3. Verificar Frontend en Vercel

En el Dashboard de Vercel (https://vercel.com):

1. Ve a tu proyecto "hoymismogps"
2. Settings → General
3. **Problema detectado**: El "Root Directory" está mal configurado
   - Cambiar de: `hoymismogps/frontend/hoymismogps/frontend`
   - A: `hoymismogps/frontend`

4. Settings → Environment Variables
   - Verificar que `VITE_API_BASE_URL=https://hoymismogps-backend.onrender.com`

5. Deployments → Redeploy el último deployment

### 4. Probar la Aplicación

Una vez que ambos servicios estén correctamente configurados:

```bash
# 1. Probar backend (debe responder en ~30 segundos si estaba dormido)
curl https://hoymismogps-backend.onrender.com/health

# Respuesta esperada:
{
  "status": "healthy",
  "service": "Mock Firebase",
  "timestamp": "...",
  "simulator_status": "running"
}

# 2. Probar endpoint de vehículos
curl https://hoymismogps-backend.onrender.com/api/v1/vehicles \
  -H "X-API-Key: test_key_gps001"

# Debe retornar lista de vehículos simulados
```

3. Abrir el frontend en: `https://hoymismogps-zoharmxs-projects.vercel.app`

### 5. Troubleshooting

#### Backend no responde:
- Render Free tier: El servicio se duerme después de 15 min de inactividad
- Primera petición puede tardar 30-60 segundos en despertar
- Revisar logs en Render Dashboard → Logs

#### Frontend muestra error de conexión:
- Verificar que `ALLOWED_ORIGINS` en Render incluya la URL correcta de Vercel
- Verificar que `VITE_API_BASE_URL` en Vercel apunte a Render
- Verificar que el Root Directory en Vercel esté correcto

#### CORS errors:
- Verificar `ALLOWED_ORIGINS` en Render
- Formato: URLs completas separadas por comas, sin espacios
- Ejemplo: `https://url1.com,https://url2.com`

## Comandos Útiles

```bash
# Ver deployments de Vercel
vercel ls

# Ver logs de Vercel (desde el proyecto)
cd hoymismogps/frontend
vercel logs

# Forzar redeploy en Vercel (desde el proyecto)
cd hoymismogps/frontend
vercel --prod
```

## URLs de la Aplicación

- **Frontend**: https://hoymismogps-zoharmxs-projects.vercel.app
- **Backend**: https://hoymismogps-backend.onrender.com
- **Backend Health**: https://hoymismogps-backend.onrender.com/health
- **Backend API Docs**: https://hoymismogps-backend.onrender.com/docs

## Próximos Pasos Recomendados

1. ✅ Configurar variables de entorno en Render (lo más importante)
2. ✅ Corregir Root Directory en Vercel
3. ✅ Esperar a que el servicio de Render se active (puede tardar 1-2 minutos)
4. ✅ Probar la aplicación completa
5. Configurar dominio personalizado (opcional)
6. Configurar Firebase real cuando sea necesario (actualmente usa mock data)