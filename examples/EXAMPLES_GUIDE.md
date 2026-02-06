"""Examples - Comprehensive Usage Guide

This document explains when daemon.py is used and how all examples work.

## About daemon.py

### What is daemon.py?

daemon.py provides manual server lifecycle management:
- `start_daemon()` - Manually start the backend server
- `stop_daemon()` - Manually stop the server
- `is_daemon_running()` - Check server status
- `get_daemon_url()` - Get the server URL

### Do I need to use daemon.py?

**NO** - For most cases, you DON'T need daemon.py:
- When you call `view_graph()`, `view_list()`, or `view_hypergraph()`
- The backend server starts **automatically** in the background
- The browser opens automatically
- Everything just works!

### When SHOULD I use daemon.py?

Yes, in these cases:
1. **Manual server control** - You want explicit control over startup/shutdown
2. **Custom port/host** - You need to use a specific port or network interface
3. **Multiple workers** - You want to run with multiple worker processes
4. **Development reload** - You want auto-reload on code changes
5. **Testing** - You need to test server startup/shutdown logic

### Example: Manual Server Control

```python
from ontosight.core import start_daemon, stop_daemon, is_daemon_running

# Start server manually
start_daemon(port=8001, workers=4)

# ... do your visualization work ...

# Stop server manually
stop_daemon()

# Check if running
print(is_daemon_running())
```

### Example: Development Mode with Auto-Reload

```python
from ontosight.core import start_daemon

# Start with auto-reload enabled
start_daemon(reload=True)
```

## Examples Overview

### 01_basic_graph.py
- **Type**: Visualization Example
- **Use daemon.py**: ❌ No
- **What it does**: Creates a simple org chart graph
- **Server**: Auto-starts when you run the script
- **How to run**: `python 01_basic_graph.py`

### 03_basic_hypergraph.py
- **Type**: Visualization Example
- **Use daemon.py**: ❌ No
- **What it does**: Shows complex relationships with hyperedges
- **Server**: Auto-starts
- **How to run**: `python 03_basic_hypergraph.py`

### 04_advanced_graph.py
- **Type**: Visualization Example (with Callbacks)
- **Use daemon.py**: ❌ No
- **What it does**: Interactive graph with search and chat callbacks
- **Server**: Auto-starts
- **Features**:
  - Search: Type 'Alice', 'Engineer', 'Senior'
  - Chat: Ask 'Who is Bob?', 'How many managers?'
- **How to run**: `python 04_advanced_graph.py`

### 05_backend_api_test.py
- **Type**: Backend API Testing (NO visualization)
- **Use daemon.py**: ❌ No (but server must be running)
- **What it does**: Tests all backend endpoints directly
- **Server**: Must be running (start via view_* first, or manually via daemon.py)
- **How to run**:
  ```bash
  # Terminal 1: Start backend
  python -c "from ontosight.core import view_graph; view_graph([{'id':'1','label':'test'}])"
  
  # Terminal 2: Run tests
  python 05_backend_api_test.py
  ```
- **Tests**:
  - GET /health
  - GET /api/meta
  - GET /api/data
  - POST /api/search
  - POST /api/chat

### 06_networkx_example.py
- **Type**: Integration Example
- **Use daemon.py**: ❌ No
- **What it does**: Visualize NetworkX graphs
- **Requirements**: `pip install networkx`
- **Server**: Auto-starts
- **How to run**: `python 06_networkx_example.py`

### 07_pydantic_example.py
- **Type**: Integration Example
- **Use daemon.py**: ❌ No
- **What it does**: Use Pydantic models with OntoSight
- **Requirements**: Pydantic (usually already installed)
- **Server**: Auto-starts
- **How to run**: `python 07_pydantic_example.py`

## Quick Reference: Examples by Use Case

### I want to...

**Visualize a simple graph**
→ Use: `01_basic_graph.py`

**Show complex relationships**
→ Use: `03_basic_hypergraph.py`

**Add search and chat**
→ Use: `04_advanced_graph.py`

**Test the backend API**
→ Use: `05_backend_api_test.py`

**Use NetworkX graphs**
→ Use: `06_networkx_example.py`

**Use Pydantic models**
→ Use: `07_pydantic_example.py`

**Manually control the server**
→ See "When SHOULD I use daemon.py?" above

## Architecture: How It All Works

```
┌─────────────────────┐
│   Your Script       │
│   (e.g. 01_*.py)   │
└──────────┬──────────┘
           │
           ├─── Calls: view_graph() ───┐
           │                           │
           │   Internally:             │
           │   1. Starts backend       │
           │   2. Stores data          │
           │   3. Opens browser        │
           │                           │
           ├──> Backend (localhost:8000)
           │    - FastAPI server
           │    - Stores visualization data
           │    - Handles /api/* endpoints
           │
           └──> Frontend (Browser)
                - React app
                - Interactive visualization
                - Search/Chat panels
```

## Flow Diagram

```
Automatic Flow (You call view_graph()):
    view_graph()
        │
        ├─> Check: Is server running?
        │   ├─ No  → Auto-start server
        │   └─ Yes → Skip startup
        │
        ├─> Store visualization data
        │
        └─> Open browser to http://localhost:8000

Manual Flow (You use start_daemon()):
    start_daemon(port=8001)
        │
        ├─> Check port availability
        │
        ├─> Start uvicorn process
        │
        ├─> Wait for server to be responsive
        │
        └─> Return success/failure

    view_graph(...)
        │
        └─> Store data (server already running)

    stop_daemon()
        │
        ├─> Send SIGTERM
        │
        ├─> Wait for graceful shutdown
        │
        └─> Kill if timeout
```

## Troubleshooting

### No, just call view_graph() or view_hypergraph()!
Automatically handles everything.

### Q: Can I use multiple servers on different ports?
**A**: Yes! Use daemon.py with different ports:
```python
from ontosight.core import start_daemon

start_daemon(port=8000)  # First server
# ... later ...
start_daemon(port=8001)  # Second server
```

### Q: What if port 8000 is already in use?
**A**: The auto-startup will find the next available port (8001, 8002, etc.)
Or use daemon.py to specify a port:
```python
start_daemon(port=8001)
```

### Q: How do I enable auto-reload for development?
**A**: Use daemon.py:
```python
start_daemon(reload=True)
```

### Q: Can I run with multiple workers?
**A**: Yes, use daemon.py:
```python
start_daemon(workers=4)
```

### Q: How do I stop the server?
**A**: Automatic servers stop when your script exits.
Or use daemon.py:
```python
stop_daemon()
```

## Performance Notes

### Small Datasets (< 1k items)
- All examples work fine
- No special optimization needed

### Medium Datasets (1k-10k items)
- Use hypergraph or graph views
- Implement efficient search callbacks to filter results
- May need to filter displayed edges for large graphs

### Large Datasets (10k-100k items)
- Use hypergraph or list views only
- Implement search callbacks to filter results
- Consider preprocessing/aggregation
- See Phase 6 performance optimization

## Next Steps

1. **Start with basics**: Run `01_basic_graph.py`
2. **Try all examples**: Run each to understand capabilities
3. **Test API**: Run `05_backend_api_test.py`
4. **Build your own**: Create a script with your data
5. **Deploy**: See deployment documentation

## Learning Path

```
Beginner:
    01_basic_graph.py
        ↓
    03_basic_hypergraph.py

Intermediate:
    04_advanced_graph.py
        ↓
    06_networkx_example.py
        ↓
    07_pydantic_example.py

Advanced:
    05_backend_api_test.py (test API)
        ↓
    daemon.py (manual control)
        ↓
    Build custom adapters
```

## Questions?

Check these documents:
- README.md - This document
- ../README.md - Project overview
- ../docs/API_REFERENCE.md - API details
- ../docs/ARCHITECTURE.md - System design
- ../docs/TROUBLESHOOTING.md - Common issues
"""
