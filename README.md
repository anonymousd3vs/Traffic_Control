# Intelligent Traffic Management System

Production-ready **ONNX-optimized** vehicle + ambulance detection & tracking system with **dual-mode operation**:

- **Zone-Based Mode**: Lane-specific filtering with intelligent zone counting
- **Line-Based Mode**: Full-frame detection with line-crossing counting

Built for Indian traffic conditions with optimized ONNX models for faster inference.

## 🚀 Core Features

| Capability                          | Status                                     |
| ----------------------------------- | ------------------------------------------ |
| ONNX-optimized inference            | ✅ (3-5x faster than PyTorch)              |
| **Video-Specific Configurations**   | ✅ **NEW!** Each video gets own config     |
| **Zone-Based Lane Filtering**       | ✅ **NEW!** Interactive lane configuration |
| **Dual-Mode Operation**             | ✅ **NEW!** Zone-based + Line-based        |
| Vehicle detection (YOLOv11n ONNX)   | ✅                                         |
| ByteTrack tracking                  | ✅                                         |
| Ambulance detection (YOLOv11n ONNX) | ✅                                         |
| Interactive lane configuration tool | ✅ **NEW!** Visual polygon drawing         |
| Zone-based vehicle counting         | ✅ **NEW!** Movement-based counting        |
| Line-crossing counting (legacy)     | ✅                                         |
| Real-time FPS monitoring            | ✅                                         |
| Auto-prompt for missing configs     | ✅ **NEW!** User-friendly workflow         |

## 🎯 Quick Start

### 1) Clone & Setup

```bash
git clone https://github.com/anonymousd3vs/Traffic_Control.git
cd Traffic_Control
```

### 2) Install Dependencies

```bash
# Windows PowerShell
python -m venv .venv
.venv\Scripts\Activate

# Install requirements
pip install -r requirements.txt
```

### 3) Download/Prepare ONNX Models

Required models in `optimized_models/` folder:

- `yolo11n_optimized.onnx` - Vehicle detection (fast)
- `indian_ambulance_yolov11n_best_optimized.onnx` - Ambulance detection

_(Use `python -m core.optimization.model_optimizer` to convert PyTorch models to ONNX if needed)_

---

## 🚦 Two Operating Modes

### **Mode 1: Zone-Based (Lane Filtering)** 🎯

**When to use:** Monitor specific lanes, optimize performance by filtering irrelevant areas

**Setup & Run:**

```bash
# Option 1: Let the system prompt you (EASIEST!)
python run_detection.py --source "videos/your_video.mp4"
# If no config exists, you'll be prompted to:
#   1. Configure lane now
#   2. Continue without filtering
#   3. Quit

# Option 2: Quick automated setup
python scripts/quick_lane_setup.py "videos/your_video.mp4"
# This will:
#   1. Open interactive lane configuration tool
#   2. Let you draw lane polygon with mouse clicks
#   3. Automatically run detection with the configured lane

# Option 3: Manual step-by-step
# Step 1: Configure lane boundaries (one-time per video)
python -m shared.config.lane_config_tool --video "videos/your_video.mp4"

# Step 2: Run detection with lane filtering
python run_detection.py --source "videos/your_video.mp4" --output "output.mp4"
```

**🎯 Video-Specific Configurations:**

Each video gets its own configuration file! Once configured, the system automatically uses the correct config for each video.

```bash
# Configure different videos
python -m shared.config.lane_config_tool --video "videos/video1.mp4"
python -m shared.config.lane_config_tool --video "videos/video2.mp4"

# Run them anytime - each uses its own config automatically!
python run_detection.py --source "videos/video1.mp4"
python run_detection.py --source "videos/video2.mp4"
```

See [docs/VIDEO_SPECIFIC_CONFIGS.md](docs/VIDEO_SPECIFIC_CONFIGS.md) for details.

**Features:**

- ✅ Detects vehicles **only inside green lane polygon**
- ✅ Zone-based counting (counts after ≥50 pixels movement)
- ✅ No counting line visible (clean interface)
- ✅ Status: "Mode: Zone-Based"
- ✅ Better performance (processes only relevant detections)

---

### **Mode 2: Line-Based (Full Frame)** 📊

**When to use:** Count all vehicles across entire road, general traffic monitoring

**Run:**

