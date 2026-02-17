# OntoSight 🔍

<p align="center">
  <img src="docs/assets/hypergraph_chat.png" width="800px" alt="OntoSight Banner">
</p>

<p align="center">
  <a href="https://pypi.org/project/ontosight/"><img src="https://img.shields.io/pypi/v/ontosight.svg" alt="PyPI Version"></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/python-3.11+-blue.svg" alt="Python Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-green.svg" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Interactive-UI-brightgreen.svg" alt="Interactive UI"></a>
</p>

<p align="center">
  <b>English</b> | <a href="README_zh.md">简体中文</a>
</p>

**Interactive Visualization Engine for AI-Enhanced Knowledge Graphs & Hypergraphs**

OntoSight is a lightweight yet powerful Python library designed to bridge the gap between static graph visualizations and dynamic AI-driven exploration. It allows developers to create highly interactive, searchable, and "chat-ready" visualizations for complex knowledge structures with just a few lines of code.

---

## 🌟 Key Features

- **Three Visualization Types**: 
  - **Graphs** (`view_graph`): Traditional node-edge networks for pairwise relationships
  - **Hypergraphs** (`view_hypergraph`): Multi-node relationships and complex pathways
  - **Nodes** (`view_nodes`): Pure entity collections without edges - perfect for archives, semantic spaces, and clusters
- **AI-Ready Callbacks**: Flexible `on_search` and `on_chat` hooks to integrate with any LLM (GPT-4, Claude, Llama 3) or Vector Database (Milvus, Pinecone, Chroma).
- **Interactive Exploration**: Built-in detail panels, filtering, and real-time highlighting.
- **Framework Agnostic**: Works with any data source. Define your schema using Pydantic and let OntoSight handle the rest.
- **Developer First**: Python-native API with automatic web-server management and browser launching.

---

## � Quick Start

### Installation

```bash
pip install ontosight
```

## 📸 Visualization Modes

### 1. Standard Knowledge Graphs (`view_graph`)
Traditional node-edge networks for pairwise relationships. Best for social networks, dependency graphs, and classic KGs.

| Main View | Intelligent Search | AI Chat |
| :---: | :---: | :---: |
| <img src="docs/assets/graph_main.png" width="100%"> | <img src="docs/assets/graph_search.png" width="100%"> | <img src="docs/assets/graph_chat.png" width="100%"> |

```python
from pydantic import BaseModel
from ontosight import view_graph

class Entity(BaseModel):
    name: str
    type: str

nodes = [Entity(name="Alice", type="Person"), Entity(name="Wonderland", type="Place")]
edges = [{"source": "Alice", "target": "Wonderland", "label": "visits"}]

view_graph(
    node_list=nodes,
    edge_list=edges,
    node_id_extractor=lambda n: n.name,
    node_ids_in_edge_extractor=lambda e: (e["source"], e["target"])
)
```

### 2. Multi-Dimensional Hypergraphs (`view_hypergraph`)
Visualize relationships that connect more than two entities. Perfect for collaborative networks, chemical reactions, or complex logical pathways.

| Main View | Intelligent Search | AI Chat |
| :---: | :---: | :---: |
| <img src="docs/assets/hypergraph_main.png" width="100%"> | <img src="docs/assets/hypergraph_search.png" width="100%"> | <img src="docs/assets/hypergraph_chat.png" width="100%"> |

```python
from ontosight import view_hypergraph

# A hyperedge connects multiple nodes
hyperedges = [{"id": "he1", "members": ["A", "B", "C"], "label": "Collaboration"}]

view_hypergraph(
    node_list=[{"id": "A"}, {"id": "B"}, {"id": "C"}],
    edge_list=hyperedges,
    node_id_extractor=lambda n: n["id"],
    node_ids_in_edge_extractor=lambda e: e["members"]
)
```

### 3. Entity Archives & Semantic Spaces (`view_nodes`)
Pure entity collections without explicit edges. Use force-clustering and semantic search to explore large-scale archives or embedding spaces.

| Main View | Intelligent Search | AI Chat |
| :---: | :---: | :---: |
| <img src="docs/assets/node_main.png" width="100%"> | <img src="docs/assets/node_search.png" width="100%"> | <img src="docs/assets/node_chat.png" width="100%"> |

```python
from ontosight import view_nodes

recipes = [
    {"name": "Pasta", "cuisine": "Italian"},
    {"name": "Sushi", "cuisine": "Japanese"}
]

view_nodes(
    node_list=recipes,
    node_id_extractor=lambda r: r["name"],
    node_label_extractor=lambda r: r["name"]
)
```

---

## 🧠 AI Integration (The "Sight" in OntoSight)

OntoSight is built for the Age of AI. While it doesn't ship with a specific LLM, it provides the "plumbing" to make your graph interactive and intelligent.

### Flexible Search (Vector DB Ready)
You can define a custom search callback to perform semantic search using embedding models.

```python
def my_vector_search(query: str):
    # Logic to call your Vector DB (e.g., Milvus)
    # returns matching_nodes, matching_edges
    pass

view_graph(..., on_search=my_vector_search)
```

### Chat
Connect a Chat interface directly to your Graph. When a user asks a question, the LLM can provide a textual answer, and OntoSight will auto-highlight the relevant subgraph.

```python
def my_chat_handler(question: str):
    # 1. Send question to LLM (e.g., GPT-4)
    # 2. Get relevant nodes/edges from your Retrieval logic
    return "Alice is in Wonderland.", (relevant_nodes, relevant_edges)

view_graph(..., on_chat=my_chat_handler)
```

---

## 🛠 Advanced Features

- **Schema-Driven Detail Panels**: Automatically generates UI panels based on your Pydantic models.
- **Hypergraph Modeling**: Visualize relationships between multiple nodes simultaneously.

---

## 📄 License
OntoSight is released under the [Apache License 2.0](LICENSE).
