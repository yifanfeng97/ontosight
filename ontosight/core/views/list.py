"""List visualization - creates interactive list views."""

import logging
from typing import Any, Callable, Optional, TypeVar, List, Type
from pydantic import BaseModel

from ontosight.server.state import global_state
from ontosight.core.storage import ListStorage
from ontosight.utils import (
    ensure_server_running,
    open_browser,
    wait_for_user,
)

logger = logging.getLogger(__name__)

ItemSchema = TypeVar("ItemSchema", bound=BaseModel)


def view_list(
    item_list: List[ItemSchema],
    item_schema: Type[ItemSchema],
    item_name_extractor: Callable[[ItemSchema], str],
    on_search: Optional[Callable[[str, dict], Any]] = None,
    on_chat: Optional[Callable[[str, dict], Any]] = None,
    context: Optional[dict[str, Any]] = None,
) -> None:
    """Create an interactive list visualization.

    Displays items as a scrollable list with optional search/chat interactions.

    Args:
        item_list: List of items to display
        item_schema: Schema describing item structure (for detail view)
        item_name_extractor: Function to extract display label from an item object (required)
        on_search: Optional callback for search queries
        on_chat: Optional callback for chat queries
        context: Optional context data to store with visualization
    """
    ensure_server_running()
    global_state.clear()

    # Validate input
    if not isinstance(item_list, (list, tuple)):
        raise TypeError(f"view_list requires list or tuple, got {type(item_list)}")

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
    if item_schema is not None:
        global_state.set_context(item_schema=item_schema)

    # Normalize data and create storage
    try:
        # Create storage directly from raw schema items
        storage = ListStorage(
            item_list=item_list,
            item_name_extractor=item_name_extractor,
        )
        global_state.set_storage(storage)

        # Get formatted data from storage for metadata
        stats = storage.get_stats()
        meta_data = {
            "Items": stats["total_items"],
            "Fields": stats.get("fields", 0),
        }

        # Get all items for initial display
        items_data = storage.get_all_items_paginated(page=0, page_size=1000)

        global_state.set_visualization_type("list")
        global_state.set_visualization_data("items", items_data["items"])
        global_state.set_visualization_data("meta_data", meta_data)

        logger.info("List visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup list visualization: {e}")
        raise


def format_data_for_ui(
    items: List[ItemSchema],
    name_extractor: Callable[[ItemSchema], str],
) -> dict[str, Any]:
    """Convert a list of items into normalized dict format.

    Used by view_list.
    Data structure complies with G6 V5:
    {
        "id": "...",
        "data": {
            "label": "...",
            "raw": { ...original_pydantic_dump... }
        }
    }

    Args:
        items: List of objects/dicts to normalize
        name_extractor: Function to extract display label from an item object (required)

    Returns:
        Dict with 'items' key containing normalized list

    Example:
        >>> format_data_for_ui([{"name": "A"}, {"name": "B"}], name_extractor="name")
        {'items': [{'id': '...', 'data': {'label': 'A', 'raw': {...}}}, ...]}
    """
    normalized_items = []

    for idx, item in enumerate(items):
        # Extract display label using required extractor
        _label = name_extractor(item)

        _id = gen_random_id()
        _data = item.model_dump()

        normalized_items.append({"id": _id, "data": {"label": _label, "raw": _data}})

    meta_data = {"Items": len(items), "Fields": len(_data)}

    return normalized_items, meta_data
