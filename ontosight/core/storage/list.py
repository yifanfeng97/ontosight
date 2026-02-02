"""Storage engine for list visualization."""

from typing import Any, Dict, List, Optional, Callable, TypeVar
from pydantic import BaseModel
import logging

from ...utils import gen_random_id
from .base import BaseStorage

logger = logging.getLogger(__name__)

ItemSchema = TypeVar("ItemSchema", bound=BaseModel)


class ListStorage(BaseStorage):
    """Storage engine for list visualization."""

    def __init__(
        self,
        item_list: List[ItemSchema],
        item_name_extractor: Callable[[ItemSchema], str],
    ):
        """Initialize list storage from raw schema items.

        Args:
            item_list: List of item schema objects
            item_name_extractor: Function to extract display label from item
        """
        self.item_name_extractor = item_name_extractor
        self.items = {}  # {id: {"id": id, "data": {"label": label, "raw": raw_data}}}
        self.item_order = []  # Maintain insertion order for deterministic pagination
        self.name_to_id = {}  # Map from item name to ID for reverse lookup

        for item in item_list:
            label = item_name_extractor(item)
            item_id = gen_random_id()
            self.name_to_id[label] = item_id
            raw_data = item.model_dump() if hasattr(item, "model_dump") else dict(item)
            self.items[item_id] = {"id": item_id, "data": {"label": label, "raw": raw_data}}
            self.item_order.append(item_id)

        self.stats = self._compute_stats()
        logger.info(f"ListStorage initialized: {len(self.items)} items")

    def _compute_stats(self) -> Dict[str, Any]:
        """Compute list statistics."""
        if not self.items:
            return {"total_items": 0}

        # Get sample item to count fields
        sample_item = next(iter(self.items.values()), {})
        sample_raw = sample_item.get("data", {}).get("raw", {})
        num_fields = len(sample_raw) if sample_raw else 0

        return {
            "total_items": len(self.items),
            "fields": num_fields,
        }

    def get_element(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get item by ID."""
        return self.items.get(element_id)

    def get_details(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of an item."""
        return self.get_element(element_id)

    def get_stats(self) -> Dict[str, Any]:
        """Get list statistics."""
        return self.stats

    def get_sample(self, center_ids: Optional[List[str]] = None, hops: int = 2) -> Dict[str, Any]:
        """Get sample of items (hops parameter ignored for lists)."""
        if not center_ids:
            # Return first page of items
            items_sample = [self.items[item_id] for item_id in self.item_order[:10]]
        else:
            items_sample = [self.items[item_id] for item_id in center_ids if item_id in self.items]

        logger.info(f"[ListStorage] get_sample: {len(items_sample)} items")
        return {"items": items_sample}

    def get_all_items_paginated(self, page: int = 0, page_size: int = 30) -> Dict[str, Any]:
        """Get paginated list of all items (with id for internal use, not displayed)."""
        item_list = [
            {
                "id": item.get("id"),  # Keep for backend queries, not displayed
                "label": item.get("data", {}).get("label", item.get("id")),
                "type": "item",
                **item.get("data", {}),  # Include all data fields
            }
            for item_id in self.item_order
            for item in [self.items[item_id]]
        ]
        total = len(item_list)
        start = page * page_size
        end = start + page_size

        return {
            "items": item_list[start:end],
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
        }

    def get_sample_from_data(self, data_list: List[Any], hops: int = 2) -> Dict[str, Any]:
        """Get sample based on a list of raw item data objects.
        
        Args:
            data_list: List of ItemSchema objects from search results
            hops: Ignored for list (included for interface compatibility)
            
        Returns:
            Dict with 'items' key containing the requested items
        """
        # Extract IDs from item objects using name extractor and name_to_id mapping
        ids = []
        for item in data_list:
            try:
                item_name = self.item_name_extractor(item)
                if item_name in self.name_to_id:
                    ids.append(self.name_to_id[item_name])
            except Exception as e:
                logger.warning(f"Failed to extract name from item: {e}")
                continue
        
        # Return items for these IDs
        return self.get_sample(center_ids=ids, hops=hops)
