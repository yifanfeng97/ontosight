"""OntoSight visualization views - modular visualization functions.

This package provides separate view functions for different visualization types:
- graph: Interactive force-directed graphs
- hypergraph: Multi-node edge visualizations
"""

from ontosight.core.views.graph import view_graph
from ontosight.core.views.hypergraph import view_hypergraph

__all__ = [
    "view_graph",
    "view_hypergraph",
]
