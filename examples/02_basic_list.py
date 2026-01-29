"""List visualization example.

This example demonstrates how to visualize data as an interactive list/table.
"""

from ontosight.core import view_list
from pydantic import BaseModel, Field


class UserSchema(BaseModel):
    id: int = Field(..., description="Unique identifier for the user")
    name: str = Field(..., description="Name of the user")
    email: str = Field(..., description="Email of the user")
    department: str = Field(..., description="Department of the user")


# Sample data - can be any list of dicts
users = [
    UserSchema(id=1, name="Alice Chen", email="alice@example.com", department="Engineering"),
    UserSchema(id=2, name="Bob Smith", email="bob@example.com", department="Sales"),
    UserSchema(id=3, name="Charlie Brown", email="charlie@example.com", department="Engineering"),
    UserSchema(id=4, name="Diana Prince", email="diana@example.com", department="Marketing"),
    UserSchema(id=5, name="Eve Johnson", email="eve@example.com", department="HR"),
    UserSchema(id=6, name="Frank Lee", email="frank@example.com", department="Finance"),
]

if __name__ == "__main__":
    # Create a list/table visualization
    view_list(
        item_list=users,
        item_schema=UserSchema,
        item_name_extractor=lambda item: item.name,
    )

    print("List visualization started!")
    print("Open your browser to http://localhost:8000 to see the list")
