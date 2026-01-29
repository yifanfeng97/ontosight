"""API route: POST /api/search - Search visualization."""

from fastapi import APIRouter, HTTPException

from ontosight.server.models.api import SearchRequest, SearchResponse
from ontosight.server.state import global_state

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest) -> SearchResponse:
    """Search visualization for matching nodes.

    Args:
        request: Search request with query string

    Returns:
        SearchResponse with list of matching node IDs

    Raises:
        HTTPException: 400 if query is invalid, 404 if callback not registered
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    state = global_state

    try:
        results = state.execute_callback(
            "search", query=request.query, context=request.context or {}
        )

        if results is None:
            results = []

        if not isinstance(results, list):
            results = [str(r) for r in results]

        return SearchResponse(results=results)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Search callback not registered. Register with GlobalState.register_callbacks(search=...)",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
