"""Debug test to check the full flow."""

import sys
import logging

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

logger.info("Starting debug test")

# Test the schema instances
from ontosight.core import view_graph
from pydantic import BaseModel, Field

class NodeSchema(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Label of the node")
    role: str = Field(..., description="Role of the node")

class EdgeSchema(BaseModel):
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    label: str = Field(..., description="Label of the edge")

nodes = [
    NodeSchema(id="1", label="Alice", role="Admin"),
    NodeSchema(id="2", label="Bob", role="User"),
]

edges = [
    EdgeSchema(source="1", target="2", label="manages"),
]

logger.info(f"Nodes created: {nodes}")
logger.info(f"Edges created: {edges}")

# Now test the view_graph function
logger.info("Calling view_graph...")

try:
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=NodeSchema,
        edge_schema=EdgeSchema,
        node_name_extractor=lambda node: node.label,
        edge_name_extractor=lambda edge: edge.label,
        nodes_in_edge_extractor=lambda edge: (edge.source, edge.target),
    )
    logger.info("view_graph call succeeded")
except Exception as e:
    logger.error(f"view_graph call failed: {e}", exc_info=True)
    sys.exit(1)

logger.info("Debug test complete!")
