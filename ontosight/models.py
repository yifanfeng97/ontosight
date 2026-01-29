"""Public Pydantic data models for OntoSight visualization engine.

These models are exported from the main package and define the data contracts
for the visualization system. All models support full type hints and are
compatible with JSON serialization.

Models:
    - Node[T]: Generic node with id, data, and label
    - Edge[T]: Generic edge connecting nodes
    - TreeNode[T]: Hierarchical node for tree structures
    - HyperEdge[T]: Multi-node edge (edge connecting >2 nodes)

Example:
    >>> from ontosight.models import Node, Edge
    >>>
    >>> nodes = [
    ...     Node(id="1", data={"name": "Alice"}, label="Alice"),
    ...     Node(id="2", data={"name": "Bob"}, label="Bob"),
    ... ]
    >>>
    >>> edges = [
    ...     Edge(
    ...         source="1",
    ...         target="2",
    ...         data={"relation": "knows"},
    ...         label="knows"
    ...     )
    ... ]
"""

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field


T = TypeVar("T")


class Node(BaseModel, Generic[T]):
    """Generic node for graph visualization.

    Attributes:
        id: Unique node identifier
        data: Domain-specific data (can be any type T)
        label: Display label for UI rendering
            - Computed by key_extractor function at runtime
            - Should be human-readable, unique among siblings if hierarchical

    Example:
        >>> class Person:
        ...     def __init__(self, name: str, age: int):
        ...         self.name = name
        ...         self.age = age
        >>>
        >>> person = Person("Alice", 30)
        >>> node = Node(
        ...     id="person_1",
        ...     data=person,
        ...     label="Alice (age 30)"
        ... )
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str = Field(..., description="Unique node identifier within the graph")
    data: Any = Field(..., description="Domain-specific data (type depends on use case)")
    label: str = Field(..., description="Display label for UI rendering")


class Edge(BaseModel, Generic[T]):
    """Generic edge connecting two nodes.

    Attributes:
        source: Source node id
        target: Target node id
        data: Domain-specific edge metadata
        label: Display label for edge (e.g., "friend", "parent")

    Example:
        >>> edge = Edge(
        ...     source="person_1",
        ...     target="person_2",
        ...     data={"relation": "friend", "since": 2020},
        ...     label="friend since 2020"
        ... )
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    source: str = Field(..., description="Source node identifier")
    target: str = Field(..., description="Target node identifier")
    data: Any = Field(..., description="Edge metadata")
    label: str = Field(..., description="Display label for edge")


class TreeNode(BaseModel, Generic[T]):
    """Hierarchical node for tree structures.

    Attributes:
        id: Unique node identifier
        data: Domain-specific data
        label: Display label
        children: Child nodes (recursive structure)

    Example:
        >>> root = TreeNode(
        ...     id="root",
        ...     data={"name": "Root"},
        ...     label="Root",
        ...     children=[
        ...         TreeNode(
        ...             id="child_1",
        ...             data={"name": "Child 1"},
        ...             label="Child 1",
        ...             children=[]
        ...         )
        ...     ]
        ... )
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str = Field(..., description="Unique node identifier")
    data: Any = Field(..., description="Node data")
    label: str = Field(..., description="Display label")
    children: List["TreeNode[T]"] = Field(default_factory=list, description="Child nodes")


# Enable recursive model update for TreeNode
TreeNode.model_rebuild()


class HyperEdge(BaseModel, Generic[T]):
    """Multi-node edge connecting more than 2 nodes.

    Attributes:
        nodes: List of node IDs connected by this hyperedge
        data: Hyperedge metadata
        label: Display label

    Example:
        >>> # A collaboration between 3 researchers
        >>> hyperedge = HyperEdge(
        ...     nodes=["researcher_1", "researcher_2", "researcher_3"],
        ...     data={"project": "AI Safety"},
        ...     label="AI Safety collaboration"
        ... )
    """

    model_config = ConfigDict(arbitrary_types_allowed=True)

    nodes: List[str] = Field(..., description="List of node IDs in this hyperedge", min_length=2)
    data: Any = Field(..., description="Hyperedge metadata")
    label: str = Field(..., description="Display label")


__all__ = [
    "Node",
    "Edge",
    "TreeNode",
    "HyperEdge",
]
