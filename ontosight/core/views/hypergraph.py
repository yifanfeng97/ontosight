"""Hypergraph visualization - creates interactive hypergraph views."""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Type, Tuple
from pydantic import BaseModel
import logging
import hashlib

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

    # Normalize data
    try:
        nodes, edges, hyperedges = format_data_for_ui(
            nodes=node_list,
            edges=edge_list,
            node_name_extractor=node_name_extractor,
            edge_name_extractor=edge_name_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        global_state.set_visualization_type("hypergraph")
        global_state.set_visualization_data("nodes", nodes)
        global_state.set_visualization_data("edges", edges)
        global_state.set_visualization_data("hyperedges", hyperedges)

        logger.info("Hypergraph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup hypergraph visualization: {e}")
        raise


def format_data_for_ui(
    nodes: List[NodeSchema],
    edges: List[EdgeSchema],
    node_name_extractor: Callable[[NodeSchema], str],
    edge_name_extractor: Optional[Callable[[EdgeSchema], str]],
    nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str, ...]],
) -> Tuple[
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    List[Dict[str, Any]],
]:
    """Convert lists of nodes and hyperedges into normalized hypergraph format.

    Args:
        nodes: List of node objects/dicts
        edges: List of edge objects/dicts
        node_name_extractor: Extractor for node display label (required)
        edge_name_extractor: Optional extractor for edge display label
        nodes_in_edge_extractor: Extractor returning list of nodes in edge (default: "nodes")

    Returns:
        Tuple of (formatted_nodes, formatted_edges, formatted_hyperedges)
    """
    label_id_map = {}
    node_deg = {}
    for node in nodes:
        node_deg[node_name_extractor(node)] = 0

    for edge in edges:
        for node in nodes_in_edge_extractor(edge):
            node_deg[node] += 1

    formated_nodes, formated_edges, formated_hyperedges = [], [], []
    for node in nodes:
        _label = node_name_extractor(node)
        _id = gen_random_id()
        label_id_map[_label] = _id
        _data = node.model_dump()
        formated_nodes.append({"id": _id, "data": {"label": _label, "raw": _data}})

    for edge in edges:
        _label = edge_name_extractor(edge)
        _nodes = nodes_in_edge_extractor(edge)
        _node_degs = [node_deg[n] for n in _nodes]
        _core_node = _nodes[_node_degs.index(min(_node_degs))]
        for _node in _nodes:
            if _node != _core_node:
                formated_edges.append(
                    {
                        "id": gen_random_id(),
                        "source": label_id_map[_core_node],
                        "target": label_id_map[_node],
                    }
                )
        _data = edge.model_dump()
        formated_hyperedges.append(
            {
                "id": gen_random_id(),
                "label": _label,
                "node_set": [label_id_map[_node] for _node in _nodes],
                "data": _data,
            }
        )

    return formated_nodes, formated_edges, formated_hyperedges
