"""API route: POST /api/search - Search visualization."""

import logging
from fastapi import APIRouter, HTTPException

from ontosight.server.models.api import (
    GraphData,
    HypergraphData,
)

from ontosight.server.models.api import SearchRequest, SearchResponse
from ontosight.server.state import global_state

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """Search visualization for matching nodes.

    Args:
        request: Search request with query string

    Returns:
        SearchResponse with list of matching node IDs

    Raises:
        HTTPException: 400 if query is invalid, 404 if callback not registered
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    viz_type = global_state.get_visualization_type()

    try:
        results = global_state.execute_callback(
            "search", query=request.query, context=request.context or {}
        )
        if viz_type == "graph":
            storage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            sample = storage.focus_on(results)
            logger.info(
                f"[/api/search] Graph search returned {len(sample['nodes'])} nodes, {len(sample['edges'])} edges"
            )
            return GraphData(nodes=sample["nodes"], edges=sample["edges"])
        elif viz_type == "hypergraph":
            storage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            sample = storage.focus_on(results)
            logger.info(
                f"[/api/search] Hypergraph search returned {len(sample['nodes'])} nodes, {len(sample['hyperedges'])} hyperedges"
            )
            return HypergraphData(nodes=sample["nodes"], hyperedges=sample["hyperedges"])
        else:
            raise NotImplementedError(f"Search not implemented for visualization type: {viz_type}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[/api/data] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
