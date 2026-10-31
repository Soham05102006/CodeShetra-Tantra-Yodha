"""
Twilio WhatsApp Sandbox Webhook & Circuit Breaker Approval Gate.
Parses inbound WhatsApp messages ("APPROVE <thread_id>", "REJECT <thread_id>")
and updates the approval queue and LangGraph execution state.
"""

from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import Response
import re
from typing import Optional
from database import resolve_approval, get_approval_by_thread, add_audit_log

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/whatsapp")
async def twilio_whatsapp_webhook(
    request: Request,
    From: Optional[str] = Form(None),
    Body: Optional[str] = Form(None)
):
    """
    Receives incoming WhatsApp messages from Twilio Sandbox.
    Format expected:
      - 'APPROVE <thread_id>'
      - 'REJECT <thread_id>'
      - or just 'APPROVE' / 'REJECT' (resolves latest pending approval)
    """
    # In case parameters are delivered via form data or JSON
    if not Body:
        try:
            json_data = await request.json()
            Body = json_data.get("Body") or json_data.get("body")
            From = json_data.get("From") or json_data.get("from")
        except Exception:
            pass

    body_text = (Body or "").strip()
    sender = From or "WhatsApp-User"

    match = re.search(r'^(APPROVE|REJECT)(?:\s+([\w\-]+))?', body_text, re.IGNORECASE)
    
    if not match:
        twiml_resp = (
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            "<Response>\n"
            "  <Message>AI-01 Command Not Recognized. Please reply with 'APPROVE &lt;thread_id&gt;' or 'REJECT &lt;thread_id&gt;'.</Message>\n"
            "</Response>"
        )
        return Response(content=twiml_resp, media_type="application/xml")

    action = match.group(1).upper()
    thread_id = match.group(2)

    status = "APPROVED" if action == "APPROVE" else "REJECTED"

    # Find the corresponding approval record
    approval_record = None
    if thread_id:
        approval_record = await get_approval_by_thread(thread_id)

    if not approval_record:
        # Fallback to the latest pending approval
        from database import get_pending_approvals
        pendings = await get_pending_approvals()
        if pendings:
            approval_record = pendings[0]
            thread_id = approval_record["thread_id"]

    if not approval_record:
        twiml_resp = (
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            "<Response>\n"
            f"  <Message>No pending circuit-breaker approvals found for thread '{thread_id or 'latest'}'.</Message>\n"
            "</Response>"
        )
        return Response(content=twiml_resp, media_type="application/xml")

    # Resolve approval in database
    resolved = await resolve_approval(approval_record["approval_id"], status)

    await add_audit_log(
        thread_id=thread_id,
        step_name="whatsapp_circuit_breaker_resolved",
        agent_reasoning=(
            f"Owner {sender} responded via WhatsApp: '{body_text}'. "
            f"Circuit breaker status updated to {status}. Workflow authorized to proceed."
        ),
        tool_used="Twilio-WhatsApp-Gate",
        execution_status=status
    )

    # Resume LangGraph execution if workflow manager is loaded
    try:
        from agent_workflow import resume_workflow_from_approval
        await resume_workflow_from_approval(thread_id, status)
    except Exception as e:
        print(f"[WhatsAppWebhook] Workflow resume notice: {e}")

    reply_msg = (
        f"✓ AI-01 Circuit Breaker: Action {approval_record['action_type']} for {approval_record['description']} has been {status}! "
        f"{'Autonomous execution is resuming.' if status == 'APPROVED' else 'Workflow safely aborted.'}"
    )

    twiml_resp = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<Response>\n"
        f"  <Message>{reply_msg}</Message>\n"
        "</Response>"
    )
    return Response(content=twiml_resp, media_type="application/xml")
