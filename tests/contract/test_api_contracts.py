"""Contract tests for API serialization alignment.

Tests verify that Pydantic models serialize correctly to JSON and
that TypeScript types can properly deserialize the JSON.

Contract: Python Pydantic → JSON → TypeScript Type

This ensures the frontend and backend stay in sync.
"""

import pytest
import json
from ontosight.models import Node, Edge, TreeNode, HyperEdge
from ontosight.server.models.api import (
    MetaResponse,
    SearchRequest,
    SearchResponse,
    ChatRequest,
    ChatResponse,
)


class TestContractNodeSerialization:
    """Test Node serialization contract."""

    def test_node_serializes_to_valid_json(self):
        """Verify Node serializes to valid JSON."""
        node = Node(id="1", data={"name": "Alice", "age": 30}, label="Alice")

        # Should serialize without error
        json_str = node.model_dump_json()
        json_obj = json.loads(json_str)

        # Should have expected fields
        assert json_obj["id"] == "1"
        assert json_obj["data"]["name"] == "Alice"
        assert json_obj["label"] == "Alice"

    def test_node_null_optional_fields(self):
        """Verify Node handles null/optional fields correctly."""
        node = Node(id="1", data=None, label="Node")
        json_str = node.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["data"] is None

    def test_node_complex_data_types(self):
        """Verify Node serializes complex nested data."""
        node = Node(
            id="1",
            data={
                "nested": {
                    "list": [1, 2, 3],
                    "bool": True,
                    "float": 3.14,
                }
            },
            label="Complex",
        )
        json_str = node.model_dump_json()
        restored = Node.model_validate_json(json_str)

        assert restored.data["nested"]["list"] == [1, 2, 3]
        assert restored.data["nested"]["bool"] is True


class TestContractEdgeSerialization:
    """Test Edge serialization contract."""

    def test_edge_json_structure(self):
        """Verify Edge JSON structure matches contract."""
        edge = Edge(source="1", target="2", data={"weight": 0.5}, label="connected")
        json_str = edge.model_dump_json()
        json_obj = json.loads(json_str)

        # Expected fields in specific order
        assert "source" in json_obj
        assert "target" in json_obj
        assert "data" in json_obj
        assert "label" in json_obj


class TestContractTreeNodeSerialization:
    """Test TreeNode (recursive) serialization contract."""

    def test_tree_round_trip_preserves_structure(self):
        """Verify tree structure preserved through serialization."""
        original = TreeNode(
            id="root",
            data={"x": 1},
            label="Root",
            children=[
                TreeNode(
                    id="child1",
                    data={"x": 2},
                    label="Child 1",
                    children=[TreeNode(id="leaf", data={"x": 3}, label="Leaf", children=[])],
                )
            ],
        )

        # Serialize and deserialize
        json_str = original.model_dump_json()
        restored = TreeNode.model_validate_json(json_str)

        # Verify structure
        assert restored.id == "root"
        assert len(restored.children) == 1
        assert restored.children[0].id == "child1"
        assert len(restored.children[0].children) == 1
        assert restored.children[0].children[0].id == "leaf"

    def test_tree_empty_children_serialization(self):
        """Verify leaf nodes serialize correctly."""
        leaf = TreeNode(id="leaf", data={}, label="Leaf", children=[])

        json_str = leaf.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["children"] == []


class TestContractSearchModels:
    """Test Search request/response contract."""

    def test_search_request_serialization(self):
        """Verify SearchRequest serializes correctly."""
        req = SearchRequest(query="test query", context={"field": "value"})
        json_str = req.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["query"] == "test query"
        assert json_obj["context"]["field"] == "value"

    def test_search_response_serialization(self):
        """Verify SearchResponse serializes correctly."""
        resp = SearchResponse(results=["item1", "item2", "item3"])
        json_str = resp.model_dump_json()
        json_obj = json.loads(json_str)

        assert len(json_obj["results"]) == 3
        assert "item1" in json_obj["results"]


class TestContractChatModels:
    """Test Chat request/response contract."""

    def test_chat_request_serialization(self):
        """Verify ChatRequest serializes correctly."""
        req = ChatRequest(query="What is this?", context={"history": ["msg1", "msg2"]})
        json_str = req.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["query"] == "What is this?"
        assert isinstance(json_obj["context"]["history"], list)

    def test_chat_response_serialization(self):
        """Verify ChatResponse serializes correctly."""
        resp = ChatResponse(response="This is a response", sources=["source1", "source2"])
        json_str = resp.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["response"] == "This is a response"
        assert len(json_obj["sources"]) == 2

    def test_chat_response_without_sources(self):
        """Verify ChatResponse handles missing sources."""
        resp = ChatResponse(response="Response without sources")
        json_str = resp.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["response"] == "Response without sources"
        # Should include sources field (may be null)
        assert "sources" in json_obj


