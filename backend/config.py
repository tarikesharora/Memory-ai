"""
LensLocal Configuration Constants
"""
import os
from pathlib import Path

# Paths
APP_DIR = Path.home() / ".lenslocal"
APP_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = APP_DIR / "lenslocal.db"
MODELS_DIR = APP_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# CLIP Model Settings
CLIP_MODEL_NAME = "openai/clip-vit-base-patch32"
CLIP_WEIGHTS_FILENAME = "model.safetensors"
CLIP_MODEL_SIZE_BYTES = 605_000_000  # ~605 MB
MIN_FREE_DISK_BYTES = 1_500_000_000   # 1.5 GB minimum free

# Indexing Defaults
DEFAULT_BATCH_SIZE = 16
DEFAULT_HYBRID_WEIGHT = 0.25
DEFAULT_SIMILARITY_THRESHOLD = 0.96

# Server
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 3000
MAX_REQUEST_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
