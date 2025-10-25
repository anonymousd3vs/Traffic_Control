# Traffic Control System - Development Roadmap

**Last Updated:** October 25, 2025  
**Current Version:** 2.2 (Phase 2 Complete - Traffic Signals & Dashboard)

---

## 🎯 Project Status Overview

### ✅ **COMPLETED** (Phase 1 & 2)

#### Phase 1: Core Detection & Configuration

- [x] **Vehicle Detection** - ONNX-optimized YOLOv11n (3-5x faster)
- [x] **Ambulance Detection** - Custom Indian ambulance model
- [x] **ByteTrack Tracking** - Multi-object tracking with trajectory
- [x] **Dual-Mode Operation** - Zone-based & Line-based counting
- [x] **Interactive Lane Configuration** - Point-and-click polygon drawing
- [x] **Zone-Based Counting** - Movement-based counting (≥50px threshold)
- [x] **ONNX Model Optimization** - PyTorch to ONNX conversion
- [x] **Video-Specific Configurations** - Per-video lane configs
- [x] **Configuration Migration Tool** - Migrate old configs to new system
- [x] **Video Config Manager** - Utility module for config management

#### Phase 1.5: Real-Time Dashboard ✅

- [x] **WebSocket Server** - Real-time data streaming with Socket.IO
- [x] **Live Video Feed** - Processed video with detection overlays
- [x] **System Metrics Panel** - FPS, active vehicles, total count
- [x] **Emergency Alert Widget** - Visual/audio alerts for ambulance
- [x] **Traffic Flow Charts** - Historical data visualization (Recharts)
- [x] **React Frontend** - Modern responsive UI with Tailwind CSS
- [x] **Metrics Fix** - Dashboard metrics now displaying correctly
- [x] **Config Auto-Detection** - Video configs auto-detected by dashboard

#### Phase 2: Traffic Signal Integration ✅

- [x] **Signal State Machine** - 4-state FSM (RED, YELLOW, GREEN, EMERGENCY)
- [x] **Priority Manager** - Multi-signal coordination with emergency override
- [x] **Visual Simulator** - Pygame-based 4-way intersection visualization
- [x] **GPIO Controller** - Raspberry Pi GPIO interface
- [x] **Modbus Controller** - Industrial Modbus TCP/RTU support
- [x] **REST API Handler** - 10+ endpoints for signal control
- [x] **Emergency Tracking** - Automatic ambulance priority (45s duration)
- [x] **Statistics & Metrics** - Real-time and historical data collection

**Overall Completion:** ~95% ✅ - System is production-ready!

---

## 🚀 **REMAINING WORK** (Phase 3)

#### 1.1 Web Dashboard

**Goal:** Real-time monitoring interface with live feed and metrics

**Components to Build:**

```
dashboard/
├── backend/
│   ├── websocket_server.py       # WebSocket server for real-time data
│   ├── stream_manager.py         # Manages video stream encoding
│   └── api_routes.py             # REST API endpoints (optional)
├── frontend/
│   ├── index.html                # Main dashboard page
│   ├── app.js                    # Dashboard logic
│   └── styles.css                # Dashboard styling
└── README.md                     # Dashboard documentation
```

**Required Features:**

- [ ] **WebSocket Server** (`websocket_server.py`)

  - Real-time data streaming to web clients
  - Client connection management
  - Broadcast vehicle detection events
  - Send system metrics (FPS, count, etc.)

- [ ] **Live Video Feed**

  - Encode processed frames to MJPEG/WebRTC
  - Display bounding boxes and tracking
  - Show lane polygons overlay
  - FPS counter overlay

- [ ] **System Metrics Panel**

  - Current FPS & processing time
  - Active vehicles count
  - Total vehicles counted
  - Mode indicator (Zone/Line-based)
  - Video source name

- [ ] **Emergency Alert Widget**

  - Red alert banner when ambulance detected
  - Show ambulance confidence score
  - Display detection stability status
  - Audio alert option (optional)

- [ ] **Traffic Flow Visualization**
  - Real-time line chart (last 5-10 minutes)
  - Vehicle count over time
  - Peak detection highlighting

**Integration Points:**

```python
# In final_tracking_onnx.py
from dashboard.backend.websocket_server import DashboardStreamer

# Initialize in __init__
self.dashboard = DashboardStreamer()

# In process_frame() - broadcast every 5 frames
if self.frame_count % 5 == 0:
    self.dashboard.broadcast({
        'fps': self.fps,
        'vehicle_count': self.tracker.total_count,
        'active_vehicles': len(self.tracker.objects),
        'ambulance_detected': self.ambulance_detected,
        'mode': 'zone' if self.lane_filter_enabled else 'line'
    })

# Encode and send video frame
frame_encoded = encode_frame(display_frame)
self.dashboard.send_frame(frame_encoded)
```

