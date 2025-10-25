# 🚀 Traffic Control System - Colleague Work Specification

**Assigned Work**: Dashboard, Traffic Signal Integration, Analytics & Reporting

---

## 📋 Project Overview

### Current System ✅

A **real-time traffic detection system** for Indian traffic:

- Vehicle detection using YOLOv11
- Ambulance detection with custom model
- Object tracking across frames
- Video processing at 4-6 FPS

### Your Tasks 👩‍💻

Three **independent modules** to build:

1. **Web Dashboard** - Real-time monitoring
2. **Traffic Signal Control** - Smart priority for ambulances
3. **Analytics & Reports** - Data insights

---

## 🔌 Integration Points

### Data Structures from Core System

**Vehicle Detection:**

```python
{
    'id': 12,
    'bbox': [x1, y1, x2, y2],
    'class': 'vehicle',
    'confidence': 0.85,
    'crossed': False,
    'timestamp': datetime
}
```

**Ambulance Detection:**

```python
{
    'id': 1,
    'bbox': [x1, y1, x2, y2],
    'class': 'ambulance',
    'confidence': 0.92,
    'stable': True,
    'features': {
        'flashing_lights': 0.21,
        'plus_cross_mark': 0.18
    },
    'timestamp': datetime
}
```

**System State:**

```python
{
    'fps': 5.2,
    'frame_count': 1250,
    'vehicle_count': 45,
    'active_vehicles': 8,
    'ambulance_detected': True
}
```

### Key Variables (from `final_tracking_onnx.py`)

```python
detector.tracker.objects          # All tracked vehicles
detector.tracker.total_count      # Vehicle count
detector.ambulance_detected       # Ambulance present?
detector.ambulance_stable         # Stable detection?
detector.fps                      # Current FPS
```

---

## 📊 TASK 1: Web Dashboard

### Goal

Real-time monitoring interface with live feed, metrics, and alerts.

### Tech Stack (Choose One)

- **React + WebSocket** (More customizable)
<!-- - **Dash/Plotly** (Great visualizations) -->

### Required Components

**1. Live Video Feed**

- Display processed video with bounding boxes
- Show FPS and frame count

**2. System Metrics Panel**

- Current FPS
- Active vehicles
- Total count
- Processing time

**3. Emergency Alert**

- Red banner when ambulance detected
- Show confidence and stability
- List detected features

**4. Traffic Flow Chart**

- Vehicle count over time (last 5-10 minutes)
- Peak detection visualization

### Implementation Start

**Step 1: Create WebSocket Server**

```python
# dashboard_server.py
import asyncio
import json
import websockets

class DashboardStreamer:
    def __init__(self):
        self.clients = set()

    async def register(self, websocket):
        self.clients.add(websocket)
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)

    async def broadcast(self, data):
        if self.clients:
            message = json.dumps(data)
            await asyncio.gather(
                *[client.send(message) for client in self.clients],
                return_exceptions=True
            )

    def update_from_detector(self, detector):
        data = {
            'fps': detector.fps,
            'frame_count': detector.frame_count,
            'vehicle_count': detector.tracker.total_count,
            'ambulance_detected': detector.ambulance_detected
        }
        asyncio.create_task(self.broadcast(data))
```

**Step 2: Integrate with Core**
Add to `final_tracking_onnx.py`:

```python
from dashboard_server import DashboardStreamer

# In __init__:
self.dashboard = DashboardStreamer()

# In process_frame (every 5 frames):
if self.frame_count % 5 == 0:
    self.dashboard.update_from_detector(self)
```

### Deliverables

- [ ] Dashboard web app
- [ ] Real-time data streaming
- [ ] All 4 components functional
- [ ] Documentation

---

## 🚦 TASK 2: Traffic Signal Integration

### Goal

Smart traffic light control that prioritizes emergency vehicles.

### Architecture

```
Ambulance Detected → Priority Manager → Traffic Signals
                                       ↓
                              Simulator (Test) | Real API (Production)
```

### Required Components

