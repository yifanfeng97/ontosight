"""Storage engine for graph visualization."""

from typing import Any, Dict, List, Optional, Set, Tuple, Callable, TypeVar
from pydantic import BaseModel
import random
import logging

from ...utils import get_model_id
from .base import BaseStorage

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)
EdgeSchema = TypeVar("EdgeSchema", bound=BaseModel)


class GraphStorage(BaseStorage):
    """Storage engine for graph visualization."""

    def __init__(
        self,
        node_list: List[NodeSchema],
        edge_list: List[EdgeSchema],
        node_label_extractor: Callable[[NodeSchema], str],
        edge_label_extractor: Callable[[EdgeSchema], str],
        nodes_in_edge_extractor: Callable[[EdgeSchema], Tuple[str, str]],
    ):
        """Initialize graph storage from raw schema items.

        Args:
            node_list: List of node schema objects
            edge_list: List of edge schema objects
            node_label_extractor: Function to extract display label from node
            edge_label_extractor: Function to extract display label from edge
            nodes_in_edge_extractor: Function to extract (source, target) from edge
        """
        # Store extractors as class variables for later use
        self.node_label_extractor = node_label_extractor
        self.edge_label_extractor = edge_label_extractor
        self.nodes_in_edge_extractor = nodes_in_edge_extractor

        # Create label->ID mapping (stable based on label hash)
        self.label_to_id = {}
        self.nodes = {}  # {id: {"id": id, "data": {"label": label, "raw": raw_data}}}
        self.deg_node = {}

        for node in node_list:
            label = node_label_extractor(node)
            # Generate stable ID based on label
            node_id = get_model_id(node)
            self.label_to_id[label] = node_id
            raw_data = node.model_dump() if hasattr(node, "model_dump") else dict(node)
            self.nodes[node_id] = {"id": node_id, "data": {"label": label, "raw": raw_data}}
            self.deg_node[node_id] = 0

        # Build edges with formatted structure
        self.edges = {}  # {id: {"id": id, "source": src_id, "target": tgt_id, "data": {...}}}
        self.adjacency: Dict[str, Set[str]] = {node_id: set() for node_id in self.nodes}
        self.incident_edges: Dict[str, List[str]] = {node_id: [] for node_id in self.nodes}

        for i, edge in enumerate(edge_list):
            edge_label = edge_label_extractor(edge)
            source_label, target_label = nodes_in_edge_extractor(edge)

            if source_label not in self.label_to_id or target_label not in self.label_to_id:
                logger.warning(f"Edge references missing nodes: {source_label} -> {target_label}")
                continue

            source_id = self.label_to_id[source_label]
            target_id = self.label_to_id[target_label]
            edge_id = get_model_id(edge)

            if source_id != target_id:
                self.deg_node[source_id] += 1
                self.deg_node[target_id] += 1

            raw_data = edge.model_dump() if hasattr(edge, "model_dump") else dict(edge)
            self.edges[edge_id] = {
                "id": edge_id,
                "source": source_id,
                "target": target_id,
                "data": {"label": edge_label, "raw": raw_data},
            }

            # Build adjacency
            self.adjacency[source_id].add(target_id)
            self.adjacency[target_id].add(source_id)
            self.incident_edges[source_id].append(edge_id)
            self.incident_edges[target_id].append(edge_id)

        self.stats = self._compute_stats()
        logger.info(f"GraphStorage initialized: {len(self.nodes)} nodes, {len(self.edges)} edges")

    def _compute_stats(self) -> Dict[str, Any]:
        """Compute graph statistics."""
        if not self.nodes:
            return {"total_nodes": 0, "total_edges": 0, "avg_degree": 0}

        total_degree = sum(self.deg_node.values())
        return {
            "total_nodes": len(self.nodes),
            "total_edges": len(self.edges),
            "avg_degree": total_degree / len(self.nodes) if self.nodes else 0,
        }

    def get_element(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get node or edge by ID."""
        if element_id in self.nodes:
            return self.nodes[element_id]
        elif element_id in self.edges:
            return self.edges[element_id]
        return None

    def get_details(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of a node or edge."""
        return self.get_element(element_id)

    def get_stats(self) -> Dict[str, Any]:
        """Get graph statistics."""
        return self.stats

    def get_sample(
        self, center_ids: Optional[List[str]] = None, hops: int = 2, highlight_center: bool = False
    ) -> Dict[str, Any]:
        """Get a subgraph around given center nodes/edges (or random if not provided).

        Args:
            center_ids: List of node or edge IDs to use as starting points
            hops: Number of hops to expand
            highlight_center: If True, mark center nodes/edges with highlighted=True

        Returns:
            Dict with 'nodes' and 'edges' keys containing the subgraph
        """
        if not center_ids:
            # Select random node with degree > 0 (not isolated)
            nodes_with_edges = [nid for nid in self.nodes.keys() if self.deg_node.get(nid, 0) > 0]
            center_ids = [random.choice(nodes_with_edges)] if nodes_with_edges else []

        if not center_ids:
            return {"nodes": [], "edges": []}

        # Separate node IDs and edge IDs from center_ids
        visited_nodes = set()
        visited_edges = set()
        center_node_ids = set()
        center_edge_ids = set()

        for element_id in center_ids:
            if element_id in self.nodes:
                visited_nodes.add(element_id)
                center_node_ids.add(element_id) if highlight_center else None
            elif element_id in self.edges:
                # If edge ID, add its source and target nodes
                visited_edges.add(element_id)
                center_edge_ids.add(element_id) if highlight_center else None
                edge_data = self.edges[element_id]
                visited_nodes.add(edge_data["source"])
                visited_nodes.add(edge_data["target"])

        if not visited_nodes:
            return {"nodes": [], "edges": []}

        # BFS to find all nodes within `hops` steps
        current_layer = set(visited_nodes)

        for _ in range(hops):
            next_layer = set()
            for node_id in current_layer:
                # Collect edges incident to this node and expand to neighbors
                for edge_id in self.incident_edges.get(node_id, []):
                    if edge_id not in visited_edges:
                        visited_edges.add(edge_id)
                        edge_data = self.edges[edge_id]
                        # Find the other node in this edge
                        other_node = (
                            edge_data["target"]
                            if edge_data["source"] == node_id
                            else edge_data["source"]
                        )
                        if other_node not in visited_nodes:
                            next_layer.add(other_node)
                            visited_nodes.add(other_node)
            current_layer = next_layer

        # Collect nodes and edges within sample
        sub_nodes = []
        for node_id in visited_nodes:
            node_data = dict(self.nodes[node_id])  # Shallow copy
            if highlight_center and node_id in center_node_ids:
                node_data["highlighted"] = True
            sub_nodes.append(node_data)

        sub_edges = []
        for edge_id in visited_edges:
            edge_data = dict(self.edges[edge_id])  # Shallow copy
            if highlight_center and edge_id in center_edge_ids:
                edge_data["highlighted"] = True
            sub_edges.append(edge_data)

        logger.info(f"[GraphStorage] get_sample: {len(sub_nodes)} nodes, {len(sub_edges)} edges")
        return {"nodes": sub_nodes, "edges": sub_edges}

    def get_all_nodes_paginated(self, page: int = 0, page_size: int = 30) -> Dict[str, Any]:
        """Get paginated list of all nodes."""
        # Use values directly to keep the nested {id, data} structure
        node_items = list(self.nodes.values())

        total = len(node_items)
        start = page * page_size
        end = start + page_size

        # For list view, we ensure 'label' and 'type' are at root
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

    def get_all_edges_paginated(self, page: int = 0, page_size: int = 30) -> Dict[str, Any]:
        """Get paginated list of all edges."""
        edge_items = list(self.edges.values())

        total = len(edge_items)
        start = page * page_size
        end = start + page_size

        items = []
        for edge in edge_items[start:end]:
            item = dict(edge)
            item["label"] = edge.get("data", {}).get("label", edge.get("id"))
            item["type"] = "edge"
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
        edge_list: List[EdgeSchema],
        hops: int = 2,
        highlight_center: bool = False,
    ) -> Dict[str, Any]:
        """Get sample based on raw node and edge data objects.

        Extracts IDs from the provided raw data using extractors and label_to_id mapping.

        Args:
            node_list: List of NodeSchema objects to extract IDs from
            edge_list: List of EdgeSchema objects to extract IDs from
            hops: Number of hops for neighborhood expansion
            highlight_center: If True, mark extracted nodes and edges with highlighted=True

        Returns:
            Dict with 'nodes' and 'edges' keys containing the subgraph
        """
        # Extract node IDs
        node_ids = []
        for node in node_list:
            node_id = get_model_id(node)
            if node_id in self.nodes:
                node_ids.append(node_id)
            else:
                logging.warning(f"Node {self.node_label_extractor(node)} not found in graph")

        # Extract edge IDs
        edge_ids = []
        for edge in edge_list:
            edge_id = get_model_id(edge)
            if edge_id in self.edges:
                edge_ids.append(edge_id)
            else:
                logging.warning(f"Edge {self.edge_label_extractor(edge)} not found in graph")

        # Combine node and edge IDs and call get_sample with highlight_center
        all_ids = node_ids + edge_ids
        if all_ids:
            return self.get_sample(center_ids=all_ids, hops=hops, highlight_center=highlight_center)
        else:
            return {"nodes": [], "edges": []}
