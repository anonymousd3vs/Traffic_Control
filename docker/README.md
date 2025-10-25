# Traffic Control System - Docker Deployment Guide

🐳 **Complete Docker setup for easy deployment across Linux, macOS, and Raspberry Pi 5**

## 📋 Prerequisites

- **Docker** (20.10+)
- **Docker Compose** (1.29+)
- **Git** (for cloning)
- **4GB+ RAM** (minimum recommended)
- **2GB+ Disk Space** (for models and dependencies)

### Installation

**Linux/macOS:**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Raspberry Pi 5:**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🚀 Quick Start

### 1. **Clone Repository**

```bash
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control
```

### 2. **Configure Environment**

```bash
# Copy example environment file
cp docker/.env.example docker/.env

# Edit configuration (optional)
nano docker/.env
```

### 3. **Build Docker Images**

```bash
cd docker
docker-compose build
```

### 4. **Start Services**

```bash
docker-compose up -d
```

### 5. **Access Dashboard**

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8765
- **API Docs:** http://localhost:8765/docs

---

## 📁 Project Structure

```
docker/
├── backend/
│   ├── Dockerfile              # Backend Python container
│   └── .dockerignore          # Build exclusions
├── frontend/
│   ├── Dockerfile             # Frontend Node.js container
│   ├── nginx.conf            # Nginx configuration
│   └── .dockerignore
├── docker-compose.yml         # Multi-container orchestration
├── .env.example              # Environment template
└── README.md                 # This file
```

---

## 🎛️ Configuration

### Environment Variables

Edit `docker/.env` to customize:

```bash
# Backend Settings
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8765

# Model Selection
ONNX_MODEL=indian_ambulance_yolov11n_best.onnx
USE_ONNX=true

# Detection Parameters
CONFIDENCE_THRESHOLD=0.5
VEHICLE_ONLY=true
```

### Volume Mounts

**Videos:**

```bash
# Place your video files in:
./videos/

# Docker will mount to /app/videos
```

**Configuration:**

```bash
# Lane configurations:
./config/

# Docker will mount to /app/config
```

**Models:**

```bash
# Pre-place models in:
./models/

# Docker will mount to /app/models (read-only)
```

---

## 🛠️ Common Commands

### View Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Check Service Status

```bash
docker-compose ps
```

### Execute Commands in Container

```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh
```

### Rebuild Images

```bash
docker-compose build --no-cache
```

---

## 🎯 Typical Workflow

### 1. **First Time Setup**

```bash
# Copy environment
cp .env.example .env

# Build images
docker-compose build

# Start all services
docker-compose up -d

# Wait for services to initialize (30-40 seconds)
sleep 40

# Check health
docker-compose ps
```

### 2. **Using the System**

```bash
# Access dashboard
# Browser: http://localhost:3000

# Upload video or select from existing
# Configure lane settings
# Start detection
```

### 3. **Viewing Logs**

```bash
# Real-time logs
docker-compose logs -f

# Backend-only
docker-compose logs -f backend

# Follow specific service
docker-compose logs -f frontend
```

### 4. **Stopping**

```bash
# Graceful stop
docker-compose down

# Remove volumes too
docker-compose down -v
```

---

## 🐧 Raspberry Pi 5 Specific Setup

### Hardware Requirements

- **Raspberry Pi 5 (8GB RAM recommended)**
- **32GB+ microSD Card (Class 10+)**
- **Power Supply: 5V 5A**
- **Cooling Solution (Optional but recommended)**

### Installation Steps

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# 4. Enable cgroup memory
echo "cgroup_memory=1" | sudo tee -a /boot/firmware/cmdline.txt

# 5. Reboot
sudo reboot

# 6. Clone project
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control/docker

# 7. Start services
docker-compose -f docker-compose.rpi.yml up -d
```

### Raspberry Pi Optimizations

**Use optimized Compose file:**

```bash
docker-compose -f docker-compose.rpi.yml up -d
```

**Monitor CPU/Memory:**

```bash
docker stats
```

**Check Temperature:**

```bash
vcgencmd measure_temp
```

---

## 📊 Performance Tuning

### For High Performance Systems

```yaml
# In docker-compose.yml
backend:
  deploy:
    resources:
      limits:
        cpus: "2"
        memory: 3G
      reservations:
        cpus: "1"
        memory: 1G
