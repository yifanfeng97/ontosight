"""
Example 06: Galactic Flavor Clusters (Advanced Nodes + Search & Chat)

This example demonstrates advanced node visualization with:
1. Semantic search capabilities (find dishes by ingredient, taste, difficulty)
2. An AI chat chef that can recommend dishes and suggest pairings
3. Nodes positioned in a semantic space based on flavor profiles
"""

import random
from typing import Any, Dict, List, Tuple
from pydantic import BaseModel, Field
from ontosight import view_nodes


# 1. Define your data schema
class DishWithCoordinates(BaseModel):
    name: str = Field(..., description="Name of the dish")
    cuisine: str = Field(..., description="Cuisine origin")
    origin: str = Field(..., description="Home planet or region")
    primary_ingredient: str = Field(..., description="Main ingredient")
    taste_profile: str = Field(..., description="Sweet, Spicy, Savory, Bitter, or Mixed")
    preparation_time: int = Field(..., description="Minutes to prepare")
    difficulty: str = Field(..., description="Easy, Medium, Hard")


dishes_data = [
    # Core Worlds Cuisine
    (
        "Coruscant Imperial Roast",
        "Core Worlds",
        "Coruscant",
        "Bantha Meat",
        "Savory",
        45,
        "Hard",
    ),
    ("Senate Plaza Salad", "Core Worlds", "Coruscant", "Mixed Greens", "Mixed", 15, "Easy"),
    (
        "Trandoshan Amber Tea",
        "Core Worlds",
        "Trandosha",
        "Amber Leaves",
        "Sweet",
        10,
        "Easy",
    ),
    # Outer Rim Street Food
    (
        "Tatooine Moisture Cake",
        "Outer Rim",
        "Tatooine",
        "Moisture Crystals",
        "Sweet",
        20,
        "Easy",
    ),
    (
        "Geonosis Dust Seasoning Stew",
        "Outer Rim",
        "Geonosis",
        "Dust Beetles",
        "Spicy",
        30,
        "Medium",
    ),
    (
        "Bespin Cloud City Noodles",
        "Outer Rim",
        "Bespin",
        "Tibanna Flour",
        "Savory",
        25,
        "Medium",
    ),
    # Hutt Territories
    ("Jabba's Treasure Feast", "Hutt Territories", "Tatooine", "Spice", "Spicy", 90, "Hard"),
    (
        "Mos Eisley Cantina Drink Mix",
        "Hutt Territories",
        "Tatooine",
        "Fruit Nectar",
        "Mixed",
        5,
        "Easy",
    ),
    # Allied Regions
    (
        "Rebel Alliance Field Rations",
        "Allied Regions",
        "Yavin 4",
        "Preserved Vegetables",
        "Savory",
        10,
        "Easy",
    ),
    (
        "Millennium Falcon Emergency Paste",
        "Allied Regions",
        "Unknown",
        "Nutrient Paste",
        "Bitter",
        3,
        "Easy",
    ),
    # More variety
    (
        "Endor Forest Mushroom Risotto",
        "Allied Regions",
        "Endor",
        "Forest Mushrooms",
        "Savory",
        35,
        "Medium",
    ),
    ("Hoth Ice Cream", "Core Worlds", "Hoth", "Crystal Ice", "Sweet", 40, "Hard"),
    ("Naboo Royal Pasta", "Core Worlds", "Naboo", "Wheat Flour", "Savory", 55, "Hard"),
    ("Ewok Acorn Bread", "Allied Regions", "Endor", "Acorns", "Mixed", 30, "Medium"),
    (
        "Kamino Ocean Market Stew",
        "Outer Rim",
        "Kamino",
        "Fresh Fish",
        "Savory",
        40,
        "Medium",
    ),
    ("Dagobah Swamp Broth", "Outer Rim", "Dagobah", "Marsh Plants", "Bitter", 60, "Hard"),
    (
        "Mustafar Spiced Selection",
        "Hutt Territories",
        "Mustafar",
        "Volcanic Spices",
        "Spicy",
        20,
        "Medium",
    ),
    (
        "Cloud Wine Reduction",
        "Core Worlds",
        "Bespin",
        "Cloud Berries",
        "Sweet",
        35,
        "Medium",
    ),
    (
        "Canto Bight Cocktail",
        "Core Worlds",
        "Cantonica",
        "Rare Liqueurs",
        "Mixed",
        8,
        "Easy",
    ),
    (
        "Scarif Tropical Bowl",
        "Allied Regions",
        "Scarif",
        "Tropical Fruits",
        "Sweet",
        12,
        "Easy",
    ),
]

dishes = [
    DishWithCoordinates(
        name=d[0],
        cuisine=d[1],
        origin=d[2],
        primary_ingredient=d[3],
        taste_profile=d[4],
        preparation_time=d[5],
        difficulty=d[6],
    )
    for d in dishes_data
]


