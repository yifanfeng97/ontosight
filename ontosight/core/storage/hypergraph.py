"""Storage engine for hypergraph visualization."""

from typing import Any, Dict, List, Optional, Set, Tuple, Callable, TypeVar
from pydantic import BaseModel
import random
import logging

from ontosight.utils import get_model_id, get_random_id
from .base import BaseStorage

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)
EdgeSchema = TypeVar("EdgeSchema", bound=BaseModel)


class HypergraphStorage(BaseStorage):
    """Storage engine for hypergraph visualization."""

    def __init__(
        self,
        node_list: List[NodeSchema],
        edge_list: List[EdgeSchema],
        node_name_extractor: Callable[[NodeSchema], str],
        edge_name_extractor: Callable[[EdgeSchema], str],
        nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str, ...]],
    ):
        """Initialize hypergraph storage from raw schema items.

        Args:
            node_list: List of node schema objects
            edge_list: List of hyperedge schema objects
            node_name_extractor: Function to extract display label from node
            edge_name_extractor: Function to extract display label from hyperedge
            nodes_in_edge_extractor: Function to extract node tuple from hyperedge
        """
        # Store extractors as class variables for later use
        self.node_name_extractor = node_name_extractor
        self.edge_name_extractor = edge_name_extractor
        self.nodes_in_edge_extractor = nodes_in_edge_extractor

        # Create label->ID mapping
        self.label_to_id = {}
        self.nodes = {}
        self.node_deg = {}

        for node in node_list:
            label = node_name_extractor(node)
            node_id = get_model_id(node)
            self.label_to_id[label] = node_id
            self.node_deg[node_id] = 0
            raw_data = node.model_dump() if hasattr(node, "model_dump") else dict(node)
            self.nodes[node_id] = {"id": node_id, "data": {"label": label, "raw": raw_data}}

        # Compute node degrees from hyperedges
        for edge in edge_list:
            nodes_in_edge = nodes_in_edge_extractor(edge)
            for node_label in nodes_in_edge:
                node_id = self.label_to_id.get(node_label)
                if node_id:
                    self.node_deg[node_id] += 1

        # Build hyperedges and auxiliary layout edges
        self.hyperedges = {}  # {id: {"id": id, "linked_nodes": [node_ids], "data": {"label": label, "raw": raw}}}
        self.node_to_hyperedges: Dict[str, Set[str]] = {node_id: set() for node_id in self.nodes}

        for i, edge in enumerate(edge_list):
            edge_label = edge_name_extractor(edge)
            nodes_in_edge = nodes_in_edge_extractor(edge)

            # Map labels to IDs
            node_ids = [
                self.label_to_id[label] for label in nodes_in_edge if label in self.label_to_id
            ]
            if not node_ids:
                logger.warning(f"Hyperedge has no valid nodes: {edge_label}")
                continue

            he_id = get_model_id(edge)
            raw_data = edge.model_dump() if hasattr(edge, "model_dump") else dict(edge)

            self.hyperedges[he_id] = {
                "id": he_id,
                "linked_nodes": node_ids,
                "data": {"label": edge_label, "raw": raw_data},
            }

            # Register hyperedge in node mapping
            for node_id in node_ids:
                self.node_to_hyperedges[node_id].add(he_id)

        self.stats = self._compute_stats()
        logger.info(
            f"HypergraphStorage initialized: {len(self.nodes)} nodes, {len(self.hyperedges)} hyperedges"
        )

    def _compute_stats(self) -> Dict[str, Any]:
        """Compute hypergraph statistics."""
        if not self.nodes:
            return {
                "total_nodes": 0,
                "total_hyperedges": 0,
                "avg_node_degree": 0,
                "avg_hyperedge_degree": 0,
            }

        total_node_degree = sum(self.node_deg.values())
        total_hyperedge_degree = sum(
            len(he.get("linked_nodes", [])) for he in self.hyperedges.values()
        )

        return {
            "total_nodes": len(self.nodes),
            "total_hyperedges": len(self.hyperedges),
            "avg_node_degree": total_node_degree / len(self.nodes) if self.nodes else 0,
            "avg_hyperedge_degree": total_hyperedge_degree / len(self.hyperedges)
            if self.hyperedges
            else 0,
        }

    def get_element(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get node or hyperedge by ID."""
        if element_id in self.nodes:
            return self.nodes[element_id]
        elif element_id in self.hyperedges:
            return self.hyperedges[element_id]
        return None

    def get_details(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of a node or hyperedge."""
        return self.get_element(element_id)

    def get_stats(self) -> Dict[str, Any]:
        """Get hypergraph statistics."""
        return self.stats

    def get_sample(self, center_ids: Optional[List[str]] = None, hops: int = 2, highlight_center: bool = False) -> Dict[str, Any]:
        """Get sub-hypergraph around given nodes/hyperedges via hyperedge neighborhoods.

        Args:
            center_ids: List of node or hyperedge IDs to use as starting points
            hops: Number of hops to expand via hyperedge connections
            highlight_center: If True, mark center nodes/hyperedges with highlighted=True

        Returns:
            Dict with 'nodes', 'edges', and 'hyperedges' keys
        """
        if not center_ids:
            # Select random node with degree > 0 (not isolated)
            nodes_with_hyperedges = [
                nid for nid in self.nodes.keys() if self.node_deg.get(nid, 0) > 0
            ]
            center_ids = [random.choice(nodes_with_hyperedges)] if nodes_with_hyperedges else []

        # Separate node IDs and hyperedge IDs from center_ids
        visited_nodes = set()
        visited_hyperedges = set()
        center_node_ids = set()
        center_hyperedge_ids = set()

        for element_id in center_ids:
            if element_id in self.nodes:
                visited_nodes.add(element_id)
                center_node_ids.add(element_id) if highlight_center else None
            elif element_id in self.hyperedges:
                # If hyperedge ID, add all its linked nodes
                visited_hyperedges.add(element_id)
                center_hyperedge_ids.add(element_id) if highlight_center else None
                hyperedge_data = self.hyperedges[element_id]
                for node_in_he in hyperedge_data.get("linked_nodes", []):
                    visited_nodes.add(node_in_he)

        if not visited_nodes:
            return {"nodes": [], "edges": [], "hyperedges": []}

        # BFS in hypergraph space
        current_layer = set(visited_nodes)

        for _ in range(hops):
            next_layer = set()

            # From current nodes, find all hyperedges
            for node_id in current_layer:
                for he_id in self.node_to_hyperedges.get(node_id, set()):
                    if he_id not in visited_hyperedges:
                        visited_hyperedges.add(he_id)
                        # Add all nodes in this hyperedge
                        for node_in_he in self.hyperedges[he_id].get("linked_nodes", []):
                            if node_in_he not in visited_nodes:
                                next_layer.add(node_in_he)
                                visited_nodes.add(node_in_he)

            current_layer = next_layer

        # Collect nodes and hyperedges
        sub_nodes = []
        for node_id in visited_nodes:
            node_data = dict(self.nodes[node_id])  # Shallow copy
            if highlight_center and node_id in center_node_ids:
                node_data["highlighted"] = True
            sub_nodes.append(node_data)

        sub_hyperedges = []
        for he_id in visited_hyperedges:
            he_data = dict(self.hyperedges[he_id])  # Shallow copy
            if highlight_center and he_id in center_hyperedge_ids:
                he_data["highlighted"] = True
            sub_hyperedges.append(he_data)

        # Generate auxiliary layout edges for sub-hypergraph
        sub_edges = []
        for sub_hyperedge in sub_hyperedges:
            node_list = sub_hyperedge.get("linked_nodes", [])
            if not node_list:
                continue
            center_node_id = min(node_list, key=lambda nid: self.node_deg.get(nid, 0))
            for node_id in node_list:
                if node_id != center_node_id:
                    sub_edges.append(
                        {
                            "id": get_random_id(),
                            "source": center_node_id,
                            "target": node_id,
                        }
                    )

        logger.info(
            f"[HypergraphStorage] get_sample: {len(sub_nodes)} nodes, {len(sub_hyperedges)} hyperedges, {len(sub_edges)} layout edges"
        )
        return {
            "nodes": sub_nodes,
            "edges": sub_edges,
            "hyperedges": sub_hyperedges,
        }

    def get_all_nodes_paginated(self, page: int = 0, page_size: int = 30) -> Dict[str, Any]:
        """Get paginated list of all nodes."""
        node_items = list(self.nodes.values())
        total = len(node_items)
        start = page * page_size
        end = start + page_size

        items = []
        for node in node_items[start:end]:
            item = dict(node)
            item["label"] = node.get("data", {}).get("label", node.get("id"))
            item["type"] = "node"
            items.append(item)

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
        }

    def get_all_hyperedges_paginated(self, page: int = 0, page_size: int = 30) -> Dict[str, Any]:
        """Get paginated list of all hyperedges."""
        he_items = list(self.hyperedges.values())
        total = len(he_items)
        start = page * page_size
        end = start + page_size

        items = []
        for he in he_items[start:end]:
            item = dict(he)
            item["label"] = he.get("data", {}).get("label", he.get("id"))
            item["type"] = "hyperedge"
            items.append(item)

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
        }

    def get_sample_from_data(
        self,
        node_list: List[NodeSchema],
        hyperedge_list: List[EdgeSchema],
        hops: int = 2,
        highlight_center: bool = False,
    ) -> Dict[str, Any]:
        """Get sample based on raw node and hyperedge data objects.

        Extracts IDs from the provided raw data using extractors and label_to_id mapping.

        Args:
            node_list: List of NodeSchema objects to extract IDs from
            hyperedge_list: List of EdgeSchema objects to extract IDs from
            hops: Number of hops for neighborhood expansion
            highlight_center: If True, mark center elements with highlighted=True

        Returns:
            Dict with 'nodes', 'edges', and 'hyperedges' keys containing the sub-hypergraph,
            may include 'highlighted' bool for center elements if highlight_center=True
        """
        # Extract node IDs using node extractor and label_to_id mapping
        node_ids = []
        for node in node_list:
            node_id = get_model_id(node)
            if node_id in self.nodes:
                node_ids.append(node_id)
            else:
                logging.warning(f"Node {self.node_label_extractor(node)} not found in hypergraph")

        # Extract hyperedge IDs using edge extractor and label lookup
        hyperedge_ids = []
        for hyperedge in hyperedge_list:
            hyperedge_id = get_model_id(hyperedge)
            if hyperedge_id in self.hyperedges:
                hyperedge_ids.append(hyperedge_id)
            else:
                logging.warning(
                    f"Hyperedge {self.hyperedge_label_extractor(hyperedge)} not found in hypergraph"
                )

        # Combine node and hyperedge IDs and call get_sample
        all_ids = node_ids + hyperedge_ids
        if all_ids:
            return self.get_sample(center_ids=all_ids, hops=hops, highlight_center=highlight_center)
        else:
            return {"nodes": [], "edges": [], "hyperedges": []}
