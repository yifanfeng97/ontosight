"""Hypergraph visualization - creates interactive hypergraph views."""

from typing import Any, Callable, Dict, List, Optional
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


def view_hypergraph(
    node_list: List[Any],
    edge_list: List[Any],
    node_schema: Any,
    edge_schema: Any,
    node_name_extractor: Extractor,
    edge_name_extractor: Extractor,
    nodes_in_edge_extractor: Extractor,
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
        node_name_extractor: Extractor for node display label
        edge_name_extractor: Extractor for edge display label
        nodes_in_edge_extractor: Extractor returning list of nodes in edge
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
        result = normalize_hypergraph(
            nodes=node_list,
            hyperedges=edge_list,
            node_name_extractor=node_name_extractor,
            edge_name_extractor=edge_name_extractor,
            nodes_in_edge_extractor=nodes_in_edge_extractor,
        )
        global_state.set_visualization_data("nodes", result.get("nodes", []))
        global_state.set_visualization_data("hyperedges", result.get("hyperedges", []))

        logger.info("Hypergraph visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup hypergraph visualization: {e}")
        raise


def normalize_hypergraph(
    nodes: List[Any],
    hyperedges: List[Any],
    node_name_extractor: Optional[Extractor] = None,
    edge_name_extractor: Optional[Extractor] = None,
    nodes_in_edge_extractor: Extractor = "nodes",
) -> Dict[str, Any]:
    """Convert lists of nodes and hyperedges into normalized hypergraph format.

    A hyperedge can connect multiple nodes (not just pairs).

    Args:
        nodes: List of node objects/dicts
        hyperedges: List of hyperedge objects/dicts
        node_name_extractor: Optional extractor for node display label (default: "label" or str())
        edge_name_extractor: Optional extractor for edge display label (default: "label" or str())
        nodes_in_edge_extractor: Extractor returning list of nodes in edge (default: "nodes")

    Returns:
        Dict with 'nodes' and 'hyperedges' keys
    """
    # Create a mapping from object id to node ID for edge resolution
    node_id_map = {}

    # Normalize nodes (same as in normalize_graph)
    normalized_nodes = []
    for node in nodes:
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

    # Normalize hyperedges
    normalized_hyperedges = []
    for hedge in hyperedges:
        # Extract nodes in hyperedge
        h_nodes_list = extract_value(hedge, nodes_in_edge_extractor, [])
        if not isinstance(h_nodes_list, (list, tuple)):
            h_nodes_list = [h_nodes_list]

        # Map node objects to their IDs
        h_node_ids = []
        for node_obj in h_nodes_list:
            node_id = node_id_map.get(id(node_obj), str(id(node_obj)))
            h_node_ids.append(node_id)

        # Extract display label
        if edge_name_extractor is None:
            # Default: try "label" key, fall back to empty string
            if isinstance(hedge, dict):
                h_label = hedge.get("label", "")
            else:
                h_label = getattr(hedge, "label", "")
        else:
            h_label = extract_value(hedge, edge_name_extractor, "")

        # Include all fields as data
        if isinstance(hedge, dict):
            h_data = {k: v for k, v in hedge.items()}
        else:
            h_data = {k: v for k, v in vars(hedge).items() if not k.startswith("_")}

        normalized_hyperedges.append({"nodes": h_node_ids, "label": h_label, "data": h_data})

    return {"nodes": normalized_nodes, "hyperedges": normalized_hyperedges}