# 3. Define Search Callback
def search_dishes(query: str) -> List[DishWithCoordinates]:
    """
    Search for dishes by name, ingredient, taste, or preparation difficulty.

    Args:
        query: Search query string (e.g., "spicy", "easy", "meat", "sweet")

    Returns:
        List of matched dishes
    """
    query_lower = query.lower().strip()
    results = []

    for dish in dishes:
        # Search by name
        if query_lower in dish.name.lower():
            results.append(dish)
            continue

        # Search by ingredient
        if query_lower in dish.primary_ingredient.lower():
            results.append(dish)
            continue

        # Search by taste profile
        if query_lower in dish.taste_profile.lower():
            results.append(dish)
            continue

        # Search by cuisine
        if query_lower in dish.cuisine.lower():
            results.append(dish)
            continue

        # Search by difficulty level
        if query_lower in dish.difficulty.lower():
            results.append(dish)
            continue

    return results


# 4. Define Chat Callback
def chat_with_chef(question: str) -> Tuple[str, List[DishWithCoordinates]]:
    """
    An AI chef assistant that recommends dishes and provides culinary advice.

    Args:
        question: User's natural language question

    Returns:
        Tuple of (response text, list of recommended dishes for highlighting)
    """
    question_lower = question.lower()

    # Recommendations based on cuisine preference
    if "core worlds" in question_lower or "imperial" in question_lower:
        recommended = [d for d in dishes if d.cuisine == "Core Worlds"]
        return (
            "For Core Worlds cuisine, I'd recommend the 'Coruscant Imperial Roast' - "
            "a sophisticated savory dish, or the 'Naboo Royal Pasta' for something more elegant. "
            "Both require considerable skill but deliver truly galactic flavors!",
            recommended
        )

    if "outer rim" in question_lower or "street food" in question_lower:
        recommended = [d for d in dishes if d.cuisine == "Outer Rim"]
        return (
            "Outer Rim street food is all about bold flavors! The 'Geonosis Dust Seasoning Stew' "
            "offers an unforgettable spicy experience, while 'Tatooine Moisture Cake' is quick "
            "and perfect for travelers like yourself.",
            recommended
        )

    if "hutt" in question_lower or "jabba" in question_lower:
        recommended = [d for d in dishes if d.cuisine == "Hutt Territories"]
        return (
            "Jabba the Hutt prefers intensely seasoned, spicy dishes that command attention. "
            "I'd prepare 'Jabba's Treasure Feast' - a masterpiece of spice and complexity that "
            "takes 90 minutes but worth every second!",
            recommended
        )

    # Recommendations based on time constraint
    if "quick" in question_lower or "fast" in question_lower or "easy" in question_lower:
        easy_dishes = [d for d in dishes if d.preparation_time <= 15]
        if easy_dishes:
            easy_names = ", ".join([d.name for d in easy_dishes[:3]])
            return (f"For a quick meal, I'd suggest: {easy_names}. All ready in 15 minutes or less!", easy_dishes)

    # Recommendations based on taste preference
    if "sweet" in question_lower or "dessert" in question_lower:
        sweet_dishes = [d for d in dishes if "sweet" in d.taste_profile.lower()]
        if sweet_dishes:
            sweet_names = ", ".join([d.name for d in sweet_dishes[:2]])
            return (f"For something sweet, try: {sweet_names}. Perfect to end your meal!", sweet_dishes)

    if "spicy" in question_lower or "hot" in question_lower:
        spicy_dishes = [d for d in dishes if "spicy" in d.taste_profile.lower()]
        if spicy_dishes:
            spicy_names = ", ".join([d.name for d in spicy_dishes[:2]])
            return (f"For heat lovers: {spicy_names}. These will definitely challenge your palate!", spicy_dishes)

    if "savory" in question_lower or "meat" in question_lower:
        savory_dishes = [
            d
            for d in dishes
            if "savory" in d.taste_profile.lower() or "meat" in d.primary_ingredient.lower()
        ]
        if savory_dishes:
            savory_names = ", ".join([d.name for d in savory_dishes[:2]])
            return (f"For a hearty savory meal, I recommend: {savory_names}.", savory_dishes)

    # Default response - no specific recommendations
    return (
        "Welcome to the Galactic Culinary Archive! I'm your AI Chef Assistant. "
        "Ask me for recommendations by cuisine (Core Worlds, Outer Rim, Hutt Territories), "
        "taste preference (sweet, spicy, savory), or time available (quick, easy). "
        "What can I help you with today?",
        []
    )


# 5. Launch the interactive visualization
if __name__ == "__main__":
    print("Launching Galactic Flavor Clusters Analysis...")
    print(f"Total dishes in archive: {len(dishes)}")
    view_nodes(
        node_list=dishes,
        node_schema=DishWithCoordinates,
        node_id_extractor=lambda d: d.name,
        node_label_extractor=lambda d: d.name,
        on_search=search_dishes,
        on_chat=chat_with_chef,
        context={
            "title": "Galactic Culinary Archive",
            "description": "Semantic exploration of dishes across the galaxy using flavor clusters",
        },
    )
