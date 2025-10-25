# Docker Setup Script for Windows
# This script automates Docker deployment on Windows 10/11

param(
    [switch]$BuildLocal = $false,
    [switch]$PullHub = $false,
    [switch]$Help = $false
)

function Show-Help {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║    Traffic Control System - Windows Docker Setup Script        ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  .\setup-windows.ps1 [OPTIONS]

OPTIONS:
  -BuildLocal    Build Docker images from local Dockerfiles
  -PullHub       Pull pre-built images from Docker Hub
  -Help          Show this help message

EXAMPLES:
  # Build images locally
  .\setup-windows.ps1 -BuildLocal

  # Pull from Docker Hub
  .\setup-windows.ps1 -PullHub

REQUIREMENTS:
  - Windows 10/11 Pro, Enterprise, or Education
  - Docker Desktop installed (https://www.docker.com/products/docker-desktop)
  - 4GB+ RAM allocated to Docker
  - 10GB+ free disk space

DEFAULT BEHAVIOR:
  If no options specified, runs interactive setup wizard.

"@
}

function Check-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan
    
    # Check Windows version
    $winver = [Environment]::OSVersion.Version
    if ($winver.Major -lt 10) {
        Write-Host "❌ Windows 10 or later required" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Windows version: $($winver.Major).$($winver.Minor)" -ForegroundColor Green
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker not installed" -ForegroundColor Red
        Write-Host "   Download from: https://www.docker.com/products/docker-desktop"
        exit 1
    }
    Write-Host "✅ Docker installed: $(docker --version)" -ForegroundColor Green
    
    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker Compose not installed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker Compose installed: $(docker-compose --version)" -ForegroundColor Green
    
    # Check Git
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  Git not found (optional)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Git installed: $(git --version)" -ForegroundColor Green
    }
    
    Write-Host ""
}

function Check-Docker-Resources {
    Write-Host "📊 Checking Docker resources..." -ForegroundColor Cyan
    
    $info = docker info | Select-String "Memory" 
    if ($info) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
        Write-Host "   $($info[0])"
    } else {
        Write-Host "❌ Docker is not running" -ForegroundColor Red
        Write-Host "   Start Docker Desktop and try again"
        exit 1
    }
    
    Write-Host ""
}

function Setup-Environment {
    Write-Host "⚙️  Setting up environment..." -ForegroundColor Cyan
    
    # Create necessary directories
    $directories = @('videos', 'config', 'output', 'logs')
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "📁 Created: $dir" -ForegroundColor Green
        } else {
            Write-Host "📁 Found: $dir" -ForegroundColor Green
        }
    }
    
    # Copy environment file if not exists
    if (-not (Test-Path 'docker/.env')) {
        if (Test-Path 'docker/.env.example') {
            Copy-Item 'docker/.env.example' 'docker/.env'
            Write-Host "📄 Copied: docker/.env" -ForegroundColor Green
        }
    }
    
    Write-Host ""
}

function Build-Local-Images {
    Write-Host "🏗️  Building Docker images (this may take 10-15 minutes)..." -ForegroundColor Cyan
    
    $startTime = Get-Date
    
    # Build backend
    Write-Host ""
    Write-Host "📦 Building backend image..." -ForegroundColor Yellow
    docker build -f docker/backend/Dockerfile `
        -t anonymousd3vs/traffic_control:backend-latest `
        -t anonymousd3vs/traffic_control:backend-v2.2 `
        .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend built successfully" -ForegroundColor Green
    
    # Build frontend
    Write-Host ""
    Write-Host "📦 Building frontend image..." -ForegroundColor Yellow
    docker build -f docker/frontend/Dockerfile `
        -t anonymousd3vs/traffic_control:frontend-latest `
        -t anonymousd3vs/traffic_control:frontend-v2.2 `
        .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    
    $duration = ((Get-Date) - $startTime).TotalMinutes
    Write-Host "⏱️  Build completed in $([Math]::Round($duration, 2)) minutes" -ForegroundColor Green
    Write-Host ""
}

function Pull-Hub-Images {
    Write-Host "📥 Pulling Docker images from Docker Hub..." -ForegroundColor Cyan
    
    # Pull backend
    Write-Host ""
    Write-Host "📦 Pulling backend image..." -ForegroundColor Yellow
    docker pull anonymousd3vs/traffic_control:backend-latest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend pull failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend pulled successfully" -ForegroundColor Green
    
    # Pull frontend
    Write-Host ""
    Write-Host "📦 Pulling frontend image..." -ForegroundColor Yellow
    docker pull anonymousd3vs/traffic_control:frontend-latest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend pull failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend pulled successfully" -ForegroundColor Green
    
    Write-Host ""
}

function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Cyan
    
    # Start services
    docker-compose -f docker/docker-compose.yml up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start services" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Services started" -ForegroundColor Green
    Write-Host ""
    
    # Wait for services to be ready
    Write-Host "⏳ Waiting for services to initialize (30 seconds)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
    # Check status
    Write-Host ""
    docker-compose -f docker/docker-compose.yml ps
}

function Show-Access-Info {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              🎉 Setup Complete! Access Your System            ║" -ForegroundColor Green
    Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "║  📊 Dashboard:  http://localhost:3000                         ║" -ForegroundColor Green
    Write-Host "║  🔧 API:        http://localhost:8765                         ║" -ForegroundColor Green
    Write-Host "║  📚 Docs:       http://localhost:8765/docs                    ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "║  📁 Videos:     Place your video files in ./videos/           ║" -ForegroundColor Green
    Write-Host "║  📋 Config:     Lane configs saved in ./config/               ║" -ForegroundColor Green
    Write-Host "║  📤 Output:     Results saved in ./output/                    ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║  Useful Commands:                                              ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "║  View logs:      docker-compose -f docker/docker-compose.yml   ║" -ForegroundColor Green
    Write-Host "║                  logs -f                                       ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "║  Stop services:  docker-compose -f docker/docker-compose.yml   ║" -ForegroundColor Green
    Write-Host "║                  down                                          ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "║  Restart:        docker-compose -f docker/docker-compose.yml   ║" -ForegroundColor Green
    Write-Host "║                  restart                                       ║" -ForegroundColor Green
    Write-Host "║                                                                ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
}

function Show-Interactive-Menu {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   Traffic Control System - Windows Docker Setup Wizard         ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Choose deployment method:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1) Build images locally (recommended for development)" -ForegroundColor White
    Write-Host "  2) Pull from Docker Hub (recommended for production)" -ForegroundColor White
    Write-Host "  3) Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-3)"
    
    return $choice
}

# Main script execution
Clear-Host

if ($Help) {
    Show-Help
    exit 0
}

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Traffic Control System - Windows Docker Setup                ║" -ForegroundColor Cyan
Write-Host "║   Version: 2.2                                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Check-Prerequisites
Check-Docker-Resources

# Setup environment
Setup-Environment

# Determine deployment method
if ($BuildLocal) {
    Build-Local-Images
} elseif ($PullHub) {
    Pull-Hub-Images
} else {
    # Interactive menu
    $choice = Show-Interactive-Menu
    
    switch ($choice) {
        "1" { Build-Local-Images }
        "2" { Pull-Hub-Images }
        "3" { 
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit 0
        }
        default { 
            Write-Host "Invalid choice" -ForegroundColor Red
            exit 1
        }
    }
}

# Start services
Start-Services

# Show access information
Show-Access-Info

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
