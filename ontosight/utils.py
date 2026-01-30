"""Utility functions for data conversion and extraction.

Provides extractors for getting values from objects and conversion helpers
for common data formats like NetworkX graphs.
"""

from typing import Any, Callable, Union
import logging
import threading
import time
import socket
import webbrowser
import uvicorn

import hashlib

logger = logging.getLogger(__name__)


# Type for extractors: either a string key/attribute name or a callable
Extractor = Union[str, Callable[[Any], Any]]


# Global server thread handle
_server_thread = None
_server_host = "127.0.0.1"
_server_port = 8000


def ensure_server_running(host: str = "127.0.0.1", port: int = 8000) -> None:
    """Ensure the visualization server is running in a background thread."""
    global _server_thread, _server_host, _server_port

    if _server_thread is not None and _server_thread.is_alive():
        # Already running
        return

    # Find an available port (handles zombie processes)
    actual_port = _find_available_port(host, port)

    _server_host = host
    _server_port = actual_port

    if actual_port != port:
        logger.warning(f"Port {port} was busy. Using port {actual_port} instead.")

    try:
        from ontosight.server.app import app

        # Configure uvicorn
        config = uvicorn.Config(app, host=host, port=actual_port, log_level="warning")
        server = uvicorn.Server(config)

        # Start server in a Daemon thread (dies when main thread dies)
        _server_thread = threading.Thread(target=server.run, daemon=True)
        _server_thread.start()

        # Wait for server to start
        if not _wait_for_server(host, actual_port, timeout=10):
            raise RuntimeError("Server failed to start")

        logger.info(f"Server started successfully at {host}:{actual_port}")

    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise


def short_id_from_str(s: str) -> str:
    """Generate a short identifier from a string input."""

    hash_obj = hashlib.sha256(s.encode("utf-8"))
    short_id = hash_obj.hexdigest()[:6]
    return short_id


def _find_available_port(host: str, start_port: int, max_retries: int = 10) -> int:
    """Find the first available port in a range."""
    for port in range(start_port, start_port + max_retries):
        if _is_port_available(host, port):
            return port
    raise RuntimeError(
        f"Could not find available port in range {start_port}-{start_port + max_retries}"
    )


def _is_port_available(host: str, port: int) -> bool:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        # return 0 if port is in use
        result = sock.connect_ex((host, port))
        sock.close()
        return result != 0
    except Exception:
        # If socket fails, assume port is open? Or error?
        # Safe default: assume available
        return True


def _wait_for_server(host: str, port: int, timeout: int = 10) -> bool:
    start_time = time.time()
    while time.time() - start_time < timeout:
        if _is_server_responsive(host, port):
            return True
        time.sleep(0.5)
    return False


def _is_server_responsive(host: str, port: int) -> bool:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False


def get_server_url(path: str = "") -> str:
    """Get the full URL for the running server."""
    # Ensure path starts with / if not empty
    if path and not path.startswith("/"):
        path = "/" + path
    return f"http://{_server_host}:{_server_port}{path}"


def open_browser(path: str = "") -> None:
    """Open the visualization in the default web browser."""
    url = get_server_url(path)
    logger.info(f"Opening browser at {url}")
    webbrowser.open(url)


def wait_for_user() -> None:
    """Block execution until the user explicitly stops the server."""
    print(f"\nOntoSight server is running at {get_server_url()}")
    print("Press Ctrl+C to stop the server and exit...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("\nStopping server...")
        # Server process will be cleaned up by atexit handler


def extract_value(obj: Any, extractor: Extractor, default: Any = None) -> Any:
    """Extract a value from an object using a string key or callable.

    Args:
        obj: Object to extract from
        extractor: Either a string (key/attribute name) or callable (lambda)
        default: Default value if extraction fails

    Returns:
        Extracted value or default

    Example:
        >>> extract_value({"id": 1}, "id")
        1
        >>> extract_value(obj, lambda x: x.uid)
        'u123'
    """
    if callable(extractor):
        try:
            return extractor(obj)
        except Exception as e:
            logger.warning(f"Extractor function failed: {e}")
            return default

    # String key/attribute extraction
    try:
        if isinstance(obj, dict):
            return obj.get(extractor, default)
        return getattr(obj, extractor, default)
    except Exception as e:
        logger.warning(f"Failed to extract '{extractor}' from {type(obj)}: {e}")
        return default
