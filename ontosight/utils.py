"""Utility functions for data conversion and extraction.

Provides extractors for getting values from objects and conversion helpers
for common data formats like NetworkX graphs.
"""

import logging
import threading
import time
import socket
import webbrowser
import uvicorn
import hashlib
import random
from pydantic import BaseModel

logger = logging.getLogger(__name__)


# Global server thread handle
_server_thread = None
_server_host = "127.0.0.1"
_server_port = 8000


def get_random_id(length: int = 8) -> str:
    """Generate a random hexadecimal ID of specified length."""
    return hashlib.md5(f"{random.random()}-{time.time()}".encode()).hexdigest()[:length]


def get_model_id(model: BaseModel) -> str:
    """Get a unique ID for a Pydantic model instance."""
    model_str = model.model_dump_json()
    return hashlib.md5(model_str.encode()).hexdigest()[:8]


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
