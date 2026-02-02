"""Graph visualization - creates interactive force-directed graphs."""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Type, Tuple
from pydantic import BaseModel
import logging

from ontosight.server.state import global_state
from ontosight.core.storage import GraphStorage
from ontosight.utils import (
    ensure_server_running,
    open_browser,
    wait_for_user,
)

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)
EdgeSchema = TypeVar("EdgeSchema", bound=BaseModel)


def view_graph(
    node_list: List[NodeSchema],
    edge_list: List[EdgeSchema],
    node_schema: Type[NodeSchema],
    edge_schema: Type[EdgeSchema],
    node_label_extractor: Callable[[NodeSchema], str],
    edge_label_extractor: Callable[[EdgeSchema], str],
    nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str, str]],
    on_search: Optional[Callable[[str, Dict], Any]] = None,
    on_chat: Optional[Callable[[str, Dict], Any]] = None,
    context: Optional[Dict[str, Any]] = None,
) -> None:
    """Create an interactive graph visualization.

    A graph visualization connects nodes using edges (typically pairwise connections).
    Each node and edge can have properties that are extracted using the provided extractors.

    Args:
        node_list: List of node objects/dicts
        edge_list: List of edge objects/dicts connecting nodes
        node_schema: Schema describing node structure (for detail view)
        edge_schema: Schema describing edge structure (for detail view)
        node_label_extractor: Function to extract display label from a node object (required)
        edge_label_extractor: Function to extract display label from an edge object (required)
        nodes_in_edge_extractor: Function returning (source_id, target_id) tuple from an edge object (required)
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

    # Normalize data and create storage
    try:
        # Create storage directly from raw schema items
        storage = GraphStorage(
            node_list=node_list,
            edge_list=edge_list,
            node_label_extractor=node_label_extractor,
            edge_label_extractor=edge_label_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        global_state.set_storage(storage)

        # Get formatted data from storage for metadata
        stats = storage.get_stats()
        meta_data = {
            "Nodes": stats["total_nodes"],
            "Edges": stats["total_edges"],
            "Average Node Degree": stats["avg_degree"],
            "Average Edge Degree": 2,
        }

        global_state.set_visualization_type("graph")
        global_state.set_visualization_data("meta_data", meta_data)
        logger.info("Graph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup graph visualization: {e}")
        raise
