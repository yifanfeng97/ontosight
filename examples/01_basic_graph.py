"""Basic graph visualization example.

This example demonstrates how to visualize a simple graph with nodes and edges.
"""

from ontosight.core import view_graph
from pydantic import BaseModel, Field


class NodeSchema(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Label of the node")
    role: str = Field(..., description="Role of the node")


class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: str = Field(..., description="Label of the edge")


nodes = [
    NodeSchema(id="1", label="Alice", role="Admin"),
    NodeSchema(id="2", label="Bob", role="User"),
    NodeSchema(id="3", label="Charlie", role="User"),
    NodeSchema(id="4", label="Diana", role="Admin"),
]

edges = [
    EdgeSchema(source="1", target="2", label="manages"),
    EdgeSchema(source="1", target="3", label="manages"),
    EdgeSchema(source="2", target="4", label="reports_to"),
    EdgeSchema(source="3", target="4", label="reports_to"),
]

if __name__ == "__main__":
    # Create a simple graph visualization
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_name_extractor=lambda node: node.label,
        edge_name_extractor=lambda edge: edge.label,
        nodes_in_edge_extractor=lambda edge: (edge.source, edge.target),
    )

    print("Graph visualization started!")
    print("Open your browser to http://localhost:8000 to see the graph")
