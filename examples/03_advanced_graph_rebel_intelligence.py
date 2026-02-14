"""
Example 03: Rebel Intelligence (Advanced Graph + AI Callbacks)

This example simulates an AI-powered GraphRAG system for intelligence analysis.
It demonstrates custom 'on_search' and 'on_chat' callbacks to interact with the graph.
"""

from typing import Tuple, List
from pydantic import BaseModel, Field
from ontosight import view_graph

# 1. Schemas
class Entity(BaseModel):
    id: str
    type: str = Field(..., description="Entity Category (Agent, Base, Ship)")
    status: str = Field(..., description="Security clearance or health")
    bio: str = Field(..., description="Intelligence summary")

class Connection(BaseModel):
    source: str
    target: str
    link_type: str = Field(..., description="Nature of relationship")

# 2. Data
nodes = [
    Entity(id="Skywalker", type="Agent", status="Active", bio="Key person for mission X."),
    Entity(id="EchoBase", type="Base", status="Compromised", bio="Located on Hoth."),
    Entity(id="Falcon", type="Ship", status="Operational", bio="Fastest ship in the sector."),
    Entity(id="Solo", type="Agent", status="Active", bio="Navigation expert."),
    Entity(id="Leia", type="Agent", status="Active", bio="Diplomatic leader."),
]

edges = [
    Connection(source="Skywalker", target="EchoBase", link_type="stationed_at"),
    Connection(source="Solo", target="Falcon", link_type="pilots"),
    Connection(source="Skywalker", target="Leia", link_type="siblings"),
    Connection(source="Falcon", target="EchoBase", link_type="docked_at"),
]

# 3. AI / Callback Logic
def simulate_search(query: str) -> Tuple[List[Entity], List[Connection]]:
    """Simulates a semantic or keyword search across intelligence files."""
    print(f"[AI Search] Query received: {query}")
    query = query.lower()
    
    # Simple logic: search in labels, bios, and types
    match_nodes = [
        n for n in nodes 
        if query in n.id.lower() or query in n.bio.lower() or query in n.type.lower()
    ]
    
    # Return matched nodes and optionally edges connected to them
    return match_nodes, []

def simulate_chat(question: str) -> Tuple[str, Tuple[List[Entity], List[Connection]]]:
    """Simulates a GraphRAG chat interaction."""
    print(f"[AI Chat] Question received: {question}")
    question = question.lower()
    
    if "falcon" in question:
        reply = "The Millennium Falcon is currently docked at Echo Base. Han Solo is assigned as the pilot."
        related_nodes = [n for n in nodes if n.id in ["Falcon", "EchoBase", "Solo"]]
        related_edges = [e for e in edges if e.source in ["Falcon", "Solo"] or e.target == "Falcon"]
        return reply, (related_nodes, related_edges)
    
    elif "compromised" in question or "status" in question:
        reply = "Intelligence report shows that Echo Base on Hoth is COMPROMISED. Evacuate immediately."
        related_nodes = [n for n in nodes if n.id == "EchoBase"]
        return reply, (related_nodes, [])
    
    return "I don't have enough intel on that topic.", ([], [])

# 4. Launch
if __name__ == "__main__":
    print("Initializing Rebel Intelligence System...")
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=Entity,
        edge_schema=Connection,
        node_id_extractor=lambda x: x.id,
        node_ids_in_edge_extractor=lambda e: (e.source, e.target),
        edge_label_extractor=lambda e: e.link_type,
        on_search=simulate_search,
        on_chat=simulate_chat
    )
