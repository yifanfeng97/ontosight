"""FastAPI route for /api/meta - returns JSON schemas for visualization.

This endpoint provides Pydantic-generated JSON schemas for all data types
used in visualization. The frontend uses these schemas to dynamically render
property panels for nodes, edges, and items.

Endpoint:
    GET /api/meta

Response:
    MetaResponse with JSON Schema objects for each data type

Example:
    GET http://localhost:8000/api/meta

    {
        "node_schema": {...},
        "edge_schema": {...},
        "item_schema": {...}
    }
"""

from fastapi import APIRouter
from ontosight.server.state import global_state
from ontosight.server.models.api import MetaResponse

router = APIRouter()


@router.get("/meta", response_model=MetaResponse)
async def get_meta() -> MetaResponse:
    """Get metadata including JSON schemas for all visualization types.

    Returns:
        MetaResponse with schemas from registered data models
    """
    data = global_state.get_all_visualization_data()

    # Return metadata regardless of whether visualization data exists
    # (metadata describes the schema, not the data itself)
    return MetaResponse(
        node_schema=data.get("node_schema"),
        edge_schema=data.get("edge_schema"),
        item_schema=data.get("item_schema"),
        hyperedge_schema=data.get("hyperedge_schema"),
    )
