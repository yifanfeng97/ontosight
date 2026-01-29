"""Global state singleton for OntoSight visualization engine.

This module provides thread-safe global state management for storing callbacks
and visualization data. State transitions are fully logged for debugging and
monitoring purposes.

Architecture:
    - Single GlobalState instance (singleton pattern)
    - Thread-safe callback storage using threading.Lock
    - Structured logging for all state operations
    - Error handling with graceful fallbacks

Example:
    >>> from ontosight.server.state import global_state
    >>>
    >>> def my_search_callback(query: str, context: dict) -> list[str]:
    ...     return ["item1", "item2"]
    >>>
    >>> global_state.register_callbacks({
    ...     "search": my_search_callback,
    ...     "chat": my_chat_callback
    ... })
    >>> results = global_state.execute_callback("search", query="test")
"""

import logging
import threading
from collections.abc import Callable
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class GlobalState:
    """Thread-safe global state singleton for OntoSight.

    Stores:
        - Callbacks: {callback_name: callable}
        - Visualization data: nodes, edges, schema metadata
        - User context: initialization options

    Thread Safety:
        All operations are protected by a threading.Lock to ensure
        concurrent access safety across multiple threads.
    """

    _instance: Optional["GlobalState"] = None
    _lock = threading.Lock()

    def __new__(cls) -> "GlobalState":
        """Ensure only one instance exists (singleton pattern)."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """Initialize global state (called only once due to singleton)."""
        if self._initialized:
            return

        self._initialized = True
        self._state_lock = threading.Lock()
        self._callbacks: Dict[str, Callable] = {}
        self._visualization_data: Dict[str, Any] = {}
        self._context: Dict[str, Any] = {}

        logger.info("GlobalState initialized (singleton)")

    def clear(self) -> None:
        """Reset all state (data, callbacks, context)."""
        with self._state_lock:
            self._callbacks.clear()
            self._visualization_data.clear()
            self._context.clear()
            logger.info("Global state cleared")

    def register_callbacks(self, callbacks: Dict[str, Callable]) -> None:
        """Register callback functions for user-defined operations.

        Args:
            callbacks: Dictionary of {callback_name: callable}
                      Common names: "search", "chat", "filter"

        Raises:
            TypeError: If any callback is not callable
            ValueError: If callback_name is empty string

        Example:
            >>> global_state.register_callbacks({
            ...     "search": lambda q: search_db(q),
            ...     "chat": my_chat_handler,
            ... })
        """
        with self._state_lock:
            for name, callback in callbacks.items():
                if not name:
                    raise ValueError("Callback name cannot be empty string")
                if not callable(callback):
                    raise TypeError(
                        f"Callback '{name}' must be callable, got {type(callback).__name__}"
                    )
                self._callbacks[name] = callback
                logger.debug(f"Registered callback: {name}")

            logger.info(f"Registered {len(callbacks)} callbacks: {list(callbacks.keys())}")

    def execute_callback(self, callback_name: str, *args, **kwargs) -> Any:
        """Execute a registered callback with error handling.

        Args:
            callback_name: Name of the callback to execute
            *args: Positional arguments for the callback
            **kwargs: Keyword arguments for the callback

        Returns:
            Result from the callback function

        Raises:
            KeyError: If callback not registered
            Exception: Re-raised from callback with context

        Example:
            >>> results = global_state.execute_callback(
            ...     "search", query="test", limit=10
            ... )
        """
        with self._state_lock:
            if callback_name not in self._callbacks:
                error_msg = (
                    f"Callback '{callback_name}' not registered. "
                    f"Available: {list(self._callbacks.keys())}"
                )
                logger.error(error_msg)
                raise KeyError(error_msg)

            callback = self._callbacks[callback_name]

        try:
            logger.debug(
                f"Executing callback: {callback_name}",
                extra={"args_count": len(args), "kwargs_keys": list(kwargs.keys())},
            )
            result = callback(*args, **kwargs)
            logger.debug(f"Callback {callback_name} completed successfully")
            return result

        except Exception as e:
            logger.error(f"Callback {callback_name} failed: {type(e).__name__}: {e}", exc_info=True)
            raise

    def set_visualization_data(self, key: str, value: Any) -> None:
        """Store visualization data in global state.

        Args:
            key: Data identifier (e.g., "nodes", "edges", "schema")
            value: Data value (usually list or dict)

        Example:
            >>> global_state.set_visualization_data("nodes", [
            ...     {"id": "1", "label": "Node 1"},
            ...     {"id": "2", "label": "Node 2"},
            ... ])
        """
        with self._state_lock:
            self._visualization_data[key] = value
            logger.debug(f"Set visualization data: {key}")

    def get_visualization_data(self, key: str, default: Any = None) -> Any:
        """Retrieve visualization data from global state.

        Args:
            key: Data identifier
            default: Default value if key not found

        Returns:
            Stored value or default

        Example:
            >>> nodes = global_state.get_visualization_data("nodes", [])
        """
        with self._state_lock:
            return self._visualization_data.get(key, default)

    def get_all_visualization_data(self) -> Dict[str, Any]:
        """Get a copy of all visualization data.

        Returns:
            Dictionary of all stored visualization data
        """
        with self._state_lock:
            return self._visualization_data.copy()

    def set_context(self, **kwargs) -> None:
        """Store user context (initialization options, configuration).

        Args:
            **kwargs: Key-value pairs to store in context

        Example:
            >>> global_state.set_context(
            ...     user_id="user123",
            ...     theme="dark",
            ...     language="en"
            ... )
        """
        with self._state_lock:
            self._context.update(kwargs)
            logger.debug(f"Updated context with keys: {list(kwargs.keys())}")

    def get_context(self, key: str, default: Any = None) -> Any:
        """Retrieve a context value.

        Args:
            key: Context key
            default: Default value if not found

        Returns:
            Context value or default
        """
        with self._state_lock:
            return self._context.get(key, default)

    def clear(self) -> None:
        """Clear all state (callbacks, data, context).

        Warning: This completely resets the global state.
        Use only for testing or shutdown.
        """
        with self._state_lock:
            self._callbacks.clear()
            self._visualization_data.clear()
            self._context.clear()
            logger.warning("GlobalState cleared (all callbacks and data removed)")

    def get_state_summary(self) -> Dict[str, Any]:
        """Get a summary of current state for logging/debugging.

        Returns:
            Dictionary with counts and keys
        """
        with self._state_lock:
            return {
                "callbacks_count": len(self._callbacks),
                "callbacks_list": list(self._callbacks.keys()),
                "data_keys": list(self._visualization_data.keys()),
                "context_keys": list(self._context.keys()),
            }


# Global singleton instance
global_state = GlobalState()
