"""
Example 07: Graph with Multiple Connected Components (Testing min_nodes Sampling)

This example demonstrates a graph with multiple disconnected connected components
to test the new min_nodes sampling logic (min_nodes=10, max_attempts=5).
"""

from pydantic import BaseModel, Field
from ontosight import view_graph


class Planet(BaseModel):
    name: str = Field(..., description="Name of the planet")
    climate: str = Field(..., description="Primary climate type")
    population: str = Field(..., description="Approximate population")


class TradeRoute(BaseModel):
    source: str = Field(..., description="Origin planet")
    target: str = Field(..., description="Destination planet")
    distance: float = Field(..., description="Distance in parsecs")


# Create a graph with multiple disconnected connected components
# This simulates a real-world scenario with sparse connections
planets = [
    # Component 1: 5 nodes (fully connected cluster)
    Planet(name="Alpha", climate="Temperate", population="1M"),
    Planet(name="Beta", climate="Desert", population="500K"),
    Planet(name="Gamma", climate="Frozen", population="200K"),
    Planet(name="Delta", climate="Forest", population="800K"),
    Planet(name="Epsilon", climate="Ocean", population="600K"),
    # Component 2: 4 nodes (fully connected cluster)
    Planet(name="Zeta", climate="Mountain", population="100K"),
    Planet(name="Eta", climate="Volcanic", population="50K"),
    Planet(name="Theta", climate="Tundra", population="30K"),
    Planet(name="Iota", climate="Desert", population="1K"),
    # Component 3: 4 nodes (fully connected cluster)
    Planet(name="Kappa", climate="Temperate", population="2K"),
    Planet(name="Lambda", climate="Forest", population="500"),
    Planet(name="Mu", climate="Ocean", population="800"),
    Planet(name="Nu", climate="Tundra", population="1.5K"),
]

routes = [
    # Component 1 connections (5 nodes, fully connected)
    TradeRoute(source="Alpha", target="Beta", distance=10.0),
    TradeRoute(source="Beta", target="Gamma", distance=8.5),
    TradeRoute(source="Gamma", target="Delta", distance=12.0),
    TradeRoute(source="Delta", target="Epsilon", distance=6.0),
    TradeRoute(source="Epsilon", target="Alpha", distance=9.0),
    TradeRoute(source="Alpha", target="Gamma", distance=15.0),
    TradeRoute(source="Beta", target="Delta", distance=11.0),
    TradeRoute(source="Beta", target="Epsilon", distance=7.0),
    # Component 2 connections (4 nodes, fully connected)
    TradeRoute(source="Zeta", target="Eta", distance=5.0),
    TradeRoute(source="Eta", target="Theta", distance=7.0),
    TradeRoute(source="Theta", target="Iota", distance=4.0),
    TradeRoute(source="Iota", target="Zeta", distance=6.0),
    TradeRoute(source="Zeta", target="Theta", distance=8.0),
    # Component 3 connections (4 nodes, fully connected)
    TradeRoute(source="Kappa", target="Lambda", distance=5.5),
    TradeRoute(source="Lambda", target="Mu", distance=3.0),
    TradeRoute(source="Mu", target="Nu", distance=4.5),
    TradeRoute(source="Nu", target="Kappa", distance=6.5),
    TradeRoute(source="Kappa", target="Mu", distance=7.0),
]

if __name__ == "__main__":
    print("Launching Graph with Multiple Connected Components Visualization...")
    print(f"Total nodes: {len(planets)}")
    print(f"Total edges: {len(routes)}")
    print("Testing min_nodes=10, max_attempts=5 sampling logic...")
    print("This graph has 3 disconnected components (5+4+4 = 13 nodes)")
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
