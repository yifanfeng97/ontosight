"""
Example 02: Starship Joint Operations (Basic Hypergraph)

This example demonstrates how hypergraphs can visualize high-order relationships,
such as tactical missions involving multiple crew members.
"""

from pydantic import BaseModel, Field
from ontosight import view_hypergraph

# 1. Define your data schemas
class CrewMember(BaseModel):
    name: str = Field(..., description="Name of the crew member")
    role: str = Field(..., description="Specialization/Class")
    rank: str = Field(..., description="Military rank")

class Mission(BaseModel):
    mission_id: str = Field(..., description="Unique mission code")
    objective: str = Field(..., description="Primary mission goal")
    participants: list[str] = Field(..., description="List of crew member names")
    status: str = Field(..., description="Current status")

# 2. Prepare the data
crew = [
    CrewMember(name="Commander Shepard", role="Infiltrator", rank="Commander"),
    CrewMember(name="Garrus Vakarian", role="Sniper", rank="Specialist"),
    CrewMember(name="Liara T'Soni", role="Biotic", rank="Researcher"),
    CrewMember(name="Tali'Zorah", role="Technician", rank="Engineer"),
    CrewMember(name="Urdnot Wrex", role="Battlemaster", rank="Mercenary"),
]

missions = [
    Mission(
        mission_id="OP-ALPHA", 
        objective="Data Extraction", 
        participants=["Commander Shepard", "Garrus Vakarian", "Tali'Zorah"],
        status="Completed"
    ),
    Mission(
        mission_id="OP-BETA", 
        objective="Biotic Research", 
        participants=["Liara T'Soni", "Commander Shepard", "Garrus Vakarian"],
        status="In Progress"
    ),
    Mission(
        mission_id="OP-GAMMA", 
        objective="Heavy Combat", 
        participants=["Urdnot Wrex", "Commander Shepard", "Garrus Vakarian"],
        status="Standby"
    )
]

# 3. Launch the hypergraph visualization
if __name__ == "__main__":
    print("Launching Starship Joint Operations Hypergraph...")
    view_hypergraph(
        node_list=crew,
        edge_list=missions,
        node_schema=CrewMember,
        edge_schema=Mission,
        node_id_extractor=lambda c: c.name,
        node_ids_in_edge_extractor=lambda m: m.participants,
        edge_label_extractor=lambda m: m.objective,
        node_label_extractor=lambda c: c.name
    )
