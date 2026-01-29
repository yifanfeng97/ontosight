#!/usr/bin/env python3
"""Quick API test to check /api/data response."""

import requests
import json
import time
import sys

# Wait for server to start
print("Waiting for server...", file=sys.stderr)
time.sleep(3)

BASE_URL = "http://localhost:8001"

try:
    print("\n=== Testing /api/meta ===", file=sys.stderr)
    resp = requests.get(f"{BASE_URL}/api/meta", timeout=5)
    print(f"Status: {resp.status_code}", file=sys.stderr)
    data = resp.json()
    print(f"Meta keys: {list(data.keys()) if data else 'None'}", file=sys.stderr)
    
    print("\n=== Testing /api/data ===", file=sys.stderr)
    resp = requests.get(f"{BASE_URL}/api/data", timeout=5)
    print(f"Status: {resp.status_code}", file=sys.stderr)
    data = resp.json()
    print(f"Data structure: {json.dumps(data, indent=2, default=str)}", file=sys.stderr)
    
except requests.exceptions.ConnectionError as e:
    print(f"Connection error: {e}", file=sys.stderr)
    print("Server may not be running yet", file=sys.stderr)
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}", file=sys.stderr)

