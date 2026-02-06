# OntoSight 🔍

**Interactive Visualization Engine for AI-Enhanced Knowledge Graphs & Hypergraphs**

OntoSight is a lightweight yet powerful Python library designed to bridge the gap between static graph visualizations and dynamic AI-driven exploration. It allows developers to create highly interactive, searchable, and "chat-ready" visualizations for complex knowledge structures with just a few lines of code.

---

## 🌟 Key Features

- **Standard & Hypergraph Support**: Seamlessly switch between traditional node-edge graphs and advanced hypergraphs.
- **AI-Ready Callbacks**: Flexible `on_search` and `on_chat` hooks to integrate with any LLM (GPT-4, Claude, Llama 3) or Vector Database (Milvus, Pinecone, Chroma).
- **Interactive Exploration**: Built-in detail panels, filtering, and real-time highlighting.
- **Framework Agnostic**: Works with any data source. Define your schema using Pydantic and let OntoSight handle the rest.
- **Developer First**: Python-native API with automatic web-server management and browser launching.

---

## 📸 Visualization Previews

### 1. Interactive Graph Visualization
*(Insert graph_preview.png here)*

### 2. Interactive Hypergraph Visualization
*(Insert hypergraph_preview.png here)*

---

## 🚀 Quick Start

### Installation

```bash
pip install ontosight
```

### Basic Usage

Define your data structure using Pydantic models:

```python
from pydantic import BaseModel
from ontosight import view_graph

class Entity(BaseModel):
    name: str
    type: str

class Relation(BaseModel):
    source: str
    target: str
    relation: str

# Your data
nodes = [Entity(name="Alice", type="Person"), Entity(name="Wonderland", type="Place")]
edges = [Relation(source="Alice", target="Wonderland", relation="visits")]

# Launch visualization
view_graph(
    node_list=nodes,
    edge_list=edges,
    node_schema=Entity,
    edge_schema=Relation,
    node_id_extractor=lambda n: n.name,
    node_ids_in_edge_extractor=lambda e: (e.source, e.target),
    edge_label_extractor=lambda e: e.relation
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
*(Insert search_interaction.gif here)*

### GraphRAG & Chat
Connect a Chat interface directly to your Graph. When a user asks a question, the LLM can provide a textual answer, and OntoSight will auto-highlight the relevant subgraph.

```python
def my_chat_handler(question: str):
    # 1. Send question to LLM (e.g., GPT-4)
    # 2. Get relevant nodes/edges from your Retrieval logic
    return "Alice is in Wonderland.", (relevant_nodes, relevant_edges)

view_graph(..., on_chat=my_chat_handler)
```
*(Insert chat_interaction.gif here)*

---

## 🛠 Advanced Features

- **Schema-Driven Detail Panels**: Automatically generates UI panels based on your Pydantic models.
- **Hypergraph Modeling**: Visualize relationships between multiple nodes simultaneously.

---

## 📄 License
OntoSight is released under the [MIT License](LICENSE).
