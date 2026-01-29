"""Unit tests for Pydantic data models.

Tests cover:
- Model creation and validation
- JSON serialization/deserialization
- Optional fields
- Recursive models (TreeNode)
- Generic types
"""

import pytest
from typing import Any, Dict
from pydantic import ValidationError
from ontosight.models import Node, Edge, TreeNode, HyperEdge
from ontosight.server.models.api import (
    MetaResponse,
    SearchRequest,
    SearchResponse,
    ChatRequest,
    ChatResponse,
    VisualizationData,
)


class TestNodeModel:
    """Test Node[T] model."""

    def test_create_node_with_string_data(self):
        """Test creating node with string data."""
        node = Node(id="1", data="some_string", label="Node 1")
        assert node.id == "1"
        assert node.data == "some_string"
        assert node.label == "Node 1"

    def test_create_node_with_dict_data(self):
        """Test creating node with dict data."""
        node = Node(id="1", data={"name": "Alice", "age": 30}, label="Alice")
        assert node.data == {"name": "Alice", "age": 30}

    def test_node_json_serialization(self):
        """Test JSON serialization of node."""
        node = Node(id="1", data={"name": "Alice"}, label="Alice")
        json_data = node.model_dump_json()

        # Should be valid JSON
        assert "id" in json_data
        assert "Alice" in json_data

    def test_node_json_deserialization(self):
        """Test JSON deserialization of node."""
        json_str = '{"id":"1","data":{"name":"Alice"},"label":"Alice"}'
        node = Node.model_validate_json(json_str)

        assert node.id == "1"
        assert node.data["name"] == "Alice"
        assert node.label == "Alice"

    def test_node_required_fields(self):
        """Test that required fields are enforced."""
        with pytest.raises(ValidationError):
            Node(id="1", data={})  # Missing label

    def test_node_from_dict(self):
        """Test creating node from dict."""
        data = {"id": "1", "data": {"name": "Alice"}, "label": "Alice"}
        node = Node(**data)

        assert node.id == "1"


class TestEdgeModel:
    """Test Edge[T] model."""

    def test_create_edge(self):
        """Test creating edge."""
        edge = Edge(source="1", target="2", data={"relation": "friend"}, label="friend")
        assert edge.source == "1"
        assert edge.target == "2"
        assert edge.data["relation"] == "friend"

    def test_edge_json_serialization(self):
        """Test JSON serialization of edge."""
        edge = Edge(source="1", target="2", data={"weight": 0.5}, label="connected")
        json_data = edge.model_dump()

        assert json_data["source"] == "1"
        assert json_data["target"] == "2"

    def test_edge_required_fields(self):
        """Test required fields."""
        with pytest.raises(ValidationError):
            Edge(source="1")  # Missing target, data, label


class TestTreeNodeModel:
    """Test TreeNode[T] model (recursive)."""

    def test_create_leaf_node(self):
        """Test creating leaf node (no children)."""
        node = TreeNode(id="leaf", data={"value": 1}, label="Leaf", children=[])
        assert node.id == "leaf"
        assert len(node.children) == 0

    def test_create_tree_with_children(self):
        """Test creating tree with children."""
        root = TreeNode(
            id="root",
            data={},
            label="Root",
            children=[
                TreeNode(id="child1", data={}, label="Child 1", children=[]),
                TreeNode(id="child2", data={}, label="Child 2", children=[]),
            ],
        )
        assert len(root.children) == 2
        assert root.children[0].id == "child1"

    def test_tree_node_default_children(self):
        """Test that children default to empty list."""
        node = TreeNode(id="1", data={}, label="Node")
        assert node.children == []

    def test_deeply_nested_tree(self):
        """Test creating deeply nested tree structure."""
        leaf = TreeNode(id="leaf", data={}, label="Leaf", children=[])
        parent = TreeNode(id="parent", data={}, label="Parent", children=[leaf])
        grandparent = TreeNode(id="grandparent", data={}, label="Grandparent", children=[parent])

        assert grandparent.children[0].children[0].id == "leaf"

    def test_tree_node_json_serialization(self):
        """Test JSON serialization of tree."""
        tree = TreeNode(
            id="root",
            data={"name": "Root"},
            label="Root",
            children=[TreeNode(id="c1", data={}, label="Child 1", children=[])],
        )
        json_data = tree.model_dump()

        assert json_data["id"] == "root"
        assert len(json_data["children"]) == 1


