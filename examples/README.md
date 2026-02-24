# OntoSight Examples 🚀

This directory contains curated examples to help you get started with OntoSight.

## 📁 Example Structure

### 1. Basic Visualizations (No AI)
These examples show how to set up the core visualization engine with Pydantic schemas.
- **[01_graph_galactic_trade.py](01_graph_galactic_trade.py)**: A classic node-edge graph representing interstellar commerce.
- **[02_hypergraph_joint_operations.py](02_hypergraph_joint_operations.py)**: Demonstrates hypergraphs where a single relationship (mission) links multiple entities (crew members).

### 2. Advanced AI-Ready Visualizations (Search & Chat)
These examples demonstrate how to use `on_search` and `on_chat` callbacks to build interactive, "intelligent" graph applications (GraphRAG).
- **[03_advanced_graph_rebel_intelligence.py](03_advanced_graph_rebel_intelligence.py)**: An intelligence analysis tool where you can ask natural language questions about security threats.
- **[04_advanced_hypergraph_biomedical_discovery.py](04_advanced_hypergraph_biomedical_discovery.py)**: A scientific tool for exploring drug-protein-disease interactions in metabolic pathways.

### 3. Node-Only Visualizations (Entities & Collections)
These examples show how to visualize pure entity collections without any edges - perfect for archives, catalogs, and semantic entity spaces.
- **[05_nodes_culinary_archive.py](05_nodes_culinary_archive.py)**: A node-only view showcasing a galactic recipe database. Perfect for displaying large collections of independent items.
- **[06_advanced_nodes_flavor_clusters.py](06_advanced_nodes_flavor_clusters.py)**: Advanced node visualization with semantic search and an AI chef assistant that recommends dishes based on taste preferences, difficulty level, and cuisine type.

### 4. Testing & Debugging Visualizations
These examples are designed to test specific features and edge cases of the visualization engine.
- **[07_graph_isolated_nodes.py](07_graph_isolated_nodes.py)**: Tests the `min_nodes` sampling logic with a graph containing multiple disconnected connected components. Useful for verifying that the sampling algorithm can gather enough nodes when the graph is sparse.
- **[08_hypergraph_isolated_nodes.py](08_hypergraph_isolated_nodes.py)**: Tests the `min_nodes` sampling logic with a hypergraph containing multiple disconnected components. Useful for verifying hyperedge sampling behavior.

## 🛠 How to Run

1. Ensure you have the package installed:
   ```bash
   pip install ontosight
   ```
2. Run any example script:
   ```bash
   python examples/03_advanced_graph_rebel_intelligence.py
   ```
3. Your browser will automatically open a local web server (usually at `http://localhost:8000`) to display the interactive UI.

## 🧠 Key Concepts Demonstrated

- **Pydantic Integration**: Use standard Python type hints to define what your data looks like.
- **Callback Pattern**: Hook up your own logic (or LLM/Vector DB calls) to the `on_search` and `on_chat` parameters.
- **Schema-Based Details**: Click on any node or edge to see a structured detail view generated directly from your Pydantic models.
- **Three Visualization Types**: 
  - **Graphs** (`view_graph`): For pairwise relationships and networks
  - **Hypergraphs** (`view_hypergraph`): For many-to-many relationships and complex pathways
  - **Nodes** (`view_nodes`): For entity collections and semantic spaces without explicit edges
- **Sampling Parameters**:
  - `min_nodes`: Minimum number of nodes to include in the sample (default: 10)
  - `max_attempts`: Maximum number of attempts to find a suitable center (default: 5)
