"""API route: GET /api/data - Retrieve visualization data."""

import logging
from fastapi import APIRouter, HTTPException

from ontosight.server.models.api import (
    VisualizationData,
    GraphPayload,
    HypergraphPayload,
    ListPayload,
    GraphData,
    HypergraphData,
    ListData,
)
from ontosight.server.state import global_state

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/data", response_model=VisualizationData)
async def get_data() -> VisualizationData:
    """Get current visualization data.

    Returns:
        Visualization payload with nodes, edges, items wrapped in typed payload.

    Raises:
        HTTPException: 404 if no visualization loaded
    """
    state = global_state

    try:
        all_data = state.get_all_visualization_data()
        viz_type = state.get_visualization_type()
        
        logger.info(f"[/api/data] viz_type: {viz_type}")
        logger.info(f"[/api/data] all_data keys: {list(all_data.keys()) if all_data else 'None'}")
        
        if not all_data:
            logger.warning("[/api/data] No visualization data found")
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

        if viz_type == "graph":
            logger.info("[/api/data] Building GraphPayload")
            nodes = to_dict_list(all_data.get("nodes"))
            edges = to_dict_list(all_data.get("edges"))
            logger.info(f"[/api/data] Graph: {len(nodes)} nodes, {len(edges)} edges")
            
            payload = GraphPayload(
                data=GraphData(
                    nodes=nodes,
                    edges=edges,
                )
            )
        elif viz_type == "hypergraph":
            logger.info("[/api/data] Building HypergraphPayload")
            nodes = to_dict_list(all_data.get("nodes"))
            edges = to_dict_list(all_data.get("edges"))
            hyperedges = to_dict_list(all_data.get("hyperedges"))
            logger.info(f"[/api/data] Hypergraph: {len(nodes)} nodes, {len(edges)} edges, {len(hyperedges)} hyperedges")
            
            payload = HypergraphPayload(
                data=HypergraphData(
                    nodes=nodes,
                    edges=edges,
                    hyperedges=hyperedges,
                )
            )
        elif viz_type == "list":
            logger.info("[/api/data] Building ListPayload")
            items = to_dict_list(all_data.get("items"))
            logger.info(f"[/api/data] List: {len(items)} items")
            
            payload = ListPayload(
                data=ListData(
                    items=items,
                )
            )
        else:
            logger.error(f"[/api/data] Unknown visualization type: {viz_type}")
            raise ValueError(f"Unknown visualization type: {viz_type}")

        response = VisualizationData(payload=payload)
        logger.info(f"[/api/data] Response payload type: {response.payload.type}")
        return response
    except RuntimeError as e:
        logger.error(f"[/api/data] RuntimeError: {e}")
        raise HTTPException(
            status_code=404, detail="No visualization loaded. Call view_graph() or similar first."
        )
    except Exception as e:
        logger.error(f"[/api/data] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

