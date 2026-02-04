"""Hypergraph visualization example.

This example demonstrates how to visualize hyperedges (edges connecting multiple nodes).
Useful for representing complex relationships like collaborations, co-authorship, etc.
Also demonstrates search and chat callbacks for interactive exploration.
"""

from ontosight.core import view_hypergraph
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Tuple
# ... existing code ...


class NodeSchema(BaseModel):
    name: str = Field(..., description="Unique name for the node")
    type: str = Field(..., description="Type of the node")


class EdgeSchema(BaseModel):
    nodes: List[str] = Field(..., description="List of node names in this hyperedge")
    label: str = Field(..., description="Label of the edge")
    type: str = Field(..., description="Type of the edge")


# Nodes - 使用name替代id和label
nodes = [
    NodeSchema(name="Machine Learning Paper", type="paper"),
    NodeSchema(name="Deep Learning Paper", type="paper"),
    NodeSchema(name="Computer Vision Paper", type="paper"),
    NodeSchema(name="NLP Paper", type="paper"),
    NodeSchema(name="Reinforcement Learning Paper", type="paper"),
    NodeSchema(name="Alice", type="author"),
    NodeSchema(name="Bob", type="author"),
    NodeSchema(name="Charlie", type="author"),
    NodeSchema(name="David", type="author"),
    NodeSchema(name="Eve", type="author"),
    NodeSchema(name="Frank", type="author"),
    NodeSchema(name="Grace", type="author"),
    NodeSchema(name="Henry", type="author"),
    NodeSchema(name="NeurIPS 2023", type="conference"),
    NodeSchema(name="ICML 2023", type="conference"),
    NodeSchema(name="CVPR 2023", type="conference"),
    NodeSchema(name="ACL 2023", type="conference"),
    NodeSchema(name="ICLR 2023", type="conference"),
    NodeSchema(name="AI", type="keyword"),
    NodeSchema(name="Neural Networks", type="keyword"),
]


# Hyperedges - 直接使用节点的name
hyperedges = [
    # 合作关系超边
    EdgeSchema(
        nodes=["Alice", "Bob", "Machine Learning Paper"],
        label="Co-authored paper",
        type="collaboration",
    ),
    EdgeSchema(
        nodes=["Bob", "Charlie", "Deep Learning Paper"],
        label="Co-authored paper",
        type="collaboration",
    ),
    EdgeSchema(
        nodes=["Alice", "David", "Frank", "Computer Vision Paper"],
        label="Co-authored paper",
        type="collaboration",
    ),
    EdgeSchema(
        nodes=["Charlie", "Eve", "Grace", "NLP Paper"],
        label="Co-authored paper",
        type="collaboration",
    ),
    EdgeSchema(
        nodes=["Bob", "Henry", "Reinforcement Learning Paper"],
        label="Co-authored paper",
        type="collaboration",
    ),
    # 发表关系超边
    EdgeSchema(
        nodes=["Machine Learning Paper", "NeurIPS 2023"],
        label="Published at conference",
        type="publication",
    ),
    EdgeSchema(
        nodes=["Deep Learning Paper", "ICML 2023"],
        label="Published at conference",
        type="publication",
    ),
    EdgeSchema(
        nodes=["Computer Vision Paper", "CVPR 2023"],
        label="Published at conference",
        type="publication",
    ),
    EdgeSchema(
        nodes=["NLP Paper", "ACL 2023"], label="Published at conference", type="publication"
    ),
    EdgeSchema(
        nodes=["Reinforcement Learning Paper", "ICLR 2023"],
        label="Published at conference",
        type="publication",
    ),
    # 关键词关联超边
    EdgeSchema(
        nodes=["Machine Learning Paper", "Deep Learning Paper", "AI"],
        label="Related to research area",
        type="keyword_link",
    ),
    EdgeSchema(
        nodes=[
            "Machine Learning Paper",
            "Computer Vision Paper",
            "Reinforcement Learning Paper",
            "Neural Networks",
        ],
        label="Uses methodology",
        type="keyword_link",
    ),
]


