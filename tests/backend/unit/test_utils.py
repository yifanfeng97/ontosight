"""Tests for utility functions (extractors and normalizers)."""

import pytest
from ontosight.utils import extract_value
from ontosight.core.views.list import normalize_dict
from ontosight.core.views.graph import normalize_graph
from ontosight.core.views.hypergraph import normalize_hypergraph


class TestExtractValue:
    """Tests for extract_value function."""

    def test_extract_from_dict_with_string_key(self):
        """Test extracting from dict with string key."""
        obj = {"id": "123", "name": "Test"}
        assert extract_value(obj, "id") == "123"
        assert extract_value(obj, "name") == "Test"

    def test_extract_from_dict_missing_key(self):
        """Test extracting missing key from dict."""
        obj = {"id": "123"}
        assert extract_value(obj, "missing", default="default") == "default"

    def test_extract_from_object_with_attribute(self):
        """Test extracting from object with attribute."""

        class Item:
            def __init__(self):
                self.id = "456"
                self.name = "Item"

        obj = Item()
        assert extract_value(obj, "id") == "456"
        assert extract_value(obj, "name") == "Item"

    def test_extract_with_callable(self):
        """Test extracting with callable."""
        obj = {"x": 10, "y": 20}
        result = extract_value(obj, lambda o: o["x"] + o["y"])
        assert result == 30

    def test_extract_with_callable_exception(self):
        """Test callable that raises exception."""
        obj = {"x": 10}
        result = extract_value(obj, lambda o: o["z"], default="error")
        assert result == "error"


class TestNormalizeDict:
    """Tests for normalize_dict function."""

    def test_normalize_simple_list(self):
        """Test normalizing simple list."""
        items = [
            {"label": "A"},
            {"label": "B"},
        ]

        result = normalize_dict(items)

        assert "items" in result
        assert len(result["items"]) == 2
        assert result["items"][0]["label"] == "A"
        assert result["items"][1]["label"] == "B"

    def test_normalize_with_custom_extractors(self):
        """Test normalization with custom extractors."""
        items = [
            {"title": "First"},
            {"title": "Second"},
        ]

        result = normalize_dict(items, name_extractor="title")

        assert result["items"][0]["label"] == "First"
        assert result["items"][1]["label"] == "Second"

    def test_normalize_includes_data(self):
        """Test that normalization includes extra fields as data."""
        items = [{"label": "A", "extra": "value"}]

        result = normalize_dict(items)

        assert "data" in result["items"][0]
        assert result["items"][0]["data"]["extra"] == "value"


class TestNormalizeGraph:
    """Tests for normalize_graph function."""

    def test_normalize_simple_graph(self):
        """Test normalizing simple graph."""
        nodes = [{"label": "A"}, {"label": "B"}]
        edges = [{"source": nodes[0], "target": nodes[1]}]

        result = normalize_graph(nodes=nodes, edges=edges)

        assert len(result["nodes"]) == 2
        assert len(result["edges"]) == 1
        assert result["nodes"][0]["label"] == "A"

    def test_normalize_graph_custom_extractors(self):
        """Test graph normalization with custom extractors."""
        nodes = [{"name": "Node 1"}]
        edges = [{"src": nodes[0], "dst": nodes[0], "title": "edge"}]

        result = normalize_graph(
            nodes=nodes,
            edges=edges,
            node_name_extractor="name",
            edge_name_extractor="title",
            nodes_in_edge_extractor=lambda e: (e["src"], e["dst"]),
        )

        assert result["nodes"][0]["label"] == "Node 1"
        assert result["edges"][0]["label"] == "edge"

    def test_normalize_graph_without_edges(self):
        """Test graph normalization without edges."""
        nodes = [{"label": "A"}]

        result = normalize_graph(nodes=nodes)

        assert len(result["nodes"]) == 1
        assert len(result["edges"]) == 0


class TestNormalizeHypergraph:
    """Tests for normalize_hypergraph function."""

    def test_normalize_simple_hypergraph(self):
        """Test normalizing simple hypergraph."""
        nodes = [
            {"label": "A"},
            {"label": "B"},
            {"label": "C"},
        ]
        hyperedges = [{"nodes": nodes, "label": "triple"}]

        result = normalize_hypergraph(nodes=nodes, hyperedges=hyperedges)

        assert len(result["nodes"]) == 3
        assert len(result["hyperedges"]) == 1
        assert len(result["hyperedges"][0]["nodes"]) == 3

    def test_normalize_hypergraph_custom_extractors(self):
        """Test hypergraph normalization with custom extractors."""
        nodes = [{"name": "A"}]
        hyperedges = [{"node_list": nodes, "title": "edge"}]

        result = normalize_hypergraph(
            nodes=nodes,
            hyperedges=hyperedges,
            node_name_extractor="name",
            edge_name_extractor="title",
            nodes_in_edge_extractor="node_list",
        )

        assert result["nodes"][0]["label"] == "A"
        assert result["hyperedges"][0]["label"] == "edge"
        assert len(result["hyperedges"][0]["nodes"]) == 1