```bash
# Use --no-filter flag to force normal mode
python run_detection.py --source "videos/your_video.mp4" --no-filter --output "output.mp4"

# Or run without any lane configuration
python run_detection.py --source "videos/your_video.mp4" --output "output.mp4"
```

**Features:**

- ✅ Detects vehicles **in entire frame**
- ✅ Line-crossing counting (counts when crossing yellow line)
- ✅ Yellow horizontal counting line visible
- ✅ Status: "Mode: Line-Based"
- ✅ Classic traffic counting approach

---

## 🎮 Runtime Controls

**During Detection:**

- **Q**: Quit and save
- **R**: Reset vehicle count
- **S**: Save screenshot
- **ESC**: Exit

**During Lane Configuration:**

- **Left Click**: Add lane boundary point
- **Right Click**: Remove last point
- **ESC**: Save configuration and exit
- **Q**: Quit without saving

## � Performance

### ONNX Optimization Benefits

- **3-5x faster** than PyTorch models
- **Lower memory usage**
- **Better CPU performance**
- Real-time processing on standard hardware

### Typical Performance

| Hardware        | Zone-Based Mode | Line-Based Mode | Notes                 |
| --------------- | --------------- | --------------- | --------------------- |
| CPU (Intel i5+) | 15-20 FPS       | 12-18 FPS       | ONNX optimized        |
| GPU (NVIDIA)    | 30-45 FPS       | 25-35 FPS       | Full frame processing |
| Edge Devices    | 8-12 FPS        | 6-10 FPS        | Raspberry Pi 4+       |

**Zone-Based Mode is faster** because it processes fewer detections!

---

## 🛠 Command Line Reference

### Main Detection Script: `final_tracking_onnx.py`

```bash
python final_tracking_onnx.py [OPTIONS]
```

**Options:**

| Flag            | Type   | Default                   | Description                                                    |
| --------------- | ------ | ------------------------- | -------------------------------------------------------------- |
| `--source`      | string | `"0"`                     | Video source: camera index (`0`), video file path, or RTSP URL |
| `--output`      | string | `""`                      | Output video file path (optional)                              |
| `--lane-config` | string | `config/lane_config.json` | Path to lane configuration file                                |
| `--no-filter`   | flag   | `False`                   | **Force line-based mode**, ignore lane config                  |

### Lane Configuration Tool: `lane_config_tool.py`

```bash
python lane_config_tool.py --video <path> [OPTIONS]
```

**Options:**

| Flag       | Type   | Default                   | Description                          |
| ---------- | ------ | ------------------------- | ------------------------------------ |
| `--video`  | string | _required_                | Path to video file for configuration |
| `--config` | string | `config/lane_config.json` | Output configuration file path       |

### Quick Setup Script: `quick_lane_setup.py`

```bash
python quick_lane_setup.py <video_path>
```

Automated workflow: configure lane → run detection in one command!

---

## � Usage Examples

### Example 1: Quick Lane Setup (Recommended)

```bash
python quick_lane_setup.py "videos/highway.mp4"
```

Interactive workflow that guides you through configuration and detection.

### Example 2: Configure Lane for Future Use

```bash
# Configure once
python lane_config_tool.py --video "videos/traffic.mp4"

# Run multiple times with same config
python final_tracking_onnx.py --source "videos/traffic.mp4" --output "result1.mp4"
python final_tracking_onnx.py --source "videos/traffic.mp4" --output "result2.mp4"
```

### Example 3: Compare Both Modes

```bash
# Zone-based mode (lane filtering)
python final_tracking_onnx.py --source "videos/test.mp4" --output "zone_mode.mp4"

# Line-based mode (full frame)
python final_tracking_onnx.py --source "videos/test.mp4" --output "line_mode.mp4" --no-filter
```

### Example 4: Process Camera Feed

```bash
# Webcam with lane filtering
python final_tracking_onnx.py --source 0

# Webcam without filtering
python final_tracking_onnx.py --source 0 --no-filter
```

### Example 5: RTSP Stream

```bash
python final_tracking_onnx.py --source "rtsp://camera-ip:554/stream" --output "stream_output.mp4"
```

---

## 🎨 Visual Features

### Vehicle Detection Classes

- **Cars** - Green bounding boxes
- **Motorcycles** - Orange bounding boxes
- **Bicycles** - Cyan bounding boxes
- **Buses** - Magenta bounding boxes
- **Trucks** - Blue bounding boxes

