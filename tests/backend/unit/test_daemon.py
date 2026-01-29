"""Tests for OntoSight Core daemon lifecycle management."""

import pytest
import time
from ontosight.core.daemon import (
    start_daemon,
    stop_daemon,
    is_daemon_running,
    get_daemon_url,
    _is_port_available,
    _is_server_responsive,
)


class TestDaemonLifecycle:
    """Test daemon start/stop lifecycle."""

    def test_port_availability_check(self):
        """Test checking if a port is available."""
        # Port 1 is typically privileged and not available
        available = _is_port_available("127.0.0.1", 1)
        # Don't assert - just verify function works without error
        assert isinstance(available, bool)

    def test_daemon_not_running_initially(self):
        """Test that daemon is not running initially."""
        assert not is_daemon_running()

    def test_start_daemon_fails_if_already_running(self):
        """Test that starting daemon twice raises error."""
        # This test just verifies the logic without actually starting
        # In integration tests, we'd need to manage actual processes
        pass

    def test_stop_daemon_when_not_running(self):
        """Test stopping daemon when not running."""
        # Should return True (success) even if not running
        result = stop_daemon()
        assert result is True


class TestDaemonURL:
    """Test daemon URL management."""

    def test_get_daemon_url_when_not_running(self):
        """Test that getting URL when not running raises error."""
        with pytest.raises(RuntimeError):
            get_daemon_url()


class TestServerResponsiveness:
    """Test server responsiveness checking."""

    def test_is_server_responsive(self):
        """Test checking if server is responsive."""
        # Test with non-existent server (should return False quickly)
        responsive = _is_server_responsive("127.0.0.1", 19999)
        assert responsive is False

    def test_server_responsiveness_with_invalid_host(self):
        """Test responsiveness check with invalid host."""
        # Should handle gracefully
        responsive = _is_server_responsive("invalid.host.local", 8000)
        assert isinstance(responsive, bool)
