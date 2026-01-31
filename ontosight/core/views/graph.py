"""Graph visualization - creates interactive force-directed graphs."""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Type, Tuple
from pydantic import BaseModel
import logging

from ontosight.server.state import global_state
from ontosight.utils import (
    ensure_server_running,
    open_browser,
    wait_for_user,
    gen_random_id,
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

    # Normalize data
    try:
        vis_nodes, vis_edges, meta_data = format_data_for_ui(
            nodes=node_list,
            edges=edge_list,
            node_label_extractor=node_label_extractor,
            edge_label_extractor=edge_label_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        global_state.set_visualization_type("graph")
        global_state.set_visualization_data("nodes", vis_nodes)
        global_state.set_visualization_data("edges", vis_edges)
        global_state.set_visualization_data("meta_data", meta_data)
        logger.info("Graph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup graph visualization: {e}")
        raise


def format_data_for_ui(
    nodes: List[BaseModel],
    edges: List[BaseModel],
    node_label_extractor: Callable[[NodeSchema], str],
    edge_label_extractor: Callable[[EdgeSchema], str],
    nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str, str]],
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Convert lists of nodes and edges into normalized graph format.

    Args:
        nodes: List of node objects/dicts
        edges: List of edge objects/dicts
        node_label_extractor: Function to extract display label from a node object (required)
        edge_label_extractor: Function to extract display label from an edge object (required)
        nodes_in_edge_extractor: Function returning (source_id, target_id) tuple from an edge object (required)
    """

    label_id_map = {}

    # Formalize nodes
    formated_nodes = []
    for node in nodes:
        # Auto-generate ID using object identity
        _label = node_label_extractor(node)
        _id = gen_random_id()
        label_id_map[_label] = _id
        _data = node.model_dump()
        formated_nodes.append({"id": _id, "data": {"label": _label, "raw": _data}})

    # Formalize edges
    formated_edges = []
    for edge in edges:
        _label = edge_label_extractor(edge)
        # Extract source and target node objects
        _source, _target = nodes_in_edge_extractor(edge)
        assert _source in label_id_map, f"Source node '{_source}' not found"
        assert _target in label_id_map, f"Target node '{_target}' not found"
        _data = edge.model_dump()
        formated_edges.append(
            {
                "id": gen_random_id(),
                "source": label_id_map[_source],
                "target": label_id_map[_target],
                "data": {"label": _label, "raw": _data},
            }
        )
    
    meta_data = {
        "Nodes": len(nodes),
        "Edges": len(edges),
        "Average Node Degree": len(edges) / len(nodes) if len(nodes) > 0 else 0,
        "Average Edge Degree": 2
    }

    return formated_nodes, formated_edges, meta_data