class TestHyperEdgeModel:
    """Test HyperEdge[T] model."""

    def test_create_hyperedge(self):
        """Test creating hyperedge."""
        hyperedge = HyperEdge(
            nodes=["1", "2", "3"], data={"collaboration": "project_a"}, label="Project A"
        )
        assert len(hyperedge.nodes) == 3
        assert "1" in hyperedge.nodes

    def test_hyperedge_requires_min_2_nodes(self):
        """Test that hyperedge requires at least 2 nodes."""
        with pytest.raises(ValidationError):
            HyperEdge(nodes=["1"], data={}, label="Invalid")

    def test_hyperedge_with_many_nodes(self):
        """Test hyperedge with many nodes."""
        nodes = [str(i) for i in range(100)]
        hyperedge = HyperEdge(nodes=nodes, data={}, label="Large hyperedge")
        assert len(hyperedge.nodes) == 100


class TestMetaResponse:
    """Test MetaResponse model."""

    def test_create_meta_response(self):
        """Test creating meta response."""
        node_schema = {
            "type": "object",
            "properties": {"id": {"type": "string"}},
            "required": ["id"],
        }
        response = MetaResponse(node_schema=node_schema)

        assert response.node_schema is not None
        assert "properties" in response.node_schema

    def test_meta_response_all_none(self):
        """Test meta response with all None fields."""
        response = MetaResponse()

        assert response.node_schema is None
        assert response.edge_schema is None


class TestSearchModels:
    """Test SearchRequest and SearchResponse."""

    def test_search_request_minimum(self):
        """Test creating minimal search request."""
        req = SearchRequest(query="test")
        assert req.query == "test"
        assert req.context is None

    def test_search_request_with_context(self):
        """Test search request with context."""
        req = SearchRequest(query="test", context={"language": "en"})
        assert req.context["language"] == "en"

    def test_search_request_empty_query_fails(self):
        """Test that empty query is rejected."""
        with pytest.raises(ValidationError):
            SearchRequest(query="")

    def test_search_response_empty(self):
        """Test empty search response."""
        resp = SearchResponse()
        assert resp.results == []

    def test_search_response_with_results(self):
        """Test search response with results."""
        resp = SearchResponse(results=["item1", "item2"])
        assert len(resp.results) == 2


class TestChatModels:
    """Test ChatRequest and ChatResponse."""

    def test_chat_request(self):
        """Test creating chat request."""
        req = ChatRequest(query="What is this?")
        assert req.query == "What is this?"

    def test_chat_response(self):
        """Test creating chat response."""
        resp = ChatResponse(response="This is a response")
        assert resp.response == "This is a response"
        assert resp.sources is None

    def test_chat_response_with_sources(self):
        """Test chat response with sources."""
        resp = ChatResponse(response="Based on item1 and item2...", sources=["item1", "item2"])
        assert len(resp.sources) == 2


class TestVisualizationData:
    """Test VisualizationData model."""

    def test_visualization_data_with_nodes(self):
        """Test visualization data with nodes."""
        data = VisualizationData(nodes=[{"id": "1"}])
        assert len(data.nodes) == 1

    def test_visualization_data_with_all_fields(self):
        """Test visualization data with all fields."""
        data = VisualizationData(
            nodes=[{"id": "1"}],
            edges=[{"source": "1", "target": "2"}],
            items=[{"id": "item1"}],
            hyperedges=[{"nodes": ["1", "2", "3"]}],
        )
        assert data.nodes is not None
        assert data.edges is not None
        assert data.items is not None
        assert data.hyperedges is not None


class TestModelSerialization:
    """Test JSON serialization consistency."""

    def test_round_trip_node(self):
        """Test round-trip serialization of node."""
        original = Node(id="1", data={"name": "Alice", "age": 30}, label="Alice (30)")
        json_str = original.model_dump_json()
        restored = Node.model_validate_json(json_str)

        assert restored.id == original.id
        assert restored.label == original.label
        assert restored.data == original.data

    def test_round_trip_tree(self):
        """Test round-trip serialization of tree."""
        original = TreeNode(
            id="root",
            data={"x": 1},
            label="Root",
            children=[TreeNode(id="c1", data={"x": 2}, label="C1", children=[])],
        )
        json_str = original.model_dump_json()
        restored = TreeNode.model_validate_json(json_str)

        assert restored.id == original.id
        assert len(restored.children) == 1
        assert restored.children[0].id == "c1"