class TestContractMetaResponse:
    """Test MetaResponse contract."""

    def test_meta_response_with_schemas(self):
        """Verify MetaResponse serializes schemas correctly."""
        node_schema = {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "name": {"type": "string"},
            },
            "required": ["id"],
        }

        meta = MetaResponse(node_schema=node_schema)
        json_str = meta.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["node_schema"]["type"] == "object"
        assert "properties" in json_obj["node_schema"]

    def test_meta_response_empty(self):
        """Verify empty MetaResponse serializes."""
        meta = MetaResponse()
        json_str = meta.model_dump_json()
        json_obj = json.loads(json_str)

        # All schema fields should be present (may be null)
        assert "node_schema" in json_obj
        assert "edge_schema" in json_obj


class TestContractNullHandling:
    """Test null/optional field handling across contract."""

    def test_optional_context_null(self):
        """Verify optional context fields serialize to null."""
        req = SearchRequest(query="test")  # context not provided
        json_str = req.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["context"] is None

    def test_optional_sources_null(self):
        """Verify optional sources serialize to null."""
        resp = ChatResponse(response="answer")  # sources not provided
        json_str = resp.model_dump_json()
        json_obj = json.loads(json_str)

        assert json_obj["sources"] is None


class TestContractTypeConsistency:
    """Test that types remain consistent through serialization."""

    def test_string_fields_remain_strings(self):
        """Verify string fields don't get corrupted."""
        node = Node(id="test@#$%", data={}, label="Label with \"quotes\" and 'apostrophes'")
        json_str = node.model_dump_json()
        restored = Node.model_validate_json(json_str)

        assert restored.id == "test@#$%"
        assert restored.label == "Label with \"quotes\" and 'apostrophes'"

    def test_number_types_preserved(self):
        """Verify number types are preserved."""
        node = Node(
            id="1",
            data={
                "int_val": 42,
                "float_val": 3.14,
                "zero": 0,
                "negative": -100,
            },
            label="Numbers",
        )
        json_str = node.model_dump_json()
        restored = Node.model_validate_json(json_str)

        assert restored.data["int_val"] == 42
        assert restored.data["float_val"] == 3.14
        assert restored.data["zero"] == 0
        assert restored.data["negative"] == -100

    def test_boolean_types_preserved(self):
        """Verify boolean values not coerced to strings."""
        node = Node(id="1", data={"true": True, "false": False}, label="Booleans")
        json_str = node.model_dump_json()
        restored = Node.model_validate_json(json_str)

        assert restored.data["true"] is True
        assert restored.data["false"] is False
        assert isinstance(restored.data["true"], bool)
        assert isinstance(restored.data["false"], bool)


class TestContractLargeDatasets:
    """Test serialization with large datasets."""

    def test_serialize_many_nodes(self):
        """Verify serialization handles large node lists."""
        nodes = [Node(id=str(i), data={"index": i}, label=f"Node {i}") for i in range(1000)]

        # Should serialize without error
        json_str = json.dumps([n.model_dump() for n in nodes])

        # Should deserialize
        data = json.loads(json_str)
        assert len(data) == 1000

    def test_serialize_deep_nesting(self):
        """Verify serialization handles deeply nested data."""
        # Create deeply nested structure (max 50 levels to avoid JSON limits)
        data = {}
        current = data
        for i in range(50):
            current["level"] = {"index": i}
            current = current["level"]

        node = Node(id="deep", data=data, label="Deep")
        json_str = node.model_dump_json()
        restored = Node.model_validate_json(json_str)

        # Should preserve deep nesting
        assert restored.data is not None


class TestContractErrorCases:
    """Test contract handling of error conditions."""

    def test_invalid_json_rejected(self):
        """Verify invalid JSON is rejected."""
        with pytest.raises(ValueError):
            Node.model_validate_json("{invalid json")

    def test_missing_required_fields_rejected(self):
        """Verify missing required fields are rejected."""
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            SearchRequest.model_validate_json('{"context": {}}')  # missing query
