"""
Path setup for dashboard - import this before anything else.
This file exists because auto-formatters keep reordering imports.
"""
import sys
from pathlib import Path

_project_root = Path(__file__).resolve().parent.parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))
