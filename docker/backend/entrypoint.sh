#!/usr/bin/env python
"""
Backend Entry Point with Health Check and Graceful Shutdown
Handles startup initialization, health monitoring, and clean shutdown
"""

import os
import sys
import signal
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add paths
sys.path.insert(0, str(Path(__file__).parent))

def setup_environment():
    """Initialize environment variables and paths"""
    logger.info("Setting up environment...")
    
    # Create necessary directories
    dirs = ['logs', 'models', 'config', 'videos']
    for directory in dirs:
        Path(directory).mkdir(exist_ok=True)
        logger.info(f"Directory ready: {directory}")
    
    # Set default env variables if not set
    os.environ.setdefault('BACKEND_HOST', '0.0.0.0')
    os.environ.setdefault('BACKEND_PORT', '8765')
    os.environ.setdefault('PYTHONUNBUFFERED', '1')
    os.environ.setdefault('PYTHONDONTWRITEBYTECODE', '1')
    
    logger.info("Environment setup complete")

def check_dependencies():
    """Verify all required dependencies are installed"""
    logger.info("Checking dependencies...")
    
    required_packages = [
        'aiohttp',
        'socketio',
        'numpy',
        'opencv',
        'torch',
        'ultralytics'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            logger.info(f"✓ {package}")
        except ImportError:
            missing_packages.append(package)
            logger.warning(f"✗ {package} not found")
    
    if missing_packages:
        logger.error(f"Missing packages: {', '.join(missing_packages)}")
        logger.error("Install with: pip install -r requirements.txt")
        return False
    
    logger.info("All dependencies available")
    return True

def start_backend():
    """Start the backend server"""
    logger.info("Starting backend server...")
    
    try:
        from dashboard.backend.server import create_app, run_server
        
        app = create_app()
        logger.info("Application created successfully")
        
        host = os.environ.get('BACKEND_HOST', '0.0.0.0')
        port = int(os.environ.get('BACKEND_PORT', 8765))
        
        logger.info(f"Starting server on {host}:{port}")
        run_server(app, host=host, port=port)
        
    except ImportError as e:
        logger.error(f"Failed to import backend module: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to start backend: {e}")
        return False

def signal_handler(signum, frame):
    """Handle graceful shutdown"""
    logger.info(f"Received signal {signum}, shutting down gracefully...")
    sys.exit(0)

def main():
    """Main entry point"""
    logger.info("=" * 60)
    logger.info("Traffic Control System - Backend Service")
    logger.info("=" * 60)
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Setup
        setup_environment()
        
        # Verify dependencies
        if not check_dependencies():
            logger.error("Dependency check failed")
            sys.exit(1)
        
        # Start backend
        start_backend()
        
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    main()
