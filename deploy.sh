#!/bin/bash
# College Clubs App - Unix/Linux Deployment Script
# Works on Linux and macOS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

show_help() {
    print_colored $CYAN "🏫 College Clubs Management System - Deployment Tool"
    print_colored $BLUE "============================================================"
    echo ""
    print_colored $GREEN "Usage: ./deploy.sh <action> [environment]"
    echo ""
    print_colored $YELLOW "ACTIONS:"
    echo "  setup         - Install all dependencies and setup environment"
    echo "  start         - Start the application (database + backend + frontend)"
    echo "  stop          - Stop all services"
    echo "  restart       - Restart all services"
    echo "  status        - Check status of all services"
    echo "  clean         - Clean up all containers and volumes"
    echo "  build         - Build the frontend for production"
    echo "  test          - Run API tests"
    echo "  logs          - Show application logs"
    echo "  backup        - Backup database"
    echo "  help          - Show this help message"
    echo ""
    print_colored $YELLOW "ENVIRONMENTS:"
    echo "  development   - Development mode (default)"
    echo "  production    - Production mode"
    echo ""
    print_colored $GREEN "EXAMPLES:"
    echo "  ./deploy.sh setup"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh stop"
    echo "  ./deploy.sh clean"
    echo ""
}

test_prerequisites() {
    print_colored $BLUE "🔍 Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_colored $GREEN "✅ Node.js found: $NODE_VERSION"
    else
        print_colored $RED "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_colored $GREEN "✅ npm found: v$NPM_VERSION"
    else
        print_colored $RED "❌ npm not found. Please install npm"
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_colored $GREEN "✅ Docker found: $DOCKER_VERSION"
    else
        print_colored $YELLOW "⚠️ Docker not found. MongoDB will need to be installed manually"
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_colored $GREEN "✅ Docker Compose found: $COMPOSE_VERSION"
    else
        print_colored $YELLOW "⚠️ Docker Compose not found. Using docker compose instead"
    fi
}

install_dependencies() {
    print_colored $BLUE "📦 Installing dependencies..."
    
    print_colored $CYAN "Installing root dependencies..."
    npm install
    
    print_colored $CYAN "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_colored $CYAN "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_colored $GREEN "✅ All dependencies installed successfully!"
}

start_database() {
    print_colored $BLUE "🗄️ Starting MongoDB..."
    
    # Try docker-compose first, then docker compose
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d mongodb mongo-express
    else
        docker compose up -d mongodb mongo-express
    fi
    
    if [ $? -eq 0 ]; then
        print_colored $GREEN "✅ MongoDB started successfully!"
        print_colored $CYAN "🌐 MongoDB UI available at: http://localhost:8081"
        print_colored $CYAN "   Username: admin"
        print_colored $CYAN "   Password: admin123"
        
        # Wait for MongoDB to be ready
        print_colored $YELLOW "⏳ Waiting for MongoDB to be ready..."
        sleep 10
    else
        print_colored $RED "❌ Failed to start MongoDB via Docker"
        print_colored $YELLOW "Please ensure Docker is running and try again"
        exit 1
    fi
}

start_application() {
    print_colored $BLUE "🚀 Starting College Clubs Application..."
    
    start_database
    
    print_colored $CYAN "Starting backend and frontend..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Production build
        print_colored $YELLOW "Building frontend for production..."
        cd frontend
        npm run build
        cd ..
        
        # Start backend only in production
        cd backend
        npm start
    else
        # Development mode
        npm run dev
    fi
}

stop_services() {
    print_colored $BLUE "🛑 Stopping all services..."
    
    # Stop Docker containers
    if command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    
    if [ $? -eq 0 ]; then
        print_colored $GREEN "✅ Docker services stopped"
    else
        print_colored $YELLOW "⚠️ No Docker services to stop"
    fi
    
    # Kill Node.js processes
    pkill -f "node" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_colored $GREEN "✅ Node.js processes stopped"
    else
        print_colored $YELLOW "⚠️ No Node.js processes to stop"
    fi
}

show_status() {
    print_colored $BLUE "📊 Service Status:"
    echo ""
    
    # Check Docker containers
    print_colored $YELLOW "Docker Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=college-clubs" 2>/dev/null || print_colored $RED "❌ Docker not available"
    
    echo ""
    
    # Check Node.js processes
    print_colored $YELLOW "Node.js Processes:"
    ps aux | grep -E "node|npm" | grep -v grep || echo "No Node.js processes running"
    
    echo ""
    print_colored $GREEN "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo "  MongoDB:  http://localhost:8081"
}

clean_environment() {
    print_colored $BLUE "🧹 Cleaning up environment..."
    
    stop_services
    
    # Remove Docker containers and volumes
    print_colored $YELLOW "Removing Docker containers..."
    docker rm -f college-clubs-mongodb college-clubs-mongo-express 2>/dev/null
    
    print_colored $YELLOW "Removing Docker volumes..."
    docker volume rm college-clubs-app_mongodb_data 2>/dev/null
    
    print_colored $YELLOW "Removing Docker networks..."
    docker network rm college-clubs-app_college-clubs-network 2>/dev/null
    
    print_colored $GREEN "✅ Environment cleaned successfully!"
}

build_application() {
    print_colored $BLUE "🏗️ Building application for production..."
    
    cd frontend
    npm run build
    cd ..
    
    print_colored $GREEN "✅ Application built successfully!"
    print_colored $CYAN "📁 Production files are in frontend/dist"
}

run_tests() {
    print_colored $BLUE "🧪 Running API tests..."
    
    cd backend
    node test-api.js
    cd ..
}

show_logs() {
    print_colored $BLUE "📋 Application logs:"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose logs -f --tail=50
    else
        docker compose logs -f --tail=50
    fi
}

backup_database() {
    print_colored $BLUE "💾 Backing up database..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups"
    BACKUP_FILE="$BACKUP_DIR/college_clubs_backup_$TIMESTAMP.archive"
    
    mkdir -p "$BACKUP_DIR"
    
    docker exec college-clubs-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin" --archive="/tmp/backup.archive"
    docker cp college-clubs-mongodb:/tmp/backup.archive "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_colored $GREEN "✅ Database backed up to: $BACKUP_FILE"
    else
        print_colored $RED "❌ Backup failed. Make sure MongoDB is running."
    fi
}

# Main execution
ACTION=${1:-help}
ENVIRONMENT=${2:-development}

case $ACTION in
    "setup")
        test_prerequisites
        install_dependencies
        print_colored $GREEN "✅ Setup complete! Run './deploy.sh start' to start the application."
        ;;
    "start")
        start_application
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 3
        start_application
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_environment
        ;;
    "build")
        build_application
        ;;
    "test")
        run_tests
        ;;
    "logs")
        show_logs
        ;;
    "backup")
        backup_database
        ;;
    "help")
        show_help
        ;;
    *)
        print_colored $RED "❌ Unknown action: $ACTION"
        show_help
        exit 1
        ;;
esac
