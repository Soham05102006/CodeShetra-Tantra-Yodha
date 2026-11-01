"""
Retell AI Outbound Telephony Service for AI-01 — The AI-Native Company of One.
Provides official Retell AI API integration for genuine outbound phone calls,
E.164 telephone number validation, cryptographic webhook signature verification,
and accurate MongoDB Atlas persistence without fabricated outcomes.
"""

import os
import re
import hmac
import hashlib
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment configuration
_current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_current_dir, "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(_current_dir), "..", ".env"))
load_dotenv()

logger = logging.getLogger("ai01.retell")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# Load environment variables
RETELL_API_KEY = os.getenv("RETELL_API_KEY", "").strip()
RETELL_AGENT_ID = os.getenv("RETELL_AGENT_ID", "").strip()
RETELL_PHONE_NUMBER = os.getenv("RETELL_PHONE_NUMBER", "").strip()

from database import (
    insert_or_update_voice_call,
    update_transaction_promise,
    add_audit_log,
    get_voice_calls_db
)
from mongo_client import get_mongo_collection, serialize_mongo_doc


def mask_key(key: str) -> str:
    """Masks secret key for safe UI and telemetry display."""
    if not key or len(key) <= 6:
        return "Not Configured"
    return f"{key[:4]}****{key[-4:]}"


def validate_e164_phone(phone: str) -> Tuple[bool, str, Optional[str]]:
    """
    Validates and formats telephone numbers into strict E.164 format (+[country code][number]).
    Returns (is_valid, cleaned_phone, error_reason).
    """
    if not phone:
        return False, "", "Phone number cannot be empty."

    # Strip whitespaces, hyphens, parentheses, dots
    cleaned = re.sub(r'[\s\-\(\)\.]', '', str(phone).strip())

    # If starts with '00', replace with '+'
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]

    # If Indian 10-digit number without country code, prefix with +91
    if len(cleaned) == 10 and cleaned.isdigit():
        cleaned = "+91" + cleaned
    elif not cleaned.startswith("+") and cleaned.isdigit() and len(cleaned) == 12 and cleaned.startswith("91"):
        cleaned = "+" + cleaned
    elif not cleaned.startswith("+") and cleaned.isdigit():
        cleaned = "+" + cleaned

    # E.164 standard: + followed by 7 to 15 digits
    e164_pattern = r'^\+[1-9]\d{6,14}$'
    if not re.match(e164_pattern, cleaned):
        return False, cleaned, f"'{phone}' is not a valid E.164 format (e.g. +919876543210)."

    return True, cleaned, None


def get_retell_status() -> Dict[str, Any]:
    """
    Returns verified server-side status of Retell AI telephony integration.
    Distinguishes genuine configuration from unconfigured state.
    """
    is_configured = bool(RETELL_API_KEY and len(RETELL_API_KEY) > 10)
    agent_configured = bool(RETELL_AGENT_ID and len(RETELL_AGENT_ID) > 5)
    phone_configured = bool(RETELL_PHONE_NUMBER and len(RETELL_PHONE_NUMBER) > 5)

    status_str = "CONNECTED" if (is_configured and agent_configured and phone_configured) else (
        "PARTIALLY_CONFIGURED" if is_configured else "NOT_CONFIGURED"
    )

    return {
        "name": "Retell AI Outbound Telephony",
        "provider": "RETELL_AI",
        "status": status_str,
        "api_key_masked": mask_key(RETELL_API_KEY),
        "agent_id_configured": agent_configured,
        "agent_id_masked": mask_key(RETELL_AGENT_ID) if agent_configured else "Not Set",
        "from_phone_number": RETELL_PHONE_NUMBER or "Not Set",
        "connected": is_configured and agent_configured and phone_configured,
        "features": [
            "Real Outbound Carrier Telephony",
            "Bilingual Hinglish/Hindi Conversational Voice Agent",
            "Automatic Call Recording & Webhook Transcription",
            "Cryptographic Signature Verification"
        ]
    }


