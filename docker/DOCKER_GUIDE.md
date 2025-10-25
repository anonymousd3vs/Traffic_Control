# Complete Docker Deployment Guide

## 📚 Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Standard Deployment](#standard-deployment)
- [Raspberry Pi 5 Deployment](#raspberry-pi-5-deployment)
- [Configuration](#configuration)
- [Docker Commands Reference](#docker-commands-reference)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)
- [Security Best Practices](#security-best-practices)

---

## Prerequisites

### System Requirements

#### Standard Deployment (Linux/macOS)

- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 5GB for images + models
- **Network:** Stable internet connection

#### Raspberry Pi 5

- **RAM:** 8GB recommended (4GB minimum)
- **microSD Card:** 32GB+ Class 10+
- **Power:** 5V 5A supply
- **Network:** Ethernet or WiFi
- See [Raspberry Pi Setup](#raspberry-pi-5-deployment)

### Installation

#### macOS

```bash
# Install with Homebrew
brew install docker docker-compose

# Or download Docker Desktop
# https://www.docker.com/products/docker-desktop
```

#### Ubuntu/Debian

```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows

```bash
# Download Docker Desktop
# https://www.docker.com/products/docker-desktop

# Or with Chocolatey
choco install docker-desktop
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               User Browser                      │
│            (http://localhost:3000)              │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │   Nginx/Frontend │
        │     (Port 3000)  │
        │   - React App    │
        │   - WebSocket    │
        │   - Static Files │
        └────────┬─────────┘
                 │ (Proxy)
        ┌────────▼─────────┐
        │  Python Backend  │
        │     (Port 8765)  │
        │  - YOLO Detection│
        │  - WebSocket API │
        │  - Video Process │
        └────────┬─────────┘
                 │
        ┌────────▼──────────┐
        │   System Resources│
        │ - GPU/CPU         │
        │ - Models          │
        │ - Videos          │
        └───────────────────┘
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control
```

### 2. Copy Environment File

```bash
cd docker
cp .env.example .env
# Edit as needed (optional)
# nano .env
```

### 3. Build Images

```bash
docker-compose build
```

### 4. Start Services

```bash
docker-compose up -d
```

### 5. Access Dashboard

```
http://localhost:3000
```

### 6. Verify Installation

```bash
docker-compose ps
```

---

## Standard Deployment

### Directory Structure

```
traffic_control/
├── docker/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   └── entrypoint.sh
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── .dockerignore
│   ├── raspberrypi/
│   │   ├── docker-compose.rpi.yml
│   │   ├── Dockerfile.rpi
│   │   ├── setup-rpi.sh
│   │   └── README_RPI.md
│   ├── docker-compose.yml
│   └── .env.example
├── dashboard/
│   ├── backend/
│   ├── frontend/
│   └── ...
├── models/
├── config/
├── videos/
└── ...
```

### Build Process

#### Build All Images

```bash
cd docker
docker-compose build
```

#### Build Specific Service

```bash
# Backend only
docker-compose build backend

# Frontend only
docker-compose build frontend

# No cache (force rebuild)
docker-compose build --no-cache
```

#### Build with Build Arguments

```bash
docker-compose build --build-arg PYTHON_VERSION=3.12
```

### Run Services

#### Start Services

```bash
# Foreground (see logs)
docker-compose up

# Background (daemonized)
docker-compose up -d

# With specific services
docker-compose up -d backend frontend
```

#### Stop Services

```bash
# Stop all (preserves data)
docker-compose stop

# Stop specific service
docker-compose stop backend

# Remove containers and volumes
docker-compose down -v
```

#### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

---

## Raspberry Pi 5 Deployment

### One-Command Setup

```bash
curl -fsSL https://raw.githubusercontent.com/anonymousd3vs/Traffic_Control/master/docker/raspberrypi/setup-rpi.sh | bash
```

### Manual Setup

#### 1. Prerequisites

```bash
sudo apt update
sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh
sudo apt install docker-compose -y
```

#### 2. Configure System

```bash
# Enable cgroup memory
echo "cgroup_memory=1" | sudo tee -a /boot/firmware/cmdline.txt
sudo reboot

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. Clone Repository

```bash
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control/docker
```

#### 4. Build (RPi Optimized)

```bash
docker-compose -f raspberrypi/docker-compose.rpi.yml build
```

#### 5. Start

```bash
docker-compose -f raspberrypi/docker-compose.rpi.yml up -d
```

#### 6. Access

```
http://raspberrypi.local:3000
or
http://<your-pi-ip>:3000
```

### RPi-Specific Optimizations

The `docker-compose.rpi.yml` includes:

- **Reduced Resources:** 1 CPU, 1.5GB RAM for backend
- **Optimized Images:** ARM64 base images
- **Lower FPS:** 15 FPS video processing
- **Extended Timeouts:** For slower hardware
- **Health Checks:** 60s intervals for stability

---

## Configuration

### Environment Variables

Create/edit `docker/.env`:

```bash
# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8765
DETECTION_MODE=video
WORKERS=4

# Frontend Configuration
FRONTEND_PORT=3000

# Model Configuration
ONNX_MODEL=yolo11n.onnx
USE_ONNX=true

# Detection Parameters
CONFIDENCE_THRESHOLD=0.5
IOU_THRESHOLD=0.5
VEHICLE_ONLY=true

# Video Configuration
VIDEO_PLAYBACK_FPS=25
VIDEO_INPUT_PATH=/app/videos/
VIDEO_OUTPUT_PATH=/app/outputs/

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/traffic_control.log

# System
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

### Volume Mounts

```yaml
volumes:
  # Models (read-only in production)
  - ./models:/app/models:ro

  # Configuration (read-write)
  - ./config:/app/config:rw

  # Videos (read-only)
  - ./videos:/app/videos:ro

  # Logs (write access)
  - ./logs:/app/logs:rw
```

### Port Mapping

```yaml
ports:
  # Backend API
  - "8765:8765"

  # Frontend Web UI
  - "3000:3000"
```

---

## Docker Commands Reference

### Container Management

```bash
# List running containers
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs --tail 100 frontend

# Execute command in container
docker-compose exec backend bash
docker-compose exec backend python --version

# View container details
docker-compose exec backend df -h
docker-compose exec backend lsb_release -a
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi image_name

# Tag image
docker tag traffic-control-backend:latest myregistry/traffic-control-backend:1.0

# Push to registry
docker push myregistry/traffic-control-backend:1.0
```

### Network & Volume

```bash
# Inspect network
docker network inspect traffic-control

# List volumes
docker volume ls

# Inspect volume
docker volume inspect docker_backend-logs
```

---

## Monitoring & Logging

### Real-Time Monitoring

```bash
# CPU, Memory, Network I/O
docker stats

# Filtered view
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Save to file
docker stats --no-stream > stats.log
```

### Log Viewing

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend

# Follow logs
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail 50

# With timestamps
docker-compose logs --timestamps

# Filter errors
docker-compose logs | grep ERROR

# Export to file
docker-compose logs > debug.log 2>&1
```

### Health Checks

```bash
# Check service health
docker-compose exec backend curl -s http://localhost:8765/health

# Backend health
docker inspect traffic-control-backend | grep -A 10 "Health"

# Monitor health continuously
while true; do docker-compose exec backend curl -s http://localhost:8765/health && echo "" || echo "UNHEALTHY"; sleep 10; done
```

### Performance Metrics

```bash
# CPU usage
docker stats --format "{{.Container}}: {{.CPUPerc}}"

# Memory usage
docker stats --format "{{.Container}}: {{.MemUsage}}"

# Top processes
docker top traffic-control-backend

# System info
docker info
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Test build
docker-compose build --no-cache backend

# Verify image
docker run -it traffic-control-backend:latest /bin/bash

# Check Docker daemon
docker ps
docker system info
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8765
sudo lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env or docker-compose.yml
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Reduce container limits
# Edit docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G

# Clean up
docker system prune -a --volumes
```

### Network Issues

```bash
# Check container network
docker-compose exec backend curl -I http://frontend:3000

# Check DNS
docker-compose exec backend nslookup google.com

# Inspect network
docker network inspect traffic-control

# Restart networking
docker-compose down
docker-compose up -d
```

### WebSocket Connection Failed

```bash
# Check backend is running
docker-compose exec frontend curl http://backend:8765/health

# Check proxy configuration (nginx.conf)
docker exec traffic-control-frontend cat /etc/nginx/conf.d/default.conf | grep socket.io

# Verify Socket.IO port is exposed
docker port traffic-control-backend 8765
```

### High CPU Usage

```bash
# Identify high CPU process
docker top traffic-control-backend

# Reduce processing
# - Lower VIDEO_PLAYBACK_FPS in .env
# - Increase CONFIDENCE_THRESHOLD
# - Use lighter model

# Restart with new settings
docker-compose restart backend
```

### Permission Denied Errors

```bash
# Fix Docker permission
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker-compose ps

# Check file permissions
ls -la models/ config/ videos/
```

---

## Production Deployment

### Pre-Production Checklist

- [ ] All environment variables configured
- [ ] SSL/TLS certificate obtained
- [ ] Firewall rules configured
- [ ] Backup strategy planned
- [ ] Monitoring alerts set up
- [ ] Log rotation configured
- [ ] Resource limits tested

### Docker Registry

```bash
# Login to Docker Hub
docker login

# Tag image for registry
docker tag traffic-control-backend:latest username/traffic-control-backend:1.0

# Push to registry
docker push username/traffic-control-backend:1.0

# Pull from registry
docker pull username/traffic-control-backend:1.0
```

### Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml traffic-control

# View stack
docker stack ls
docker stack ps traffic-control

# Update service
docker service update --image newimage:tag traffic-control_backend
```

### Kubernetes Deployment

```bash
# Install Kubernetes
kubectl create -f k8s/

# Scale deployment
kubectl scale deployment traffic-control-backend --replicas=3

# View pods
kubectl get pods

# View logs
kubectl logs pod_name
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name traffic-control.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:8765;
    }
}
```

### SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d traffic-control.example.com

# Update Nginx config with SSL
sudo certbot --nginx -d traffic-control.example.com
```

### Automated Backups

```bash
#!/bin/bash
# Daily backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz ./config/

# Backup volumes
docker run --rm -v docker_backend-logs:/data -v $BACKUP_DIR:/backup \
  ubuntu tar -czf /backup/logs_$DATE.tar.gz -C /data .

echo "Backup completed: $DATE"
```

---

## Security Best Practices

### 1. Non-Root User

✅ **Implemented in Dockerfile:**

```dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
```

### 2. Resource Limits

✅ **Implemented in docker-compose.yml:**

```yaml
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 4G
    reservations:
      cpus: "1"
      memory: 2G
```

### 3. Read-Only Volumes

```yaml
volumes:
  - ./models:/app/models:ro
  - ./config:/app/config:ro
```

### 4. Firewall

```bash
sudo ufw enable
sudo ufw allow 3000
sudo ufw allow 8765
sudo ufw allow from 192.168.1.0/24  # Local network only
```

### 5. Secrets Management

```bash
# Use Docker secrets (Swarm mode)
echo "secret_password" | docker secret create db_password -

# Or use environment files
docker-compose --env-file .env.prod up -d
```

### 6. Image Scanning

```bash
# Scan image for vulnerabilities
docker scan traffic-control-backend:latest

# Use Trivy scanner
trivy image traffic-control-backend:latest
```

### 7. Network Security

```yaml
networks:
  traffic-control:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.enable_ip_masquerade: "true"
```

### 8. Regular Updates

```bash
# Update base images
docker pull python:3.12-slim
docker pull nginx:alpine

# Rebuild with latest bases
docker-compose build --no-cache
```

---

## Monitoring with Prometheus & Grafana

### Setup

```bash
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Metrics Collection

```bash
# Backend metrics
docker-compose exec backend curl http://localhost:8765/metrics

# Container metrics
docker stats --format "{{.Container}}: {{.CPUPerc}} {{.MemUsage}}"
```

---

## Performance Tuning

### CPU Optimization

```bash
# Limit CPU usage
deploy:
  resources:
    limits:
      cpus: '2'  # 2 cores max

# Check CPU cores
docker exec backend nproc
```

### Memory Optimization

```bash
# Limit memory
deploy:
  resources:
    limits:
      memory: 4G

# Monitor memory
docker stats --format "{{.Container}}: {{.MemUsage}}"
```

### I/O Optimization

```bash
# Use tmpfs for temporary files
tmpfs:
  - /tmp
  - /dev/shm

# Check I/O
docker stats --format "{{.Container}}: {{.NetIO}}"
```

---

## Support & Documentation

- **GitHub Issues:** https://github.com/anonymousd3vs/Traffic_Control/issues
- **Docker Documentation:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **Raspberry Pi Docs:** https://www.raspberrypi.com/documentation/

---

**Last Updated:** 2024
**Version:** 1.0.0
