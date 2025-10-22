@echo off
REM College Clubs App - Windows Batch Deployment Script

setlocal enabledelayedexpansion

set ACTION=%1
set ENVIRONMENT=%2

if "%ACTION%"=="" set ACTION=help
if "%ENVIRONMENT%"=="" set ENVIRONMENT=development

REM Color codes for Windows
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set MAGENTA=[95m
set CYAN=[96m
set NC=[0m

goto :main

:colored_echo
echo %~1%~2%NC%
goto :eof

:show_help
call :colored_echo "%CYAN%" "🏫 College Clubs Management System - Deployment Tool"
call :colored_echo "%BLUE%" "============================================================"
echo.
call :colored_echo "%GREEN%" "Usage: deploy.bat [action] [environment]"
echo.
call :colored_echo "%YELLOW%" "ACTIONS:"
echo   setup         - Install all dependencies and setup environment
echo   start         - Start the application (database + backend + frontend)
echo   stop          - Stop all services
echo   restart       - Restart all services
echo   status        - Check status of all services
echo   clean         - Clean up all containers and volumes
echo   build         - Build the frontend for production
echo   test          - Run API tests
echo   help          - Show this help message
echo.
call :colored_echo "%YELLOW%" "ENVIRONMENTS:"
echo   development   - Development mode (default)
echo   production    - Production mode
echo.
call :colored_echo "%GREEN%" "EXAMPLES:"
echo   deploy.bat setup
echo   deploy.bat start
echo   deploy.bat stop
echo   deploy.bat clean
echo.
goto :eof

:test_prerequisites
call :colored_echo "%BLUE%" "🔍 Checking prerequisites..."

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
    call :colored_echo "%GREEN%" "✅ Node.js found: !NODE_VERSION!"
) else (
    call :colored_echo "%RED%" "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
    call :colored_echo "%GREEN%" "✅ npm found: v!NPM_VERSION!"
) else (
    call :colored_echo "%RED%" "❌ npm not found. Please install npm"
    exit /b 1
)

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('docker --version') do set DOCKER_VERSION=%%a
    call :colored_echo "%GREEN%" "✅ Docker found: !DOCKER_VERSION!"
) else (
    call :colored_echo "%YELLOW%" "⚠️ Docker not found. MongoDB will need to be installed manually"
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('docker-compose --version') do set COMPOSE_VERSION=%%a
    call :colored_echo "%GREEN%" "✅ Docker Compose found: !COMPOSE_VERSION!"
) else (
    call :colored_echo "%YELLOW%" "⚠️ Docker Compose not found. Using docker compose instead"
)
goto :eof

:install_dependencies
call :colored_echo "%BLUE%" "📦 Installing dependencies..."

call :colored_echo "%CYAN%" "Installing root dependencies..."
npm install

call :colored_echo "%CYAN%" "Installing backend dependencies..."
cd backend
npm install
cd ..

call :colored_echo "%CYAN%" "Installing frontend dependencies..."
cd frontend
npm install
cd ..

call :colored_echo "%GREEN%" "✅ All dependencies installed successfully!"
goto :eof

:start_database
call :colored_echo "%BLUE%" "🗄️ Starting MongoDB..."

docker-compose up -d mongodb mongo-express >nul 2>&1
if %errorlevel% equ 0 (
    call :colored_echo "%GREEN%" "✅ MongoDB started successfully!"
    call :colored_echo "%CYAN%" "🌐 MongoDB UI available at: http://localhost:8081"
    call :colored_echo "%CYAN%" "   Username: admin"
    call :colored_echo "%CYAN%" "   Password: admin123"
    
    call :colored_echo "%YELLOW%" "⏳ Waiting for MongoDB to be ready..."
    timeout /t 10 >nul
) else (
    call :colored_echo "%RED%" "❌ Failed to start MongoDB via Docker"
    call :colored_echo "%YELLOW%" "Please ensure Docker is running and try again"
    exit /b 1
)
goto :eof

:start_application
call :colored_echo "%BLUE%" "🚀 Starting College Clubs Application..."

call :start_database

call :colored_echo "%CYAN%" "Starting backend and frontend..."

if "%ENVIRONMENT%"=="production" (
    call :colored_echo "%YELLOW%" "Building frontend for production..."
    cd frontend
    npm run build
    cd ..
    
    cd backend
    npm start
) else (
    npm run dev
)
goto :eof

:stop_services
call :colored_echo "%BLUE%" "🛑 Stopping all services..."

docker-compose down >nul 2>&1
if %errorlevel% equ 0 (
    call :colored_echo "%GREEN%" "✅ Docker services stopped"
) else (
    call :colored_echo "%YELLOW%" "⚠️ No Docker services to stop"
)

taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    call :colored_echo "%GREEN%" "✅ Node.js processes stopped"
) else (
    call :colored_echo "%YELLOW%" "⚠️ No Node.js processes to stop"
)
goto :eof

:show_status
call :colored_echo "%BLUE%" "📊 Service Status:"
echo.

call :colored_echo "%YELLOW%" "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=college-clubs" 2>nul || call :colored_echo "%RED%" "❌ Docker not available"

echo.

call :colored_echo "%YELLOW%" "Node.js Processes:"
tasklist /fi "imagename eq node.exe" /fo table 2>nul || echo No Node.js processes running

echo.
call :colored_echo "%GREEN%" "Application URLs:"
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   MongoDB:  http://localhost:8081
goto :eof

:clean_environment
call :colored_echo "%BLUE%" "🧹 Cleaning up environment..."

call :stop_services

call :colored_echo "%YELLOW%" "Removing Docker containers..."
docker rm -f college-clubs-mongodb college-clubs-mongo-express >nul 2>&1

call :colored_echo "%YELLOW%" "Removing Docker volumes..."
docker volume rm college-clubs-app_mongodb_data >nul 2>&1

call :colored_echo "%YELLOW%" "Removing Docker networks..."
docker network rm college-clubs-app_college-clubs-network >nul 2>&1

call :colored_echo "%GREEN%" "✅ Environment cleaned successfully!"
goto :eof

:build_application
call :colored_echo "%BLUE%" "🏗️ Building application for production..."

cd frontend
npm run build
cd ..

call :colored_echo "%GREEN%" "✅ Application built successfully!"
call :colored_echo "%CYAN%" "📁 Production files are in frontend/dist"
goto :eof

:run_tests
call :colored_echo "%BLUE%" "🧪 Running API tests..."

cd backend
node test-api.js
cd ..
goto :eof

:main
if "%ACTION%"=="setup" (
    call :test_prerequisites
    call :install_dependencies
    call :colored_echo "%GREEN%" "✅ Setup complete! Run 'deploy.bat start' to start the application."
) else if "%ACTION%"=="start" (
    call :start_application
) else if "%ACTION%"=="stop" (
    call :stop_services
) else if "%ACTION%"=="restart" (
    call :stop_services
    timeout /t 3 >nul
    call :start_application
) else if "%ACTION%"=="status" (
    call :show_status
) else if "%ACTION%"=="clean" (
    call :clean_environment
) else if "%ACTION%"=="build" (
    call :build_application
) else if "%ACTION%"=="test" (
    call :run_tests
) else if "%ACTION%"=="help" (
    call :show_help
) else (
    call :colored_echo "%RED%" "❌ Unknown action: %ACTION%"
    call :show_help
    exit /b 1
)

endlocal