**1. Signal State Machine**

```python
# traffic_signal.py
from enum import Enum
from datetime import datetime

class SignalState(Enum):
    RED = "RED"
    YELLOW = "YELLOW"
    GREEN = "GREEN"
    EMERGENCY = "EMERGENCY"

class TrafficSignal:
    def __init__(self, signal_id, location):
        self.signal_id = signal_id
        self.state = SignalState.RED
        self.emergency_mode = False
        self.timings = {
            'RED': 30, 'YELLOW': 3,
            'GREEN': 25, 'EMERGENCY': 45
        }

    def set_emergency(self, enable):
        if enable:
            self.emergency_mode = True
            self.state = SignalState.EMERGENCY
            # Turn light green
        else:
            self.emergency_mode = False
            self.state = SignalState.RED
```

**2. Priority Manager**

```python
# priority_manager.py
class PrioritySignalManager:
    def __init__(self):
        self.signals = {}
        self.active_emergencies = []

    def register_signal(self, signal_id, location):
        self.signals[signal_id] = TrafficSignal(signal_id, location)

    def on_ambulance_detected(self, ambulance_data):
        if not ambulance_data.get('stable'):
            return

        # Activate emergency on all signals (or route-based)
        for signal in self.signals.values():
            signal.set_emergency(True)

    def on_ambulance_cleared(self):
        for signal in self.signals.values():
            signal.set_emergency(False)
```

**3. Visual Simulator**

```python
# signal_simulator.py
import cv2
import numpy as np

class SignalVisualizer:
    def draw_signal(self, signal):
        canvas = np.zeros((600, 400, 3), dtype=np.uint8)

        # Draw traffic light box
        cv2.rectangle(canvas, (140, 200), (260, 450), (50, 50, 50), -1)

        # Draw lights based on state
        lights = {
            'RED': (200, 260),
            'YELLOW': (200, 340),
            'GREEN': (200, 420)
        }

        for name, (x, y) in lights.items():
            if signal.emergency_mode and name == 'GREEN':
                color = (0, 255, 0)
            elif signal.state.value == name:
                color = (0, 0, 255) if name == 'RED' else (0, 255, 255) if name == 'YELLOW' else (0, 255, 0)
            else:
                color = (30, 30, 30)

            cv2.circle(canvas, (x, y), 40, color, -1)

        return canvas
```

**4. REST API (for real signals)**

```python
# signal_api.py
from flask import Flask, jsonify, request

app = Flask(__name__)
signal_manager = PrioritySignalManager()

@app.route('/api/signals', methods=['GET'])
def get_signals():
    return jsonify(signal_manager.get_status())

@app.route('/api/emergency/activate', methods=['POST'])
def activate_emergency():
    data = request.json
    signal_manager.on_ambulance_detected(data)
    return jsonify({'status': 'activated'})

@app.route('/api/emergency/clear', methods=['POST'])
def clear_emergency():
    signal_manager.on_ambulance_cleared()
    return jsonify({'status': 'cleared'})
```

### Integration with Core

```python
# In final_tracking_onnx.py
from priority_manager import PrioritySignalManager

# In __init__:
self.signal_manager = PrioritySignalManager()
self.signal_manager.register_signal("SIG_001", "Main Junction")

# When ambulance detected:
if ambulance_detections and ambulance_detections[0].get('stable'):
    self.signal_manager.on_ambulance_detected(ambulance_detections[0])

# When cleared:
if not ambulance_detections and self.ambulance_detected:
    self.signal_manager.on_ambulance_cleared()
```

### Deliverables

- [ ] Signal state machine
- [ ] Priority manager
- [ ] Visual simulator
- [ ] REST API
- [ ] Integration code
- [ ] Testing suite
- [ ] Documentation

---

## 📈 TASK 3: Analytics & Reporting

### Goal

Collect, analyze, and report on traffic data.

### Database Schema (SQLite)

