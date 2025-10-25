# Raspberry Pi 5 Setup Guide

## 📋 Prerequisites

- **Raspberry Pi 5** (8GB RAM recommended)
- **32GB+ microSD Card** (Class 10+)
- **Power Supply: 5V 5A**
- **Network connectivity** (Ethernet or WiFi)
- **Active internet connection**

---

## 🚀 One-Command Setup

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/anonymousd3vs/Traffic_Control/master/docker/raspberrypi/setup-rpi.sh | bash
```

---

## 📝 Manual Setup Steps

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Install Docker Compose

```bash
sudo apt install docker-compose -y
```

### 4. Enable Cgroup Memory (Required for Resource Limits)

```bash
echo "cgroup_memory=1" | sudo tee -a /boot/firmware/cmdline.txt
sudo reboot
```

### 5. Clone Repository

```bash
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control/docker
```

### 6. Create Configuration

```bash
cp .env.example .env

# Edit if needed
nano .env
```

### 7. Build Images

```bash
docker-compose -f raspberrypi/docker-compose.rpi.yml build
```

### 8. Start Services

```bash
docker-compose -f raspberrypi/docker-compose.rpi.yml up -d
```

### 9. Verify Installation

```bash
docker-compose ps
docker stats
```

---

## 🎯 Access the Dashboard

### Local Network

```
http://raspberrypi.local:3000
```

### Using IP Address

```
http://<your-pi-ip>:3000
```

### API Endpoint

```
http://raspberrypi.local:8765
```

---

## 🔧 Configuration

### Environment Variables

Edit `docker/.env` for custom settings:

```bash
# Model selection
ONNX_MODEL=yolo11n.onnx
USE_ONNX=true

# Video settings
VIDEO_PLAYBACK_FPS=15

# Detection
CONFIDENCE_THRESHOLD=0.6
```

### Adding Videos

```bash
# Place video files in:
./videos/

# Accessible in app at:
/app/videos/
```

### Configure Lanes

```bash
# Edit lane configuration:
nano ./config/lane_config.json

# Changes take effect after restart
docker-compose restart backend
```

---

## 📊 Performance Optimization

### Monitor Resources

```bash
# Real-time monitoring
docker stats

# Log to file
docker stats > pi_stats.log &
```

### Reduce CPU Usage

1. Lower video FPS: `VIDEO_PLAYBACK_FPS=10`
2. Increase confidence threshold: `CONFIDENCE_THRESHOLD=0.7`
3. Use lighter model: `ONNX_MODEL=yolo11n.onnx`

### Reduce Memory Usage

1. Use ONNX models (more efficient)
2. Lower batch size in backend
3. Enable memory limits in compose file

### Enable Swap (Additional Memory)

```bash
# Check current swap
free -h

# Increase swap size
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Change CONF_SWAPSIZE=100 to CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Verify
free -h
```

---

## 🌡️ Temperature Monitoring

### Check CPU Temperature

```bash
vcgencmd measure_temp
```

### Monitor Continuously

```bash
while true; do vcgencmd measure_temp && sleep 2; done
```

### Safe Temperature Ranges

- Normal: < 60°C
- Warm: 60-80°C
- Hot: > 80°C (Throttling may occur)

### Cooling Solutions

- **Passive Cooling:** Heatsink or case with ventilation
- **Active Cooling:** Small fan attachment
- **Placement:** Well-ventilated area, avoid sunlight

---

## 📋 Useful Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose -f raspberrypi/docker-compose.rpi.yml logs -f backend

# Follow and filter
docker-compose logs -f | grep ERROR
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend

# Full rebuild and restart
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands

```bash
# Backend shell
docker-compose exec backend bash

# Run Python command
docker-compose exec backend python -c "print('Hello')"
```

### Cleanup

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker ps
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Remove old logs
sudo journalctl --vacuum=50M
```

### High Temperature

```bash
# Check throttling
vcgencmd get_throttled

# Reduce load
docker-compose stop  # Stop services
vcgencmd measure_temp  # Check temp recovery
```

### Services Won't Start

```bash
# Check service logs
docker-compose logs backend

# Verify ports are free
sudo netstat -tlnp | grep :8765
sudo netstat -tlnp | grep :3000

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Network Issues

```bash
# Check connectivity
docker-compose exec backend curl -I http://frontend:3000

# Verify DNS
docker-compose exec backend nslookup docker.com

# Check network
docker network inspect traffic-control
```

---

## 🔒 Security Tips

1. **Change Default Credentials** (if any)
2. **Use Firewall**

   ```bash
   sudo ufw enable
   sudo ufw allow 3000
   sudo ufw allow 8765
   ```

3. **Keep System Updated**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Use HTTPS** (with reverse proxy)

5. **Restrict Network Access**
   ```bash
   # Only allow local network
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   ```

---

## 📈 Scaling & Production

### Auto-restart Services

Services are configured with `restart: unless-stopped`

### Monitor Uptime

```bash
# Check container uptime
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Backup Configuration

```bash
# Backup config
tar -czf traffic-control-backup.tar.gz config/

# Restore config
tar -xzf traffic-control-backup.tar.gz
```

---

## 📞 Getting Help

### Check Status

```bash
# Service status
docker-compose ps

# System info
docker info

# Version info
docker --version
docker-compose --version
uname -a
```

### View Detailed Logs

```bash
# Export logs for debugging
docker-compose logs --timestamps > debug.log

# Share with support team
cat debug.log | head -100
```

---

## 🎉 You're All Set!

Your Traffic Control System is ready on Raspberry Pi 5!

**Next Steps:**

1. Access dashboard: http://raspberrypi.local:3000
2. Upload video or configure
3. Start detection
4. Monitor system resources
5. Fine-tune settings as needed

**Happy Traffic Monitoring! 🚦**
