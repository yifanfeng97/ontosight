"""API route: POST /api/chat - Chat with visualization."""

from fastapi import APIRouter, HTTPException

from ontosight.server.models.api import ChatRequest, ChatResponse
from ontosight.server.state import global_state

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with the visualization data.

    Args:
        request: Chat request with query

    Returns:
        ChatResponse with response text and optional sources

    Raises:
        HTTPException: 400 if query is invalid, 404 if callback not registered
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    state = global_state

    try:
        # Try to execute chat callback
        result = state.execute_callback("chat", query=request.query, context=request.context or {})

        # Handle various response formats
        if isinstance(result, ChatResponse):
            return result
        elif isinstance(result, dict):
            return ChatResponse(**result)
        elif isinstance(result, tuple) and len(result) == 2:
            response_text, sources = result
            return ChatResponse(response=str(response_text), sources=sources)
        else:
            return ChatResponse(response=str(result))
    except KeyError:
        # No chat callback registered - return empty response
        raise HTTPException(
            status_code=404,
            detail="Chat callback not registered. Register with GlobalState.register_callbacks(chat=...)",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