### Ambulance Detection

- **Ambulance** - Red bounding box with "🚨 AMBULANCE" label
- High-priority visual indicator

### Visual Overlays

**Zone-Based Mode:**

- Green semi-transparent lane polygon
- Colored vehicle trajectories (tracking history)
- Vehicle bounding boxes with IDs
- Stats panel: "Mode: Zone-Based", "Total in Zone: X"

**Line-Based Mode:**

- Yellow horizontal counting line
- Colored vehicle trajectories
- Vehicle bounding boxes with IDs
- Stats panel: "Mode: Line-Based", "Total Crossed: X"

---

## 🏗 System Architecture

### Detection Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     INPUT VIDEO FRAME                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ONNX Vehicle Detection (YOLOv11n)              │
│         • Optimized inference (3-5x faster)                 │
│         • Detects: car, bus, truck, motorcycle, bicycle     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         LANE FILTERING (if zone-based mode enabled)         │
│         • Point-in-polygon test for each detection          │
│         • Filters out vehicles outside configured lane      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BYTETRACK TRACKING                        │
│         • Assigns unique IDs to vehicles                    │
│         • Maintains trajectory history (20 frames)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   VEHICLE COUNTING                           │
│   Zone Mode: Movement-based (≥50 pixels through zone)       │
│   Line Mode: Line-crossing detection                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            ONNX Ambulance Detection (YOLOv11n)              │
│         • High-priority emergency vehicle detection         │
│         • Visual/audio alert capability                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 VISUALIZATION & OUTPUT                       │
│         • Draw bounding boxes, trajectories, stats          │
│         • Overlay lane polygon or counting line             │
│         • Save to video file (if --output specified)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
traffic_control/
├── core/                           # Core detection & tracking
│   ├── detectors/
│   │   ├── onnx_detector.py       # ONNX model inference
│   │   └── traffic_detector.py    # Main detection system
│   ├── trackers/                  # Vehicle tracking (future)
│   └── optimization/
│       └── model_optimizer.py     # PyTorch → ONNX converter
│
├── dashboard/                      # Web dashboard (Phase 1)
│   ├── backend/                   # Flask + SocketIO server
│   └── frontend/                  # React app
│
├── traffic_signals/                # Signal control (Phase 2)
│   ├── core/                      # State machine & priority
│   └── hardware/                  # GPIO, Modbus, simulator
│
├── shared/                         # Shared utilities
│   ├── config/
│   │   ├── lane_config_tool.py    # Interactive lane config
│   │   ├── video_config_manager.py # Video-specific configs
│   │   └── check_lane_config.py   # Config diagnostics
│   └── utils/                     # Common utilities
│
├── tests/                          # Test suite
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── performance/               # Performance tests
│
├── scripts/                        # Utility scripts
│   ├── migrate_config.py          # Config migration
│   ├── quick_lane_setup.py        # Quick lane setup
│   └── setup_environment.py       # Environment setup
│
├── config/                         # Configuration files
│   ├── lane_config_*.json         # Video-specific lane configs
│   ├── lane_configs_master.json   # Master config registry
│   ├── development.yaml           # Dev environment config
│   ├── production.yaml            # Prod environment config
│   └── debug_config.json          # Debug settings
│
├── models/                         # PyTorch models
├── optimized_models/               # ONNX models
├── videos/                         # Test videos
├── output/                         # Output videos
├── docs/                           # Documentation
│
├── run_detection.py                # Main entry: run detection
├── run_dashboard.py                # Main entry: start dashboard
├── run_signals.py                  # Main entry: signal simulator
├── requirements.txt                # Python dependencies
├── ROADMAP.md                      # Development roadmap
└── README.md                       # This file
```

**New Modular Structure** (Updated Oct 9, 2025):

- ✅ Clean separation of concerns
- ✅ Ready for dashboard & signal development
- ✅ Organized test structure
- ✅ Scalable and maintainable

See [REORGANIZATION_COMPLETE.md](REORGANIZATION_COMPLETE.md) for details.

## 🎛 Examples

Higher recall (lower vehicle confidence) in accuracy mode:

```
python final_tracking_detection.py --conf 0.18 --accuracy --source videos/rushing.mp4
```

Fast mode + tighter ambulance interval (every frame):

```
python final_tracking_detection.py --fast --ambulance-interval 1 --source videos/rushing.mp4
```

Override ambulance model:

```
python final_tracking_detection.py --ambulance-model models/custom_amb.pt
```

### Performance Optimization

- CPU: prefer `--super-fast` (YOLO11n)
- GPU: larger `--imgsz` + `--accuracy` for recall
- Memory: tune processing size and ROI

## � Ambulance Detection Logic

Default: raw custom YOLOv11m weights at adaptive confidence (starts ~0.07, decays slightly if starved, gently rises after hits, capped to avoid missing).

Fallback: YOLOv8 custom model may produce higher confidences; used when primary misses and fallback is enabled.

Ensemble: `--ambulance-ensemble` invokes the enhanced detector (slower; includes visual feature heuristics) for evaluation scenarios.

## 📈 Runtime Stats Overlay

Displayed:

- FPS / frame latency
- Active / confirmed vehicles
- Recent ambulance event flag
- (Optional) snapshot saving to `logs/` when enabled

## 🚦 Integration Potential

Foundation for adaptive signals, emergency corridor automation, and density analytics. JSON/event streaming layer can be added externally (not bundled to keep core lean).

## 📦 Deployment Notes

- Keep model weights outside Git history (use release assets or manual placement)
- GPU recommended for accuracy mode at 832 resolution
- For edge devices drop to `--fast` and `yolo11n.pt`

---

## � Lane Configuration Guide

### Interactive Lane Setup

The lane configuration tool provides a visual interface to define lane boundaries:

**Steps:**

1. Launch tool: `python lane_config_tool.py --video "your_video.mp4"`
2. **Left-click** on frame to add boundary points around your lane
3. **Right-click** to remove the last point if needed
4. Press **ESC** to save configuration
5. Creates `config/lane_config.json` + preview image

### Best Practices

✅ **DO:**

- Cover the **entire lane height** you want to monitor
- Draw polygon with 4-8 points for best coverage
- Use `check_lane_config.py` to verify coverage

❌ **DON'T:**

- Make polygon too small (causes missed detections)
- Use less than 3 points (minimum required)

### Diagnostic Tool

```bash
python check_lane_config.py  # Verify your lane configuration
```

---

## 📈 On-Screen Statistics

**Zone-Based Mode:**

```
┌────────────────────────┐
│ DETECTION STATS        │
│ FPS: 18.5             │
│ Active Objects: 5      │
│ Total in Zone: 23      │
│ Mode: Zone-Based       │
└────────────────────────┘
```

**Line-Based Mode:**

```
┌────────────────────────┐
│ DETECTION STATS        │
│ FPS: 15.2             │
│ Active Objects: 12     │
│ Total Crossed: 45      │
│ Mode: Line-Based       │
└────────────────────────┘
```

---

## 📋 Requirements

### System Requirements

- **Python:** 3.8+ (3.10+ recommended)
- **OS:** Windows, Linux, macOS
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB for models and dependencies

### Python Dependencies

```
opencv-python>=4.8.0
numpy>=1.24.0
onnxruntime>=1.16.0
filterpy>=1.4.5
scipy>=1.10.0
```

Install:

```bash
pip install -r requirements.txt
```

### ONNX Model Conversion (Optional)

```bash
pip install -r requirements_optimize.txt
python optimize_models.py
```

---

## 🚦 Phase 2: Traffic Signal Control System ✅

**Status:** COMPLETE & READY FOR DEPLOYMENT

### Quick Start - Test the Simulator

```bash
# Install pygame (if not already installed)
pip install pygame

