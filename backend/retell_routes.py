"""
Retell AI Telephony Router for AI-01 — The AI-Native Company of One.
Exposes endpoints for dispatching outbound phone calls, verifying webhook authenticity,
and querying Retell provider status.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Header, Request, Depends, status
from pydantic import BaseModel, Field

from services.retell_service import (
    get_retell_status,
    initiate_retell_call,
    verify_retell_signature,
    process_retell_webhook,
    validate_e164_phone
)
from services.auth_service import get_current_user_optional
from mongo_client import get_mongo_collection, serialize_mongo_doc

router = APIRouter(prefix="/api/retell", tags=["Retell AI Telephony"])


class RetellCallRequest(BaseModel):
    phone_number: str = Field(..., description="Recipient phone number (E.164 format)")
    customer_name: str = Field(..., description="Debtor/Customer full name")
    invoice_number: str = Field(..., description="Overdue invoice identifier")
    amount_due: float = Field(..., gt=0, description="Overdue balance amount")
    thread_id: Optional[str] = "retell-manual-dispatch"


@router.get("/status")
async def fetch_status():
    """Returns verified server-side configuration status of Retell AI."""
    return get_retell_status()


@router.post("/call")
async def dispatch_call(
    payload: RetellCallRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Triggers an outbound telephone call via Retell AI.
    Validates E.164 phone numbers and handles carrier/API errors accurately.
    """
    res = await initiate_retell_call(
        to_number=payload.phone_number,
        customer_name=payload.customer_name,
        invoice_number=payload.invoice_number,
        amount_due=payload.amount_due,
        thread_id=payload.thread_id or "retell-manual"
    )

    if not res.get("success"):
        # Explicit error reporting without fabrication
        status_code = status.HTTP_400_BAD_REQUEST if res.get("status") == "INVALID_PHONE_NUMBER" else (
            status.HTTP_503_SERVICE_UNAVAILABLE if res.get("status") == "NOT_CONFIGURED" else status.HTTP_502_BAD_GATEWAY
        )
        raise HTTPException(status_code=status_code, detail=res)

    return res


@router.post("/webhook")
async def receive_webhook(
    request: Request,
    x_retell_signature: Optional[str] = Header(None, alias="X-Retell-Signature"),
    retell_signature: Optional[str] = Header(None, alias="Retell-Signature")
):
    """
    Receives incoming webhook callbacks from Retell AI.
    Validates cryptographic signature before processing transcripts and call status updates.
    """
    body_bytes = await request.body()
    sig_header = x_retell_signature or retell_signature

    if not verify_retell_signature(body_bytes, sig_header):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Retell cryptographic webhook signature."
        )

    try:
        import json
        payload = json.loads(body_bytes.decode('utf-8'))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON webhook payload")

    res = await process_retell_webhook(payload)
    return res


@router.get("/calls")
async def get_calls(limit: int = 50):
    """Returns persistent call records dispatched via Retell AI."""
    col = get_mongo_collection("voice_calls")
    calls = list(col.find({"provider": "RETELL_AI"}).sort([("created_at", -1)]).limit(limit))
    return {"calls": serialize_mongo_doc(calls), "count": len(calls)}

