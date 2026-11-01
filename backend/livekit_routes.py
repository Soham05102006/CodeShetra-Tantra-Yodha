"""
LiveKit Cloud Real-Time WebRTC Audio & Video Router for AI-01 — The AI-Native Company of One.
Exposes endpoints to generate short-lived JWT tokens, inspect cluster health,
and manage active video/audio conference rooms.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field

from services.livekit_service import (
    get_livekit_status,
    generate_livekit_token,
    list_livekit_rooms,
    create_livekit_room
)
from services.auth_service import get_current_user_optional

router = APIRouter(prefix="/api/livekit", tags=["LiveKit Video & Audio"])


class TokenRequest(BaseModel):
    room_name: Optional[str] = Field("ai01-ops-room", description="Target LiveKit audio/video room name")
    participant_name: Optional[str] = Field(None, description="Participant display name")
    identity: Optional[str] = Field(None, description="Optional custom participant identity")


class CreateRoomRequest(BaseModel):
    room_name: str = Field(..., min_length=1, max_length=64, description="Room identifier")


@router.get("/status")
async def fetch_status():
    """Returns verified server-side status of LiveKit Cloud."""
    return get_livekit_status()


@router.get("/token")
async def fetch_token_get(
    room: Optional[str] = Query("ai01-ops-room", description="Target room name"),
    name: Optional[str] = Query(None, description="Display name"),
    identity: Optional[str] = Query(None, description="Unique user identity"),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Issues short-lived LiveKit WebRTC access token.
    Uses authenticated user identity if logged in, or generates safe guest identity.
    """
    display_name = name or (current_user.get("full_name") if current_user else "AI Operator")
    user_id = identity or (current_user.get("username") if current_user else None)
    role = current_user.get("role", "OPERATOR") if current_user else "GUEST"

    res = generate_livekit_token(
        room_name=room,
        participant_name=display_name,
        identity=user_id,
        user_role=role
    )
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to generate LiveKit token"))
    return res


@router.post("/token")
async def fetch_token_post(
    payload: TokenRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Issues short-lived LiveKit WebRTC access token via POST with video/audio permissions.
    """
    display_name = payload.participant_name or (current_user.get("full_name") if current_user else "AI Operator")
    user_id = payload.identity or (current_user.get("username") if current_user else None)
    role = current_user.get("role", "OPERATOR") if current_user else "GUEST"

    res = generate_livekit_token(
        room_name=payload.room_name or "ai01-ops-room",
        participant_name=display_name,
        identity=user_id,
        user_role=role
    )
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Failed to generate LiveKit token"))
    return res


@router.get("/rooms")
async def fetch_rooms():
    """Lists currently active rooms from LiveKit Cloud."""
    rooms = await list_livekit_rooms()
    return {"rooms": rooms, "count": len(rooms)}


@router.post("/rooms")
async def make_room(payload: CreateRoomRequest):
    """Creates a new LiveKit conference room."""
    res = await create_livekit_room(payload.room_name)
    return res
