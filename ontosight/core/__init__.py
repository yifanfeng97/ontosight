"""OntoSight Core - High-level API for visualization management.

This module provides simple, intuitive functions for creating and managing
interactive visualizations of knowledge graphs and structured data.

Example:
    >>> from ontosight.core import view_graph, view_list
    >>>
    >>> # Create a graph visualization
    >>> nodes = [{"name": "Node 1"}, {"name": "Node 2"}]
    >>> edges = [{"source": nodes[0], "target": nodes[1]}]
    >>> view_graph(node_list=nodes, edge_list=edges)
"""

from ontosight.core.views import (
    view_graph,
    view_list,
    view_hypergraph,
)

from .storage import BaseStorage, GraphStorage, HypergraphStorage, ListStorage

__all__ = [
    "view_graph",
    "view_list",
    "view_hypergraph",
    "BaseStorage",
    "GraphStorage",
    "HypergraphStorage",
    "ListStorage",
]
