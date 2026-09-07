"""Exercise the actual endpoints consumed by both presentation styles."""

import copy
import importlib.util
from pathlib import Path

from fastapi.testclient import TestClient

from ontosight.server.app import create_app
from ontosight.server.state import global_state


def load_demo():
    path = Path(__file__).resolve().parents[1] / "examples" / "workbench_demo.py"
    spec = importlib.util.spec_from_file_location("workbench_demo", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_native_memberships_details_and_callbacks_survive_display_requests():
    storage = load_demo().setup_demo()
    original = copy.deepcopy(storage.hyperedges)
    client = TestClient(create_app())
    try:
        meta = client.get("/api/meta").json()
        assert meta["features"] == {"search": True, "chat": True}
        data = client.get("/api/data", params={"ids": "ada"}).json()
        assert len(data["nodes"]) == 11
        assert len(data["hyperedges"]) == 5
        assert sum(len(e["linked_nodes"]) for e in data["hyperedges"]) == 16
        assert len(data["edges"]) == 11  # auxiliary links, not asserted pairwise facts
        for edge in data["hyperedges"]:
            assert "label" in edge["data"]
            assert "node_set" not in edge
            details = client.get(f"/api/details/{edge['id']}").json()
            assert details == edge
            assert len(details["data"]["raw"]["membership_records"]) == len(edge["linked_nodes"])
        search = client.post("/api/search", json={"query": "Mentorship"}).json()
        hits = [e for e in search["hyperedges"] if e.get("highlighted")]
        assert len(hits) == 1 and hits[0]["data"]["label"] == "Mentorship"
        assert len(hits[0]["linked_nodes"]) == 2
        response = client.post("/api/chat", json={"query": "Ada"})
        assert response.status_code == 200
        chat = response.json()
        assert "synthetic" in chat["response"]
        assert [n["id"] for n in chat["data"]["nodes"] if n.get("highlighted")] == ["ada"]
        assert storage.hyperedges == original
    finally:
        global_state.clear()
