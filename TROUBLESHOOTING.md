# Traffic Control System - Troubleshooting Guide

## 🔴 Backend Crashes on New System

### Symptoms
- Backend starts successfully
- Frontend loads OK
- When you start detection → backend crashes
- No error message appears

### Quick Fixes

#### 1. Run Diagnostic Test (IMPORTANT!)
```bash
python test_detection_system.py
```

This will check:
- ✅ Python version
- ✅ PyTorch/CUDA
- ✅ All dependencies installed
- ✅ Model files exist
- ✅ ONNX runtime works
- ✅ Camera access
- ✅ Detection system

#### 2. Verify Dependencies
```bash
pip install -r requirements.txt --upgrade
```

Make sure you have:
- `torch >= 2.0.0`
- `onnxruntime >= 1.16.0`
- `opencv-python >= 4.8.0`
- `aiohttp >= 3.8.0`

#### 3. Lower Confidence Threshold
If you see 0 detections, the confidence threshold might be too high:

```bash
# Edit config/detection_config.yaml
vehicle:
  confidence_threshold: 0.2  # Lower = more detections (but more false positives)
```

#### 4. Check Model Files
```bash
# Verify optimized models exist
ls -la optimized_models/
```

Must have:
- `yolo11n_optimized.onnx` (~10MB)
- `indian_ambulance_yolov11n_best_optimized.onnx` (~10MB)

#### 5. Test Detection Directly
```python
from core.detectors.traffic_detector import ONNXTrafficDetector
import cv2

detector = ONNXTrafficDetector(device='cpu')
frame = cv2.imread('test_image.jpg')
result = detector.process_frame(frame)
print(f"Detected {detector.vehicle_count} vehicles")
```

#### 6. Check GPU/CUDA
If CUDA is not available:
```bash
# Force CPU mode
export CUDA_VISIBLE_DEVICES=""
python run_dashboard.py
```

Or in code:
```python
import torch
torch.cuda.is_available()  # Should be False (OK for CPU)
```

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError: No module named 'onnxruntime'` | Missing ONNX Runtime | `pip install onnxruntime` |
| `Model file not found` | Models not in optimized_models/ | Run `git lfs pull` or download from hub |
| `0 vehicles detected` | Confidence threshold too high | Lower in detection_config.yaml |
| `Backend crashes silently` | Missing dependency or GPU issue | Run diagnostic test |
| `OpenCV error` | Incompatible OpenCV version | `pip install --upgrade opencv-python` |

### Detailed Debug Mode

Enable full logging:

```bash
export DEBUG=1
export LOG_LEVEL=DEBUG
python run_dashboard.py
```

### Still Broken?

1. Share output of `test_detection_system.py`
2. Check `dashboard/backend/traffic_control.log`
3. Look for error messages in console
4. Try CPU-only mode first (disable GPU)

---

## 🟢 System is Working - What Now?

### Performance Tips
- Lower resolution for faster processing
- Use zone-based detection (faster than line-crossing)
- Adjust confidence thresholds for your use case

### Configuration Files
- `config/development.yaml` - Backend settings
- `config/lane_config.json` - Lane boundaries
- `config/detection_config.yaml` - Detection thresholds

### Monitoring
Check logs:
```bash
tail -f dashboard/backend/traffic_control.log
```

---

**Last Updated:** October 31, 2025
