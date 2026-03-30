"""OnToSight - Interactive visualization library for knowledge graphs and structured data.

A simple, powerful library for creating interactive visualizations of graphs,
trees, lists, and other structured data with Python.

Logging Configuration:
    OnToSight provides automatic logging configuration. By default, it uses a
    user-friendly log format that minimizes output for end users.

    Environment Variables:
        ONTOSIGHT_LOG_LEVEL: Log level (DEBUG, INFO, WARNING, ERROR)
        ONTOSIGHT_LOG_FORMAT: Log format ("user_friendly" or "detailed")
        ONTOSIGHT_QUIET: Set to "true" to disable all log output

    Example:
        import os
        os.environ["ONTOSIGHT_LOG_LEVEL"] = "DEBUG"
        os.environ["ONTOSIGHT_LOG_FORMAT"] = "detailed"

        from ontosight import view_graph
        # Now view_graph will output detailed debug logs
"""

# 导入日志配置（在任何其他导入之前）
from ontosight import logging_config

from ontosight.core import (
    view_graph,
    view_hypergraph,
    view_nodes,
)

__version__ = "0.1.6"
__author__ = "Yifan Feng"
__email__ = "evanfeng97@gmail.com"

__all__ = [
    "view_graph",
    "view_hypergraph",
    "view_nodes",
    "logging_config",
]