**Tech Stack Options:**

- **Option A:** React + WebSocket (More customizable, modern)
- **Option B:** Flask + Socket.IO + Simple HTML/JS (Simpler, faster to build)
- **Option C:** Dash/Plotly (Great visualizations, Python-based)

**Recommended:** Option B for faster development, can migrate to React later

**Deliverables:**

- [ ] Working dashboard accessible at `http://localhost:5000`
- [ ] Real-time video feed with overlays
- [ ] Live metrics updating every second
- [ ] Emergency alert system
- [ ] Traffic flow chart

---

### **PHASE 2: Traffic Signal Integration** 🚦

**Priority:** 🔴 **HIGH** (Critical for safety)  
**Estimated Time:** 2-3 weeks  
**Status:** ❌ Not Started

#### 2.1 Signal Control System

**Goal:** Smart traffic light control with ambulance priority

**Components to Build:**

```
traffic_signals/
├── core/
│   ├── signal_state_machine.py   # Traffic light FSM
│   ├── priority_manager.py       # Emergency priority logic
│   └── timing_controller.py      # Signal timing management
├── hardware/
│   ├── gpio_controller.py        # Raspberry Pi GPIO (production)
│   ├── modbus_controller.py      # Industrial signals (production)
│   └── signal_simulator.py       # Visual simulator (testing)
├── api/
│   ├── signal_api.py             # REST/MQTT API
│   └── websocket_handler.py      # Real-time updates
└── README.md                     # Signal integration docs
```

**Required Features:**

- [ ] **Signal State Machine** (`signal_state_machine.py`)

  ```python
  class SignalState(Enum):
      RED = "RED"
      YELLOW = "YELLOW"
      GREEN = "GREEN"
      EMERGENCY = "EMERGENCY"  # Special mode for ambulances
  ```

  - State transitions: RED → GREEN → YELLOW → RED
  - Emergency override: Any state → EMERGENCY → Resume
  - Configurable timing per state
  - All-red clearance interval (3-4 seconds)

- [ ] **Priority Manager** (`priority_manager.py`)

  - Listens for ambulance detection events
  - Calculates route and affected signals
  - Activates emergency mode on relevant signals
  - Coordinates multi-signal priority (if multiple intersections)
  - Resets to normal operation after ambulance passes

- [ ] **Signal Simulator** (`signal_simulator.py`)

  - Visual representation using Pygame/Tkinter
  - Shows 4-way intersection with traffic lights
  - Color-coded signals (Red/Yellow/Green)
  - Emergency mode indication
  - Real-time state changes
  - Test controls (manual ambulance trigger)

- [ ] **Hardware Controllers**

  - **GPIO Controller** (`gpio_controller.py`)
    - For Raspberry Pi deployment
    - Controls physical relays/LEDs
    - Uses RPi.GPIO or gpiozero library
  - **Modbus Controller** (`modbus_controller.py`)
    - For industrial traffic controllers
    - Implements Modbus TCP/RTU protocol
    - Reads/writes to controller registers

- [ ] **Signal API** (`signal_api.py`)
  - REST endpoints:
    - `GET /signals/status` - Get all signal states
    - `POST /signals/{id}/emergency` - Activate emergency mode
    - `POST /signals/{id}/reset` - Reset to normal
    - `GET /signals/{id}/timing` - Get timing configuration
  - MQTT topics (optional):
    - `traffic/signals/{id}/state` - Signal state updates
    - `traffic/emergency/activate` - Emergency activation command

**Integration with Detection System:**

```python
# In final_tracking_onnx.py
from traffic_signals.core.priority_manager import PriorityManager

# Initialize in __init__
self.priority_manager = PriorityManager()
self.priority_manager.register_signal('signal_001', location='north')

# In process_frame() - when ambulance detected with high confidence
if self.ambulance_detected and self.ambulance_confidence > 0.7:
    if not self.emergency_mode_active:
        self.priority_manager.activate_emergency({
            'ambulance_id': ambulance_id,
            'confidence': self.ambulance_confidence,
            'location': 'approaching_intersection',
            'timestamp': datetime.now()
        })
        self.emergency_mode_active = True
        logger.info("🚨 EMERGENCY MODE ACTIVATED - Ambulance detected!")
```

**Configuration:**

Uses existing `config/development.yaml` and `config/production.yaml`:

