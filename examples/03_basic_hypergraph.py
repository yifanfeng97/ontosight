"""Hypergraph visualization example.

This example demonstrates how to visualize hyperedges (edges connecting multiple nodes).
Useful for representing complex relationships like collaborations, co-authorship, etc.
"""

from ontosight.core import view_hypergraph
from pydantic import BaseModel, Field
from typing import List


class NodeSchema(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Label of the node")
    type: str = Field(..., description="Type of the node")


class EdgeSchema(BaseModel):
    nodes: List[str] = Field(..., description="List of node IDs in this hyperedge")
    label: str = Field(..., description="Label of the edge")
    type: str = Field(..., description="Type of the edge")

# Nodes
nodes = [
    NodeSchema(id="paper1", label="Paper: Machine Learning", type="paper"),
    NodeSchema(id="paper2", label="Paper: Deep Learning", type="paper"),
    NodeSchema(id="author1", label="Alice", type="author"),
    NodeSchema(id="author2", label="Bob", type="author"),
    NodeSchema(id="author3", label="Charlie", type="author"),
    NodeSchema(id="conf1", label="NeurIPS 2023", type="conference"),
    NodeSchema(id="conf2", label="ICML 2023", type="conference"),
]


# Hyperedges - representing co-authorship
hyperedges = [
    EdgeSchema(
        nodes=["author1", "author2", "paper1"],
        label="Co-authored: Paper 1",
        type="collaboration"
    ),
    EdgeSchema(
        nodes=["author2", "author3", "paper2"],
        label="Co-authored: Paper 2",
        type="collaboration"
    ),
    EdgeSchema(
        nodes=["paper1", "conf1"],
        label="Published at",
        type="publication"
    ),
    EdgeSchema(
        nodes=["paper2", "conf2"],
        label="Published at",
        type="publication"
    ),
]
if __name__ == "__main__":
    # Create a hypergraph visualization
    view_hypergraph(
        node_list=nodes,
        edge_list=hyperedges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_name_extractor=lambda node: node.label,
        edge_name_extractor=lambda edge: edge.label,
        nodes_in_edge_extractor=lambda edge: tuple(edge.nodes),
    )
    
    print("Hypergraph visualization started!")
    print("Open your browser to http://localhost:8000 to see the hypergraph")
    print("\nHypergraph shows relationships between multiple entities")
    print("For example: co-authorship (3+ nodes per edge)")
