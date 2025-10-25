# Docker Deployment Guide

**Complete guide for deploying Traffic Control System using Docker Hub images.**

> **Recommendation:** Use this method for production deployment. It ensures consistent environment across all systems (Windows, Linux, Raspberry Pi 5).

---

## 🚀 Quick Start (2 Minutes)

### Prerequisites
- Docker installed ([Get Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- ~5GB free disk space

### One-Command Deployment

```bash
# Clone the repository
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control

# Start all services
docker-compose -f docker/docker-compose.yml up
```

**That's it!** Open browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8765

---

## 📋 Installation Methods

### Method 1: Docker Compose (Easiest) ⭐ RECOMMENDED

**For:** Windows, Linux, macOS

```bash
cd Traffic_Control
docker-compose -f docker/docker-compose.yml up -d
```

**Services Started:**
- ✅ Backend (Python detection engine) - Port 8765
- ✅ Frontend (React dashboard) - Port 3000
- ✅ Auto-configured networking

**Stop Services:**
```bash
docker-compose -f docker/docker-compose.yml down
```

**View Logs:**
```bash
docker-compose -f docker/docker-compose.yml logs -f
```

---

### Method 2: Docker Compose for Raspberry Pi 5

**For:** Raspberry Pi 5 (ARM64)

```bash
cd Traffic_Control
docker-compose -f docker/raspberrypi/docker-compose.rpi.yml up -d
```

**Differences:**
- Optimized for ARM64 architecture
- Lower memory footprint
- ONNX inference optimized for RPi

---

### Method 3: Manual Docker Commands

**For:** Custom configurations or learning

**Pull Images from Docker Hub:**
```bash
# Backend image
docker pull anonymousd3vs/traffic-backend:latest

# Frontend image
docker pull anonymousd3vs/traffic-frontend:latest
```

**Run Backend:**
```bash
docker run -d \
  --name traffic-backend \
  -p 8765:8765 \
  -v $(pwd)/videos:/app/videos \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/config:/app/config \
  -e DETECTION_MODE=zone \
  anonymousd3vs/traffic-backend:latest
```

**Run Frontend:**
```bash
docker run -d \
  --name traffic-frontend \
  -p 3000:3000 \
  anonymousd3vs/traffic-frontend:latest
```

**Run with Network Connection:**
```bash
# Create network
docker network create traffic-network

# Run backend
docker run -d \
  --name traffic-backend \
  --network traffic-network \
  -p 8765:8765 \
  -v $(pwd)/videos:/app/videos \
  -v $(pwd)/output:/app/output \
  anonymousd3vs/traffic-backend:latest

# Run frontend
docker run -d \
  --name traffic-frontend \
  --network traffic-network \
  -p 3000:3000 \
  anonymousd3vs/traffic-frontend:latest
```

---

## 🎯 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Detection Settings
DETECTION_MODE=zone          # zone or line
CONFIDENCE_THRESHOLD=0.5
GPU_ENABLED=false

# Model Settings
MODEL_PATH=/app/optimized_models
AMBULANCE_CONFIDENCE=0.7

# Video Settings
VIDEO_INPUT=/app/videos
VIDEO_OUTPUT=/app/output
MAX_FRAME_WIDTH=1280
MAX_FRAME_HEIGHT=720

# Backend Settings
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8765
BACKEND_WORKERS=4

# Dashboard Settings
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=3000
```

**Load in Docker Compose:**
```yaml
services:
  backend:
    env_file: .env
    environment:
      - DETECTION_MODE=${DETECTION_MODE}
      - GPU_ENABLED=${GPU_ENABLED}
```

---

## 📁 Volume Mounts

### Persistent Data Folders

```bash
docker-compose -f docker/docker-compose.yml up \
  -v traffic_videos:/app/videos \
  -v traffic_output:/app/output \
  -v traffic_config:/app/config \
  -v traffic_logs:/app/logs
```

### Folder Structure

```
Traffic_Control/
├── videos/              ← Add your video files here
├── output/              ← Output videos saved here
├── config/              ← Lane configs saved here
├── logs/                ← Application logs
└── docker/
    └── docker-compose.yml
```

---

## 🐳 Docker Images

### Image Details

| Image | Size | Base | Purpose |
|-------|------|------|---------|
| `traffic-backend:latest` | ~850MB | Python 3.11-slim | Detection + API |
| `traffic-frontend:latest` | ~180MB | Node 18 → Nginx | React Dashboard |

### Available Tags

```bash
# Latest stable
docker pull anonymousd3vs/traffic-backend:latest

# Specific version
docker pull anonymousd3vs/traffic-backend:v2.2

# ARM64 for Raspberry Pi
docker pull anonymousd3vs/traffic-backend:latest-arm64
```

---

## ✅ Verification & Testing

### Check Container Status

```bash
# List running containers
docker ps

# Expected output:
# traffic-backend    Running on 0.0.0.0:8765
# traffic-frontend   Running on 0.0.0.0:3000
```

### Test Backend API

```bash
# Check backend health
curl http://localhost:8765/api/health

# Expected response:
# {"status": "healthy", "version": "2.2"}
```

### Test Frontend

```bash
# Open browser
http://localhost:3000
```

### View Logs

```bash
# Backend logs
docker logs -f traffic-backend

# Frontend logs
docker logs -f traffic-frontend

# All logs
docker-compose logs -f
```

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8765
# Windows
netstat -ano | findstr :8765
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8765
kill -9 <PID>

# Or use different port
docker run -p 9000:8765 traffic-backend
```

### Container Won't Start

```bash
# Check logs
docker logs <container_name>

# Inspect image
docker inspect anonymousd3vs/traffic-backend:latest

# Try rebuild
docker pull --no-cache anonymousd3vs/traffic-backend:latest
```

### Out of Memory

```bash
# Limit memory usage
docker run -m 2g traffic-backend

# Or in docker-compose.yml
services:
  backend:
    mem_limit: 2g
```

### GPU Support (Linux with NVIDIA)

```bash
# Install nvidia-docker
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  tee /etc/apt/sources.list.d/nvidia-docker.list

# Run with GPU
docker run --gpus all -p 8765:8765 anonymousd3vs/traffic-backend:latest
```

---

## 🚦 Common Workflows

### Process a Single Video

```bash
# Place video in videos/ folder
cp my_video.mp4 videos/

# Backend processes it automatically
# Check output/ for results
ls output/
```

### Configure Lane for Video

```bash
# Access backend API
curl -X POST http://localhost:8765/api/configure-lane \
  -H "Content-Type: application/json" \
  -d '{
    "video": "my_video.mp4",
    "lane_points": [[100,50], [300,50], [350,400], [50,400]]
  }'
```

### Export Configuration

```bash
# Save current config
docker exec traffic-backend cp config/lane_config.json /app/output/

# Retrieve from local
cat config/lane_config.json
```

### Backup & Restore

```bash
# Backup volumes
docker run --rm \
  -v traffic_config:/config \
  -v $(pwd)/backups:/backup \
  ubuntu tar czf /backup/config-backup.tar.gz -C /config .

# Restore volumes
docker run --rm \
  -v traffic_config:/config \
  -v $(pwd)/backups:/backup \
  ubuntu tar xzf /backup/config-backup.tar.gz -C /config
```

---

## 📊 Performance Tips

### For Optimal Performance

1. **Enable GPU (if available)**
   ```bash
   docker run --gpus all traffic-backend
   ```

2. **Increase Workers**
   ```env
   BACKEND_WORKERS=8  # Default: 4
   ```

3. **Optimize Memory**
   ```bash
   docker run -m 4g traffic-backend
   ```

4. **Use Zone-Based Mode** (faster)
   ```env
   DETECTION_MODE=zone
   ```

5. **Lower Resolution** (for edge devices)
   ```env
   MAX_FRAME_WIDTH=640
   MAX_FRAME_HEIGHT=480
   ```

---

## 🔐 Security

### Run as Non-Root

```yaml
# docker-compose.yml
services:
  backend:
    user: "1000:1000"  # Non-root user
    read_only: true    # Read-only filesystem
```

### Limit Resource Usage

```yaml
services:
  backend:
    mem_limit: 2g
    cpus: "2"
    pids_limit: 100
```

### Network Isolation

```bash
# Create isolated network
docker network create --driver bridge traffic-net

# Connect only specific containers
docker run --network traffic-net traffic-backend
```

---

## 📚 Advanced Topics

### Build Custom Image

```bash
# Navigate to docker folder
cd docker/backend

# Build
docker build -t my-traffic-backend:custom .

# Run
docker run -p 8765:8765 my-traffic-backend:custom
```

### Push to Private Registry

```bash
# Tag for private registry
docker tag traffic-backend:latest \
  myregistry.azurecr.io/traffic-backend:latest

# Push
docker push myregistry.azurecr.io/traffic-backend:latest
```

### Kubernetes Deployment (Advanced)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traffic-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: traffic-backend
  template:
    metadata:
      labels:
        app: traffic-backend
    spec:
      containers:
      - name: backend
        image: anonymousd3vs/traffic-backend:latest
        ports:
        - containerPort: 8765
        resources:
          limits:
            memory: "2Gi"
            cpu: "2"
```

---

## 🆘 Support & Troubleshooting

### Get Help

1. Check logs: `docker logs <container>`
2. See FAQ below
3. Open issue: https://github.com/anonymousd3vs/Traffic_Control/issues

### FAQ

**Q: Can I run both backend and frontend on same machine?**
A: Yes! Docker Compose handles this automatically.

**Q: What if port 3000 or 8765 is already in use?**
A: Modify ports in docker-compose.yml or use `-p 9000:8765` flag.

**Q: How do I update the image to latest version?**
A: `docker pull anonymousd3vs/traffic-backend:latest` then restart.

**Q: Can I use on Raspberry Pi 5?**
A: Yes! Use the RPi-specific docker-compose file.

**Q: Do I need GPU?**
A: No. CPU works fine with ONNX optimization. GPU optional for faster inference.

**Q: How much storage do I need?**
A: ~5GB for images + space for videos/output.

---

## 📖 Related Documentation

- [`CLASSICAL_DEPLOYMENT.md`](CLASSICAL_DEPLOYMENT.md) - Traditional GitHub clone method
- [`docker/README.md`](docker/README.md) - Docker folder overview
- [`docker/DOCKER_GUIDE.md`](docker/DOCKER_GUIDE.md) - Technical Docker details
- [`dashboard/README.md`](dashboard/README.md) - Dashboard documentation

---

**Version:** 2.2  
**Last Updated:** October 26, 2025  
**Repository:** [github.com/anonymousd3vs/Traffic_Control](https://github.com/anonymousd3vs/Traffic_Control)
