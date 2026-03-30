"""Logging configuration module - provides unified logging initialization and management.

This module is responsible for:
1. Providing user-friendly logging configuration
2. Preventing external logging configurations from interfering with OnToSight's log output
3. Supporting environment variable control for logging levels
4. Providing layered logging architecture (user messages, debug logs, error logs)

Usage Examples:
    # Default configuration (user-friendly mode)
    from ontosight import logging_config
    logging_config.setup_logging()

    # Debug mode
    from ontosight import logging_config
    logging_config.setup_logging(level="DEBUG", format_type="detailed")

    # Using environment variables
    # ONTOSIGHT_LOG_LEVEL=DEBUG
    # ONTOSIGHT_LOG_FORMAT=user_friendly
    # ONTOSIGHT_QUIET=true
"""

import logging
import os
import sys
from typing import Optional

# User-facing output configuration
USER_OUTPUT_STREAM = sys.stdout

# Default configuration
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_FORMAT_TYPE = "user_friendly"
DEFAULT_QUIET_MODE = False

# Environment variable names
ENV_LOG_LEVEL = "ONTOSIGHT_LOG_LEVEL"
ENV_LOG_FORMAT = "ONTOSIGHT_LOG_FORMAT"
ENV_QUIET_MODE = "ONTOSIGHT_QUIET"

# Logging configuration flag (prevents duplicate initialization)
_initialized = False


def get_log_level() -> str:
    """Get logging level from environment variable.

    Returns:
        Logging level string (DEBUG, INFO, WARNING, ERROR)
    """
    return os.getenv(ENV_LOG_LEVEL, DEFAULT_LOG_LEVEL).upper()


def get_format_type() -> str:
    """Get logging format type from environment variable.

    Returns:
        Format type string ("user_friendly" or "detailed")
    """
    return os.getenv(ENV_LOG_FORMAT, DEFAULT_FORMAT_TYPE).lower()


def is_quiet_mode() -> bool:
    """Check if quiet mode is enabled.

    Returns:
        True if quiet mode is enabled
    """
    return os.getenv(ENV_QUIET_MODE, str(DEFAULT_QUIET_MODE).lower()).lower() == "true"


def setup_logging(
    level: Optional[str] = None,
    format_type: Optional[str] = None,
    quiet: Optional[bool] = None,
    log_file: Optional[str] = None,
    force: bool = False
) -> None:
    """Configure the logging system.

    This function configures the logging system to provide user-friendly log output.
    If no parameters are provided, configuration is read from environment variables.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
              If None, reads from environment variable ONTOSIGHT_LOG_LEVEL
        format_type: Format type
                    - "user_friendly": Simple format, only shows level and message
                    - "detailed": Detailed format with timestamp and module name
              If None, reads from environment variable ONTOSIGHT_LOG_FORMAT
        quiet: Whether to enable quiet mode (disables all log output)
               If None, reads from environment variable ONTOSIGHT_QUIET
        log_file: Optional log file path
        force: Whether to force reconfiguration (ignores initialization flag)

    Example:
        # Use default configuration
        setup_logging()

        # Debug mode
        setup_logging(level="DEBUG")

        # Detailed logging mode
        setup_logging(level="DEBUG", format_type="detailed")

        # Quiet mode
        setup_logging(quiet=True)

        # Output to file
        setup_logging(log_file="ontosight.log")
    """
    global _initialized

    # Prevent duplicate initialization
    if _initialized and not force:
        return

    # Get configuration
    if level is None:
        level = get_log_level()

    if format_type is None:
        format_type = get_format_type()

    if quiet is None:
        quiet = is_quiet_mode()

    # Convert logging level
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    # Create formatter
    if format_type == "user_friendly":
        formatter = logging.Formatter(
            '%(levelname)s: %(message)s'
        )
    else:
        # detailed format (includes timestamp and module name)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Clear existing handlers (avoid duplication)
    root_logger.handlers.clear()

    # Add console handler if not in quiet mode
    if not quiet:
        console_handler = logging.StreamHandler(sys.stderr)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(numeric_level)
        root_logger.addHandler(console_handler)

    # Optional: add file handler
    if log_file:
        try:
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            file_handler.setLevel(numeric_level)
            root_logger.addHandler(file_handler)
        except (IOError, OSError) as e:
            # If file handler cannot be created, log warning but continue
            warnings_logger = logging.getLogger(__name__)
            warnings_logger.warning(f"Failed to create log file {log_file}: {e}")

    _initialized = True


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance.

    Args:
        name: Logger name, typically use __name__

    Returns:
        Configured logger instance

    Example:
        logger = get_logger(__name__)
        logger.info("This is an info message")
        logger.debug("This is a debug message")
    """
    return logging.getLogger(name)


def set_level(level: str) -> None:
    """Set logging level.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Also update all handler levels
    for handler in root_logger.handlers:
        handler.setLevel(numeric_level)


def enable_debug() -> None:
    """Enable debug mode.

    Sets logging level to DEBUG and uses detailed format.
    """
    setup_logging(level="DEBUG", format_type="detailed", force=True)


def disable_logging() -> None:
    """Disable all log output.

    This will completely silence log output, including error messages.
    """
    setup_logging(level="CRITICAL", quiet=True, force=True)


def reset_logging() -> None:
    """Reset logging system to initial state.

    Clears all handlers and resets initialization flag.
    """
    global _initialized
    _initialized = False

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(logging.NOTSET)


# Auto initialization (default configuration)
# If user imports ontosight.logging_config, default configuration will be applied automatically
# If user wants custom configuration, set environment variables before import
setup_logging()