```sql
-- traffic_data.db

CREATE TABLE vehicle_detections (
    id INTEGER PRIMARY KEY,
    vehicle_id INTEGER,
    timestamp DATETIME,
    confidence FLOAT,
    bbox_x1 INTEGER, bbox_y1 INTEGER,
    bbox_x2 INTEGER, bbox_y2 INTEGER,
    crossed_line BOOLEAN,
    session_id TEXT
);

CREATE TABLE ambulance_detections (
    id INTEGER PRIMARY KEY,
    ambulance_id INTEGER,
    timestamp DATETIME,
    confidence FLOAT,
    features_json TEXT,
    stable BOOLEAN,
    session_id TEXT
);

CREATE TABLE system_metrics (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    fps FLOAT,
    active_vehicles INTEGER,
    total_count INTEGER,
    session_id TEXT
);

CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    start_time DATETIME,
    end_time DATETIME,
    video_source TEXT,
    total_vehicles INTEGER,
    total_ambulances INTEGER
);
```

### Required Components

**1. Data Collector**

```python
# analytics_collector.py
import sqlite3
import json
from datetime import datetime
import uuid

class DataCollector:
    def __init__(self, db_path='traffic_data.db'):
        self.db = db_path
        self.session_id = str(uuid.uuid4())
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db)
        # Create tables (use schema above)
        conn.close()

    def record_vehicle(self, vehicle_data):
        conn = sqlite3.connect(self.db)
        conn.execute('''
            INSERT INTO vehicle_detections
            (vehicle_id, timestamp, confidence, bbox_x1, bbox_y1,
             bbox_x2, bbox_y2, crossed_line, session_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (vehicle_data['id'], datetime.now(),
              vehicle_data['confidence'], *vehicle_data['bbox'],
              vehicle_data.get('crossed', False), self.session_id))
        conn.commit()
        conn.close()

    def record_ambulance(self, amb_data):
        conn = sqlite3.connect(self.db)
        conn.execute('''
            INSERT INTO ambulance_detections
            (ambulance_id, timestamp, confidence, features_json,
             stable, session_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (amb_data['id'], datetime.now(), amb_data['confidence'],
              json.dumps(amb_data.get('features', {})),
              amb_data.get('stable', False), self.session_id))
        conn.commit()
        conn.close()
```

**2. Analytics Engine**

```python
# analytics_engine.py
import pandas as pd
from datetime import datetime, timedelta

class TrafficAnalytics:
    def __init__(self, db_path='traffic_data.db'):
        self.db = db_path

    def get_hourly_traffic(self, date=None):
        """Get vehicle count by hour"""
        query = '''
            SELECT
                strftime('%Y-%m-%d %H:00', timestamp) as hour,
                COUNT(*) as vehicle_count
            FROM vehicle_detections
            WHERE crossed_line = 1
            GROUP BY hour
            ORDER BY hour
        '''
        return pd.read_sql(query, f'sqlite:///{self.db}')

    def get_peak_hours(self, n=5):
        """Get top N busiest hours"""
        df = self.get_hourly_traffic()
        return df.nlargest(n, 'vehicle_count')

    def get_ambulance_stats(self):
        """Get ambulance detection statistics"""
        query = '''
            SELECT
                COUNT(*) as total_detections,
                AVG(confidence) as avg_confidence,
                SUM(CASE WHEN stable = 1 THEN 1 ELSE 0 END) as stable_count
            FROM ambulance_detections
        '''
        return pd.read_sql(query, f'sqlite:///{self.db}')

    def get_system_performance(self):
        """Get system performance metrics"""
        query = '''
            SELECT
                AVG(fps) as avg_fps,
                MIN(fps) as min_fps,
                MAX(fps) as max_fps,
                AVG(active_vehicles) as avg_active
            FROM system_metrics
        '''
        return pd.read_sql(query, f'sqlite:///{self.db}')
```

**3. Report Generator**

