"""
Example 01: Galactic Trade Network (Basic Graph)

This example demonstrates a basic graph setup visualizing trade routes 
between different planets in a star system.
"""

from pydantic import BaseModel, Field
from ontosight import view_graph

# 1. Define your data schemas
class Planet(BaseModel):
    name: str = Field(..., description="Name of the planet")
    climate: str = Field(..., description="Primary climate type")
    population: str = Field(..., description="Approximate population")
    resource: str = Field(..., description="Primary export resource")

class TradeRoute(BaseModel):
    source: str = Field(..., description="Origin planet")
    target: str = Field(..., description="Destination planet")
    distance: float = Field(..., description="Distance in parsecs")
    danger_level: int = Field(..., description="Danger level (1-10)")

# 2. Prepare the data
planets = [
    Planet(name="Coruscant", climate="City-scape", population="1 Trillion", resource="Technology"),
    Planet(name="Tatooine", climate="Desert", population="200,000", resource="Ores"),
    Planet(name="Nabooti", climate="Temperate", population="4.5 Billion", resource="Artwork"),
    Planet(name="Hoth", climate="Frozen", population="Tiny", resource="Isotopes"),
    Planet(name="Endor", climate="Forest", population="30,000", resource="Timber"),
]

routes = [
    TradeRoute(source="Coruscant", target="Nabooti", distance=12.5, danger_level=2),
    TradeRoute(source="Coruscant", target="Tatooine", distance=45.0, danger_level=7),
    TradeRoute(source="Nabooti", target="Tatooine", distance=32.2, danger_level=5),
    TradeRoute(source="Tatooine", target="Hoth", distance=15.8, danger_level=8),
    TradeRoute(source="Endor", target="Coruscant", distance=28.4, danger_level=3),
]

# 3. Launch the interactive visualization
if __name__ == "__main__":
    print("Launching Galactic Trade Network Visualization...")
    view_graph(
        node_list=planets,
        edge_list=routes,
        node_schema=Planet,
        edge_schema=TradeRoute,
        node_id_extractor=lambda p: p.name,
        node_ids_in_edge_extractor=lambda r: (r.source, r.target),
        edge_label_extractor=lambda r: f"{r.distance}pc",
        node_label_extractor=lambda p: p.name
    )
