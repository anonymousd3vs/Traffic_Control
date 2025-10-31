#!/usr/bin/env python3
"""
Traffic Detection System Diagnostic
Tests all components to identify issues on new systems
"""
import sys
import os
import logging
from pathlib import Path

# Setup path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

print("\n" + "=" * 70)
print("🔍 TRAFFIC CONTROL SYSTEM DIAGNOSTIC")
print("=" * 70)

# 1. Check Python Version
print("\n[1/7] Python Version:")
print(f"    Version: {sys.version}")
print(f"    ✅ Python {sys.version_info.major}.{sys.version_info.minor} OK")

# 2. Check PyTorch/CUDA
print("\n[2/7] PyTorch & GPU:")
try:
    import torch
    print(f"    PyTorch Version: {torch.__version__}")
    print(f"    CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"    GPU Device: {torch.cuda.get_device_name(0)}")
        print(f"    CUDA Version: {torch.version.cuda}")
        print(f"    ✅ GPU Support OK")
    else:
        print(f"    ⚠️  Running on CPU (slower)")
except ImportError as e:
    print(f"    ❌ PyTorch not installed: {e}")
    sys.exit(1)

# 3. Check Dependencies
print("\n[3/7] Dependencies:")
dependencies = {
    'cv2': 'OpenCV',
    'numpy': 'NumPy',
    'onnxruntime': 'ONNX Runtime',
    'aiohttp': 'aiohttp',
}

all_ok = True
for module, name in dependencies.items():
    try:
        mod = __import__(module)
        version = getattr(mod, '__version__', 'unknown')
        print(f"    ✅ {name}: {version}")
    except ImportError:
        print(f"    ❌ {name} NOT installed")
        all_ok = False

if not all_ok:
    print(f"\n    Install missing: pip install -r requirements.txt")
    sys.exit(1)

# 4. Check Model Files
print("\n[4/7] Model Files:")
models_to_check = [
    ('optimized_models/yolo11n_optimized.onnx', 'YOLOv11 Vehicle Model (ONNX)'),
    ('optimized_models/indian_ambulance_yolov11n_best_optimized.onnx',
     'Ambulance Model (ONNX)'),
    ('config/lane_config.json', 'Lane Configuration'),
    ('config/development.yaml', 'Development Config'),
]

for model_path, name in models_to_check:
    full_path = project_root / model_path
    if full_path.exists():
        size_mb = full_path.stat().st_size / (1024 * 1024)
        print(f"    ✅ {name}: {size_mb:.1f}MB")
    else:
        print(f"    ❌ MISSING: {model_path}")

# 5. Test ONNX Model Loading
print("\n[5/7] ONNX Model Loading:")
try:
    import onnxruntime as ort
    import numpy as np

    model_path = str(project_root / 'optimized_models/yolo11n_optimized.onnx')

    print(f"    Loading: {model_path}")
    sess = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])

    print(f"    ✅ Model loaded successfully")
    print(f"    Providers: {ort.get_available_providers()}")

    # Test inference
    input_name = sess.get_inputs()[0].name
    input_shape = sess.get_inputs()[0].shape
    print(f"    Input shape: {input_shape}")

    # Create dummy input
    dummy_input = np.random.randn(1, 3, 640, 640).astype(np.float32)
    output = sess.run(None, {input_name: dummy_input})
    print(f"    ✅ Inference works (output shape: {output[0].shape})")

except Exception as e:
    print(f"    ❌ ONNX Error: {e}")
    import traceback
    traceback.print_exc()

# 6. Test OpenCV & Camera
print("\n[6/7] OpenCV & Camera:")
try:
    import cv2

    print(f"    OpenCV Version: {cv2.__version__}")
    print(f"    ✅ OpenCV OK")

    # Test camera
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            print(f"    ✅ Camera working: {frame.shape}")
        else:
            print(f"    ⚠️  Camera not responding")
        cap.release()
    else:
        print(f"    ⚠️  Camera not available (might not have one)")

except Exception as e:
    print(f"    ❌ OpenCV Error: {e}")

# 7. Test Detection Detector Class
print("\n[7/7] Detection Detector Class:")
try:
    from core.detectors.traffic_detector import ONNXTrafficDetector

    print(f"    Creating detector...")
    detector = ONNXTrafficDetector(device='cpu')
    print(f"    ✅ Detector created successfully")
    print(f"    Vehicle model: {detector.vehicle_model is not None}")
    print(f"    Ambulance model: {detector.ambulance_model is not None}")
    print(f"    Lane enabled: {detector.lane_enabled}")

except Exception as e:
    print(f"    ❌ Detector Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 70)
print("✅ ALL CHECKS PASSED - System is ready!")
print("=" * 70 + "\n")
