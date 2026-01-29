"""List visualization example.

This example demonstrates how to visualize data as an interactive list/table.
"""

from ontosight.core import view_list

# Sample data - can be any list of dicts
users = [
    {"id": 1, "name": "Alice Chen", "email": "alice@example.com", "department": "Engineering"},
    {"id": 2, "name": "Bob Smith", "email": "bob@example.com", "department": "Sales"},
    {"id": 3, "name": "Charlie Brown", "email": "charlie@example.com", "department": "Engineering"},
    {"id": 4, "name": "Diana Prince", "email": "diana@example.com", "department": "Marketing"},
    {"id": 5, "name": "Eve Johnson", "email": "eve@example.com", "department": "HR"},
]

if __name__ == "__main__":
    # Create a list/table visualization
    view_list(
        item_list=users,
        item_schema=None,
        item_name_extractor=None,
    )
    
    print("List visualization started!")
    print("Open your browser to http://localhost:8000 to see the list")
