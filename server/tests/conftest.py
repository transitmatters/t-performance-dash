"""Set required environment variables before any app modules are imported."""

import os

os.environ.setdefault("TM_BACKEND_SOURCE", "static")
os.environ.setdefault("MBTA_V3_API_KEY", "test-key")
