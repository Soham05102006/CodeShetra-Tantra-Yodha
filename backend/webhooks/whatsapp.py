"""
WhatsApp Circuit Breaker Approval Gate for AI-01 — The AI-Native Company of One.
Supports both Free Baileys WhatsApp Dispatcher and Twilio legacy format.
Enforces strict sender authorization, thread verification, duplicate approval prevention,
and comprehensive audit forensics.
"""

import os
import re
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Request, Form, HTTPException, Header
from fastapi.responses import Response, JSONResponse

from database import (
    resolve_approval,
    get_approval_by_thread,
    get_pending_approvals,
    add_audit_log,
    save_whatsapp_message,
    get_all_system_config
)
from services.whatsapp import send_whatsapp

logger = logging.getLogger("ai01.whatsapp_webhook")
router = APIRouter(tags=["WhatsApp Webhook"])

def normalize_digits(phone: str) -> str:
    """Extracts pure digits from phone number for reliable equality comparison."""
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("91") and len(digits) == 12:
        return digits[2:]  # 10 digits
    if digits.startswith("0") and len(digits) == 11:
        return digits[1:]
    return digits

async def is_sender_authorized(sender_phone: str) -> bool:
    """Checks whether the incoming WhatsApp phone number is an authorized approver."""
    if not sender_phone:
        return False
    
    sender_digits = normalize_digits(sender_phone)
    if not sender_digits:
        return False

    configs = await get_all_system_config()
    authorized_phones = [
        configs.get("whatsapp_owner_phone", "+91 98765 43210"),
        configs.get("twilio_owner_phone", "+91 98765 43210"),
        os.getenv("WHATSAPP_OWNER_PHONE", "+919876543210"),
        os.getenv("TWILIO_OWNER_PHONE", "+919876543210")
    ]

    # Additional authorized phone numbers from comma-separated env
    extra = os.getenv("WHATSAPP_AUTHORIZED_PHONES", "")
    if extra:
        authorized_phones.extend(extra.split(","))

    for p in authorized_phones:
        if normalize_digits(p) == sender_digits:
            return True

    return False

