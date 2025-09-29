# 🚀 Guía de Despliegue HoyMismoGPS

## Arquitectura de Despliegue

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Firebase      │
│   (Vercel)      │────│   (Render)       │────│  (Firestore)    │
│   React + Maps  │    │   FastAPI        │    │  Auth + Rules   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │   Simuladores    │
                       │   GPS (Docker)   │
                       └──────────────────┘
```

## 📋 Prerequisitos

### Cuentas y Servicios Necesarios

1. **Firebase/Google Cloud**
   - Proyecto Firebase creado
   - Firestore habilitado
   - Authentication configurado
   - Service Account JSON descargado

2. **Render Account**
   - Cuenta gratuita o de pago
   - Repository GitHub conectado

3. **Vercel Account**
   - Cuenta conectada con GitHub
   - Dominio personalizado (opcional)

4. **Servicios Externos**
   - EmailJS o SendGrid para notificaciones
   - Mapbox/Google Maps API key

---

## 🔧 Configuración de Variables de Entorno

### Backend (Render)

Crear archivo `.env` con las siguientes variables:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=hoymismogps-production
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-service-account@hoymismogps-production.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Database
DATABASE_URL=postgresql://user:password@host:port/database
FIRESTORE_DATABASE_ID=(default)

# API Configuration
ENVIRONMENT=production
DEBUG=false
API_VERSION=v1
CORS_ORIGINS=https://hoymismogps.vercel.app,https://www.hoymismogps.com
SECRET_KEY=your_super_secret_key_here_min_32_chars
JWT_SECRET=your_jwt_secret_key_here

# Monitoring & Logging
LOG_LEVEL=INFO
METRICS_ENABLED=true
ALERT_EMAIL=admin@hoymismogps.com

# External APIs
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
MAX_REQUESTS_PER_HOUR=1000

# Email Configuration (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=alerts@hoymismogps.com
SMTP_PASSWORD=your_app_password_here
```

### Frontend (Vercel)

Variables de entorno en Vercel dashboard:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://hoymismogps-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://hoymismogps-backend.onrender.com

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hoymismogps-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hoymismogps-production
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hoymismogps-production.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012

# Maps Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App Configuration
NEXT_PUBLIC_APP_NAME=HoyMismoGPS
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
```

---

## 🖥️ Despliegue del Backend en Render

### 1. Preparación del Repositorio

Estructura del backend:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   ├── routers/
│   ├── services/
│   └── utils/
├── requirements.txt
├── Dockerfile
├── render.yaml
└── start.sh
```

### 2. Archivo requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
firebase-admin==6.4.0
google-cloud-firestore==2.13.1
google-auth==2.25.2
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
passlib[bcrypt]==1.7.4
aioredis==2.0.1
websockets==12.0
aiohttp==3.9.1
python-dotenv==1.0.0
psutil==5.9.6
pytest==7.4.3
pytest-asyncio==0.21.1
gunicorn==21.2.0
```

### 3. Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8000

# Start command
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]
```

### 4. render.yaml

```yaml
services:
  - type: web
    name: hoymismogps-backend
    env: python
    plan: starter  # or standard/pro based on needs
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT --timeout 120
    healthCheckPath: /health
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: PYTHON_VERSION
        value: 3.11.7
    # Environment variables should be set in Render dashboard
    
  - type: worker
    name: hoymismogps-gps-simulator
    env: python
    plan: starter
    buildCommand: pip install -r requirements.txt
    startCommand: python data-simulators/real_time_gps_simulator.py
    envVars:
      - key: BACKEND_URL
        fromService:
          type: web
          name: hoymismogps-backend
          property: host
```

### 5. Script de Inicio (start.sh)

```bash
#!/bin/bash

echo "🚀 Starting HoyMismoGPS Backend"

# Wait for database to be ready
echo "⏳ Waiting for services..."
sleep 10

# Initialize database if needed
echo "🔄 Initializing database..."
python -c "
from app.database import init_db
import asyncio
asyncio.run(init_db())
"

# Start the application
echo "✅ Starting FastAPI server..."
exec gunicorn app.main:app \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:${PORT:-8000} \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
```

### 6. Pasos para Despliegue en Render

1. **Conectar Repositorio**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "Backend ready for deployment"
   git push origin main
   ```

2. **Crear Servicio en Render**
   - Login to Render.com
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select branch: `main`
   - Runtime: `Python 3`

3. **Configurar Servicio**
   - **Name**: `hoymismogps-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `./start.sh`
   - **Health Check Path**: `/health`

4. **Añadir Variables de Entorno**
   - Go to Environment tab
   - Add all variables from `.env` file above
   - Save changes

5. **Deploy**
   - Click "Deploy"
   - Monitor logs for successful deployment
   - Test health endpoint: `https://your-service.onrender.com/health`

---

## 🌐 Despliegue del Frontend en Vercel

### 1. Preparación del Proyecto React

