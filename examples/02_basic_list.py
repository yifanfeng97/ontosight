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
    UserSchema(id=7, name="Grace Wilson", email="grace@example.com", department="Engineering"),
    UserSchema(id=8, name="Henry Davis", email="henry@example.com", department="Sales"),
    UserSchema(id=9, name="Ivy Martinez", email="ivy@example.com", department="Marketing"),
    UserSchema(id=10, name="Jack Thompson", email="jack@example.com", department="HR"),
    UserSchema(id=11, name="Kate Anderson", email="kate@example.com", department="Finance"),
    UserSchema(id=12, name="Leo Garcia", email="leo@example.com", department="Engineering"),
    UserSchema(id=13, name="Mia Rodriguez", email="mia@example.com", department="Sales"),
    UserSchema(id=14, name="Nathan Clark", email="nathan@example.com", department="Marketing"),
    UserSchema(id=15, name="Olivia Lewis", email="olivia@example.com", department="HR"),
    UserSchema(id=16, name="Paul Walker", email="paul@example.com", department="Finance"),
    UserSchema(id=17, name="Quinn Hall", email="quinn@example.com", department="Engineering"),
    UserSchema(id=18, name="Rachel Young", email="rachel@example.com", department="Sales"),
    UserSchema(id=19, name="Sam King", email="sam@example.com", department="Marketing"),
    UserSchema(id=20, name="Tina Wright", email="tina@example.com", department="HR"),
    UserSchema(id=21, name="Uma Patel", email="uma@example.com", department="Finance"),
    UserSchema(id=22, name="Victor Scott", email="victor@example.com", department="Engineering"),
    UserSchema(id=23, name="Wendy Green", email="wendy@example.com", department="Sales"),
    UserSchema(id=24, name="Xander Baker", email="xander@example.com", department="Marketing"),
    UserSchema(id=25, name="Yara Hill", email="yara@example.com", department="HR"),
    UserSchema(id=26, name="Zack Adams", email="zack@example.com", department="Finance"),
    UserSchema(id=27, name="Amy Carter", email="amy@example.com", department="Engineering"),
    UserSchema(id=28, name="Brad Murphy", email="brad@example.com", department="Sales"),
    UserSchema(id=29, name="Cindy Reed", email="cindy@example.com", department="Marketing"),
    UserSchema(id=30, name="David Cook", email="david@example.com", department="HR"),
    UserSchema(id=31, name="Emma Perry", email="emma@example.com", department="Finance"),
    UserSchema(id=32, name="Finn Cooper", email="finn@example.com", department="Engineering"),
    UserSchema(id=33, name="Gina Bell", email="gina@example.com", department="Sales"),
    UserSchema(id=34, name="Harry Foster", email="harry@example.com", department="Marketing"),
    UserSchema(id=35, name="Isabel Diaz", email="isabel@example.com", department="HR"),
]

if __name__ == "__main__":
    # Create a list/table visualization
    view_list(
        item_list=users,
        item_schema=UserSchema,
        item_name_extractor=lambda item: item.name,
    )
