"""Storage engine for node-only visualization."""

from typing import Any, Dict, List, Optional, Callable, TypeVar
from pydantic import BaseModel
import random
import logging

from ontosight.utils import get_model_id, default_label_formatter
from .base import BaseStorage

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)


class NodeStorage(BaseStorage):
    """Storage engine for node-only visualization (no edges)."""

    def __init__(
        self,
        node_list: List[NodeSchema],
        node_id_extractor: Callable[[NodeSchema], str],
        node_label_extractor: Optional[Callable[[NodeSchema], str]] = None,
    ):
        """Initialize node storage from raw schema items.

        Args:
            node_list: List of node schema objects
            node_id_extractor: Function to extract unique ID from node
            node_label_extractor: Optional function to extract display label from node
        """
        node_label_extractor = (
            node_label_extractor
            if node_label_extractor
            else lambda n: default_label_formatter(node_id_extractor(n))
        )
        
        # Store extractors as class variables for later use
        self.node_id_extractor = node_id_extractor
        self.node_label_extractor = node_label_extractor

        self.nodes = {}  # {id: {"id": id, "data": {"label": label, "raw": raw_data}}}

        for node in node_list:
            node_id = node_id_extractor(node)
            label = node_label_extractor(node)
            raw_data = node.model_dump() if hasattr(node, "model_dump") else dict(node)
            self.nodes[node_id] = {"id": node_id, "data": {"label": label, "raw": raw_data}}

        self.stats = self._compute_stats()
        logger.info(f"NodeStorage initialized: {len(self.nodes)} nodes")

    def _compute_stats(self) -> Dict[str, Any]:
        """Compute node statistics."""
        return {
            "total_nodes": len(self.nodes),
        }

    def get_element(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get node by ID."""
        return self.nodes.get(element_id)

    def get_details(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of a node."""
        return self.get_element(element_id)

    def get_stats(self) -> Dict[str, Any]:
        """Get node statistics."""
        return self.stats

    def get_sample(
        self, 
        center_ids: Optional[List[str]] = None, 
        n_nodes: int = 10,
        highlight_center: bool = False,
    ) -> Dict[str, Any]:
        """Get a sample of nodes.

        For node-only visualization, hops parameter is ignored (kwargs).

        Args:
            center_ids: List of node IDs to include first (and highlight)
            n_nodes: Total number of nodes to return (default: 10)
            highlight_center: If True, mark center nodes with highlighted=True

        Returns:
            Dict with 'nodes' key containing list of node objects
        """
        all_node_ids = list(self.nodes.keys())
        center_node_ids = set(center_ids) if center_ids else set()
        
        # 1. Start with requested center nodes (filtering out invalid ones)
        result_ids = {nid for nid in center_node_ids if nid in self.nodes}
        
        # 2. If we need more nodes to reach n_nodes, sample randomly from remaining
        if len(result_ids) < n_nodes:
            remaining_ids = [nid for nid in all_node_ids if nid not in result_ids]
            needed = n_nodes - len(result_ids)
            
            # Sample up to 'needed' amount, or take all remaining if fewer
            if remaining_ids:
                sampled_additional = random.sample(remaining_ids, min(len(remaining_ids), needed))
                result_ids.update(sampled_additional)

        # 3. Build return list
        nodes_to_return = []
        for node_id in result_ids:
            node_data = self.nodes[node_id]
            node_copy = dict(node_data)
            
            # Mark highlighted if this is a center node and highlight_center is True
            if highlight_center and node_id in center_node_ids:
                node_copy["highlighted"] = True
            
            nodes_to_return.append(node_copy)

        logger.info(f"[NodeStorage] Returning {len(nodes_to_return)} nodes (Target: {n_nodes})")
        return {"nodes": nodes_to_return}

    def get_sample_from_data(
        self, 
        node_list: List[NodeSchema],
        highlight_center: bool = False,
    ) -> Dict[str, Any]:
        """Get sample based on raw data objects.

        For node visualization: get_sample_from_data(node_list, highlight_center=False)

        Args:
            node_list: Raw node data objects to extract IDs from
            highlight_center: If True, mark matching elements with highlighted=True

        Returns:
            Sample data with highlighted nodes if matched
        """
        # Extract IDs from provided nodes
        center_ids = [self.node_id_extractor(node) for node in node_list]
        return self.get_sample(center_ids=center_ids, highlight_center=highlight_center)

    def get_all_nodes_paginated(
        self, page: int = 0, page_size: int = 30
    ) -> Dict[str, Any]:
        """Get paginated list of all nodes.

        Args:
            page: Page number (0-indexed)
            page_size: Items per page

        Returns:
            Dict with 'items' (paginated nodes) and 'total' (total count)
        """
        node_list = list(self.nodes.values())
        total = len(node_list)
        start = page * page_size
        end = start + page_size
        
        # Consistent format with GraphStorage for frontend compatibility
        # Extract 'label' from nested 'data' and place at root level
        items = []
        for node in node_list[start:end]:
            item = dict(node)
            item["label"] = node.get("data", {}).get("label", node.get("id"))
            item["type"] = "node"
            items.append(item)

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_next": end < total,
        }
