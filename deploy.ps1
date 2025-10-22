#!/usr/bin/env pwsh
# College Clubs App - Universal Deployment Script
# Works on Windows, Linux, and macOS with PowerShell

param(
    [string]$Action = "help",
    [string]$Environment = "development"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Magenta = "`e[35m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

function Write-ColoredOutput {
    param($Message, $Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Show-Help {
    Write-ColoredOutput " College Clubs Management System - Deployment Tool" $Cyan
    Write-ColoredOutput "=" * 60 $Blue
    Write-Host ""
    Write-ColoredOutput "Usage: ./deploy.ps1 -Action <action> [-Environment <env>]" $Green
    Write-Host ""
    Write-ColoredOutput "ACTIONS:" $Yellow
    Write-Host "  setup         - Install all dependencies and setup environment"
    Write-Host "  start         - Start the application (database + backend + frontend)"
    Write-Host "  stop          - Stop all services"
    Write-Host "  restart       - Restart all services"
    Write-Host "  status        - Check status of all services"
    Write-Host "  clean         - Clean up all containers and volumes"
    Write-Host "  build         - Build the frontend for production"
    Write-Host "  test          - Run API tests"
    Write-Host "  logs          - Show application logs"
    Write-Host "  backup        - Backup database"
    Write-Host "  restore       - Restore database from backup"
    Write-Host "  help          - Show this help message"
    Write-Host ""
    Write-ColoredOutput "ENVIRONMENTS:" $Yellow
    Write-Host "  development   - Development mode (default)"
    Write-Host "  production    - Production mode"
    Write-Host ""
    Write-ColoredOutput "EXAMPLES:" $Green
    Write-Host "  ./deploy.ps1 -Action setup"
    Write-Host "  ./deploy.ps1 -Action start"
    Write-Host "  ./deploy.ps1 -Action stop"
    Write-Host "  ./deploy.ps1 -Action clean"
    Write-Host ""
}

function Test-Prerequisites {
    Write-ColoredOutput " Checking prerequisites..." $Blue
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-ColoredOutput " Node.js found: $nodeVersion" $Green
    }
    catch {
        Write-ColoredOutput "Node.js not found. Please install Node.js 18+ from https://nodejs.org" $Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-ColoredOutput " npm found: v$npmVersion" $Green
    }
    catch {
        Write-ColoredOutput "npm not found. Please install npm" $Red
        exit 1
    }
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-ColoredOutput " Docker found: $dockerVersion" $Green
    }
    catch {
        Write-ColoredOutput "Docker not found. MongoDB will need to be installed manually" $Yellow
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-ColoredOutput " Docker Compose found: $composeVersion" $Green
    }
    catch {
        Write-ColoredOutput "Docker Compose not found. Using docker compose instead" $Yellow
    }
}

function Install-Dependencies {
    Write-ColoredOutput " Installing dependencies..." $Blue
    
    Write-ColoredOutput "Installing root dependencies..." $Cyan
    npm install
    
    Write-ColoredOutput "Installing backend dependencies..." $Cyan
    Set-Location backend
    npm install
    Set-Location ..
    
    Write-ColoredOutput "Installing frontend dependencies..." $Cyan
    Set-Location frontend
    npm install
    Set-Location ..
    
    Write-ColoredOutput " All dependencies installed successfully!" $Green
}

function Start-Database {
    Write-ColoredOutput "Starting MongoDB..." $Blue
    
    try {
        # Try docker-compose first, then docker compose
        try {
            docker-compose up -d mongodb mongo-express
        }
        catch {
            docker compose up -d mongodb mongo-express
        }
        
        Write-ColoredOutput " MongoDB started successfully!" $Green
        Write-ColoredOutput " MongoDB UI available at: http://localhost:8081" $Cyan
        Write-ColoredOutput "   Username: admin" $Cyan
        Write-ColoredOutput "   Password: admin123" $Cyan
        
        # Wait for MongoDB to be ready
        Write-ColoredOutput " Waiting for MongoDB to be ready..." $Yellow
        Start-Sleep -Seconds 10
    }
    catch {
        Write-ColoredOutput " Failed to start MongoDB via Docker" $Red
        Write-ColoredOutput "Please ensure Docker is running and try again" $Yellow
        exit 1
    }
}

function Start-Application {
    Write-ColoredOutput " Starting College Clubs Application..." $Blue
    
    # Stop any existing services first
    Write-ColoredOutput "Checking for existing services..." $Yellow
    Stop-Services -Silent
    
    Start-Database
    
    Write-ColoredOutput "Starting backend and frontend..." $Cyan
    
    if ($Environment -eq "production") {
        # Production build
        Write-ColoredOutput "Building frontend for production..." $Yellow
        Set-Location frontend
        npm run build
        Set-Location ..
        
        # Start backend only in production
        Set-Location backend
        npm start
    }
    else {
        # Development mode
        npm run dev
    }
}

function Stop-Services {
    param([switch]$Silent)
    
    if (-not $Silent) {
        Write-ColoredOutput " Stopping all services..." $Blue
    }
    
    # Stop Docker containers
    try {
        try {
            docker-compose down 2>$null
        }
        catch {
            docker compose down 2>$null
        }
        if (-not $Silent) {
            Write-ColoredOutput " Docker services stopped" $Green
        }
    }
    catch {
        if (-not $Silent) {
            Write-ColoredOutput " No Docker services to stop" $Yellow
        }
    }
    
    # Kill Node.js processes
    if ($IsWindows) {
        try {
            $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
            if ($nodeProcesses) {
                $nodeProcesses | Stop-Process -Force
                if (-not $Silent) {
                    Write-ColoredOutput " Node.js processes stopped" $Green
                }
            }
        }
        catch {
            if (-not $Silent) {
                Write-ColoredOutput " No Node.js processes to stop" $Yellow
            }
        }
    }
    else {
        try {
            pkill -f "node" 2>/dev/null
            if (-not $Silent) {
                Write-ColoredOutput " Node.js processes stopped" $Green
            }
        }
        catch {
            if (-not $Silent) {
                Write-ColoredOutput " No Node.js processes to stop" $Yellow
            }
        }
    }
}

function Show-Status {
    Write-ColoredOutput " Service Status:" $Blue
    Write-Host ""
    
    # Check Docker containers
    Write-ColoredOutput "Docker Containers:" $Yellow
    try {
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=college-clubs"
    }
    catch {
        Write-ColoredOutput " Docker not available" $Red
    }
    
    Write-Host ""
    
    # Check Node.js processes
    Write-ColoredOutput "Node.js Processes:" $Yellow
    if ($IsWindows) {
        Get-Process -Name node -ErrorAction SilentlyContinue | Format-Table -AutoSize
    }
    else {
        ps aux | grep -E "node|npm" | grep -v grep
    }
    
    Write-Host ""
    Write-ColoredOutput "Application URLs:" $Green
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Backend:  http://localhost:5000"
    Write-Host "  MongoDB:  http://localhost:8081"
}

function Clean-Environment {
    Write-ColoredOutput " Cleaning up environment..." $Blue
    
    Stop-Services
    
    # Remove Docker containers and volumes
    try {
        Write-ColoredOutput "Removing Docker containers..." $Yellow
        docker rm -f college-clubs-mongodb college-clubs-mongo-express 2>$null
        
        Write-ColoredOutput "Removing Docker volumes..." $Yellow
        docker volume rm college-clubs-app_mongodb_data 2>$null
        
        Write-ColoredOutput "Removing Docker networks..." $Yellow
        docker network rm college-clubs-app_college-clubs-network 2>$null
        
        Write-ColoredOutput " Environment cleaned successfully!" $Green
    }
    catch {
        Write-ColoredOutput " Some cleanup operations failed (this is normal)" $Yellow
    }
}

function Build-Application {
    Write-ColoredOutput " Building application for production..." $Blue
    
    Set-Location frontend
    npm run build
    Set-Location ..
    
    Write-ColoredOutput " Application built successfully!" $Green
    Write-ColoredOutput " Production files are in frontend/dist" $Cyan
}

function Run-Tests {
    Write-ColoredOutput " Running API tests..." $Blue
    
    Set-Location backend
    node test-api.js
    Set-Location ..
}

function Show-Logs {
    Write-ColoredOutput " Application logs:" $Blue
    
    try {
        docker-compose logs -f --tail=50
    }
    catch {
        docker compose logs -f --tail=50
    }
}

function Backup-Database {
    Write-ColoredOutput " Backing up database..." $Blue
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups"
    $backupFile = "$backupDir/college_clubs_backup_$timestamp.archive"
    
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir
    }
    
    try {
        docker exec college-clubs-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/college_clubs?authSource=admin" --archive="/tmp/backup.archive"
        docker cp college-clubs-mongodb:/tmp/backup.archive $backupFile
        
        Write-ColoredOutput " Database backed up to: $backupFile" $Green
    }
    catch {
        Write-ColoredOutput " Backup failed. Make sure MongoDB is running." $Red
    }
}

# Main execution
switch ($Action.ToLower()) {
    "setup" {
        Test-Prerequisites
        Install-Dependencies
        Write-ColoredOutput " Setup complete! Run './deploy.ps1 -Action start' to start the application." $Green
    }
    "start" {
        Start-Application
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 3
        Start-Application
    }
    "status" {
        Show-Status
    }
    "clean" {
        Clean-Environment
    }
    "build" {
        Build-Application
    }
    "test" {
        Run-Tests
    }
    "logs" {
        Show-Logs
    }
    "backup" {
        Backup-Database
    }
    "help" {
        Show-Help
    }
    default {
        Write-ColoredOutput "Unknown action: $Action" $Red
        Show-Help
        exit 1
    }
}

