"""
Example 05: Galactic Culinary Archive (Basic Nodes)

This example demonstrates a node-only visualization showcasing a collection of
dishes from across the galaxy with no relationship edges - perfect for archives,
catalogs, and independent entity collections.
"""

from pydantic import BaseModel, Field
from ontosight import view_nodes


# 1. Define your data schema
class Dish(BaseModel):
    id: str = Field(..., description="Unique dish identifier")
    name: str = Field(..., description="Name of the dish")
    cuisine: str = Field(
        ..., description="Cuisine origin: Core Worlds, Outer Rim, Hutt Territories, Allied Regions"
    )
    origin: str = Field(..., description="Home planet or region")
    primary_ingredient: str = Field(..., description="Main ingredient")
    taste_profile: str = Field(..., description="Sweet, Spicy, Savory, Bitter, or Mixed")
    preparation_time: int = Field(..., description="Minutes to prepare")
    difficulty: str = Field(..., description="Easy, Medium, Hard")


# 2. Prepare the data - Galactic Culinary Archive
dishes = [
    # Core Worlds Cuisine
    Dish(
        id="d01",
        name="Coruscant Imperial Roast",
        cuisine="Core Worlds",
        origin="Coruscant",
        primary_ingredient="Bantha Meat",
        taste_profile="Savory",
        preparation_time=45,
        difficulty="Hard",
    ),
    Dish(
        id="d02",
        name="Senate Plaza Salad",
        cuisine="Core Worlds",
        origin="Coruscant",
        primary_ingredient="Mixed Greens",
        taste_profile="Mixed",
        preparation_time=15,
        difficulty="Easy",
    ),
    Dish(
        id="d03",
        name="Trandoshan Amber Tea",
        cuisine="Core Worlds",
        origin="Trandosha",
        primary_ingredient="Amber Leaves",
        taste_profile="Sweet",
        preparation_time=10,
        difficulty="Easy",
    ),
    # Outer Rim Street Food
    Dish(
        id="d04",
        name="Tatooine Moisture Cake",
        cuisine="Outer Rim",
        origin="Tatooine",
        primary_ingredient="Moisture Crystals",
        taste_profile="Sweet",
        preparation_time=20,
        difficulty="Easy",
    ),
    Dish(
        id="d05",
        name="Geonosis Dust Seasoning Stew",
        cuisine="Outer Rim",
        origin="Geonosis",
        primary_ingredient="Dust Beetles",
        taste_profile="Spicy",
        preparation_time=30,
        difficulty="Medium",
    ),
    Dish(
        id="d06",
        name="Bespin Cloud City Noodles",
        cuisine="Outer Rim",
        origin="Bespin",
        primary_ingredient="Tibanna Flour",
        taste_profile="Savory",
        preparation_time=25,
        difficulty="Medium",
    ),
    # Hutt Territories
    Dish(
        id="d07",
        name="Jabba's Treasure Feast",
        cuisine="Hutt Territories",
        origin="Tatooine",
        primary_ingredient="Spice",
        taste_profile="Spicy",
        preparation_time=90,
        difficulty="Hard",
    ),
    Dish(
        id="d08",
        name="Mos Eisley Cantina Drink Mix",
        cuisine="Hutt Territories",
        origin="Tatooine",
        primary_ingredient="Fruit Nectar",
        taste_profile="Mixed",
        preparation_time=5,
        difficulty="Easy",
    ),
    # Allied Regions
    Dish(
        id="d09",
        name="Rebel Alliance Field Rations",
        cuisine="Allied Regions",
        origin="Yavin 4",
        primary_ingredient="Preserved Vegetables",
        taste_profile="Savory",
        preparation_time=10,
        difficulty="Easy",
    ),
    Dish(
        id="d10",
        name="Millennium Falcon Emergency Paste",
        cuisine="Allied Regions",
        origin="Unknown",
        primary_ingredient="Nutrient Paste",
        taste_profile="Bitter",
        preparation_time=3,
        difficulty="Easy",
    ),
    # More variety
    Dish(
        id="d11",
        name="Endor Forest Mushroom Risotto",
        cuisine="Allied Regions",
        origin="Endor",
        primary_ingredient="Forest Mushrooms",
        taste_profile="Savory",
        preparation_time=35,
        difficulty="Medium",
    ),
    Dish(
        id="d12",
        name="Hoth Ice Cream",
        cuisine="Core Worlds",
        origin="Hoth",
        primary_ingredient="Crystal Ice",
        taste_profile="Sweet",
        preparation_time=40,
        difficulty="Hard",
    ),
    Dish(
        id="d13",
        name="Naboo Royal Pasta",
        cuisine="Core Worlds",
        origin="Naboo",
        primary_ingredient="Wheat Flour",
        taste_profile="Savory",
        preparation_time=55,
        difficulty="Hard",
    ),
    Dish(
        id="d14",
        name="Ewok Acorn Bread",
        cuisine="Allied Regions",
        origin="Endor",
        primary_ingredient="Acorns",
        taste_profile="Mixed",
        preparation_time=30,
        difficulty="Medium",
    ),
    Dish(
        id="d15",
        name="Kamino Ocean Market Stew",
        cuisine="Outer Rim",
        origin="Kamino",
        primary_ingredient="Fresh Fish",
        taste_profile="Savory",
        preparation_time=40,
        difficulty="Medium",
    ),
]

# 3. Launch the interactive visualization
if __name__ == "__main__":
    print("Launching Galactic Culinary Archive...")
    print(f"Total dishes: {len(dishes)}")
    view_nodes(
        node_list=dishes,
        node_schema=Dish,
        node_id_extractor=lambda d: d.id,
        node_label_extractor=lambda d: d.name,
    )