# Run the simulator
python -m traffic_signals.hardware.signal_simulator
```

**Keyboard Controls:**

- `N/S/E/W` - Select direction (North, South, East, West)
- `A` - Trigger ambulance from selected direction
- `SPACE` - Pause/Resume
- `R` - Reset all signals
- `H` - Help
- `Q` - Quit

### Features Implemented

✅ **Signal State Machine** - 4-state FSM (RED, YELLOW, GREEN, EMERGENCY)
✅ **Priority Manager** - Multi-signal coordination with emergency override
✅ **Visual Simulator** - Pygame-based 4-way intersection visualization
✅ **GPIO Controller** - Raspberry Pi GPIO interface for real hardware
✅ **Modbus Controller** - Industrial Modbus TCP/RTU support
✅ **REST API Handler** - 10+ endpoints for signal control and monitoring
✅ **Emergency Tracking** - Automatic ambulance priority with 45-second duration
✅ **Statistics & Metrics** - Real-time and historical data collection

### Integration with Detection System

```python
from traffic_signals import PriorityManager

# In your detection loop
signals = PriorityManager()
signals.register_signal('north', 'north')
signals.register_signal('south', 'south')
signals.register_signal('east', 'east')
signals.register_signal('west', 'west')
signals.start_all_signals()

# Update signals every frame
while processing_video:
    signals.update()

    # When ambulance detected
    if ambulance_detected and confidence > 0.8:
        signals.activate_emergency(
            ambulance_id=f"amb_{timestamp}",
            direction="north",  # Determine from detection
            confidence=confidence
        )