```yaml
# Example: config/development.yaml
traffic_controller:
  controller_type: "simulator" # or "gpio", "modbus"
  intersection_id: "intersection_001"
  signal_phases:
    north_south: 30 # seconds
    east_west: 25
  minimum_green_time: 10
  all_red_clearance: 3
  emergency:
    priority_duration: 45 # seconds
    clearance_time: 5
```

**Deliverables:**

- [ ] Working signal simulator (visual testing)
- [ ] Emergency priority activation working
- [ ] State machine with proper timing
- [ ] Hardware controller interfaces (GPIO + Modbus)
- [ ] REST API for signal control
- [ ] Integration with detection system
- [ ] Documentation and testing guide

---

### **PHASE 3: System Integration & Testing** 🔧

**Priority:** 🟡 **MEDIUM**  
**Estimated Time:** 1-2 weeks  
**Status:** ❌ Not Started

#### 3.1 Multi-Camera Support

**Goal:** Support multiple camera feeds simultaneously

**Components:**

- [ ] **Camera Manager** (`camera_manager.py`)

  - Manage multiple video sources (RTSP/file/webcam)
  - Load video-specific lane configs automatically
  - Distribute processing across cameras
  - Handle camera disconnections/reconnections

- [ ] **Configuration Manager**
  - Enhanced `video_config_manager.py`
  - Support camera IDs in addition to video filenames
  - Per-camera settings (resolution, FPS, detection params)

**Example:**

```python
# cameras.yaml
cameras:
  - id: "cam_north"
    source: "rtsp://192.168.1.10:554/stream1"
    lane_config: "config/lane_config_cam_north.json"
    enabled: true
  - id: "cam_south"
    source: "rtsp://192.168.1.11:554/stream1"
    lane_config: "config/lane_config_cam_south.json"
    enabled: true
```

#### 3.2 Testing Suite

**Goal:** Ensure system reliability and correctness

- [ ] **Unit Tests** (`tests/unit/`)

  - Test video_config_manager functions
  - Test lane polygon filtering
  - Test tracking logic
  - Test signal state machine

- [ ] **Integration Tests** (`tests/integration/`)

  - Test full detection pipeline
  - Test dashboard data flow
  - Test signal integration
  - Test multi-camera scenarios

- [ ] **Performance Tests** (`tests/performance/`)
  - FPS benchmarking on different hardware
  - Memory usage profiling
  - Stress testing (multiple cameras)

**Testing Framework:**

```bash
# Install testing dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest tests/ --cov=./ --cov-report=html
```

---

### **PHASE 4: Production Hardening** 🏭

**Priority:** 🟢 **LOW** (Nice to have)  
**Estimated Time:** 2-3 weeks  
**Status:** ❌ Not Started

#### 4.1 REST API Service

**Goal:** Expose system functionality via HTTP API

- [ ] **API Server** (`api/`)
  - FastAPI or Flask-based REST API
  - Endpoints for system status, metrics, configuration
  - WebSocket endpoints for real-time data
  - Authentication (API keys or JWT)

#### 4.2 Configuration Web UI

**Goal:** Browser-based configuration management

- [ ] **Web-Based Lane Config**
  - Canvas-based lane drawing (like desktop tool)
  - Save/load configs from browser
  - Preview lane overlays on video
  - Remote configuration from dashboard

#### 4.3 Monitoring & Logging

**Goal:** Production-grade monitoring and debugging

- [ ] **Structured Logging**

  - JSON logging format
  - Log levels per module
  - Rotating log files
  - Centralized logging (optional)

- [ ] **System Monitoring**
  - CPU/GPU/Memory usage tracking
  - Error rate monitoring
  - Performance metrics (FPS, latency)
  - Alert on anomalies

#### 4.4 Deployment Tools

**Goal:** Easy deployment and updates

- [ ] **Docker Containerization**

  - Dockerfile for the system
  - Docker Compose for multi-service setup
  - NVIDIA GPU support in containers

- [ ] **Systemd Service**
  - Auto-start on boot
  - Auto-restart on crash
  - Log management

---

## 🎯 **IMMEDIATE NEXT STEPS**

### **Week 1-2: Dashboard Development** (Start Here!)

1. **Setup Dashboard Structure**

   ```bash
   mkdir -p dashboard/backend dashboard/frontend
   ```

2. **Build WebSocket Server**

   - Create `dashboard/backend/websocket_server.py`
   - Implement basic connection management
   - Test with simple HTML client

3. **Integrate with Detection System**

   - Add WebSocket broadcast in `final_tracking_onnx.py`
   - Send metrics every 5 frames
   - Test data flow

4. **Build Frontend**

   - Create simple HTML/JS dashboard
   - Display real-time metrics
   - Show video feed (MJPEG stream)
   - Add emergency alert banner

5. **Polish & Test**
   - Test with multiple videos
   - Verify metric accuracy
   - Improve UI/UX

