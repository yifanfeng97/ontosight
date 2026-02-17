"""FastAPI route for /api/meta - returns metadata for visualization.

This endpoint provides:
1. Visualization type (graph, list, hypergraph)
2. Available features (search, chat, etc.)
3. JSON schemas for each data element type

The frontend uses this information to:
- Route to the correct visualization component
- Enable/disable UI features
- Dynamically render property panels

Endpoint:
    GET /api/meta

Response:
    MetaResponse with type, features, and schemas

Example:
    GET http://localhost:8000/api/meta

    {
        "type": "graph",
        "features": {"search": true, "chat": true},
        "schemas": {
            "nodes": {...},
            "edges": {...}
        }
    }
"""

from fastapi import APIRouter
from ontosight.server.state import global_state
from ontosight.server.models.api import MetaResponse

router = APIRouter()


@router.get("/meta", response_model=MetaResponse)
async def get_meta() -> MetaResponse:
    """Get metadata including visualization type, features, and schemas.

    Returns:
        MetaResponse with type, features, and schemas
    """
    # Get visualization type
    viz_type = global_state.get_visualization_type()

    # Get all visualization data
    data = global_state.get_all_visualization_data()

    # Build features dict from registered callbacks
    callbacks = global_state.get_callbacks()
    features = callbacks  # e.g. {"search": True, "chat": True}

    # Build schemas dict based on visualization type
    schemas = {}

    if viz_type == "graph":
        if "node_schema" in data and data["node_schema"] is not None:
            schemas["nodes"] = data["node_schema"].model_json_schema()
        if "edge_schema" in data and data["edge_schema"] is not None:
            schemas["edges"] = data["edge_schema"].model_json_schema()

    elif viz_type == "hypergraph":
        if "node_schema" in data and data["node_schema"] is not None:
            schemas["nodes"] = data["node_schema"].model_json_schema()
        if "edge_schema" in data and data["edge_schema"] is not None:
            schemas["edges"] = data["edge_schema"].model_json_schema()
        if "hyperedge_schema" in data and data["hyperedge_schema"] is not None:
            schemas["hyperedges"] = data["hyperedge_schema"].model_json_schema()

    elif viz_type == "nodes":
        if "node_schema" in data and data["node_schema"] is not None:
            schemas["nodes"] = data["node_schema"].model_json_schema()

    return MetaResponse(
        type=viz_type,
        features=features,
        schemas=schemas,
        stats=data.get("meta_data", {}),
    )
