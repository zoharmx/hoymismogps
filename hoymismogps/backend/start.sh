#!/bin/bash

echo "🚀 Starting HoyMismoGPS Backend"

# Wait for services to be ready
echo "⏳ Waiting for services..."
sleep 5

# Initialize logging directory
echo "📝 Setting up logging..."
mkdir -p logs

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ -z "$FIREBASE_PROJECT_ID" ]; then
    echo "❌ ERROR: FIREBASE_PROJECT_ID is not set"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY is not set"
    exit 1
fi

# Initialize database if needed (optional)
if [ "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://user:password@host:port/database" ]; then
    echo "🔄 Initializing database connection..."
    python -c "
try:
    from init_database import init_db
    import asyncio
    asyncio.run(init_db())
    print('✅ Database initialized successfully')
except Exception as e:
    print(f'⚠️ Database initialization failed: {e}')
    print('Continuing without database...')
"
fi

# Start the application
echo "✅ Starting FastAPI server..."
exec gunicorn main:app \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:${PORT:-8000} \
    --timeout 120 \
    --keep-alive 5 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --preload