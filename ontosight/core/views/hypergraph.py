"""Hypergraph visualization - creates interactive hypergraph views."""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Type, Tuple
from pydantic import BaseModel
import logging

from ontosight.server.state import global_state
from ontosight.core.storage import HypergraphStorage
from ontosight.utils import (
    ensure_server_running,
    open_browser,
    wait_for_user,
)

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)
EdgeSchema = TypeVar("EdgeSchema", bound=BaseModel)


def view_hypergraph(
    node_list: List[NodeSchema],
    edge_list: List[EdgeSchema],
    node_schema: Type[NodeSchema],
    edge_schema: Type[EdgeSchema],
    node_name_extractor: Callable[[NodeSchema], str],
    edge_name_extractor: Callable[[EdgeSchema], str],
    nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str, ...]],
    on_search: Optional[Callable[[str, Dict], Any]] = None,
    on_chat: Optional[Callable[[str, Dict], Any]] = None,
    context: Optional[Dict[str, Any]] = None,
) -> None:
    """Create an interactive hypergraph visualization.

    A hypergraph allows edges to connect multiple nodes (not just pairs).
    Each hyperedge can group multiple nodes together.

    Args:
        node_list: List of node objects/dicts
        edge_list: List of edge objects/dicts connecting multiple nodes
        node_schema: Schema describing node structure (for detail view)
        edge_schema: Schema describing edge structure (for detail view)
        node_name_extractor: Function to extract display label from a node object (required)
        edge_name_extractor: Function to extract display label from an edge object (required)
        nodes_in_edge_extractor: Function returning tuple of node IDs in hyperedge (required)
        on_search: Optional callback for search queries
        on_chat: Optional callback for chat queries
        context: Optional context data to store with visualization
    """
    ensure_server_running()
    global_state.clear()

    # Extract callbacks and context
    callbacks = {}
    if on_search is not None:
        callbacks["search"] = on_search
    if on_chat is not None:
        callbacks["chat"] = on_chat

    if callbacks:
        global_state.register_callbacks(callbacks)

    if context:
        global_state.set_context(**context)

    # Store schema for detail view (if provided)
    if node_schema is not None:
        global_state.set_context(node_schema=node_schema)
    if edge_schema is not None:
        global_state.set_context(edge_schema=edge_schema)

    # Create storage with raw items and extractors
    try:
        storage = HypergraphStorage(
            node_list=node_list,
            edge_list=edge_list,
            node_name_extractor=node_name_extractor,
            edge_name_extractor=edge_name_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        
        # Get stats for metadata
        stats = storage.get_stats()
        meta_data = {
            "Nodes": stats["total_nodes"],
            "Hyperedges": stats["total_hyperedges"],
            "Average Node Degree": stats["avg_node_degree"],
            "Average Hyperedge Degree": stats["avg_hyperedge_degree"],
        }
        
        # Register storage globally for API access
        global_state.set_storage(storage)
        
        global_state.set_visualization_type("hypergraph")
        global_state.set_visualization_data("meta_data", meta_data)

        logger.info("Hypergraph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup hypergraph visualization: {e}")
        raise
