"""README for OntoSight Examples

This directory contains comprehensive examples of how to use OntoSight
for different visualization scenarios.

## Quick Start

### 1. Basic Graph Visualization (01_basic_graph.py)
Simple nodes and edges visualization.

```bash
python 01_basic_graph.py
```

Then open http://localhost:8000 in your browser.

### 2. List/Table Visualization (02_basic_list.py)
Display tabular data with filtering and sorting.

```bash
python 02_basic_list.py
```

### 3. Hypergraph Visualization (03_basic_hypergraph.py)
Visualize complex relationships with hyperedges (edges connecting 3+ nodes).

```bash
python 03_basic_hypergraph.py
```

### 4. Advanced Graph with Search & Chat (04_advanced_graph.py)
Interactive graph with search callbacks and Q&A.

```bash
python 04_advanced_graph.py
```

Features:
- Search: Try searching for 'Alice', 'Engineer', 'Senior'
- Chat: Ask questions like 'Who is Bob?' or 'How many managers?'
- Interactive: Click, drag, zoom on nodes

### 5. Backend API Testing (05_backend_api_test.py)
Test the backend API directly without using visualization.

```bash
python 05_backend_api_test.py
```

This tests:
- GET /health - Server health check
- GET /api/meta - Metadata endpoint
- GET /api/data - Visualization data
- POST /api/search - Search functionality
- POST /api/chat - Chat/Q&A functionality

### 6. NetworkX Integration (06_networkx_example.py)
Use OntoSight with NetworkX graphs.

Requirements: `pip install networkx`

```bash
python 06_networkx_example.py
```

### 7. Pydantic Models (07_pydantic_example.py)
Use OntoSight with Pydantic models for type-safe visualizations.

```bash
python 07_pydantic_example.py
```

## Architecture

```
OntoSight Workflow:
┌─────────────────┐
│  Python Code    │  (This directory)
│ (view_graph()   │
│  view_list()    │
│  view_hypergraph())
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│  OntoSight Backend          │
│  (ontosight/server/)        │
│  - Global State             │
│  - 4 API Endpoints          │
│  - FastAPI + Uvicorn        │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  OntoSight Frontend         │
│  (frontend/)                │
│  - React 18 + TypeScript    │
│  - AntV G6 Visualization    │
│  - Ant Design UI            │
└─────────────────────────────┘
         ↑
         │
    HTTP/JSON
         │
┌─────────────────────┐
│  Browser            │
│  (http://localhost) │
└─────────────────────┘
```

## How It Works

1. **Your Python Code** - Call `view_graph()`, `view_list()`, or `view_hypergraph()`
2. **Backend** - Stores data in global state and starts HTTP server
3. **Frontend** - React app fetches data and renders visualization
4. **Browser** - Interactive visualization with search and chat

## API Reference

### view_graph()
```python
view_graph(
    node_list: List[Any],
    edge_list: Optional[List[Any]] = None,
    node_schema: Optional[Any] = None,
    edge_schema: Optional[Any] = None,
    node_name_extractor: Optional[Callable] = None,
    edge_name_extractor: Optional[Callable] = None,
    nodes_in_edge_extractor: Optional[Callable] = None,
    on_search: Optional[Callable] = None,
    on_chat: Optional[Callable] = None,
    context: Optional[Dict] = None,
) -> None
```

### view_list()
```python
view_list(
    data_list: List[Any],
    item_schema: Optional[Any] = None,
    item_name_extractor: Optional[Callable] = None,
    on_search: Optional[Callable] = None,
    on_chat: Optional[Callable] = None,
    context: Optional[Dict] = None,
) -> None
```

### view_hypergraph()
```python
view_hypergraph(
    node_list: List[Any],
    hyperedge_list: Optional[List[Any]] = None,
    node_schema: Optional[Any] = None,
    hyperedge_schema: Optional[Any] = None,
    node_name_extractor: Optional[Callable] = None,
    hyperedge_name_extractor: Optional[Callable] = None,
    nodes_in_hyperedge_extractor: Optional[Callable] = None,
    on_search: Optional[Callable] = None,
    on_chat: Optional[Callable] = None,
    context: Optional[Dict] = None,
) -> None
```

## Data Format

### Nodes
```python
nodes = [
    {
        "id": "unique_id",
        "label": "Display Label",
        # Any additional properties
        "property1": "value1",
        "property2": "value2",
    },
    # ... more nodes
]
```

### Edges
```python
edges = [
    {
        "source": "source_node_id",
        "target": "target_node_id",
        "label": "Relationship Label",
        # Any additional properties
    },
    # ... more edges
]
```

### Hyperedges
```python
hyperedges = [
    {
        "nodes": ["node1", "node2", "node3"],  # 2 or more nodes
        "label": "Multi-node Relationship",
        # Any additional properties
    },
    # ... more hyperedges
]
```

## Common Use Cases

### 1. Knowledge Graphs
Visualize entities and their relationships.

```python
view_graph(
    node_list=entities,
    edge_list=relationships,
)
```

### 2. Social Networks
Show connections between people.

```python
view_graph(
    node_list=users,
    edge_list=connections,
    on_search=search_users,
)
```

### 3. Organizational Hierarchies
Display team structure and reporting relationships.

```python
view_graph(
    node_list=employees,
    edge_list=report_relationships,
)
```

### 4. Data Tables
Simple tabular data visualization.

```python
view_list(data_list=records)
```

### 5. Co-authorship Networks
Show publications and collaborations.

```python
view_hypergraph(
    node_list=papers + authors,
    hyperedge_list=collaborations,
)
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
- Kill existing process: `lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill`
- Or modify the port in your script

### Backend Not Starting
Make sure dependencies are installed:
```bash
pip install -e .
```

### Search/Chat Not Working
Implement the `on_search` and `on_chat` callbacks:
```python
def on_search(query: str, context: Dict) -> List[str]:
    # Return list of matching node IDs
    return [id for id in node_ids if query.lower() in id.lower()]

def on_chat(question: str, context: Dict) -> str:
    # Return answer
    return "Answer to your question"
```

## Performance Tips

1. **Large Graphs (10k+ nodes)**
   - Use virtual scrolling for lists
   - Consider hierarchical layouts
   - Test with performance profiler

2. **Complex Relationships**
   - Use hypergraph for co-occurrence patterns
   - Filter edges to reduce clutter

3. **Real-time Updates**
   - Call view_* functions to update data
   - Frontend will refresh automatically

## Next Steps

After running these examples:
1. Create your own data source
2. Implement search callbacks
3. Implement chat callbacks
4. Deploy to production (see DEPLOYMENT.md)
5. Optimize performance (see PERFORMANCE.md)

## Get Help

For more information, see:
- Main README: ../README.md
- Architecture: ../docs/ARCHITECTURE.md
- API Reference: ../docs/API_REFERENCE.md
- Troubleshooting: ../docs/TROUBLESHOOTING.md
"""
