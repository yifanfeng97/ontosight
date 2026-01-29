"""NetworkX graph example.

This example shows how to use OntoSight with NetworkX graphs.
"""

import networkx as nx
from ontosight.core import view_graph
from pydantic import BaseModel, Field


class NodeSchema(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Label of the node")
    club: str = Field(..., description="Club affiliation")


class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: str = Field(..., description="Label of the edge")


# Create a NetworkX graph
G = nx.karate_club_graph()  # Famous Zachary's Karate Club network

# Convert NetworkX nodes and edges to OntoSight format
nodes = [
    NodeSchema(
        id=str(node),
        label=f"Person {node}",
        club=G.nodes[node].get("club", "Unknown"),
    )
    for node in G.nodes()
]

edges = [
    EdgeSchema(source=str(u), target=str(v), label="connected")
    for u, v in G.edges()
]

if __name__ == "__main__":
    print(f"Visualizing NetworkX graph: Zachary's Karate Club")
    print(f"Nodes: {len(nodes)}, Edges: {len(edges)}")
    
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_name_extractor=lambda node: node.label,
        edge_name_extractor=lambda edge: edge.label,
        nodes_in_edge_extractor=lambda edge: (edge.source, edge.target),
    )
    
    print("\nGraph visualization started!")
    print("Open your browser to http://localhost:8000")
    print("\nThis is a famous social network showing relationships")
    print("between members of a karate club at a US university.")
