"""API route: GET /api/data - Retrieve visualization data."""

from fastapi import APIRouter, HTTPException

from ontosight.server.models.api import VisualizationData
from ontosight.server.state import global_state

router = APIRouter()


@router.get("/data", response_model=VisualizationData)
async def get_data() -> VisualizationData:
    """Get current visualization data.

    Returns:
        Visualization payload with nodes, edges, items, hyperedges

    Raises:
        HTTPException: 404 if no visualization loaded
    """
    state = global_state

    try:
        all_data = state.get_all_visualization_data()
        if not all_data:
            raise RuntimeError("No visualization data")

        # Convert Node/Edge objects to dicts if needed
        def to_dict_list(items):
            if not items:
                return []
            result = []
            for item in items:
                if hasattr(item, "model_dump"):
                    result.append(item.model_dump())
                elif isinstance(item, dict):
                    result.append(item)
                else:
                    result.append(item)
            return result

        return VisualizationData(
            nodes=to_dict_list(all_data.get("nodes", [])),
            edges=to_dict_list(all_data.get("edges", [])),
            items=to_dict_list(all_data.get("items", [])),
            hyperedges=to_dict_list(all_data.get("hyperedges", [])),
        )
    except RuntimeError:
        raise HTTPException(
            status_code=404, detail="No visualization loaded. Call view_graph() or similar first."
        )
