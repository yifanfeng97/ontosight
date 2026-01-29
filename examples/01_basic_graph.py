"""Basic graph visualization example.

This example demonstrates how to visualize a simple graph with nodes and edges.
"""

from ontosight.core import view_graph

# Simple node data
nodes = [
    {"id": "1", "label": "Alice", "role": "Admin"},
    {"id": "2", "label": "Bob", "role": "User"},
    {"id": "3", "label": "Charlie", "role": "User"},
    {"id": "4", "label": "Diana", "role": "Admin"},
]

# Simple edge data
edges = [
    {"source": "1", "target": "2", "label": "manages"},
    {"source": "1", "target": "3", "label": "manages"},
    {"source": "2", "target": "4", "label": "reports_to"},
    {"source": "3", "target": "4", "label": "reports_to"},
]

if __name__ == "__main__":
    # Create a simple graph visualization
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=None,
        edge_schema=None,
        node_name_extractor=None,
        edge_name_extractor=None,
        nodes_in_edge_extractor=None,
    )
    
    print("Graph visualization started!")
    print("Open your browser to http://localhost:8000 to see the graph")
