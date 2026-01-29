"""Unit tests for GlobalState singleton.

Tests cover:
- Singleton pattern (single instance)
- Thread-safe callback storage
- Callback execution with error handling
- Visualization data storage/retrieval
- Context management
- State transitions and logging
"""

import pytest
import threading
from ontosight.server.state import GlobalState, global_state


class TestGlobalStateSingleton:
    """Test singleton pattern."""

    def test_singleton_instance(self):
        """Verify only one GlobalState instance exists."""
        state1 = GlobalState()
        state2 = GlobalState()
        assert state1 is state2
        assert state1 is global_state

    def test_singleton_thread_safe(self):
        """Verify singleton creation is thread-safe."""
        instances = []

        def create_instance():
            instances.append(GlobalState())

        threads = [threading.Thread(target=create_instance) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # All instances should be the same
        assert len(set(id(inst) for inst in instances)) == 1


class TestCallbackManagement:
    """Test callback registration and execution."""

    def setup_method(self):
        """Clear state before each test."""
        global_state.clear()

    def test_register_single_callback(self):
        """Test registering a single callback."""

        def search_cb(query: str):
            return [f"result_{query}"]

        global_state.register_callbacks({"search": search_cb})

        summary = global_state.get_state_summary()
        assert "search" in summary["callbacks_list"]

    def test_register_multiple_callbacks(self):
        """Test registering multiple callbacks."""

        def search_cb(query: str):
            return []

        def chat_cb(msg: str):
            return "response"

        global_state.register_callbacks({"search": search_cb, "chat": chat_cb})

        summary = global_state.get_state_summary()
        assert len(summary["callbacks_list"]) == 2
        assert "search" in summary["callbacks_list"]
        assert "chat" in summary["callbacks_list"]

    def test_register_non_callable_raises_error(self):
        """Test that registering non-callable raises TypeError."""
        with pytest.raises(TypeError):
            global_state.register_callbacks({"search": "not_callable"})

    def test_register_empty_name_raises_error(self):
        """Test that empty callback name raises ValueError."""
        with pytest.raises(ValueError):
            global_state.register_callbacks({"": lambda q: []})

    def test_execute_callback(self):
        """Test executing a callback."""

        def search_cb(query: str):
            return ["item1", "item2"]

        global_state.register_callbacks({"search": search_cb})
        result = global_state.execute_callback("search", "test")

        assert result == ["item1", "item2"]

    def test_execute_callback_with_kwargs(self):
        """Test executing callback with keyword arguments."""

        def search_cb(query: str, limit: int = 10):
            return [f"item_{i}" for i in range(limit)]

        global_state.register_callbacks({"search": search_cb})
        result = global_state.execute_callback("search", "test", limit=3)

        assert len(result) == 3

    def test_execute_unregistered_callback_raises_error(self):
        """Test executing unregistered callback raises KeyError."""
        with pytest.raises(KeyError):
            global_state.execute_callback("nonexistent")

    def test_execute_callback_with_exception(self):
        """Test that callback exceptions are re-raised."""

        def failing_cb():
            raise ValueError("Test error")

        global_state.register_callbacks({"failing": failing_cb})

        with pytest.raises(ValueError, match="Test error"):
            global_state.execute_callback("failing")


class TestVisualizationData:
    """Test visualization data storage."""

    def setup_method(self):
        """Clear state before each test."""
        global_state.clear()

    def test_set_and_get_data(self):
        """Test storing and retrieving data."""
        nodes = [{"id": "1", "label": "Node 1"}]
        global_state.set_visualization_data("nodes", nodes)

        retrieved = global_state.get_visualization_data("nodes")
        assert retrieved == nodes

    def test_get_nonexistent_data_returns_default(self):
        """Test getting nonexistent data returns default."""
        result = global_state.get_visualization_data("nonexistent", [])
        assert result == []

    def test_get_all_visualization_data(self):
        """Test retrieving all data."""
        global_state.set_visualization_data("nodes", [1, 2, 3])
        global_state.set_visualization_data("edges", [4, 5, 6])

        all_data = global_state.get_all_visualization_data()

        assert all_data["nodes"] == [1, 2, 3]
        assert all_data["edges"] == [4, 5, 6]

    def test_set_data_overwrites_existing(self):
        """Test that setting data overwrites previous value."""
        global_state.set_visualization_data("nodes", [1, 2, 3])
        global_state.set_visualization_data("nodes", [7, 8, 9])

        result = global_state.get_visualization_data("nodes")
        assert result == [7, 8, 9]


class TestContextManagement:
    """Test context storage."""

    def setup_method(self):
        """Clear state before each test."""
        global_state.clear()

    def test_set_and_get_context(self):
        """Test storing and retrieving context."""
        global_state.set_context(user_id="user123", theme="dark")

        assert global_state.get_context("user_id") == "user123"
        assert global_state.get_context("theme") == "dark"

    def test_get_context_default(self):
        """Test getting nonexistent context returns default."""
        result = global_state.get_context("nonexistent", "default_value")
        assert result == "default_value"

    def test_context_update(self):
        """Test that set_context updates existing values."""
        global_state.set_context(user_id="user123")
        global_state.set_context(user_id="user456", theme="light")

        assert global_state.get_context("user_id") == "user456"
        assert global_state.get_context("theme") == "light"


class TestStateSummary:
    """Test state summary method."""

    def setup_method(self):
        """Clear state before each test."""
        global_state.clear()

    def test_empty_state_summary(self):
        """Test summary of empty state."""
        summary = global_state.get_state_summary()

        assert summary["callbacks_count"] == 0
        assert summary["callbacks_list"] == []
        assert summary["data_keys"] == []
        assert summary["context_keys"] == []

    def test_populated_state_summary(self):
        """Test summary of populated state."""
        global_state.register_callbacks({"search": lambda q: []})
        global_state.set_visualization_data("nodes", [])
        global_state.set_context(user_id="user1")

        summary = global_state.get_state_summary()

        assert summary["callbacks_count"] == 1
        assert "search" in summary["callbacks_list"]
        assert "nodes" in summary["data_keys"]
        assert "user_id" in summary["context_keys"]


class TestThreadSafety:
    """Test thread-safe concurrent access."""

    def setup_method(self):
        """Clear state before each test."""
        global_state.clear()

    def test_concurrent_data_writes(self):
        """Test concurrent writes to visualization data."""

        def write_data(thread_id):
            for i in range(100):
                global_state.set_visualization_data(f"thread_{thread_id}", list(range(i)))

        threads = [threading.Thread(target=write_data, args=(i,)) for i in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        data = global_state.get_all_visualization_data()
        assert len(data) == 5

    def test_concurrent_callback_execution(self):
        """Test concurrent callback execution."""
        results = []

        def search_cb(query: str, thread_id: int):
            results.append((query, thread_id))
            return [query] * thread_id

        global_state.register_callbacks({"search": search_cb})

        def execute_search(thread_id):
            for i in range(10):
                global_state.execute_callback("search", f"query_{i}", thread_id)

        threads = [threading.Thread(target=execute_search, args=(i,)) for i in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert len(results) == 50  # 5 threads * 10 calls each


class TestStateClear:
    """Test state clearing."""

    def test_clear_empties_state(self):
        """Test that clear empties all state."""
        global_state.register_callbacks({"search": lambda q: []})
        global_state.set_visualization_data("nodes", [1, 2, 3])
        global_state.set_context(user_id="user123")

        global_state.clear()

        summary = global_state.get_state_summary()
        assert summary["callbacks_count"] == 0
        assert len(summary["data_keys"]) == 0
        assert len(summary["context_keys"]) == 0
