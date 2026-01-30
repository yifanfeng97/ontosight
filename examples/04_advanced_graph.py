"""Advanced graph with search and chat callbacks.

This example demonstrates how to use search and chat callbacks to make the
visualization interactive.
"""

from ontosight.core import view_graph
from typing import Dict, Any, Tuple
from pydantic import BaseModel, Field


class NodeSchema(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Label of the node")
    department: str = Field(..., description="Department of the node")
    level: str = Field(..., description="Level of the node")


class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: str = Field(..., description="Label of the edge")


# Sample network data
nodes = [
    NodeSchema(id="alice", label="Alice", department="Engineering", level="Senior"),
    NodeSchema(id="bob", label="Bob", department="Sales", level="Manager"),
    NodeSchema(id="charlie", label="Charlie", department="Engineering", level="Junior"),
    NodeSchema(id="diana", label="Diana", department="Marketing", level="Manager"),
    NodeSchema(id="eve", label="Eve", department="HR", level="Director"),
]

edges = [
    EdgeSchema(source="alice", target="charlie", label="mentors"),
    EdgeSchema(source="bob", target="diana", label="manages"),
    EdgeSchema(source="diana", target="eve", label="reports_to"),
    EdgeSchema(source="charlie", target="eve", label="reports_to"),
    EdgeSchema(source="alice", target="bob", label="collaborates_with"),
]


# Define search callback
def on_search(query: str, context: Dict[str, Any]) -> list:
    """Handle search queries - return matching node IDs."""
    print(f"[Search] Query: {query}")

    results = []
    for node in nodes:
        # Search in label, department, level
        if (
            query.lower() in node.label.lower()
            or query.lower() in node.department.lower()
            or query.lower() in node.level.lower()
        ):
            results.append(node.id)

    print(f"[Search] Found {len(results)} results: {results}")
    return results


# Define chat callback
def on_chat(question: str, context: Dict[str, Any]) -> str:
    """Handle chat/Q&A queries."""
    print(f"[Chat] Question: {question}")

    # Simple Q&A logic
    if "alice" in question.lower():
        response = "Alice is a Senior Engineer who mentors Charlie."
    elif "bob" in question.lower():
        response = "Bob is a Sales Manager who manages Diana."
    elif "engineer" in question.lower():
        response = "We have 2 engineers in the department: Alice (Senior) and Charlie (Junior)."
    elif "manager" in question.lower():
        response = "We have 2 managers: Bob (Sales) and Diana (Marketing)."
    else:
        response = f"I don't have information about '{question}'."

    print(f"[Chat] Response: {response}")
    return response


if __name__ == "__main__":
    print("Starting advanced graph visualization with search and chat...")
    print()

    # Create graph with callbacks
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_label_extractor=lambda node: node.label,
        edge_label_extractor=lambda edge: edge.label,
        nodes_in_edge_extractor=lambda edge: (edge.source, edge.target),
        on_search=on_search,
        on_chat=on_chat,
        context={"org": "Acme Corp", "team": "Engineering"},
    )
