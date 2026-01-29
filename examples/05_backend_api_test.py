"""Backend API testing example (without visualization).

This example shows how to test the OntoSight backend API directly
without starting the frontend. Useful for testing and integration.
"""

import requests
import json
from typing import Dict, Any

# Backend API base URL
API_BASE_URL = "http://localhost:8000"

# Sample data
TEST_NODES = [
    {"id": "1", "label": "Node 1", "value": 10},
    {"id": "2", "label": "Node 2", "value": 20},
    {"id": "3", "label": "Node 3", "value": 30},
]

TEST_EDGES = [
    {"source": "1", "target": "2", "label": "connects"},
    {"source": "2", "target": "3", "label": "connects"},
]

def test_health_check():
    """Test the health check endpoint."""
    print("\n📋 Testing Health Check")
    print("-" * 50)
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_meta_endpoint():
    """Test the metadata endpoint."""
    print("\n📋 Testing /api/meta Endpoint")
    print("-" * 50)
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/meta", timeout=5)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        print(f"Full response:\n{json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_data_endpoint():
    """Test the data endpoint."""
    print("\n📋 Testing /api/data Endpoint")
    print("-" * 50)
    
    try:
        # First, set some data on the backend using view_graph
        from ontosight.core import view_graph
        view_graph(
            TEST_NODES,
            TEST_EDGES,
            None,
            None,
            None,
            None,
            None,
        )
        
        # Now fetch the data
        response = requests.get(f"{API_BASE_URL}/api/data", timeout=5)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Nodes: {len(data.get('nodes', []))} items")
        print(f"Edges: {len(data.get('edges', []))} items")
        print(f"Full response:\n{json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_search_endpoint():
    """Test the search endpoint."""
    print("\n📋 Testing /api/search Endpoint")
    print("-" * 50)
    
    try:
        search_data = {
            "query": "Node",
            "context": {"type": "test"}
        }
        response = requests.post(
            f"{API_BASE_URL}/api/search",
            json=search_data,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Results: {data}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat_endpoint():
    """Test the chat endpoint."""
    print("\n📋 Testing /api/chat Endpoint")
    print("-" * 50)
    
    try:
        chat_data = {
            "query": "What is this data about?",
            "context": {"type": "test"}
        }
        response = requests.post(
            f"{API_BASE_URL}/api/chat",
            json=chat_data,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {data}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all API tests."""
    print("\n" + "=" * 50)
    print("OntoSight Backend API Testing")
    print("=" * 50)
    print("\n⚠️  Make sure the backend server is running!")
    print("    Start it with: python -m ontosight.server.app")
    print("    Or run a view_* function first (which auto-starts it)")
    
    results = {
        "Health Check": test_health_check(),
        "Meta Endpoint": test_meta_endpoint(),
        "Data Endpoint": test_data_endpoint(),
        "Search Endpoint": test_search_endpoint(),
        "Chat Endpoint": test_chat_endpoint(),
    }
    
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    print(f"\nTotal: {passed}/{total} tests passed")

if __name__ == "__main__":
    main()
