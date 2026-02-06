"""Storage engine for list visualization."""

from typing import Any, Dict, List, Optional, Callable, TypeVar
from pydantic import BaseModel
import logging

from ...utils import get_model_id
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
            item_id = get_model_id(item)
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

    def get_sample(
        self, center_ids: Optional[List[str]] = None, hops: int = 2, highlight_center: bool = False
    ) -> Dict[str, Any]:
        """Get sample of items (hops parameter ignored for lists).

        Args:
            center_ids: List of item IDs to return
            hops: Ignored for lists (included for interface compatibility)
            highlight_center: If True, mark center items with highlighted=True

        Returns:
            Dict with 'items' key containing the sample items
        """
        center_id_set = set(center_ids) if center_ids else set()

        if not center_ids:
            # Return up to 50 items as default sample
            sample_size = min(50, len(self.item_order))
            items_sample = [dict(self.items[item_id]) for item_id in self.item_order[:sample_size]]
        else:
            items_sample = [
                dict(self.items[item_id]) for item_id in center_ids if item_id in self.items
            ]

        # Inject highlighted flag if requested
        if highlight_center:
            for item in items_sample:
                if item.get("id") in center_id_set:
                    item["highlighted"] = True

        logger.info(f"[ListStorage] get_sample: {len(items_sample)} items")
        return {"items": items_sample}

    def get_all_items_paginated(self, page: int = 0, page_size: int = 30) -> Dict[str, Any]:
        """Get paginated list of all items."""
        item_objects = [self.items[item_id] for item_id in self.item_order]
        total = len(item_objects)
        start = page * page_size
        end = start + page_size

        return {
            "items": item_objects[start:end],
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
        }

    def get_sample_from_data(
        self, data_list: List[Any], hops: int = 2, highlight_center: bool = False
    ) -> Dict[str, Any]:
        """Get sample based on a list of raw item data objects.

        Args:
            data_list: List of ItemSchema objects from search results
            hops: Ignored for list (included for interface compatibility)
            highlight_center: If True, mark center items with highlighted=True

        Returns:
            Dict with 'items' key containing the requested items,
            may include 'highlighted' bool for center items if highlight_center=True
        """
        # Extract IDs
        ids = []
        for item in data_list:
            item_id = get_model_id(item)
            if item_id in self.items:
                ids.append(item_id)
            else:
                logging.warning(f"Item {self.item_name_extractor(item)} not found in list storage")

        # Return items for these IDs
        return self.get_sample(center_ids=ids, hops=hops, highlight_center=highlight_center)
