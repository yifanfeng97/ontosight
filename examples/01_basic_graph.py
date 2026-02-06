"""Basic graph visualization example.

This example demonstrates how to visualize a simple graph with nodes and edges.
"""

from ontosight.core import view_graph
from pydantic import BaseModel, Field


class NodeSchema(BaseModel):
    name: str = Field(..., description="Name of the node")
    role: str = Field(..., description="Role of the node")


class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node name")
    target: str = Field(..., description="Target node name")
    action: str = Field(..., description="Label of the edge")


nodes = [
    NodeSchema(name="Alice", role="Admin"),
    NodeSchema(name="Bob", role="User"),
    NodeSchema(name="Charlie", role="User"),
    NodeSchema(name="Diana", role="Admin"),
]

edges = [
    EdgeSchema(source="Alice", target="Bob", action="manages"),
    EdgeSchema(source="Alice", target="Charlie", action="manages"),
    EdgeSchema(source="Bob", target="Diana", action="reports_to"),
    EdgeSchema(source="Charlie", target="Diana", action="reports_to"),
]

if __name__ == "__main__":
    # Create a simple graph visualization
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_id_extractor=lambda node: node.name,
        node_ids_in_edge_extractor=lambda edge: (edge.source, edge.target),
        edge_label_extractor=lambda edge: edge.action,
    )