**Goal:** Working dashboard by end of Week 2

---

### **Week 3-4: Signal Integration** (After Dashboard)

1. **Build Signal Simulator**

   - Create visual 4-way intersection
   - Implement state machine
   - Add manual controls for testing

2. **Build Priority Manager**

   - Listen for ambulance events
   - Trigger emergency mode
   - Handle reset to normal

3. **Integrate with Detection**

   - Connect ambulance detection to signal priority
   - Test emergency activation
   - Verify timing behavior

4. **Document & Demo**
   - Write integration guide
   - Create demo video
   - Test different scenarios

**Goal:** Working signal integration by end of Week 4

---

## 📦 **FUTURE ENHANCEMENTS** (Postponed)

The following features are **NOT** part of the current development plan and will be considered later:

### ❄️ **Frozen Features:**

- ❄️ **Analytics & Reporting**

  - Database storage (SQLite/PostgreSQL)
  - Data collector module
  - Analytics engine
  - PDF/CSV report generation
  - Historical traffic analysis

- ❄️ **Multi-Lane Support & Advanced Analytics**
  - Multiple lanes per camera
  - Per-lane counting and metrics
  - Speed estimation
  - Lane occupancy calculation
  - Traffic density analysis
  - Congestion detection

**Reason:** These features are valuable but not critical for the initial production deployment. They can be added later as enhancements once the core monitoring and signal control systems are working.

---

## 📊 **Progress Tracking**

### Overall Completion: ~75%

| Component                      | Status  | Completion |
| ------------------------------ | ------- | ---------- |
| Core Detection & Tracking      | ✅ Done | 100%       |
| ONNX Optimization              | ✅ Done | 100%       |
| Lane Configuration             | ✅ Done | 100%       |
| Video-Specific Configs         | ✅ Done | 100%       |
| **Dashboard**                  | ❌ Todo | 0%         |
| **Traffic Signal Integration** | ❌ Todo | 0%         |
| Multi-Camera Support           | ❌ Todo | 0%         |
| Testing Suite                  | ❌ Todo | 0%         |
| Production Hardening           | ❌ Todo | 0%         |

---

## 🎯 **Success Criteria**

### Dashboard (Phase 1)

- ✅ Real-time video feed with <1 second delay
- ✅ Metrics update every second
- ✅ Emergency alerts trigger immediately
- ✅ Works with any configured video
- ✅ Responsive UI (works on mobile/tablet)

### Traffic Signals (Phase 2)

- ✅ Simulator shows accurate signal states
- ✅ Ambulance detection triggers emergency mode within 1 second
- ✅ Signals return to normal after 45 seconds
- ✅ Hardware controllers work with real equipment
- ✅ API endpoints respond within 100ms

### Integration (Phase 3)

- ✅ Multiple cameras process simultaneously
- ✅ 80%+ test coverage
- ✅ System runs stable for 24+ hours
- ✅ Memory usage stays constant (no leaks)

---

## 📚 **Resources & References**

### Documentation

- `docs/VIDEO_SPECIFIC_CONFIGS.md` - Video configuration system
- `docs/VIDEO_CONFIG_IMPLEMENTATION.md` - Implementation details
- `docs/ZONE_BASED_COUNTING.md` - Zone-based counting guide
- `docs/LANE_BASED_OPTIMIZATION.md` - Lane filtering technical docs
- `docs/Colleague_Work_Spec.md` - Detailed task specifications

### Configuration Files

- `config/development.yaml` - Development environment config
- `config/production.yaml` - Production environment config
- `config/lane_configs_master.json` - Master video config registry

### Key Scripts

- `video_config_manager.py` - Video config utilities
- `migrate_config.py` - Config migration tool
- `final_tracking_onnx.py` - Main detection system

---

## 🤝 **Contributing**

### Current Focus Areas:

1. **Dashboard Development** - Priority #1
2. **Signal Integration** - Priority #2
3. **Documentation** - Ongoing

### How to Contribute:

1. Pick a task from Phase 1 or Phase 2
2. Create a feature branch: `git checkout -b feature/dashboard-websocket`
3. Implement and test
4. Update documentation
5. Submit for review

---

## 📞 **Questions & Support**

For questions about:

- **Video Configurations:** See `docs/VIDEO_SPECIFIC_CONFIGS.md`
- **Lane Setup:** Run `python quick_lane_setup.py <video>`
- **System Architecture:** See `docs/IMPLEMENTATION_SUMMARY.md`
- **Task Details:** See `docs/Colleague_Work_Spec.md`

---

**Ready to start? Begin with Phase 1: Dashboard Development! 🚀**
