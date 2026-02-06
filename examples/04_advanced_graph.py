"""Advanced graph with search and chat callbacks.

This example demonstrates how to use search and chat callbacks to make the
visualization interactive.
"""

from ontosight.core import view_graph
from typing import Dict, Any, Tuple
from pydantic import BaseModel, Field


class NodeSchema(BaseModel):
    name: str = Field(..., description="Label of the node")
    department: str = Field(..., description="Department of the node")
    level: str = Field(..., description="Level of the node")


class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: str = Field(..., description="Label of the edge")


# Sample network data
nodes = [
    NodeSchema(name="Alice", department="Engineering", level="Senior"),
    NodeSchema(name="Bob", department="Sales", level="Manager"),
    NodeSchema(name="Charlie", department="Engineering", level="Junior"),
    NodeSchema(name="Diana", department="Marketing", level="Manager"),
    NodeSchema(name="Eve", department="HR", level="Director"),
]

edges = [
    EdgeSchema(source="Alice", target="Charlie", label="mentors"),
    EdgeSchema(source="Bob", target="Diana", label="manages"),
    EdgeSchema(source="Diana", target="Eve", label="reports_to"),
    EdgeSchema(source="Charlie", target="Eve", label="reports_to"),
    EdgeSchema(source="Alice", target="Bob", label="collaborates_with"),
]


# Define search callback
def on_search(query: str) -> list:
    """Handle search queries - return matching nodes."""
    print(f"[Search] Query: {query}")

    results = []
    for node in nodes:
        # Search in label, department, level
        if (
            query.lower() in node.name.lower()
            or query.lower() in node.department.lower()
            or query.lower() in node.level.lower()
        ):
            results.append(node)

    print(f"[Search] Found {len(results)} results: {results}")
    return results, []


# Define chat callback
def on_chat(question: str) -> str:
    """Handle chat/Q&A queries and return related nodes and edges."""
    print(f"[Chat] Question: {question}")

    nodes_in_answer, edges_in_answer = [], []
    # Simple Q&A logic
    if "alice" in question.lower():
        response = "Alice is a Senior Engineer who mentors Charlie."
        nodes_in_answer = [node for node in nodes if node.name == "Alice"]
        edges_in_answer = [
            edge for edge in edges if edge.source == "Alice" or edge.target == "Alice"
        ]
    elif "bob" in question.lower():
        response = "Bob is a Sales Manager who manages Diana."
        nodes_in_answer = [node for node in nodes if node.name == "Bob"]
        edges_in_answer = [edge for edge in edges if edge.source == "Bob" or edge.target == "Bob"]
    elif "engineer" in question.lower():
        response = "We have 2 engineers in the department: Alice (Senior) and Charlie (Junior)."
        nodes_in_answer = [node for node in nodes if node.department == "Engineering"]
        edges_in_answer = [
            edge
            for edge in edges
            if edge.source in nodes_in_answer or edge.target in nodes_in_answer
        ]
    elif "manager" in question.lower():
        response = "We have 2 managers: Bob (Sales) and Diana (Marketing)."
        nodes_in_answer = [node for node in nodes if node.level == "Manager"]
        edges_in_answer = [
            edge
            for edge in edges
            if edge.source in nodes_in_answer or edge.target in nodes_in_answer
        ]
    else:
        response = f"I don't have information about '{question}'."

    print(f"[Chat] Response: {response}")
    return response, (nodes_in_answer, edges_in_answer)


if __name__ == "__main__":
    print("Starting advanced graph visualization with search and chat...")
    print()

    # Create graph with callbacks
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_id_extractor=lambda node: node.name,
        node_ids_in_edge_extractor=lambda edge: (edge.source, edge.target),
        edge_label_extractor=lambda edge: edge.label,
        on_search=on_search,
        on_chat=on_chat,
        context={"org": "Acme Corp", "team": "Engineering"},
    )
