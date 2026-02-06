"""
Example 04: Biomedical Discovery (Advanced Hypergraph + AI Callbacks)

This example demonstrates how OntoSight can be used for complex scientific data 
analysis, visualizing molecular pathways and drug-disease interactions.
"""

from typing import Tuple, List
from pydantic import BaseModel, Field
from ontosight import view_hypergraph

# 1. Schemas
class BioElement(BaseModel):
    id: str
    category: str = Field(..., description="Protein, Compound, or Disease")
    molecular_weight: float = Field(0.0, description="Mass in Daltons")

class Interaction(BaseModel):
    id: str
    pathway: str = Field(..., description="Biological pathway name")
    components: List[str] = Field(..., description="IDs of elements involved")

# 2. Data
bio_nodes = [
    BioElement(id="Insulin", category="Protein", molecular_weight=5808),
    BioElement(id="Glucose", category="Compound", molecular_weight=180.16),
    BioElement(id="Diabetes", category="Disease"),
    BioElement(id="Metformin", category="Compound", molecular_weight=129.16),
    BioElement(id="AMPK", category="Protein", molecular_weight=63000),
]

interactions = [
    Interaction(id="Pathway-1", pathway="Metabolic Regulation", components=["Insulin", "Glucose", "Diabetes"]),
    Interaction(id="Pathway-2", pathway="Drug Mechanism", components=["Metformin", "AMPK", "Glucose"]),
]

# 3. AI / Callback Logic
def search_bio(query: str) -> Tuple[List[BioElement], List[Interaction]]:
    query = query.lower()
    matches = [n for n in bio_nodes if query in n.id.lower() or query in n.category.lower()]
    return matches, []

def chat_bio(question: str) -> Tuple[str, Tuple[List[BioElement], List[Interaction]]]:
    question = question.lower()
    if "metformin" in question:
        ans = "Metformin targets the AMPK protein to regulate Glucose levels in the blood."
        nodes = [n for n in bio_nodes if n.id in ["Metformin", "AMPK", "Glucose"]]
        hes = [h for h in interactions if h.id == "Pathway-2"]
        return ans, (nodes, hes)
    return "No clinical data found for this query.", ([], [])

# 4. Launch
if __name__ == "__main__":
    print("Launching Biomedical Discovery System...")
    view_hypergraph(
        node_list=bio_nodes,
        edge_list=interactions,
        node_schema=BioElement,
        edge_schema=Interaction,
        node_id_extractor=lambda n: n.id,
        node_ids_in_edge_extractor=lambda h: h.components,
        edge_label_extractor=lambda h: h.pathway,
        on_search=search_bio,
        on_chat=chat_bio
    )
