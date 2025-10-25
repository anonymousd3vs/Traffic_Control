#!/bin/bash

# Traffic Control System - Raspberry Pi Setup Script
# This script automates Docker installation and configuration on Raspberry Pi 5

set -e

echo "🚀 Traffic Control System - Raspberry Pi 5 Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running on Raspberry Pi
check_pi() {
    if grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
        print_success "Running on $(cat /proc/device-tree/model)"
    else
        print_error "This script is designed for Raspberry Pi"
        exit 1
    fi
}

# Update system
update_system() {
    print_info "Updating system packages..."
    sudo apt update
    sudo apt upgrade -y
    print_success "System updated"
}

# Install Docker
install_docker() {
    print_info "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker already installed: $(docker --version)"
    else
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        rm get-docker.sh
        print_success "Docker installed"
    fi
    
    # Install Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose already installed: $(docker-compose --version)"
    else
        print_info "Installing Docker Compose..."
        sudo apt install docker-compose -y
        print_success "Docker Compose installed"
    fi
}

# Configure Docker
configure_docker() {
    print_info "Configuring Docker..."
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    newgrp docker
    
    # Enable cgroup memory (for resource limits)
    if ! grep -q "cgroup_memory=1" /boot/firmware/cmdline.txt; then
        print_info "Enabling cgroup memory..."
        echo "cgroup_memory=1" | sudo tee -a /boot/firmware/cmdline.txt > /dev/null
        print_info "Please reboot for cgroup changes to take effect"
    else
        print_success "cgroup memory already enabled"
    fi
    
    # Enable Docker service
    sudo systemctl enable docker
    print_success "Docker configured"
}

# Clone/Update repository
setup_repository() {
    print_info "Setting up repository..."
    
    if [ -d "Traffic_Control" ]; then
        print_info "Repository already exists, updating..."
        cd Traffic_Control
        git pull origin master
    else
        git clone https://github.com/anonymousd3vs/Traffic_Control.git
        cd Traffic_Control
    fi
    
    print_success "Repository ready"
}

# Create logs directory
setup_directories() {
    print_info "Creating necessary directories..."
    
    mkdir -p logs/backend
    mkdir -p logs/frontend
    mkdir -p videos
    mkdir -p config
    
    print_success "Directories created"
}

# Build images
build_images() {
    print_info "Building Docker images (this may take 10-15 minutes)..."
    
    cd docker
    docker-compose -f raspberrypi/docker-compose.rpi.yml build
    
    print_success "Docker images built"
}

# Start services
start_services() {
    print_info "Starting services..."
    
    docker-compose -f raspberrypi/docker-compose.rpi.yml up -d
    
    print_info "Waiting for services to start (30 seconds)..."
    sleep 30
    
    docker-compose ps
    print_success "Services started"
}

# Check status
check_status() {
    print_info "Checking service status..."
    
    echo ""
    echo "Service Status:"
    docker-compose ps
    
    echo ""
    echo "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    echo ""
    print_success "Setup complete!"
}

# Main installation flow
main() {
    echo ""
    
    # Check if running on Pi
    check_pi
    
    # Ask for confirmation
    echo ""
    print_info "This will install Docker and set up Traffic Control System"
    print_info "Proceed with installation? (y/n)"
    read -r response
    
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "Installation cancelled"
        exit 1
    fi
    
    echo ""
    
    # Run installation steps
    update_system
    install_docker
    configure_docker
    setup_repository
    setup_directories
    
    echo ""
    print_info "Building Docker images..."
    print_info "This may take 10-15 minutes depending on your internet speed"
    print_info "Please wait..."
    
    build_images
    start_services
    
    echo ""
    echo "=================================================="
    print_success "Installation Complete!"
    echo "=================================================="
    echo ""
    echo "Access your dashboard at:"
    echo "  🌐 http://raspberrypi.local:3000"
    echo "  or"
    echo "  🌐 http://<your-pi-ip>:3000"
    echo ""
    echo "API is available at:"
    echo "  📡 http://raspberrypi.local:8765"
    echo ""
    echo "Useful commands:"
    echo "  View logs:        docker-compose logs -f"
    echo "  Stop services:    docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Check status:     docker stats"
    echo ""
    
    check_status
}

# Run main function
main
