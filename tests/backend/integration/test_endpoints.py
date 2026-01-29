"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from ontosight.server.app import create_app
from ontosight.server.state import global_state
from ontosight.models import Node, Edge


@pytest.fixture
def client():
    """Create test client."""
    app = create_app()
    return TestClient(app)


@pytest.fixture
def clear_state():
    """Clear global state before each test."""
    state = global_state
    state.clear()
    yield
    state.clear()


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check_head(self, client):
        """Verify HEAD /api/health works."""
        response = client.head("/api/health")
        assert response.status_code == 200

    def test_health_check_get(self, client):
        """Verify GET /api/health works."""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestMetaEndpoint:
    """Test /api/meta endpoint."""

    def test_meta_no_visualization(self, client, clear_state):
        """Verify meta endpoint returns schemas."""
        response = client.get("/api/meta")
        assert response.status_code == 200
        data = response.json()

        assert "node_schema" in data

    def test_meta_with_visualization(self, client, clear_state):
        """Verify meta endpoint returns schemas."""
        # Setup visualization
        state = global_state
        nodes = [Node(id="1", data={}, label="Node 1")]
        edges = [Edge(source="1", target="2", data={}, label="edge")]
        state.set_visualization_data("nodes", nodes)
        state.set_visualization_data("edges", edges)
        state.set_visualization_data("items", [])
        state.set_visualization_data("hyperedges", [])

        response = client.get("/api/meta")
        assert response.status_code == 200
        data = response.json()

        assert "node_schema" in data
        assert "edge_schema" in data


class TestDataEndpoint:
    """Test /api/data endpoint."""

    def test_data_no_visualization(self, client, clear_state):
        """Verify 404 when no visualization loaded."""
        response = client.get("/api/data")
        assert response.status_code == 404

    def test_data_with_visualization(self, client, clear_state):
        """Verify data endpoint returns visualization."""
        # Setup visualization
        state = global_state
        nodes = [Node(id="1", data={"name": "Alice"}, label="Alice")]
        edges = []
        state.set_visualization_data("nodes", nodes)
        state.set_visualization_data("edges", edges)
        state.set_visualization_data("items", [])
        state.set_visualization_data("hyperedges", [])

        response = client.get("/api/data")
        assert response.status_code == 200
        data = response.json()

        assert len(data["nodes"]) == 1
        assert data["nodes"][0]["id"] == "1"
        assert data["nodes"][0]["label"] == "Alice"


class TestSearchEndpoint:
    """Test /api/search endpoint."""

    def test_search_empty_query(self, client, clear_state):
        """Verify error on empty query."""
        response = client.post("/api/search", json={"query": "  "})
        assert response.status_code == 400

    def test_search_no_callback(self, client, clear_state):
        """Verify error when search callback not registered."""
        response = client.post("/api/search", json={"query": "test"})
        assert response.status_code == 404

    def test_search_with_callback(self, client, clear_state):
        """Verify search with registered callback."""
        # Register search callback
        state = global_state
        state.register_callbacks({"search": lambda query, context: ["result1", "result2"]})

        response = client.post("/api/search", json={"query": "test"})
        assert response.status_code == 200
        data = response.json()

        assert len(data["results"]) == 2
        assert "result1" in data["results"]

    def test_search_with_context(self, client, clear_state):
        """Verify search with context parameter."""
        # Register search callback that uses context
        state = global_state

        def search_handler(query, context):
            field = context.get("field", "all")
            return [f"result_from_{field}"]

        state.register_callbacks({"search": search_handler})

        response = client.post("/api/search", json={"query": "test", "context": {"field": "name"}})
        assert response.status_code == 200
        data = response.json()

        assert "result_from_name" in data["results"]


class TestChatEndpoint:
    """Test /api/chat endpoint."""

    def test_chat_empty_query(self, client, clear_state):
        """Verify error on empty query."""
        response = client.post("/api/chat", json={"query": "  "})
        assert response.status_code == 400

    def test_chat_no_callback(self, client, clear_state):
        """Verify error when chat callback not registered."""
        response = client.post("/api/chat", json={"query": "test"})
        assert response.status_code == 404

    def test_chat_with_callback_string(self, client, clear_state):
        """Verify chat with string response."""
        # Register chat callback
        state = global_state
        state.register_callbacks({"chat": lambda query, context: "Chat response"})

        response = client.post("/api/chat", json={"query": "Hello"})
        assert response.status_code == 200
        data = response.json()

        assert data["response"] == "Chat response"

    def test_chat_with_callback_dict(self, client, clear_state):
        """Verify chat with dict response."""
        state = global_state
        state.register_callbacks(
            {
                "chat": lambda query, context: {
                    "response": "Chat response",
                    "sources": ["node1", "node2"],
                }
            }
        )

        response = client.post("/api/chat", json={"query": "Hello"})
        assert response.status_code == 200
        data = response.json()

        assert data["response"] == "Chat response"
        assert data["sources"] == ["node1", "node2"]

    def test_chat_with_callback_tuple(self, client, clear_state):
        """Verify chat with tuple response."""
        state = global_state
        state.register_callbacks(
            {"chat": lambda query, context: ("Chat response", ["node1", "node2"])}
        )

        response = client.post("/api/chat", json={"query": "Hello"})
        assert response.status_code == 200
        data = response.json()

        assert data["response"] == "Chat response"
        assert data["sources"] == ["node1", "node2"]

    def test_chat_with_context(self, client, clear_state):
        """Verify chat with context parameter."""
        state = global_state
        state.register_callbacks(
            {"chat": lambda query, context: f"Response for query in context {context.get('mode')}"}
        )

        response = client.post("/api/chat", json={"query": "test", "context": {"mode": "expert"}})
        assert response.status_code == 200
        data = response.json()

        assert "expert" in data["response"]
