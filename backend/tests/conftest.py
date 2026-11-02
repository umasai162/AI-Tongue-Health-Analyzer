import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)
