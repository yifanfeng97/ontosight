"""Internal API response models for FastAPI endpoints.

These models define the JSON responses returned by the REST API.
They are distinct from the public models (Node, Edge, etc.) and serve
as contracts between frontend and backend.

Models:
    - MetaResponse: Schema + metadata for visualization
    - SearchRequest: Search query input
    - ChatRequest: Chat query input
    - ChatResponse: Chat response with optional sources
    - GraphData: Graph visualization payload
    - HypergraphData: Hypergraph visualization payload

Example:
    >>> from ontosight.server.models.api import MetaResponse
    >>>
    >>> meta = MetaResponse(
    ...     type="graph",
    ...     features={"search": True, "chat": True},
    ...     schemas={...}
    ... )
"""

from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field


class MetaResponse(BaseModel):
    """Metadata response for /api/meta endpoint.

    Contains visualization type, available features, and schemas for data types.
    The frontend uses this to:
    1. Determine which visualization component to render
    2. Decide which UI features (search, chat) to enable
    3. Dynamically render property panels based on schemas

    Attributes:
        type: Visualization type (graph or hypergraph)
        features: Dict of feature flags (e.g., {"search": true, "chat": false})
        schemas: Dict mapping element types to their JSON Schemas
                 For graph: {"nodes": {...}, "edges": {...}}
                 For hypergraph: {"nodes": {...}, "edges": {...}, "hyperedges": {...}}
    """

    type: Literal["graph", "hypergraph", "nodes"] = Field(
        ..., description="Type of visualization"
    )
    features: Dict[str, bool] = Field(
        default_factory=dict,
        description="Feature availability flags (e.g., search, chat)",
    )
    schemas: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Map of element types to their JSON Schemas",
    )
    stats: Dict[str, Any] = Field(
        default_factory=dict,
        description="Statistics about the data (e.g. node count, edge count)",
    )


class SearchRequest(BaseModel):
    """Search query request model.

    Attributes:
        query: Search query string
    """

    query: str = Field(..., description="Search query string", min_length=1)


class ChatRequest(BaseModel):
    """Chat query request model.

    Attributes:
        query: User question or message
    """

    query: str = Field(..., description="User question or message", min_length=1)


class ChatResponse(BaseModel):
    """Chat response model.

    Attributes:
        response: Chat response text
        data: Optional visualization data with highlighted related elements
    """

    response: str = Field(..., description="Response text")
    data: Optional[Dict[str, Any]] = Field(
        None, description="Visualization data (GraphData or HypergraphData) with highlighted related elements"
    )


class NodeData(BaseModel):
    """Data for node-only visualization."""
    nodes: List[Dict[str, Any]] = Field(..., description="List of node objects (may include 'highlighted' bool)")


class GraphData(BaseModel):
    """Data for graph visualization."""
    nodes: List[Dict[str, Any]] = Field(..., description="List of node objects (may include 'highlighted' bool)")
    edges: List[Dict[str, Any]] = Field(..., description="List of edge objects (may include 'highlighted' bool)")


class HypergraphData(BaseModel):
    """Data for hypergraph visualization."""
    nodes: List[Dict[str, Any]] = Field(..., description="List of node objects (may include 'highlighted' bool)")
    edges: List[Dict[str, Any]] = Field(..., description="List of edge objects (for layout)")
    hyperedges: List[Dict[str, Any]] = Field(..., description="List of hyperedge objects (may include 'highlighted' bool)")


__all__ = [
    "MetaResponse",
    "SearchRequest",
    "ChatRequest",
    "ChatResponse",
    "NodeData",
    "GraphData",
    "HypergraphData",
]
