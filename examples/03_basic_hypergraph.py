"""Hypergraph visualization example.

This example demonstrates how to visualize hyperedges (edges connecting multiple nodes).
Useful for representing complex relationships like collaborations, co-authorship, etc.
"""

from ontosight.core import view_hypergraph

# Nodes
nodes = [
    {"id": "paper1", "label": "Paper: Machine Learning", "type": "paper"},
    {"id": "paper2", "label": "Paper: Deep Learning", "type": "paper"},
    {"id": "author1", "label": "Alice", "type": "author"},
    {"id": "author2", "label": "Bob", "type": "author"},
    {"id": "author3", "label": "Charlie", "type": "author"},
    {"id": "conf1", "label": "NeurIPS 2023", "type": "conference"},
]

# Hyperedges - representing co-authorship
hyperedges = [
    {
        "nodes": ["author1", "author2", "paper1"],
        "label": "Co-authored: Paper 1",
        "type": "collaboration"
    },
    {
        "nodes": ["author2", "author3", "paper2"],
        "label": "Co-authored: Paper 2",
        "type": "collaboration"
    },
    {
        "nodes": ["paper1", "conf1"],
        "label": "Published at",
        "type": "publication"
    },
]

if __name__ == "__main__":
    # Create a hypergraph visualization
    view_hypergraph(
        node_list=nodes,
        edge_list=hyperedges,
        node_schema=None,
        edge_schema=None,
        node_name_extractor=None,
        edge_name_extractor=None,
        nodes_in_edge_extractor="nodes",
    )
    
    print("Hypergraph visualization started!")
    print("Open your browser to http://localhost:8000 to see the hypergraph")
    print("\nHypergraph shows relationships between multiple entities")
    print("For example: co-authorship (3+ nodes per edge)")
