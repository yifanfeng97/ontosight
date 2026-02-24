"""
Example 08: Hypergraph with Multiple Disconnected Components (Testing min_nodes Sampling)

This example demonstrates a hypergraph with multiple disconnected components
to test the new min_nodes sampling logic (min_nodes=10, max_attempts=5).
"""

from pydantic import BaseModel, Field
from ontosight import view_hypergraph


class CrewMember(BaseModel):
    name: str = Field(..., description="Name of the crew member")
    role: str = Field(..., description="Specialization/Class")
    rank: str = Field(..., description="Military rank")


class Mission(BaseModel):
    mission_id: str = Field(..., description="Unique mission code")
    objective: str = Field(..., description="Primary mission goal")
    participants: list[str] = Field(..., description="List of crew member names")
    status: str = Field(..., description="Current status")


# Create a hypergraph with multiple disconnected components
crew = [
    # Component 1: 5 members (participating in multiple missions)
    CrewMember(name="Shepard", role="Infiltrator", rank="Commander"),
    CrewMember(name="Garrus", role="Sniper", rank="Specialist"),
    CrewMember(name="Liara", role="Biotic", rank="Researcher"),
    CrewMember(name="Tali", role="Technician", rank="Engineer"),
    CrewMember(name="Wrex", role="Battlemaster", rank="Mercenary"),
    # Component 2: 4 members (participating in their own missions)
    CrewMember(name="Miranda", role="Biotic", rank="Major"),
    CrewMember(name="Jacob", role="Soldier", rank="Commander"),
    CrewMember(name="Jack", role="Biotic", rank="Prisoner"),
    CrewMember(name="Grunt", role="Soldier", rank="Young"),
    # Component 3: 4 members (participating in their own missions)
    CrewMember(name="Mordin", role="Scientist", rank="Professor"),
    CrewMember(name="Thane", role="Assassin", rank="Devoted"),
    CrewMember(name="Samara", role="Justicar", rank="Honorable"),
    CrewMember(name="Legion", role="Platform", rank="Unique"),
]

missions = [
    # Component 1 missions (5 members, 4 missions)
    Mission(
        mission_id="OP-ALPHA",
        objective="Data Extraction",
        participants=["Shepard", "Garrus", "Tali"],
        status="Completed"
    ),
    Mission(
        mission_id="OP-BETA",
        objective="Biotic Research",
        participants=["Liara", "Shepard", "Garrus"],
        status="In Progress"
    ),
    Mission(
        mission_id="OP-GAMMA",
        objective="Heavy Combat",
        participants=["Wrex", "Shepard", "Garrus"],
        status="Standby"
    ),
    Mission(
        mission_id="OP-DELTA",
        objective="Rescue Mission",
        participants=["Shepard", "Liara", "Tali", "Wrex"],
        status="Active"
    ),
    # Component 2 missions (4 members, 3 missions)
    Mission(
        mission_id="OP-EPSILON",
        objective="Research",
        participants=["Miranda", "Jacob", "Jack"],
        status="Ongoing"
    ),
    Mission(
        mission_id="OP-ZETA",
        objective="Combat Training",
        participants=["Jack", "Grunt", "Jacob"],
        status="Completed"
    ),
    Mission(
        mission_id="OP-ETA",
        objective="Protection",
        participants=["Miranda", "Grunt"],
        status="Planned"
    ),
    # Component 3 missions (4 members, 3 missions)
    Mission(
        mission_id="OP-THETA",
        objective="Investigation",
        participants=["Mordin", "Thane", "Samara"],
        status="Active"
    ),
    Mission(
        mission_id="OP-IOTA",
        objective="Diplomacy",
        participants=["Mordin", "Legion", "Thane"],
        status="Completed"
    ),
    Mission(
        mission_id="OP-KAPPA",
        objective="Reconciliation",
        participants=["Samara", "Legion"],
        status="Pending"
    ),
]

if __name__ == "__main__":
    print("Launching Hypergraph with Multiple Disconnected Components Visualization...")
    print(f"Total nodes: {len(crew)}")
    print(f"Total hyperedges: {len(missions)}")
    print("Testing min_nodes=10, max_attempts=5 sampling logic...")
    print("This hypergraph has 3 disconnected components (5+4+4 = 13 nodes)")
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