Estructura del frontend:
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── public/
├── package.json
├── next.config.js
├── vercel.json
└── .env.local
```

### 2. package.json

```json
{
  "name": "hoymismogps-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.0.3",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "leaflet": "1.9.4",
    "react-leaflet": "4.2.1",
    "mapbox-gl": "2.15.0",
    "firebase": "10.7.1",
    "axios": "1.6.2",
    "socket.io-client": "4.7.4",
    "@heroicons/react": "2.0.18",
    "tailwindcss": "3.3.6",
    "autoprefixer": "10.4.16",
    "postcss": "8.4.32",
    "typescript": "5.3.3",
    "@types/node": "20.10.4",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.17",
    "recharts": "2.8.0",
    "date-fns": "2.30.0"
  },
  "devDependencies": {
    "eslint": "8.55.0",
    "eslint-config-next": "14.0.3",
    "@tailwindcss/forms": "0.5.7"
  }
}
```

### 3. next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
  
  // Image optimization
  images: {
    domains: [
      'assets.zyrosite.com',
      'api.mapbox.com',
      'via.placeholder.com'
    ],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

### 4. vercel.json

```json
{
  "version": 2,
  "name": "hoymismogps",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://hoymismogps-backend.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://hoymismogps-backend.onrender.com"
  },
  "functions": {
    "pages/api/health.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

### 5. Pasos para Despliegue en Vercel

1. **Preparar Repositorio**
   ```bash
   # Build and test locally
   npm run build
   npm run start
   
   # Commit changes
   git add .
   git commit -m "Frontend ready for deployment"
   git push origin main
   ```

2. **Conectar con Vercel**
   - Login to vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select repository

3. **Configurar Proyecto**
   - **Project Name**: `hoymismogps`
   - **Framework**: `Next.js`
   - **Root Directory**: `frontend` (if not root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Variables de Entorno**
   - Add all `NEXT_PUBLIC_*` variables
   - Save and redeploy

5. **Dominio Personalizado** (Opcional)
   - Go to Domains tab
   - Add custom domain
   - Configure DNS settings

---

## 🔒 Configuración de Firebase/Firestore

### 1. Crear Proyecto Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init firestore
firebase init hosting
```

### 2. Configurar Reglas de Seguridad

Subir el archivo `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### 3. Configurar índices

```bash
firebase deploy --only firestore:indexes
```

### 4. Configurar Authentication

En Firebase Console:
1. Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google (opcional)
4. Configure authorized domains

---

## 📊 Monitoreo y Logging

### 1. Configurar Logging

Crear directorio de logs en Render:
```bash
mkdir -p /opt/render/project/src/logs
```

### 2. Configurar Alertas

En el dashboard de Render:
- Enable notifications
- Configure webhooks
- Set up health checks

### 3. Métricas Personalizadas

```python
# En tu aplicación FastAPI
from monitoring.metrics_monitor import MonitoringService

monitoring = MonitoringService()
monitoring.start()
```

---

## 🧪 Testing y Validación

### 1. Tests de Deployment

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test API endpoints
curl https://your-backend.onrender.com/api/v1/status

# Test frontend
curl https://your-app.vercel.app
```

### 2. Performance Testing

```bash
# Load testing with artillery
npm install -g artillery
artillery quick --count 100 --num 10 https://your-backend.onrender.com/health
```

### 3. Smoke Tests

```bash
# Run smoke tests
npm run test:smoke
python -m pytest tests/smoke/
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy HoyMismoGPS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend tests
      - name: Test Backend
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
      
      # Frontend tests
      - name: Test Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        run: |
          # Vercel auto-deploys on push to main
          echo "Frontend auto-deployed to Vercel"
```

---

## 📋 Checklist de Despliegue

### Pre-Deployment

- [ ] Todas las variables de entorno configuradas
- [ ] Firebase proyecto creado y configurado
- [ ] Service account JSON descargado
- [ ] Dominios DNS configurados
- [ ] SSL certificates configurados
- [ ] Tests pasando localmente

### Deployment

- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Vercel
- [ ] Firestore rules desplegadas
- [ ] Health checks funcionando
- [ ] API endpoints respondiendo
- [ ] WebSocket connections funcionando

### Post-Deployment

- [ ] Monitoreo configurado
- [ ] Alertas configuradas
- [ ] Logs funcionando correctamente
- [ ] Backup strategy implementada
- [ ] Performance baselines establecidos
- [ ] Documentación actualizada

### Production Readiness

- [ ] Load testing completado
- [ ] Security scan completado
- [ ] Disaster recovery plan
- [ ] Monitoring dashboards configurados
- [ ] On-call procedures documentadas

---

## 🆘 Troubleshooting

### Problemas Comunes

1. **CORS Errors**
   ```javascript
   // En next.config.js
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Origin', value: '*' },
         ],
       },
     ];
   }
   ```

2. **Firebase Connection Issues**
   ```bash
   # Verify service account
   firebase projects:list
   firebase use your-project-id
   ```

3. **Render Build Failures**
   ```bash
   # Check build logs
   # Ensure Python version compatibility
   # Verify requirements.txt
   ```

4. **Vercel Deployment Issues**
   ```bash
   # Check build logs
   # Verify environment variables
   # Test build locally
   ```

### Logs y Debugging

```bash
# Backend logs (Render)
render logs --service your-service

# Frontend logs (Vercel)
vercel logs your-deployment-url

# Firebase logs
firebase functions:log
```

---

## 📞 Soporte y Contacto

- **Documentación**: [docs.hoymismogps.com](https://docs.hoymismogps.com)
- **Issues**: GitHub Issues
- **Email**: support@hoymismogps.com
- **Discord**: HoyMismoGPS Community

---

## 📝 Changelog

### v1.0.0 (Current)
- Initial production deployment
- Multi-tenant architecture
- Real-time GPS tracking
- Complete monitoring system
- Security rules implemented

---

*Esta guía es mantenida por el equipo de HoyMismoGPS. Última actualización: Diciembre 2024*
