"""Node visualization - creates interactive node-only visualizations."""

from typing import Any, Callable, Dict, List, Optional, TypeVar, Type
from pydantic import BaseModel
import logging

from ontosight.server.state import global_state
from ontosight.core.storage import NodeStorage
from ontosight.utils import (
    ensure_server_running,
    open_browser,
    wait_for_user,
)

logger = logging.getLogger(__name__)

NodeSchema = TypeVar("NodeSchema", bound=BaseModel)


def view_nodes(
    node_list: List[NodeSchema],
    node_schema: Type[NodeSchema],
    node_id_extractor: Callable[[NodeSchema], str],
    node_label_extractor: Optional[Callable[[NodeSchema], str]] = None,
    on_search: Optional[Callable[[str, Dict], Any]] = None,
    on_chat: Optional[Callable[[str, Dict], Any]] = None,
    context: Optional[Dict[str, Any]] = None,
) -> None:
    """Create an interactive node-only visualization.

    A node visualization displays a collection of nodes without edges,
    useful for:
    - Embedding/semantic space visualization
    - Entity clustering and grouping
    - Large-scale node collections without relationships

    Each node can have properties and interactions.

    Args:
        node_list: List of node objects/dicts
        node_schema: Schema describing node structure (for detail view)
        node_id_extractor: Function to extract unique ID from a node object (required)
        node_label_extractor: Optional function to extract display label from a node object
        on_search: Optional callback for search queries
        on_chat: Optional callback for chat queries
        context: Optional context data to store with visualization

    Example:
        >>> from ontosight import view_nodes
        >>> from pydantic import BaseModel
        >>>
        >>> class Person(BaseModel):
        ...     id: str
        ...     name: str
        ...     age: int
        >>>
        >>> people = [
        ...     Person(id="p1", name="Alice", age=30),
        ...     Person(id="p2", name="Bob", age=25),
        ... ]
        >>>
        >>> view_nodes(
        ...     node_list=people,
        ...     node_schema=Person,
        ...     node_id_extractor=lambda p: p.id,
        ...     node_label_extractor=lambda p: f"{p.name} ({p.age})",
        ... )
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

    # Create storage
    try:
        storage = NodeStorage(
            node_list=node_list,
            node_id_extractor=node_id_extractor,
            node_label_extractor=node_label_extractor,
        )
        global_state.set_storage(storage)

        # Get stats for metadata
        stats = storage.get_stats()
        meta_data = {
            "Nodes": stats["total_nodes"],
        }

        global_state.set_visualization_type("nodes")
        global_state.set_visualization_data("meta_data", meta_data)
        logger.info("Node visualization setup complete")

        open_browser()
        wait_for_user()

    except Exception as e:
        logger.error(f"Failed to setup node visualization: {e}")
        raise
