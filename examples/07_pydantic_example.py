"""Pydantic model example.

This example shows how to use OntoSight with Pydantic models
for structured data with validation.
"""

from pydantic import BaseModel
from typing import List
from ontosight.core import view_graph

# Define Pydantic models
class Person(BaseModel):
    """Represents a person in the network."""
    id: str
    name: str
    email: str
    department: str
    
    class Config:
        schema_extra = {
            "example": {
                "id": "p1",
                "name": "Alice",
                "email": "alice@example.com",
                "department": "Engineering"
            }
        }

class Relationship(BaseModel):
    """Represents a relationship between two people."""
    source_id: str
    target_id: str
    type: str
    since: int = 2020

# Create sample data
people = [
    Person(id="p1", name="Alice", email="alice@example.com", department="Engineering"),
    Person(id="p2", name="Bob", email="bob@example.com", department="Sales"),
    Person(id="p3", name="Charlie", email="charlie@example.com", department="Engineering"),
    Person(id="p4", name="Diana", email="diana@example.com", department="Marketing"),
]

relationships = [
    Relationship(source_id="p1", target_id="p3", type="mentors"),
    Relationship(source_id="p2", target_id="p4", type="manages"),
    Relationship(source_id="p1", target_id="p2", type="collaborates_with"),
]

# Define extractors
def extract_person_label(person: Person) -> str:
    """Extract label from Person model."""
    return f"{person.name} ({person.department})"

def extract_relationship_label(rel: Relationship) -> str:
    """Extract label from Relationship model."""
    return rel.type.replace("_", " ").title()

def extract_relationship_nodes(rel: Relationship):
    """Extract source and target from relationship."""
    # Find the actual person objects
    source = next((p for p in people if p.id == rel.source_id), None)
    target = next((p for p in people if p.id == rel.target_id), None)
    return (source, target) if source and target else None

if __name__ == "__main__":
    print("Visualizing Pydantic models as a graph")
    print(f"People: {len(people)}")
    print(f"Relationships: {len(relationships)}")
    
    # Convert to OntoSight format
    nodes = [
        {
            "id": p.id,
            "label": extract_person_label(p),
            "email": p.email,
            "department": p.department,
        }
        for p in people
    ]
    
    edges = [
        {
            "source": r.source_id,
            "target": r.target_id,
            "label": extract_relationship_label(r),
        }
        for r in relationships
    ]
    
    # Create visualization
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=None,
        edge_schema=None,
        node_name_extractor=None,
        edge_name_extractor=None,
        nodes_in_edge_extractor=None,
        context={"model": "Person", "type": "organizational_network"}
    )
    
    print("\nGraph visualization started!")
    print("Open your browser to http://localhost:8000")
    print("\nThis example shows how to use Pydantic models")
    print("with OntoSight for type-safe visualizations.")