```python
# report_generator.py
import matplotlib.pyplot as plt
from fpdf import FPDF
from datetime import datetime

class ReportGenerator:
    def __init__(self, analytics):
        self.analytics = analytics

    def generate_daily_report(self, date=None):
        """Generate PDF daily report"""
        pdf = FPDF()
        pdf.add_page()

        # Title
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'Traffic Control Daily Report', ln=True, align='C')
        pdf.cell(0, 10, f'Date: {date or datetime.now().date()}', ln=True, align='C')

        # Traffic stats
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Traffic Statistics', ln=True)

        hourly = self.analytics.get_hourly_traffic(date)
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 8, f'Total Vehicles: {hourly["vehicle_count"].sum()}', ln=True)

        # Peak hours
        peaks = self.analytics.get_peak_hours(3)
        pdf.cell(0, 8, 'Peak Hours:', ln=True)
        for _, row in peaks.iterrows():
            pdf.cell(0, 6, f'  {row["hour"]}: {row["vehicle_count"]} vehicles', ln=True)

        # Ambulance stats
        amb_stats = self.analytics.get_ambulance_stats()
        pdf.cell(0, 10, 'Ambulance Detections', ln=True)
        pdf.cell(0, 8, f'Total: {amb_stats["total_detections"].iloc[0]}', ln=True)

        # Save
        filename = f'report_{date or datetime.now().date()}.pdf'
        pdf.output(filename)
        return filename

    def export_csv(self, table_name, output_file):
        """Export table to CSV"""
        df = pd.read_sql(f'SELECT * FROM {table_name}',
                        f'sqlite:///{self.analytics.db}')
        df.to_csv(output_file, index=False)
        return output_file
```

### Integration with Core

```python
# In final_tracking_onnx.py
from analytics_collector import DataCollector

# In __init__:
self.data_collector = DataCollector()

# In process_frame:
# Record vehicles (every 30 frames to reduce overhead)
if self.frame_count % 30 == 0:
    for obj_id, obj_data in self.tracker.objects.items():
        self.data_collector.record_vehicle(obj_data)

# Record ambulances
if ambulance_detections:
    for amb in ambulance_detections:
        self.data_collector.record_ambulance(amb)
```

### Deliverables

- [ ] Database setup
- [ ] Data collector
- [ ] Analytics engine
- [ ] Report generator (PDF, CSV, Excel)
- [ ] Dashboard charts integration
- [ ] Export functionality
- [ ] Documentation

---

## 🚀 Getting Started

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install streamlit flask pandas matplotlib fpdf2
pip install websockets plotly sqlite3
```

### 2. Project Structure

```
Traffic Control/
├── final_tracking_onnx.py        # Core system (existing)
├── dashboard_server.py            # Your work
├── dashboard_app.py               # Your work
├── traffic_signal.py              # Your work
├── priority_manager.py            # Your work
├── signal_simulator.py            # Your work
├── signal_api.py                  # Your work
├── analytics_collector.py         # Your work
├── analytics_engine.py            # Your work
├── report_generator.py            # Your work
└── traffic_data.db               # Auto-created
```

### 3. Development Order

**Week 1-2**: Dashboard (most user-facing)  
**Week 3-4**: Traffic Signal (core safety feature)  
**Week 5-6**: Analytics (long-term value)

### 4. Testing

Each module should work independently first, then integrate.

---

## 📚 Additional Resources

### File Locations

- Core detection: `final_tracking_onnx.py`
- Config: `config/debug_config.json`
- Models: `models/` directory
- Logs: `traffic_control.log`

### Key Classes to Understand

- `ONNXTrafficDetector` - Main detection engine
- `ONNXVehicleTracker` - Tracks vehicles
- Both in `final_tracking_onnx.py`

### Communication

- Use this doc with your AI assistant (Windsurf/Cursor)
- Reference specific sections for context
- Update doc as you make progress

---

## ✅ Success Criteria

### Dashboard

- Real-time updates (<1s delay)
- All 4 components functional
- Responsive UI

### Traffic Signals

- Ambulance triggers green light
- Simulator works visually
- API documented

### Analytics

- Data collected automatically
- Reports generated successfully
- Export formats work

---

**Happy Coding! 🎉**
