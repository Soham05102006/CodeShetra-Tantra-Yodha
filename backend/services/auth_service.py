"""
Authentication and Authorization Module for AI-01 — The AI-Native Company of One.
Provides JWT token creation, password hashing (PBKDF2-HMAC-SHA256 with 100,000 rounds),
session verification, and FastAPI security dependencies for role-based access.
"""

import os
import hmac
import hashlib
import binascii
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from mongo_client import get_mongo_collection, serialize_mongo_doc, logger

# Security Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ai01_jwt_secret_super_secure_key_2026_sharma")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a unique salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return binascii.hexlify(salt).decode('ascii') + ":" + binascii.hexlify(key).decode('ascii')


def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verifies a password against the stored PBKDF2-HMAC-SHA256 hash."""
    try:
        salt_hex, key_hex = stored_password.split(":")
        salt = binascii.unhexlify(salt_hex.encode('ascii'))
        expected_key = binascii.unhexlify(key_hex.encode('ascii'))
        actual_key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(actual_key, expected_key)
    except Exception as e:
        logger.warning(f"Password verification error: {e}")
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Encodes a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


# Models
class UserLogin(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")
    password: str = Field(..., min_length=4, description="Plaintext password")


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    full_name: str
    password: str = Field(..., min_length=6)
    role: Optional[str] = "OPERATOR"  # 'OWNER' | 'OPERATOR' | 'AUDITOR'


# Database Helpers
def ensure_default_admin():
    """Seeds the baseline MSME Owner credentials if users collection is empty."""
    col = get_mongo_collection("users")
    if col.count_documents({}) == 0:
        admin_doc = {
            "username": "sharma_owner",
            "email": "owner@sharma-enterprises.com",
            "full_name": "Ramesh Sharma (Business Owner)",
            "password_hash": hash_password("Sharma@2026"),
            "role": "OWNER",
            "phone_number": "+919876543210",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "active": True
        }
        operator_doc = {
            "username": "ai_operator",
            "email": "operator@sharma-enterprises.com",
            "full_name": "Priya Sharma (AI Systems Operator)",
            "password_hash": hash_password("Operator@2026"),
            "role": "OPERATOR",
            "phone_number": "+919876543211",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "active": True
        }
        col.insert_many([admin_doc, operator_doc])
        logger.info("Seeded default users: 'sharma_owner' (Password: Sharma@2026), 'ai_operator' (Password: Operator@2026)")


async def get_current_user_optional(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """Retrieves current authenticated user if token present; returns None if omitted."""
    if not creds or not creds.credentials:
        return None
    payload = decode_access_token(creds.credentials)
    if not payload:
        return None
    username = payload.get("sub")
    if not username:
        return None
    col = get_mongo_collection("users")
    user = col.find_one({"username": username, "active": True})
    return serialize_mongo_doc(user) if user else None


async def get_current_user_required(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Strict authentication dependency: rejects request with 401 if token missing/invalid."""
    user = await get_current_user_optional(creds)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a valid Bearer token in Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
