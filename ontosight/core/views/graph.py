"""Graph visualization - creates interactive force-directed graphs."""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Type, Tuple
from pydantic import BaseModel
import logging

from ontosight.server.state import global_state
from ontosight.utils import (
    Extractor,
    extract_value,
    ensure_server_running,
    open_browser,
    wait_for_user,
    short_id_from_str,
)

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)
EdgeSchema = TypeVar("EdgeSchema", bound=BaseModel)


def view_graph(
    node_list: List[NodeSchema],
    edge_list: List[EdgeSchema],
    node_schema: Type[NodeSchema],
    edge_schema: Type[EdgeSchema],
    node_label_extractor: Callable[[NodeSchema], str] | str,
    edge_label_extractor: Callable[[EdgeSchema], str] | str,
    nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str]] | str,
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
        node_label_extractor: Extractor for node display label
        edge_label_extractor: Extractor for edge display label
        nodes_in_edge_extractor: Extractor returning (source_obj, target_obj) tuple
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
        vis_nodes, vis_edges = format_data_for_ui(
            nodes=node_list,
            edges=edge_list,
            node_label_extractor=node_label_extractor,
            edge_label_extractor=edge_label_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        global_state.set_visualization_type("graph")
        global_state.set_visualization_data("nodes", vis_nodes)
        global_state.set_visualization_data("edges", vis_edges)
        logger.info("Graph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup graph visualization: {e}")
        raise


def format_data_for_ui(
    nodes: List[BaseModel],
    edges: List[BaseModel],
    node_label_extractor: Callable[[NodeSchema], str] | str,
    edge_label_extractor: Callable[[EdgeSchema], str] | str,
    nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str]] | str,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Convert lists of nodes and edges into normalized graph format.

    Args:
        nodes: List of node objects/dicts
        edges: List of edge objects/dicts (optional)
        node_name_extractor: Optional extractor for node display label (default: "label" or str())
        edge_name_extractor: Optional extractor for edge display label (default: "label" or str())
        nodes_in_edge_extractor: Extractor returning (source_obj, target_obj) tuple (auto-detects if None)

    Returns:
        Tuple of (list of normalized nodes, list of normalized edges)

    Example:
        >>> nodes = [{"name": "A"}, {"name": "B"}]
        >>> edges = [{"source": nodes[0], "target": nodes[1]}]
        >>> schema2vis_data(nodes, edges, node_name_extractor="name")
        ( [...], [...] )
    """

    # Formalize nodes
    formated_nodes = []
    for node in nodes:
        # Auto-generate ID using object identity
        _label = extract_value(node, node_label_extractor)
        _id = _label
        _data = node.model_dump()
        formated_nodes.append({"id": _id, "data": {"label": _label, "raw": _data}})

    # Formalize edges
    formated_edges = []
    for edge in edges:
        _label = extract_value(edge, edge_label_extractor)
        # Extract source and target node objects
        _source, _target = extract_value(edge, nodes_in_edge_extractor)
        _data = edge.model_dump()
        formated_edges.append(
            {
                "source": _source,
                "target": _target,
                "data": {"label": _label, "raw": _data},
            }
        )

    return formated_nodes, formated_edges
