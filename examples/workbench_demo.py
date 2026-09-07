"""Synthetic collaboration example for Classic/Workbench comparison.

Build the frontend and install OntoSight, then run:
    python examples/workbench_demo.py
Search/chat callbacks below are deterministic local examples, with no LLM calls.
"""

from __future__ import annotations

import argparse
import webbrowser

from pydantic import BaseModel, Field

from ontosight.core.storage import HypergraphStorage
from ontosight.server.state import global_state


class PersonOrTopic(BaseModel):
    id: str
    name: str
    kind: str


class Collaboration(BaseModel):
    title: str
    members: list[str]
    membership_records: list[dict[str, str]] = Field(default_factory=list)
    note: str = "Synthetic example; not a factual research record."


def setup_demo() -> HypergraphStorage:
    nodes = [
        PersonOrTopic(id=id_, name=name, kind=kind)
        for id_, name, kind in [
            ("ada", "Ada", "Person"),
            ("grace", "Grace", "Person"),
            ("alan", "Alan", "Person"),
            ("katherine", "Katherine", "Person"),
            ("lab", "Research Lab", "Organization"),
            ("graphs", "Knowledge graphs", "Topic"),
            ("data", "Open data", "Topic"),
            ("london", "London", "Place"),
            ("year", "2026", "Time"),
            ("workshop", "联合研究工作坊", "Event"),
            ("paper", "Shared paper", "Work"),
        ]
    ]
    specifications = [
        (
            "Graph methods",
            [
                ("ada", "researcher"),
                ("grace", "researcher"),
                ("lab", "organization"),
                ("graphs", "topic"),
            ],
        ),
        ("Open data study", [("ada", "researcher"), ("alan", "researcher"), ("data", "topic")]),
        (
            "Workshop",
            [("ada", "organizer"), ("workshop", "event"), ("london", "place"), ("year", "time")],
        ),
        ("Joint manuscript", [("ada", "author"), ("katherine", "author"), ("paper", "work")]),
        ("Mentorship", [("ada", "mentor"), ("grace", "mentee")]),
    ]
    relations = [
        Collaboration(
            title=title,
            members=[id_ for id_, _ in pairs],
            membership_records=[{"node_id": id_, "role": role} for id_, role in pairs],
        )
        for title, pairs in specifications
    ]
    storage = HypergraphStorage(
        nodes,
        relations,
        lambda n: n.id,
        lambda e: tuple(e.members),
        lambda e: e.title,
        lambda n: n.name,
    )

    def search(query: str):
        query = query.casefold()
        return (
            [n for n in nodes if query in n.name.casefold()],
            [e for e in relations if query in e.title.casefold()],
        )

    def chat(question: str):
        return "Local demo: these are synthetic collaborations, not a model answer.", search(
            question
        )

    global_state.clear()
    global_state.set_storage(storage)
    global_state.set_visualization_type("hypergraph")
    global_state.set_visualization_data("node_schema", PersonOrTopic)
    global_state.set_visualization_data("edge_schema", Collaboration)
    stats = storage.get_stats()
    global_state.set_visualization_data(
        "meta_data", {"Nodes": stats["total_nodes"], "Hyperedges": stats["total_hyperedges"]}
    )
    global_state.register_callbacks({"search": search, "chat": chat})
    return storage


if __name__ == "__main__":
    import uvicorn
    from ontosight.server.app import app

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--no-open", action="store_true")
    args = parser.parse_args()
    setup_demo()
    url = f"http://127.0.0.1:{args.port}"
    print(f"Synthetic OntoSight demo: {url}", flush=True)
    if not args.no_open:
        webbrowser.open(url)
    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="warning")
