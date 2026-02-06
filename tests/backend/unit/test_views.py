"""Tests for SDK view functions."""

import pytest
from ontosight.core import view_graph, view_hypergraph
from ontosight.server.state import global_state


@pytest.fixture
def clear_state():
    """Clear global state before each test."""
    global_state.clear()
    yield
    global_state.clear()


class TestViewGraph:
    """Tests for view_graph function."""

    def test_view_graph_simple_dict(self, clear_state):
        """Test graph with simple dict nodes and edges."""
        nodes = [{"label": "A"}, {"label": "B"}]
        edges = [{"source": nodes[0], "target": nodes[1], "label": "knows"}]

        view_graph(node_list=nodes, edge_list=edges)

        data = global_state.get_all_visualization_data()
        assert len(data["nodes"]) == 2
        assert len(data["edges"]) == 1

    def test_view_graph_custom_extractors(self, clear_state):
        """Test graph with custom field extractors."""
        nodes = [
            {"name": "Alice"},
            {"name": "Bob"},
        ]
        edges = [{"source": nodes[0], "target": nodes[1]}]

        view_graph(
            node_list=nodes,
            edge_list=edges,
            node_label_extractor="name",
            nodes_in_edge_extractor=lambda e: (e["source"], e["target"]),
        )

        data = global_state.get_all_visualization_data()
        assert data["nodes"][0]["label"] == "Alice"
        assert data["nodes"][1]["label"] == "Bob"

    def test_view_graph_lambda_extractors(self, clear_state):
        """Test graph with lambda extractors."""
        nodes = [{"name": "Alice"}, {"name": "Bob"}]
        edges = [{"source": nodes[0], "target": nodes[1]}]

        view_graph(
            node_list=nodes,
            edge_list=edges,
            node_label_extractor=lambda n: n["name"].upper(),
            nodes_in_edge_extractor=lambda e: (e["source"], e["target"]),
        )

        data = global_state.get_all_visualization_data()
        assert data["nodes"][0]["label"] == "ALICE"

    def test_view_graph_with_callbacks(self, clear_state):
        """Test graph with search and chat callbacks."""
        nodes = [{"label": "A"}]

        def on_search(query, context):
            return {"result": "found"}

        def on_chat(message, context):
            return {"response": "ok"}

        view_graph(node_list=nodes, on_search=on_search, on_chat=on_chat)

        callbacks = global_state._callbacks
        assert "search" in callbacks
        assert "chat" in callbacks

    def test_view_graph_with_context(self, clear_state):
        """Test graph with context data."""
        nodes = [{"label": "A"}]

        view_graph(node_list=nodes, context={"title": "My Graph", "version": "1.0"})

        context = global_state._context
        assert context["title"] == "My Graph"


class TestViewHypergraph:
    """Tests for view_hypergraph function."""

    def test_view_hypergraph_simple(self, clear_state):
        """Test hypergraph visualization."""
        nodes = [
            {"label": "Node 1"},
            {"label": "Node 2"},
            {"label": "Node 3"},
        ]
        hyperedges = [{"nodes": nodes, "label": "triple"}]

        view_hypergraph(node_list=nodes, edge_list=hyperedges)

        data = global_state.get_all_visualization_data()
        assert len(data["nodes"]) == 3
        assert len(data["hyperedges"]) == 1
        assert len(data["hyperedges"][0]["nodes"]) == 3

    def test_view_hypergraph_custom_extractors(self, clear_state):
        """Test hypergraph with custom extractors."""
        nodes = [{"name": "A"}, {"name": "B"}]
        hyperedges = [{"node_list": nodes, "title": "edge1"}]

        view_hypergraph(
            node_list=nodes,
            edge_list=hyperedges,
            node_name_extractor="name",
            edge_name_extractor="title",
            nodes_in_edge_extractor="node_list",
        )

        data = global_state.get_all_visualization_data()
        assert data["nodes"][0]["label"] == "A"
        assert data["hyperedges"][0]["label"] == "edge1"


class TestExtractors:
    """Tests for extractor functionality."""

    def test_extractor_dict_key(self, clear_state):
        """Test dict key extraction."""
        nodes = [{"title": "Node A"}]

        view_graph(node_list=nodes, node_label_extractor="title")

        data = global_state.get_all_visualization_data()
        assert data["nodes"][0]["label"] == "Node A"

    def test_extractor_lambda(self, clear_state):
        """Test lambda function extraction."""
        nodes = [{"x": 10, "y": 20}]

        view_graph(node_list=nodes, node_label_extractor=lambda n: f"pos_{n['x']}_{n['y']}")

        data = global_state.get_all_visualization_data()
        assert data["nodes"][0]["label"] == "pos_10_20"

    def test_extractor_object_attribute(self, clear_state):
        """Test object attribute extraction."""

        class Node:
            def __init__(self, name):
                self.name = name

        nodes = [Node("First"), Node("Second")]

        view_graph(node_list=nodes, node_label_extractor="name")

        data = global_state.get_all_visualization_data()
        assert data["nodes"][0]["label"] == "First"
        assert data["nodes"][1]["label"] == "Second"
