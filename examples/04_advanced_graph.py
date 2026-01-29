"""Advanced graph with search and chat callbacks.

This example demonstrates how to use search and chat callbacks to make the
visualization interactive.
"""

from ontosight.core import view_graph
from typing import Dict, Any

# Sample network data
nodes = [
    {"id": "alice", "label": "Alice", "department": "Engineering", "level": "Senior"},
    {"id": "bob", "label": "Bob", "department": "Sales", "level": "Manager"},
    {"id": "charlie", "label": "Charlie", "department": "Engineering", "level": "Junior"},
    {"id": "diana", "label": "Diana", "department": "Marketing", "level": "Manager"},
    {"id": "eve", "label": "Eve", "department": "HR", "level": "Director"},
]

edges = [
    {"source": "alice", "target": "charlie", "label": "mentors"},
    {"source": "bob", "target": "diana", "label": "manages"},
    {"source": "diana", "target": "eve", "label": "reports_to"},
    {"source": "charlie", "target": "eve", "label": "reports_to"},
    {"source": "alice", "target": "bob", "label": "collaborates_with"},
]

# Define search callback
def on_search(query: str, context: Dict[str, Any]) -> list:
    """Handle search queries - return matching node IDs."""
    print(f"[Search] Query: {query}")
    
    results = []
    for node in nodes:
        # Search in label, department, level
        if (query.lower() in node["label"].lower() or
            query.lower() in node["department"].lower() or
            query.lower() in node["level"].lower()):
            results.append(node["id"])
    
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
        node_schema=None,
        edge_schema=None,
        node_name_extractor=None,
        edge_name_extractor=None,
        nodes_in_edge_extractor=None,
        on_search=on_search,
        on_chat=on_chat,
        context={"org": "Acme Corp", "team": "Engineering"},
    )
    
    print("Graph visualization started!")
    print("Open your browser to http://localhost:8000")
    print("\nFeatures:")
    print("- Search: Try searching for 'Alice', 'Engineer', 'Senior'")
    print("- Chat: Ask questions like 'Who is Bob?' or 'How many managers?'")
    print("- Interact: Click nodes to select, drag to move, scroll to zoom")
