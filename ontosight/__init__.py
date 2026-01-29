"""OntoSight - Interactive visualization library for knowledge graphs and structured data.

A simple, powerful library for creating interactive visualizations of graphs,
trees, lists, and other structured data with Python.

Example:
    >>> from ontosight import view_graph, view_list
    >>>
    >>> # Create a graph visualization
    >>> nodes = [{"id": "1", "label": "Node 1"}, {"id": "2", "label": "Node 2"}]
    >>> edges = [{"source": "1", "target": "2", "label": "connects"}]
    >>> view_graph(node_list=nodes, edge_list=edges)
"""

from ontosight.core import (
    view_graph,
    view_list,
    view_hypergraph,
)

__version__ = "0.1.0"

__all__ = [
    "view_graph",
    "view_list",
    "view_hypergraph",
]
