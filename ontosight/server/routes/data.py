"""API route: GET /api/data - Retrieve visualization data.

This endpoint returns sampled visualization data for display:
- Graph/Hypergraph: Returns a random neighborhood (2 hops)
- List: Returns paginated items

Endpoint:
    GET /api/data

Response:
    GraphData | HypergraphData | ListData depending on visualization type
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from ontosight.server.models.api import (
    GraphData,
    HypergraphData,
    ListData,
)
from ontosight.server.state import global_state

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/data")
async def get_data(ids: Optional[str] = Query(None), page: int = Query(0), page_size: int = Query(30)):
    """Get sampled visualization data for display.
    
    - Graph/Hypergraph: Returns neighborhood around specified IDs (or random if empty). 2 hops.
    - List: Returns paginated items.
    
    Args:
        ids: Comma-separated list of element IDs (optional, for graph/hypergraph)
        page: Page number for list views (0-indexed)
        page_size: Items per page for list views
    
    Returns:
        GraphData, HypergraphData, or ListData with sampled neighborhood
    """
    viz_type = global_state.get_visualization_type()
    
    try:
        if viz_type == "graph":
            storage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            id_list = ids.split(",") if ids else None
            subgraph = storage.get_sample(center_ids=id_list, hops=2)
            logger.info(f"[/api/data] Graph: {len(subgraph['nodes'])} nodes, {len(subgraph['edges'])} edges")
            return GraphData(nodes=subgraph["nodes"], edges=subgraph["edges"])
        
        elif viz_type == "hypergraph":
            storage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            id_list = ids.split(",") if ids else None
            sub_hg = storage.get_sample(center_ids=id_list, hops=2)
            logger.info(f"[/api/data] Hypergraph: {len(sub_hg['nodes'])} nodes, {len(sub_hg['edges'])} edges, {len(sub_hg['hyperedges'])} hyperedges")
            return HypergraphData(
                nodes=sub_hg["nodes"],
                edges=sub_hg["edges"],
                hyperedges=sub_hg["hyperedges"]
            )
        
        elif viz_type == "list":
            # For list view, get paginated items from global_state
            all_items = global_state.get_visualization_data("items", [])
            total = len(all_items)
            start = page * page_size
            end = start + page_size
            paginated_items = all_items[start:end]
            
            logger.info(f"[/api/data] List page {page}: {len(paginated_items)} items (total: {total})")
            return ListData(
                items=paginated_items,
                page=page,
                page_size=page_size,
                total=total,
                has_next=end < total
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown viz type: {viz_type}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[/api/data] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details/{element_id}")
async def get_details(element_id: str):
    """Get full details of an element by ID.
    
    Args:
        element_id: ID of the node/edge/hyperedge/list-item
    
    Returns:
        Full element data
    """
    viz_type = global_state.get_visualization_type()
    
    try:
        # For list visualization, search for item in global state
        if viz_type == "list":
            all_items = global_state.get_visualization_data("items", [])
            for item in all_items:
                if item.get("id") == element_id:
                    logger.info(f"[/api/details] List item {element_id} found")
                    return item
            raise HTTPException(status_code=404, detail=f"List item {element_id} not found")
        
        # For graph/hypergraph, use storage
        storage = global_state.get_storage()
        if not storage:
            raise HTTPException(status_code=400, detail="Storage not initialized")
        
        details = storage.get_details(element_id)
        if not details:
            raise HTTPException(status_code=404, detail=f"Element {element_id} not found")
        return details
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[/api/details] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/nodes_paginated")
async def get_nodes_paginated(page: int = Query(0), page_size: int = Query(30)):
    """Get paginated list of all nodes.
    
    Args:
        page: Page number (0-indexed)
        page_size: Items per page
    
    Returns:
        Paginated node list
    """
    storage = global_state.get_storage()
    if not storage:
        raise HTTPException(status_code=400, detail="Storage not initialized")
    
    try:
        return storage.get_all_nodes_paginated(page=page, page_size=page_size)
    except Exception as e:
        logger.error(f"[/api/nodes_paginated] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/edges_paginated")
async def get_edges_paginated(page: int = Query(0), page_size: int = Query(30)):
    """Get paginated list of all edges.
    
    Args:
        page: Page number (0-indexed)
        page_size: Items per page
    
    Returns:
        Paginated edge list
    """
    storage = global_state.get_storage()
    if not storage:
        raise HTTPException(status_code=400, detail="Storage not initialized")
    
    try:
        return storage.get_all_edges_paginated(page=page, page_size=page_size)
    except Exception as e:
        logger.error(f"[/api/edges_paginated] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hyperedges_paginated")
async def get_hyperedges_paginated(page: int = Query(0), page_size: int = Query(30)):
    """Get paginated list of all hyperedges.
    
    Args:
        page: Page number (0-indexed)
        page_size: Items per page
    
    Returns:
        Paginated hyperedge list
    """
    storage = global_state.get_storage()
    if not storage:
        raise HTTPException(status_code=400, detail="Storage not initialized")
    
    try:
        return storage.get_all_hyperedges_paginated(page=page, page_size=page_size)
    except Exception as e:
        logger.error(f"[/api/hyperedges_paginated] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


