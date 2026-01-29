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
)

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)
EdgeSchema = TypeVar("EdgeSchema", bound=BaseModel)


def view_graph(
    node_list: List[NodeSchema],
    edge_list: List[EdgeSchema],
    node_schema: Type[NodeSchema],
    edge_schema: Type[EdgeSchema],
    node_name_extractor: Callable[[NodeSchema], str] | str,
    edge_name_extractor: Callable[[EdgeSchema], str] | str,
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
        node_name_extractor: Extractor for node display label
        edge_name_extractor: Extractor for edge display label
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
        result = normalize_graph(
            nodes=node_list,
            edges=edge_list,
            node_name_extractor=node_name_extractor,
            edge_name_extractor=edge_name_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        global_state.set_visualization_type("graph")
        global_state.set_visualization_data("nodes", result.get("nodes", []))
        global_state.set_visualization_data("edges", result.get("edges", []))

        logger.info("Graph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup graph visualization: {e}")
        raise


def normalize_graph(
    nodes: List[Any],
    edges: Optional[List[Any]] = None,
    node_name_extractor: Optional[Extractor] = None,
    edge_name_extractor: Optional[Extractor] = None,
    nodes_in_edge_extractor: Optional[Extractor] = None,
) -> Dict[str, Any]:
    """Convert lists of nodes and edges into normalized graph format.

    Args:
        nodes: List of node objects/dicts
        edges: List of edge objects/dicts (optional)
        node_name_extractor: Optional extractor for node display label (default: "label" or str())
        edge_name_extractor: Optional extractor for edge display label (default: "label" or str())
        nodes_in_edge_extractor: Extractor returning (source_obj, target_obj) tuple (auto-detects if None)

    Returns:
        Dict with 'nodes' and 'edges' keys

    Example:
        >>> nodes = [{"name": "A"}, {"name": "B"}]
        >>> edges = [{"source": nodes[0], "target": nodes[1]}]
        >>> normalize_graph(nodes, edges, node_name_extractor="name")
        {'nodes': [...], 'edges': [...]}
    """
    # Create a mapping from object id to node ID for edge resolution
    node_id_map = {}

    # Normalize nodes
    normalized_nodes = []
    for idx, node in enumerate(nodes):
        # Auto-generate ID using object identity
        n_id = str(id(node))
        node_id_map[id(node)] = n_id

        # Extract display label
        if node_name_extractor is None:
            # Default: try "label" key, fall back to str(node)
            if isinstance(node, dict):
                n_label = node.get("label", str(node))
            else:
                n_label = getattr(node, "label", str(node))
        else:
            n_label = extract_value(node, node_name_extractor, str(node))

        # Include all fields as data
        if isinstance(node, dict):
            n_data = {k: v for k, v in node.items()}
        else:
            n_data = {k: v for k, v in vars(node).items() if not k.startswith("_")}

        normalized_nodes.append({"id": n_id, "label": n_label, "data": n_data})

    # Normalize edges
    normalized_edges = []
    if edges:
        for edge in edges:
            # Default nodes_in_edge_extractor: try dict keys first, then attributes
            if nodes_in_edge_extractor is None:
                # Auto-detect: try to get source/target from dict or attributes
                if isinstance(edge, dict):
                    source_obj = edge.get("source")
                    target_obj = edge.get("target")
                else:
                    source_obj = getattr(edge, "source", None)
                    target_obj = getattr(edge, "target", None)
            else:
                # Extract source and target objects using nodes_in_edge_extractor
                try:
                    source_obj, target_obj = extract_value(
                        edge, nodes_in_edge_extractor, (None, None)
                    )
                except (TypeError, ValueError):
                    # If extraction fails, skip this edge
                    logger.warning(f"Failed to extract source/target from edge: {edge}")
                    continue

            if source_obj is None or target_obj is None:
                logger.warning(f"Invalid edge source or target: {edge}")
                continue

            # Map objects to IDs
            e_source = node_id_map.get(id(source_obj), str(id(source_obj)))
            e_target = node_id_map.get(id(target_obj), str(id(target_obj)))

            # Extract display label
            if edge_name_extractor is None:
                # Default: try "label" key, fall back to empty string
                if isinstance(edge, dict):
                    e_label = edge.get("label", "")
                else:
                    e_label = getattr(edge, "label", "")
            else:
                e_label = extract_value(edge, edge_name_extractor, "")

            # Include all fields as data
            if isinstance(edge, dict):
                e_data = {k: v for k, v in edge.items()}
            else:
                e_data = {k: v for k, v in vars(edge).items() if not k.startswith("_")}

            normalized_edges.append(
                {"source": e_source, "target": e_target, "label": e_label, "data": e_data}
            )

    return {"nodes": normalized_nodes, "edges": normalized_edges}
