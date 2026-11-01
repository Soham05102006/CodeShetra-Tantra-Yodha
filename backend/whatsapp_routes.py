"""
WhatsApp REST API Router for AI-01 — The AI-Native Company of One.
Exposes endpoints for the React dashboard to manage WhatsApp connection,
view live QR codes, dispatch manual messages, review communications history,
and configure AI notification triggers.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from services.whatsapp import (
    get_whatsapp_status,
    get_whatsapp_qr,
    send_whatsapp,
    disconnect_whatsapp,
    is_notification_enabled
)
from database import (
    get_whatsapp_messages,
    get_whatsapp_notification_settings,
    update_whatsapp_notification_settings,
    add_audit_log
)

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Dispatcher"])

class SendMessagePayload(BaseModel):
    phone: str = Field(..., description="Recipient phone number with country code")
    message: str = Field(..., min_length=1, max_length=4096, description="Text message content")

class DisconnectPayload(BaseModel):
    clear_auth: bool = Field(False, description="Whether to purge persistent auth credentials")

class NotificationSettingsPayload(BaseModel):
    notify_invoice_ingestion: Optional[bool] = True
    notify_overdue_reminders: Optional[bool] = True
    notify_circuit_breaker: Optional[bool] = True
    notify_approval_resolution: Optional[bool] = True
    notify_workflow_completion: Optional[bool] = True
    notify_workflow_failure: Optional[bool] = True

@router.get("/status")
async def fetch_status():
    """Returns the current connection state of the Baileys WhatsApp microservice."""
    status = await get_whatsapp_status()
    return status

@router.get("/qr")
async def fetch_qr():
    """Retrieves the active QR code for WhatsApp Web authentication."""
    qr_data = await get_whatsapp_qr()
    return qr_data

@router.post("/send")
async def dispatch_message(payload: SendMessagePayload):
    """Dispatches a manual or automated WhatsApp message to a recipient."""
    res = await send_whatsapp(payload.phone, payload.message)
    if not res.get("success"):
        raise HTTPException(
            status_code=400 if "Invalid" in res.get("error", "") else 503,
            detail=res.get("error", "Failed to dispatch message")
        )
    return res

@router.post("/disconnect")
async def disconnect_session(payload: DisconnectPayload = Body(default=DisconnectPayload())):
    """Terminates the WhatsApp session and optionally resets pairing credentials."""
    res = await disconnect_whatsapp(clear_auth=payload.clear_auth)
    await add_audit_log(
        thread_id="whatsapp-session",
        step_name="whatsapp_manual_disconnect",
        agent_reasoning=f"Admin initiated manual WhatsApp disconnection (clearAuth={payload.clear_auth}).",
        tool_used="WhatsApp-Dispatcher",
        execution_status="DISCONNECTED"
    )
    return res

@router.get("/messages")
async def fetch_message_history(limit: int = Query(50, ge=1, le=200)):
    """Retrieves recent inbound and outbound WhatsApp communication logs."""
    msgs = await get_whatsapp_messages(limit=limit)
    return {"messages": msgs, "total": len(msgs)}

@router.get("/settings")
async def fetch_notification_settings():
    """Retrieves AI notification preferences for automated workflow events."""
    settings = await get_whatsapp_notification_settings()
    return {"settings": settings}

@router.post("/settings")
async def save_notification_settings(payload: NotificationSettingsPayload):
    """Updates AI notification preferences for automated workflow events."""
    data = payload.model_dump(exclude_unset=True)
    updated = await update_whatsapp_notification_settings(data)
    await add_audit_log(
        thread_id="system-configuration",
        step_name="whatsapp_notification_settings_updated",
        agent_reasoning=f"Admin updated WhatsApp AI notification settings: {data}",
        tool_used="Config-Manager",
        execution_status="UPDATED"
    )
    return {"success": True, "settings": updated}