def verify_retell_signature(body_bytes: bytes, signature_header: Optional[str]) -> bool:
    """
    Validates webhook authenticity using HMAC-SHA256 against RETELL_API_KEY.
    Prevents forged webhook requests from spoofing call transcripts.
    """
    if not RETELL_API_KEY:
        logger.warning("Retell API key unconfigured; skipping webhook signature verification in development.")
        return True

    if not signature_header:
        logger.warning("Missing Retell-Signature header on incoming webhook.")
        return False

    try:
        # Extract raw hex signature (handles both raw hex and v1=<sig> format)
        provided_sig = signature_header.strip()
        if "v1=" in provided_sig:
            for part in provided_sig.split(","):
                if part.strip().startswith("v1="):
                    provided_sig = part.strip()[3:]
                    break

        expected_sig = hmac.new(
            RETELL_API_KEY.encode('utf-8'),
            body_bytes,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_sig, provided_sig)
    except Exception as e:
        logger.error(f"Error validating Retell webhook signature: {e}")
        return False


async def initiate_retell_call(
    to_number: str,
    customer_name: str,
    invoice_number: str,
    amount_due: float,
    thread_id: str = "retell-thread",
    dynamic_variables: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Dispatches a genuine outbound telephony call via Retell AI.
    Accurately records call status in MongoDB without fabricating outcomes.
    """
    # 1. Validate phone number
    is_valid, clean_phone, phone_err = validate_e164_phone(to_number)
    if not is_valid:
        err_msg = f"Phone validation failed: {phone_err}"
        logger.warning(err_msg)
        await add_audit_log(
            thread_id=thread_id,
            step_name="retell_phone_validation_failed",
            agent_reasoning=err_msg,
            tool_used="Retell-Phone-Validator",
            execution_status="FAILED"
        )
        return {
            "success": False,
            "status": "INVALID_PHONE_NUMBER",
            "error": err_msg,
            "phone": to_number
        }

    # 2. Verify API key
    if not RETELL_API_KEY:
        err_msg = "RETELL_API_KEY is not configured in backend environment (.env)."
        logger.warning(err_msg)
        await add_audit_log(
            thread_id=thread_id,
            step_name="retell_config_missing",
            agent_reasoning=err_msg,
            tool_used="Retell-API-Dispatcher",
            execution_status="NOT_CONFIGURED"
        )
        return {
            "success": False,
            "status": "NOT_CONFIGURED",
            "error": err_msg,
            "phone": clean_phone
        }

    if not RETELL_AGENT_ID or not RETELL_PHONE_NUMBER:
        err_msg = "RETELL_AGENT_ID or RETELL_PHONE_NUMBER is not set in .env."
        logger.warning(err_msg)
        return {
            "success": False,
            "status": "NOT_CONFIGURED",
            "error": err_msg,
            "phone": clean_phone
        }

    # 3. Call Retell SDK / REST API
    try:
        import retell
        client = retell.Retell(api_key=RETELL_API_KEY)

        vars_payload = dynamic_variables or {}
        vars_payload.update({
            "customer_name": customer_name,
            "invoice_number": invoice_number,
            "amount_due": f"₹{amount_due:,.2f}"
        })

        call_resp = client.call.create_phone_call(
            from_number=RETELL_PHONE_NUMBER,
            to_number=clean_phone,
            override_agent_id=RETELL_AGENT_ID,
            retell_llm_dynamic_variables=vars_payload
        )

        call_id = getattr(call_resp, "call_id", str(call_resp.get("call_id") if isinstance(call_resp, dict) else ""))
        call_status = getattr(call_resp, "call_status", "registered")

        logger.info(f"Retell call initiated successfully! Call ID: {call_id} to {clean_phone}")

        # Persist call initiation in MongoDB Atlas
        record = {
            "id": call_id,
            "provider": "RETELL_AI",
            "contact_name": customer_name,
            "phone_number": clean_phone,
            "masked_phone": clean_phone[:6] + " XXXXX" if len(clean_phone) > 6 else clean_phone,
            "invoice_number": invoice_number,
            "amount_due": float(amount_due),
            "language": "Hindi / Hinglish",
            "call_status": "INITIATED",
            "raw_status": call_status,
            "extracted_promise": None,
            "duration": "00:00",
            "recording_url": None,
            "ai_transcript": None,
            "customer_transcript": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await insert_or_update_voice_call(record)

        await add_audit_log(
            thread_id=thread_id,
            step_name="retell_voice_call_initiated",
            agent_reasoning=f"Outbound Retell AI phone call dispatched to {clean_phone} (Call ID: {call_id}).",
            tool_used="Retell-AI-Telephony",
            execution_status="INITIATED"
        )

        return {
            "success": True,
            "status": "INITIATED",
            "call_id": call_id,
            "phone": clean_phone,
            "provider": "RETELL_AI"
        }

    except Exception as e:
        err_msg = f"Retell AI API call failed: {str(e)}"
        logger.error(err_msg)
        await add_audit_log(
            thread_id=thread_id,
            step_name="retell_api_call_failed",
            agent_reasoning=err_msg,
            tool_used="Retell-AI-Telephony",
            execution_status="FAILED"
        )
        return {
            "success": False,
            "status": "FAILED",
            "error": err_msg,
            "phone": clean_phone
        }


async def process_retell_webhook(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes incoming Retell webhooks (call_started, call_ended, call_analyzed).
    Updates MongoDB with real transcripts, real durations, and promised payment dates.
    """
    event = payload.get("event")
    data = payload.get("data") or payload.get("call") or payload
    call_id = data.get("call_id") or payload.get("call_id")

    if not call_id:
        return {"success": False, "error": "Missing call_id in webhook payload"}

    logger.info(f"Processing Retell webhook event '{event}' for call '{call_id}'")

    col = get_mongo_collection("voice_calls")
    existing = col.find_one({"id": call_id}) or {}

    updates: Dict[str, Any] = {
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    if event == "call_started":
        updates["call_status"] = "CONNECTED"
    elif event in ("call_ended", "call_analyzed"):
        updates["call_status"] = "COMPLETED"

    # Extract real duration
    duration_ms = data.get("duration_ms")
    if duration_ms is not None:
        total_seconds = int(duration_ms // 1000)
        mins = total_seconds // 60
        secs = total_seconds % 60
        updates["duration"] = f"{mins:02d}:{secs:02d}"

    # Extract real audio recording
    recording_url = data.get("recording_url")
    if recording_url:
        updates["recording_url"] = recording_url

    # Extract genuine transcript
    transcript = data.get("transcript")
    if transcript:
        updates["customer_transcript"] = transcript
        updates["ai_transcript"] = transcript

    # Extract custom analysis/promised date if extracted by Retell
    call_analysis = data.get("call_analysis") or {}
    custom_data = call_analysis.get("custom_analysis_data") or {}
    promised_date = custom_data.get("promised_payment_date") or data.get("promised_payment_date")

    if promised_date:
        updates["extracted_promise"] = str(promised_date)
        updates["promised_date"] = str(promised_date)
        # Update ledger if invoice is linked
        inv_num = existing.get("invoice_number")
        if inv_num:
            await update_transaction_promise(
                invoice_number=inv_num,
                promised_date=str(promised_date),
                notes=f"Retell Call ({call_id}): Customer promised payment by {promised_date}."
            )

    col.update_one({"id": call_id}, {"$set": updates}, upsert=True)

    await add_audit_log(
        thread_id=f"retell-{call_id[:8]}",
        step_name=f"retell_webhook_{event or 'update'}",
        agent_reasoning=f"Retell webhook processed for call {call_id}. Status: {updates.get('call_status', 'UPDATED')}.",
        tool_used="Retell-Webhook-Listener",
        execution_status="SUCCESS"
    )

    return {"success": True, "call_id": call_id, "event": event}