# Define search callback
def on_search(query: str, context: Dict[str, Any]) -> Tuple[List, List]:
    """Handle search queries - return matching nodes."""
    print(f"[Search] Query: {query}")

    matched_nodes = []
    for node in nodes:
        # Search in node name and type
        if (
            query.lower() in node.name.lower()
            or query.lower() in node.type.lower()
        ):
            matched_nodes.append(node)

    print(f"[Search] Found {len(matched_nodes)} results: {matched_nodes}")
    return matched_nodes, []


# Define chat callback
def on_chat(question: str, context: Dict[str, Any]) -> Tuple[str, Tuple[List, List]]:
    """Handle chat/Q&A queries and return related nodes and hyperedges."""
    print(f"[Chat] Question: {question}")

    nodes_in_answer = []
    hyperedges_in_answer = []

    # Q&A logic based on keywords
    if "alice" in question.lower():
        response = "Alice is an author who has co-authored papers on Machine Learning and Computer Vision."
        nodes_in_answer = [node for node in nodes if node.name == "Alice"]
        # Find hyperedges involving Alice
        hyperedges_in_answer = [
            edge for edge in hyperedges 
            if "Alice" in edge.nodes
        ]
    elif "paper" in question.lower() or "research" in question.lower():
        response = "We have 5 research papers covering Machine Learning, Deep Learning, Computer Vision, NLP, and Reinforcement Learning."
        nodes_in_answer = [node for node in nodes if node.type == "paper"]
        # Find hyperedges involving papers
        hyperedges_in_answer = [
            edge for edge in hyperedges 
            if any(node in edge.nodes for node in nodes_in_answer)
        ]
    elif "conference" in question.lower():
        response = "We have papers published at 5 major conferences: NeurIPS, ICML, CVPR, ACL, and ICLR."
        nodes_in_answer = [node for node in nodes if node.type == "conference"]
        # Find hyperedges involving conferences
        hyperedges_in_answer = [
            edge for edge in hyperedges 
            if any(node in edge.nodes for node in nodes_in_answer)
        ]
    elif "author" in question.lower():
        response = "We have 8 authors collaborating on various research papers."
        nodes_in_answer = [node for node in nodes if node.type == "author"]
        # Find collaboration hyperedges
        hyperedges_in_answer = [
            edge for edge in hyperedges 
            if edge.type == "collaboration"
        ]
    elif "neural network" in question.lower() or "keyword" in question.lower():
        response = "Key methodologies and keywords include AI and Neural Networks used across multiple papers."
        nodes_in_answer = [node for node in nodes if node.type == "keyword"]
        # Find keyword-related hyperedges
        hyperedges_in_answer = [
            edge for edge in hyperedges 
            if edge.type == "keyword_link"
        ]
    elif "collaboration" in question.lower():
        response = "Our researchers collaborate on various research projects, co-authoring papers on different topics."
        nodes_in_answer = []  # Empty for collaboration query
        # Find all collaboration hyperedges
        hyperedges_in_answer = [
            edge for edge in hyperedges 
            if edge.type == "collaboration"
        ]
    else:
        response = f"I don't have specific information about '{question}'. Try asking about papers, authors, conferences, or keywords."
        nodes_in_answer = []
        hyperedges_in_answer = []

    print(f"[Chat] Response: {response}")
    return response, (nodes_in_answer, hyperedges_in_answer)


if __name__ == "__main__":
    print("Starting hypergraph visualization with search and chat...")
    print()

    # Create a hypergraph visualization
    view_hypergraph(
        node_list=nodes,
        edge_list=hyperedges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_name_extractor=lambda node: node.name,
        edge_name_extractor=lambda edge: edge.label,
        nodes_in_edge_extractor=lambda edge: tuple(edge.nodes),
        on_search=on_search,
        on_chat=on_chat,
    )
