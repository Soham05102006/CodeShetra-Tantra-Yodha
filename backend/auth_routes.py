"""
Authentication Router for AI-01 — The AI-Native Company of One.
Exposes REST endpoints for user authentication, session verification,
and operator role inspection.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from services.auth_service import (
    UserLogin,
    UserRegister,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_required,
    get_current_user_optional,
    ensure_default_admin
)
from mongo_client import get_mongo_collection, serialize_mongo_doc

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
async def login(payload: UserLogin):
    """Authenticates user credentials and issues a signed JWT access token."""
    ensure_default_admin()
    col = get_mongo_collection("users")
    
    # Allow login with either username or email
    user = col.find_one({
        "$or": [
            {"username": payload.username_or_email},
            {"email": payload.username_or_email}
        ],
        "active": True
    })

    if not user or not verify_password(user.get("password_hash", ""), payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Issue token with subject and user role
    token = create_access_token({
        "sub": user["username"],
        "role": user.get("role", "OPERATOR"),
        "name": user.get("full_name", user["username"])
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "email": user.get("email"),
            "full_name": user.get("full_name"),
            "role": user.get("role", "OPERATOR")
        }
    }


@router.post("/register")
async def register(payload: UserRegister, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """Registers a new MSME operator account."""
    ensure_default_admin()
    col = get_mongo_collection("users")

    # Check for duplicate username or email
    existing = col.find_one({
        "$or": [{"username": payload.username}, {"email": payload.email}]
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered."
        )

    new_user = {
        "username": payload.username,
        "email": payload.email,
        "full_name": payload.full_name,
        "password_hash": hash_password(payload.password),
        "role": payload.role or "OPERATOR",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "active": True
    }
    res = col.insert_one(new_user)
    new_user["_id"] = str(res.inserted_id)
    del new_user["password_hash"]

    return {
        "message": "User registered successfully",
        "user": serialize_mongo_doc(new_user)
    }


@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user_required)):
    """Returns currently authenticated user profile."""
    if "password_hash" in user:
        del user["password_hash"]
    return user


@router.get("/users")
async def list_users(user: Dict[str, Any] = Depends(get_current_user_required)):
    """Lists team members."""
    col = get_mongo_collection("users")
    users = list(col.find({"active": True}, {"password_hash": 0}))
    return {"users": serialize_mongo_doc(users)}