```

### For Resource-Constrained Systems (Raspberry Pi)

```yaml
# Use docker-compose.rpi.yml
backend:
  deploy:
    resources:
      limits:
        cpus: "1"
        memory: 1G
      reservations:
        cpus: "0.5"
        memory: 512M
```

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Find process using port 8765
lsof -i :8765

# Kill process (if needed)
kill -9 <PID>
```

### Containers Won't Start

```bash
# Check logs
docker-compose logs

# Remove dangling containers
docker container prune

# Full rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### High Memory Usage

```bash
# Check container resource usage
docker stats

# Restart services
docker-compose restart

# Check for memory leaks in logs
docker-compose logs | grep -i error
```

### WebSocket Connection Issues

```bash
# Verify backend is running
curl http://localhost:8765/health

# Check frontend connectivity
docker-compose exec frontend curl http://backend:8765/health
```

### Raspberry Pi Slow Performance

```bash
# Reduce video FPS
export VIDEO_PLAYBACK_FPS=15

# Use lighter model
export ONNX_MODEL=yolo11n.onnx

# Enable swap
sudo dphys-swapfile swapon
```

---

## 📈 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8765/health

# Frontend health
curl http://localhost:3000/health

# Check service status
docker-compose ps
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Memory usage
docker stats --no-stream

# CPU usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 🔒 Security Best Practices

### 1. **Use Non-Root User**

✅ Already configured in Dockerfiles

### 2. **Set Resource Limits**

```yaml
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 2G
```

### 3. **Use Read-Only Volumes**

```yaml
volumes:
  - ./models:/app/models:ro
```

### 4. **Enable Docker Content Trust**

```bash
export DOCKER_CONTENT_TRUST=1
```

### 5. **Keep Base Images Updated**

```bash
docker pull python:3.12-slim
docker pull node:18-alpine
docker pull nginx:alpine
```

---

## 📦 Image Sizes

| Component | Size    | Notes                         |
| --------- | ------- | ----------------------------- |
| Backend   | ~2.5GB  | Includes Python, OpenCV, YOLO |
| Frontend  | ~150MB  | Nginx + React build           |
| Total     | ~2.65GB | With both services            |

**Optimization Tips:**

- Use `.dockerignore` to exclude unnecessary files
- Multi-stage builds to reduce final size
- Alpine base images for frontend

---

## 🚀 Deployment to Production

### Using Docker Hub

```bash
# Tag image
docker tag traffic-control-backend:latest yourusername/traffic-control-backend:1.0

# Push to Docker Hub
docker push yourusername/traffic-control-backend:1.0

# Pull on production server
docker pull yourusername/traffic-control-backend:1.0
```

### Using Private Registry

```bash
# Tag for private registry
docker tag traffic-control-backend:latest myregistry.com/traffic-control-backend:1.0

# Push
docker push myregistry.com/traffic-control-backend:1.0

# In docker-compose.yml
backend:
  image: myregistry.com/traffic-control-backend:1.0
```

---

## 📝 Logs & Debugging

### View All Logs

```bash
docker-compose logs
```

### Follow Logs in Real-Time

```bash
docker-compose logs -f
```

### Logs for Specific Service

```bash
docker-compose logs backend
docker-compose logs frontend
```

### Export Logs

```bash
docker-compose logs > debug.log
```

---

## 🆘 Getting Help

### Check System Status

```bash
# Docker info
docker info

# Check version
docker --version
docker-compose --version

# List images
docker images

# List containers
docker ps -a
```

### Common Issues & Solutions

**Issue: "Cannot connect to Docker daemon"**

```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

**Issue: "Permission denied"**

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Issue: "Out of disk space"**

```bash
# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune
```

---

## 📞 Support

For issues and questions:

- 📧 Open an issue on GitHub
- 💬 Check existing documentation
- 🐛 Include Docker version and system info in bug reports

---

## 📄 License

This Docker configuration is part of the Traffic Control System project.

---

**Happy Deploying! 🎉**
