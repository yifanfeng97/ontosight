"""API route: POST /api/search - Search visualization."""

import logging
from fastapi import APIRouter, HTTPException
from typing import Union

from ontosight.server.models.api import (
    GraphData,
    HypergraphData,
    ListData,
)

from ontosight.core.storage import GraphStorage, HypergraphStorage, ListStorage

from ontosight.server.models.api import SearchRequest
from ontosight.server.state import global_state

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/search", response_model=Union[GraphData, HypergraphData, ListData])
async def search(request: SearchRequest) -> Union[GraphData, HypergraphData, ListData]:
    """Search visualization for matching nodes and return highlighted sample data.

    Args:
        request: Search request with query string

    Returns:
        Visualization data (GraphData, HypergraphData, or ListData) with highlighted 
        matching elements and surrounding context

    Raises:
        HTTPException: 400 if query is invalid, 404 if callback not registered
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    viz_type = global_state.get_visualization_type()

    try:
        results = global_state.execute_callback("search", query=request.query)
        
        if viz_type == "graph":
            node_list, edge_list = results
            storage: GraphStorage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            
            # Get sample with highlighting injected at storage layer
            sample = storage.get_sample_from_data(node_list, edge_list, highlight_center=True)
            
            highlighted_nodes = sum(1 for n in sample["nodes"] if n.get("highlighted"))
            highlighted_edges = sum(1 for e in sample["edges"] if e.get("highlighted"))
            logger.info(
                f"[/api/search] Graph search returned {len(sample['nodes'])} nodes, {len(sample['edges'])} edges "
                f"({highlighted_nodes} highlighted nodes, {highlighted_edges} highlighted edges)"
            )
            return GraphData(nodes=sample["nodes"], edges=sample["edges"])
            
        elif viz_type == "hypergraph":
            node_list, hyperedge_list = results
            storage: HypergraphStorage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            
            # Get sample with highlighting injected at storage layer
            sample = storage.get_sample_from_data(node_list, hyperedge_list, highlight_center=True)
            
            logger.info(
                f"[/api/search] Hypergraph search returned {len(sample['nodes'])} nodes, "
                f"{len(sample['hyperedges'])} hyperedges "
                f"({sum(1 for n in sample['nodes'] if n.get('highlighted'))}) highlighted nodes, "
                f"{sum(1 for he in sample['hyperedges'] if he.get('highlighted'))} highlighted hyperedges)"
            )
            return HypergraphData(
                nodes=sample["nodes"],
                edges=sample.get("edges", []),
                hyperedges=sample["hyperedges"]
            )
            
        elif viz_type == "list":
            storage: ListStorage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")
            
            # Unpack results (item_list, _) from callback
            item_list = results[0] if isinstance(results, tuple) else results
            
            # Get sample with highlighting injected at storage layer
            sample = storage.get_sample_from_data(item_list, highlight_center=True)
            
            logger.info(
                f"[/api/search] List search returned {len(sample['items'])} items "
                f"({sum(1 for i in sample['items'] if i.get('highlighted'))} highlighted)"
            )
            return ListData(items=sample["items"])
            
        else:
            raise NotImplementedError(f"Search not implemented for visualization type: {viz_type}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[/api/search] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
