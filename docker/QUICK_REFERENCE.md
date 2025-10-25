# Docker Quick Reference Card

## 🚀 Getting Started

```bash
# Clone project
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control/docker

# Setup (interactive)
docker-compose up -d

# Access dashboard
http://localhost:3000
```

---

## 📦 Build & Deployment

| Task                   | Command                           |
| ---------------------- | --------------------------------- |
| Build all images       | `docker-compose build`            |
| Build specific service | `docker-compose build backend`    |
| Rebuild without cache  | `docker-compose build --no-cache` |
| Start services         | `docker-compose up -d`            |
| View logs              | `docker-compose logs -f`          |
| Stop services          | `docker-compose stop`             |
| Remove & cleanup       | `docker-compose down -v`          |
| Restart service        | `docker-compose restart backend`  |

---

## 🔍 Monitoring

```bash
# Real-time resource usage
docker stats

# View logs with timestamps
docker-compose logs --timestamps -f

# Check service health
docker-compose exec backend curl http://localhost:8765/health

# List running containers
docker-compose ps

# Inspect container
docker inspect traffic-control-backend
```

---

## 🛠️ Troubleshooting

```bash
# Port in use?
sudo lsof -i :8765
sudo lsof -i :3000

# Container shell access
docker-compose exec backend bash
docker-compose exec frontend sh

# View recent errors
docker-compose logs | grep ERROR

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🍓 Raspberry Pi 5

```bash
# One-command setup
curl -fsSL https://raw.githubusercontent.com/anonymousd3vs/Traffic_Control/master/docker/raspberrypi/setup-rpi.sh | bash

# Manual: Build RPi optimized
docker-compose -f raspberrypi/docker-compose.rpi.yml build

# Manual: Start RPi services
docker-compose -f raspberrypi/docker-compose.rpi.yml up -d

# Access via local network
http://raspberrypi.local:3000
http://<pi-ip>:3000
```

---

## 📊 Docker Compose Operations

```bash
# Configuration
docker-compose config              # View merged config
docker-compose env                 # Show environment variables

# Services
docker-compose ps                  # List services
docker-compose up                  # Start (foreground)
docker-compose up -d               # Start (background)
docker-compose down                # Stop & remove
docker-compose restart             # Restart services
docker-compose pause               # Pause services
docker-compose unpause             # Resume services

# Logs & Debugging
docker-compose logs                # View all logs
docker-compose logs -f             # Follow logs
docker-compose logs backend        # Specific service
docker-compose exec backend bash   # Open shell

# Cleanup
docker-compose down                # Stop & remove containers
docker-compose down -v             # Also remove volumes
docker system prune                # Remove unused resources
```

---

## 🔌 Network & Ports

```bash
# Check port availability
netstat -tlnp | grep 8765
netstat -tlnp | grep 3000

# View network details
docker network ls
docker network inspect traffic-control

# Port mapping
Backend:  localhost:8765  → container:8765
Frontend: localhost:3000  → container:3000
```

---

## 📁 Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect traffic-control_backend-logs

# Backup volume
docker run --rm -v traffic-control_backend-logs:/data \
  -v $(pwd):/backup ubuntu tar -czf /backup/logs.tar.gz -C /data .

# Mount host directory to container
volumes:
  - ./models:/app/models:ro
  - ./config:/app/config:rw
```

---

## 🔐 Security

```bash
# Run container as non-root
# (Already configured in Dockerfile)
USER appuser

# Resource limits
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G

# Read-only volumes
- ./models:/app/models:ro

# Scan image for vulnerabilities
docker scan traffic-control-backend:latest
trivy image traffic-control-backend:latest
```

---

## 📋 Environment Variables

Create `docker/.env`:

```bash
# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8765
DETECTION_MODE=video
WORKERS=4

# Frontend
FRONTEND_PORT=3000

# Model
ONNX_MODEL=yolo11n.onnx
USE_ONNX=true

# Detection
CONFIDENCE_THRESHOLD=0.5
VEHICLE_ONLY=true

# Video
VIDEO_PLAYBACK_FPS=25

# Logging
LOG_LEVEL=INFO

# Python
PYTHONUNBUFFERED=1
```

---

## 🐛 Common Issues & Fixes

| Issue                     | Solution                                                  |
| ------------------------- | --------------------------------------------------------- |
| `Permission denied`       | `sudo usermod -aG docker $USER && newgrp docker`          |
| `Port already in use`     | `docker-compose down && sleep 5 && docker-compose up`     |
| `Out of memory`           | Check: `docker stats` \| Reduce: Memory limits in compose |
| `Container won't start`   | Check logs: `docker-compose logs backend`                 |
| `WebSocket won't connect` | Verify nginx.conf proxy setup \| Check firewall           |
| `Slow performance (RPi)`  | Lower VIDEO_PLAYBACK_FPS \| Increase CONFIDENCE_THRESHOLD |

---

## 🌐 Access URLs

| Component      | URL                           |
| -------------- | ----------------------------- |
| Dashboard      | http://localhost:3000         |
| Backend API    | http://localhost:8765         |
| Backend Health | http://localhost:8765/health  |
| Raspberry Pi   | http://raspberrypi.local:3000 |

---

## 📈 Performance Monitoring

```bash
# Watch resources
watch -n 1 'docker stats --no-stream'

# Check CPU usage
docker stats --format "{{.Container}}: {{.CPUPerc}}"

# Check memory
docker stats --format "{{.Container}}: {{.MemUsage}}"

# Check network I/O
docker stats --format "{{.Container}}: {{.NetIO}}"

# Log resource usage
docker stats --no-stream > stats.log &
```

---

## 🚢 Production Tips

```bash
# Use specific image tags
docker build -t traffic-control-backend:1.0.0 .

# Push to registry
docker tag traffic-control-backend:1.0.0 myregistry/traffic-control-backend:1.0.0
docker push myregistry/traffic-control-backend:1.0.0

# Use production compose
docker-compose -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose logs -f > production.log &

# Setup backups
0 2 * * * docker exec traffic-control-backend tar -czf /app/backups/config_$(date +\%Y\%m\%d).tar.gz /app/config
```

---

## 📚 Useful Links

- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Raspberry Pi Docker Setup](https://docs.docker.com/engine/install/raspberry-pi-os/)
- [Best Practices for Python Docker](https://docs.docker.com/language/python/build-images/)

---

## 💡 Pro Tips

✅ **Always use `docker-compose` for consistency**

```bash
docker-compose up  # vs docker run
```

✅ **Check logs first for any issues**

```bash
docker-compose logs -f backend
```

✅ **Use `.dockerignore` to reduce build context**

```
.git
__pycache__
.venv
node_modules
```

✅ **Multi-stage builds reduce image size**

```dockerfile
FROM builder as build
FROM runtime
COPY --from=build /app .
```

✅ **Always use health checks**

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8765/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

✅ **Tag images with semantic versioning**

```bash
docker tag traffic-control-backend:latest traffic-control-backend:1.0.0
```

---

**Quick Stats:**

- Backend Image: ~2.5 GB
- Frontend Image: ~150 MB
- Total Space: ~2.65 GB
- Build Time (first): ~10 minutes
- Build Time (incremental): ~1 minute
- Startup Time: ~30 seconds

---

**For detailed information, see:**

- `docker/README.md` - Complete deployment guide
- `docker/raspberrypi/README_RPI.md` - RPi-specific guide
- `docker/DOCKER_GUIDE.md` - In-depth reference