```

### Normal Signal Cycle

```
RED:    34 seconds  🔴
GREEN:  30 seconds  🟢
YELLOW:  4 seconds  🟡
───────────────────────
Total: 68 seconds per direction pair
```

### Emergency Mode

```
[Any State] → EMERGENCY (GREEN) → 45 seconds 🚨
```

### Files in traffic_signals/

```
traffic_signals/
├── core/
│   ├── signal_state_machine.py      # Individual signal FSM (370+ lines)
│   └── priority_manager.py          # Multi-signal coordination (380+ lines)
├── api/
│   └── signal_api.py                # REST API handler (450+ lines)
└── hardware/
    ├── signal_simulator.py          # Visual simulator - Pygame (600+ lines)
    ├── realistic_junction_simulator.py  # Advanced simulator
    ├── gpio_controller.py           # Raspberry Pi GPIO (140+ lines)
    └── modbus_controller.py         # Modbus TCP/RTU (180+ lines)
```

### API Endpoints

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | `/api/signals/status`      | Get all signal states       |
| GET    | `/api/signals/emergencies` | Get active emergencies      |
| POST   | `/api/signals/emergency`   | Activate ambulance priority |
| GET    | `/api/signals/statistics`  | Get system statistics       |
| POST   | `/api/signals/reset`       | Reset all signals           |

### Dashboard Integration

The dashboard now displays:

- Real-time signal status for all 4 directions
- Active emergency alerts with duration countdown
- Emergency history and statistics
- 3-way integration: Detection + Signals + Dashboard

### Hardware Support

- **Simulator Mode** (Testing) - Pygame visualization
- **Raspberry Pi (GPIO)** - Direct GPIO pin control
- **Industrial Modbus** - TCP/RTU protocol support

---

## 🚦 Real-World Applications

- 🚦 **Smart Traffic Signals** - Adaptive signal timing ✅ IMPLEMENTED
- 🚑 **Emergency Response** - Automatic ambulance priority ✅ IMPLEMENTED
- 📊 **Traffic Analytics** - Lane-specific monitoring
- 🎥 **Surveillance Systems** - Camera infrastructure integration
- 🏗️ **Smart Cities** - Urban planning data

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📚 Documentation

Comprehensive documentation available in `docs/` folder:

- `ZONE_BASED_COUNTING.md` - Zone-based mode detailed guide
- `LANE_BASED_OPTIMIZATION.md` - Technical implementation details
- `IMPLEMENTATION_SUMMARY.md` - System architecture overview

---

## 🙏 Acknowledgments

- Built for Indian traffic conditions 🇮🇳
- ONNX-optimized for production deployment
- Dual-mode operation for maximum flexibility

---

---

## 🎛 Dashboard Overview

**Status:** ✅ Production Ready

A fully functional real-time dashboard with:

- **Live Video Stream** - Processed video feed with detection overlays (5 FPS optimized)
- **System Metrics** - FPS, active vehicles, total count, detection mode
- **Emergency Alerts** - Visual and audio alerts for ambulance detection
- **Traffic Flow Charts** - Historical data visualization
- **WebSocket Communication** - Sub-second latency updates

### Quick Start

```bash
python run_dashboard.py
# Opens: http://localhost:5173 (Frontend)
# Backend: http://localhost:8765
```

See `dashboard/README.md` for complete documentation.

---

**Version:** 2.2 - Phase 2 Complete (Traffic Signals + Dashboard)  
**Last Updated:** October 25, 2025  
**Repository:** [github.com/anonymousd3vs/Traffic_Control](https://github.com/anonymousd3vs/Traffic_Control)
