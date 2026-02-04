"""API route: POST /api/chat - Chat with visualization."""

import logging
from fastapi import APIRouter, HTTPException
from typing import Union

from ontosight.server.models.api import (
    ChatRequest,
    ChatResponse,
    GraphData,
    HypergraphData,
    ListData,
)
from ontosight.core.storage import GraphStorage, HypergraphStorage, ListStorage
from ontosight.server.state import global_state

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with the visualization data.

    Args:
        request: Chat request with query

    Returns:
        ChatResponse with response text and optional highlighted visualization data

    Raises:
        HTTPException: 400 if query is invalid, 404 if callback not registered
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    viz_type = global_state.get_visualization_type()

    try:
        # Execute chat callback - expect (response_text, related_data) tuple
        # Note: callback uses 'question' parameter, not 'query'
        result = global_state.execute_callback(
            "chat", question=request.query, context=request.context or {}
        )

        # Extract response and related data from callback result
        response_text = None
        related_data = None

        if isinstance(result, tuple) and len(result) == 2:
            response_text, related_data = result
        elif isinstance(result, str):
            response_text = result
        else:
            response_text = str(result)

        # Process related data if provided
        highlighted_data = None
        if related_data:
            storage = global_state.get_storage()
            if not storage:
                raise HTTPException(status_code=400, detail="Storage not initialized")

            if viz_type == "graph":
                node_list, edge_list = related_data
                # Only process if there's actual data
                if node_list or edge_list:
                    sample = storage.get_sample_from_data(node_list, edge_list, highlight_center=True)
                    highlighted_nodes = sum(1 for n in sample["nodes"] if n.get("highlighted"))
                    highlighted_edges = sum(1 for e in sample["edges"] if e.get("highlighted"))
                    logger.info(
                        f"[/api/chat] Graph chat returned {len(sample['nodes'])} nodes, {len(sample['edges'])} edges "
                        f"({highlighted_nodes} highlighted nodes, {highlighted_edges} highlighted edges)"
                    )
                    highlighted_data = GraphData(nodes=sample["nodes"], edges=sample["edges"])

            elif viz_type == "hypergraph":
                node_list, hyperedge_list = related_data
                # Only process if there's actual data
                if node_list or hyperedge_list:
                    sample = storage.get_sample_from_data(
                        node_list, hyperedge_list, highlight_center=True
                    )
                    highlighted_nodes = sum(1 for n in sample["nodes"] if n.get("highlighted"))
                    highlighted_hes = sum(1 for he in sample["hyperedges"] if he.get("highlighted"))
                    logger.info(
                        f"[/api/chat] Hypergraph chat returned {len(sample['nodes'])} nodes, "
                        f"{len(sample['hyperedges'])} hyperedges "
                        f"({highlighted_nodes} highlighted nodes, {highlighted_hes} highlighted hyperedges)"
                    )
                    highlighted_data = HypergraphData(
                        nodes=sample["nodes"],
                        edges=sample.get("edges", []),
                        hyperedges=sample["hyperedges"],
                    )

            elif viz_type == "list":
                item_list = related_data
                # Only process if there's actual data
                if item_list:
                    sample = storage.get_sample_from_data(item_list, highlight_center=True)
                    highlighted_items = sum(1 for i in sample["items"] if i.get("highlighted"))
                    logger.info(
                        f"[/api/chat] List chat returned {len(sample['items'])} items "
                        f"({highlighted_items} highlighted)"
                    )
                    highlighted_data = ListData(items=sample["items"])

        return ChatResponse(response=str(response_text), data=highlighted_data.model_dump() if highlighted_data else None)

    except HTTPException:
        raise
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Chat callback not registered. Register with GlobalState.register_callbacks(chat=...)",
        )
    except Exception as e:
        logger.error(f"[/api/chat] Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