async def process_whatsapp_command(sender_phone: str, body_text: str, message_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Core security & resolution engine for WhatsApp APPROVE / REJECT commands.
    Verifies sender authorization, prevents duplicate processing, and triggers workflow resume.
    """
    clean_body = (body_text or "").strip()
    logger.info(f"Processing inbound WhatsApp command from {sender_phone}: '{clean_body}'")

    # Record message in database
    await save_whatsapp_message(
        direction="INBOUND",
        phone=sender_phone,
        message=clean_body,
        status="RECEIVED",
        message_id=message_id
    )

    # 1. Authorize sender
    authorized = await is_sender_authorized(sender_phone)
    if not authorized:
        reason = f"SECURITY ALERT: Unauthorized WhatsApp approval command from {sender_phone} blocked. Text: '{clean_body}'"
        logger.warning(reason)
        await add_audit_log(
            thread_id="security-gatekeeper",
            step_name="unauthorized_whatsapp_command_blocked",
            agent_reasoning=reason,
            tool_used="Security-Authorization-Gate",
            execution_status="BLOCKED"
        )
        reply = (
            f"⚠️ AI-01 Security Alert: Phone number {sender_phone} is not authorized to approve or reject "
            f"high-stakes operations for Sharma Enterprises."
        )
        await send_whatsapp(sender_phone, reply)
        return {
            "success": False,
            "status": "BLOCKED",
            "reason": "Unauthorized sender phone number",
            "reply": reply
        }

    # 2. Parse command: APPROVE <thread_id> or REJECT <thread_id>
    match = re.search(r'^(APPROVE|REJECT)(?:\s+([\w\-]+))?', clean_body, re.IGNORECASE)
    if not match:
        reply = "AI-01 Command Not Recognized. Please reply with 'APPROVE <thread_id>' or 'REJECT <thread_id>'."
        await send_whatsapp(sender_phone, reply)
        return {
            "success": False,
            "status": "UNRECOGNIZED",
            "reply": reply
        }

    action = match.group(1).upper()
    thread_id = match.group(2)
    action_status = "APPROVED" if action == "APPROVE" else "REJECTED"

    # 3. Locate approval record
    approval_record = None
    if thread_id:
        approval_record = await get_approval_by_thread(thread_id)

    if not approval_record:
        pendings = await get_pending_approvals()
        if pendings:
            approval_record = pendings[0]
            thread_id = approval_record["thread_id"]

    if not approval_record:
        reply = f"No pending circuit-breaker approvals found for thread '{thread_id or 'latest'}'."
        await send_whatsapp(sender_phone, reply)
        return {
            "success": False,
            "status": "NO_PENDING_APPROVAL",
            "reply": reply
        }

    # 4. Prevent duplicate approval processing
    curr_status = str(approval_record.get("status", "")).upper()
    if curr_status in ("APPROVED", "REJECTED"):
        reply = (
            f"ℹ️ Request '{approval_record['approval_id']}' for thread '{thread_id}' has already been processed "
            f"with status '{curr_status}'. Duplicate command ignored."
        )
        logger.info(reply)
        await send_whatsapp(sender_phone, reply)
        return {
            "success": False,
            "status": "ALREADY_PROCESSED",
            "previous_status": curr_status,
            "reply": reply
        }

    # 5. Resolve approval in database
    await resolve_approval(approval_record["approval_id"], action_status)

    # 6. Audit Trail Forensics
    await add_audit_log(
        thread_id=thread_id,
        step_name="whatsapp_circuit_breaker_resolved",
        agent_reasoning=(
            f"Authorized Owner {sender_phone} responded via WhatsApp: '{clean_body}'. "
            f"Circuit breaker status updated to {action_status}. Workflow authorized to proceed."
        ),
        tool_used="Baileys-WhatsApp-Gate",
        execution_status=action_status
    )

    # 7. Resume LangGraph execution
    try:
        from agent_workflow import resume_workflow_from_approval
        await resume_workflow_from_approval(thread_id, action_status)
    except Exception as e:
        logger.error(f"[WhatsAppWebhook] Workflow resume error: {e}")

    # 8. Confirmation message
    reply_msg = (
        f"✓ AI-01 Circuit Breaker: Action {approval_record.get('action_type', 'Action')} "
        f"for {approval_record.get('description', '')} has been {action_status}! "
        f"{'Autonomous execution is resuming.' if action_status == 'APPROVED' else 'Workflow safely aborted.'}"
    )
    await send_whatsapp(sender_phone, reply_msg, thread_id=thread_id)

    return {
        "success": True,
        "status": action_status,
        "approval_id": approval_record["approval_id"],
        "thread_id": thread_id,
        "reply": reply_msg
    }

# ==========================================
# ENDPOINT 1: Baileys Microservice Webhook
# ==========================================
@router.post("/api/whatsapp/incoming")
async def baileys_incoming_webhook(
    request: Request,
    x_service_token: Optional[str] = Header(None)
):
    """
    Receives incoming WhatsApp messages forwarded from the local Baileys microservice.
    Protected with internal service secret token.
    """
    expected_token = os.getenv("WHATSAPP_SERVICE_TOKEN", "ai01_whatsapp_secret_2026")
    if x_service_token != expected_token:
        raise HTTPException(status_code=401, detail="Unauthorized webhook caller")

    try:
        body_json = await request.json()
        sender_phone = body_json.get("from")
        body_text = body_json.get("body")
        message_id = body_json.get("messageId")

        res = await process_whatsapp_command(sender_phone, body_text, message_id=message_id)
        return JSONResponse(status_code=200, content=res)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling Baileys incoming webhook: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

# ==========================================
# ENDPOINT 2: Legacy Twilio Sandbox Webhook (Preserved)
# ==========================================
@router.post("/api/webhooks/whatsapp")
async def twilio_whatsapp_webhook(
    request: Request,
    From: Optional[str] = Form(None),
    Body: Optional[str] = Form(None)
):
    """
    Preserved Twilio Sandbox Webhook with complete backward compatibility.
    """
    if not Body:
        try:
            json_data = await request.json()
            Body = json_data.get("Body") or json_data.get("body")
            From = json_data.get("From") or json_data.get("from")
        except Exception:
            pass

    sender = From or "WhatsApp-User"
    body_text = (Body or "").strip()

    res = await process_whatsapp_command(sender, body_text)
    reply_msg = res.get("reply", "Command received.")

    twiml_resp = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<Response>\n"
        f"  <Message>{reply_msg}</Message>\n"
        "</Response>"
    )
    return Response(content=twiml_resp, media_type="application/xml")
