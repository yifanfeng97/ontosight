"""List visualization - creates interactive list views."""

import logging
from typing import Any, Callable, Optional, TypeVar, List, Type
from pydantic import BaseModel

from ontosight.server.state import global_state
from ontosight.utils import (
    Extractor,
    extract_value,
    ensure_server_running,
    open_browser,
    wait_for_user,
)

logger = logging.getLogger(__name__)

ItemSchema = TypeVar("ItemSchema", bound=BaseModel)

def view_list(
    item_list: List[ItemSchema],
    item_schema: Type[ItemSchema],
    item_name_extractor: Callable[[ItemSchema], str] | str,
    on_search: Optional[Callable[[str, dict], Any]] = None,
    on_chat: Optional[Callable[[str, dict], Any]] = None,
    context: Optional[dict[str, Any]] = None,
) -> None:
    """Create an interactive list visualization.

    Displays items as a scrollable list with optional search/chat interactions.

    Args:
        item_list: List of items to display
        item_schema: Schema describing item structure (for detail view)
        item_name_extractor: Extractor for item display label
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

    # Normalize data
    try:
        result = normalize_dict(
            items=item_list,
            name_extractor=item_name_extractor,
        )
        global_state.set_visualization_type("list")
        global_state.set_visualization_data("items", result.get("items", []))

        logger.info("List visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup list visualization: {e}")
        raise


def normalize_dict(
    items: list[Any],
    name_extractor: Optional[Extractor] = None,
) -> dict[str, Any]:
    """Convert a list of items into normalized dict format.

    Used by view_list.

    Args:
        items: List of objects/dicts to normalize
        name_extractor: Optional extractor for display label (default: "label" or str())

    Returns:
        Dict with 'items' key containing normalized list

    Example:
        >>> normalize_dict([{"name": "A"}, {"name": "B"}])
        {'items': [{'id': '...', 'label': 'A', 'data': {...}}, ...]}
    """
    normalized_items = []

    for idx, item in enumerate(items):
        # Auto-generate ID using object identity
        item_id = str(id(item))

        # Extract display label
        if name_extractor is None:
            # Default: try "label" key, fall back to str(item)
            if isinstance(item, dict):
                item_label = item.get("label", str(item))
            else:
                item_label = getattr(item, "label", str(item))
        else:
            item_label = extract_value(item, name_extractor, str(item))

        # Include all fields as data
        if isinstance(item, dict):
            item_data = {k: v for k, v in item.items()}
        elif hasattr(item, "__dict__"):
            item_data = {k: v for k, v in vars(item).items() if not k.startswith("_")}
        else:
            # For primitive types (strings, numbers, etc), don't include data
            item_data = {}

        normalized_items.append({"id": item_id, "label": item_label, "data": item_data})

    return {"items": normalized_items}
