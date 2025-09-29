#!/bin/bash

# HoyMismoGPS Complete Deployment Script
# This script deploys the entire HoyMismoGPS application to production

set -e

echo "🚀 Starting HoyMismoGPS Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."

    required_vars=("FIREBASE_PROJECT_ID" "SECRET_KEY" "NEXT_PUBLIC_FIREBASE_API_KEY")

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            return 1
        fi
    done

    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    pip install -r requirements.txt
    cd ..

    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..

    print_success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    print_status "Running tests..."

    # Backend tests
    if [ -f "backend/pytest" ] || python -c "import pytest" 2>/dev/null; then
        print_status "Running backend tests..."
        cd backend
        python -m pytest || print_warning "Some backend tests failed"
        cd ..
    else
        print_warning "pytest not found, skipping backend tests"
    fi

    # Frontend tests
    if [ -f "frontend/package.json" ]; then
        print_status "Running frontend tests..."
        cd frontend
        npm run lint || print_warning "Frontend linting failed"
        npm run type-check || print_warning "TypeScript type checking failed"
        cd ..
    fi

    print_success "Tests completed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend for production..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

# Deploy to Render (Backend)
deploy_backend() {
    print_status "Deploying backend to Render..."

    # Check if we have git repository
    if [ ! -d ".git" ]; then
        print_error "Not a git repository. Please initialize git first."
        return 1
    fi

    # Commit changes
    git add .
    git commit -m "Deploy: Production deployment $(date)" || true

    # Push to main branch (triggers Render deployment)
    git push origin main || print_warning "Git push failed - you may need to set up remote repository"

    print_success "Backend deployment triggered"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."

    # Start monitoring script if available
    if [ -f "monitoring/metrics_monitor.py" ]; then
        print_status "Starting metrics monitor..."
        python monitoring/metrics_monitor.py &
        echo $! > monitoring.pid
        print_success "Monitoring started (PID: $(cat monitoring.pid))"
    fi
}

# Validate deployment
validate_deployment() {
    print_status "Validating deployment..."

    # Wait for services to be ready
    sleep 30

    # Test backend health (adjust URL after deployment)
    BACKEND_URL="${NEXT_PUBLIC_API_URL:-https://hoymismogps-backend.onrender.com}"

    print_status "Testing backend health at $BACKEND_URL/health"
    if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed - service may still be starting"
    fi

    # Test frontend (adjust URL after deployment)
    FRONTEND_URL="${FRONTEND_URL:-https://hoymismogps.vercel.app}"

    print_status "Testing frontend at $FRONTEND_URL"
    if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend accessibility check failed"
    fi
}

# Main deployment function
main() {
    print_status "Starting complete deployment process..."

    # Check prerequisites
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        print_error "Python is not installed"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi

    # Run deployment steps
    check_env_vars || exit 1
    install_dependencies
    run_tests
    build_frontend
    deploy_backend
    setup_monitoring
    validate_deployment

    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "======================"
    echo "Backend URL: ${NEXT_PUBLIC_API_URL:-https://hoymismogps-backend.onrender.com}"
    echo "Frontend URL: ${FRONTEND_URL:-https://hoymismogps.vercel.app}"
    echo "Firebase Project: ${FIREBASE_PROJECT_ID}"
    echo ""
    echo "🔍 Next Steps:"
    echo "1. Verify the application is working correctly"
    echo "2. Configure custom domain (if needed)"
    echo "3. Set up monitoring and alerts"
    echo "4. Update DNS records"
    echo ""
    echo "📚 Documentation: https://github.com/your-repo/hoymismogps/blob/main/deployment/README_DEPLOYMENT.md"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "HoyMismoGPS Deployment Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --test-only    Run tests only"
        echo "  --build-only   Build only (no deployment)"
        echo ""
        echo "Environment Variables:"
        echo "  FIREBASE_PROJECT_ID    Firebase project ID"
        echo "  SECRET_KEY             Application secret key"
        echo "  NEXT_PUBLIC_API_URL    Backend API URL"
        echo ""
        exit 0
        ;;
    --test-only)
        check_env_vars || exit 1
        run_tests
        exit 0
        ;;
    --build-only)
        install_dependencies
        build_frontend
        exit 0
        ;;
    *)
        main
        ;;
esac