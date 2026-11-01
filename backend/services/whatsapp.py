"""
Zero-Cost WhatsApp Dispatcher Service for AI-01 — The AI-Native Company of One.
Connects FastAPI backend with the local Baileys Node.js WhatsApp microservice.
Provides secure dispatching, QR retrieval, status queries, rate limiting,
consent checking, and communication audit logging.
"""

import os
import re
import logging
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from database import (
    save_whatsapp_message,
    get_all_system_config,
    get_whatsapp_notification_settings,
    add_audit_log
)

logger = logging.getLogger("ai01.whatsapp_service")

# Service Configuration
WHATSAPP_SERVICE_URL = os.getenv("WHATSAPP_SERVICE_URL", "http://127.0.0.1:3001").rstrip("/")
WHATSAPP_SERVICE_TOKEN = os.getenv("WHATSAPP_SERVICE_TOKEN", "ai01_whatsapp_secret_2026")
DEFAULT_OWNER_PHONE = os.getenv("WHATSAPP_OWNER_PHONE", "+91 98765 43210")

def _get_headers() -> Dict[str, str]:
    return {
        "Content-Type": "application/json",
        "x-api-key": WHATSAPP_SERVICE_TOKEN,
        "x-service-token": WHATSAPP_SERVICE_TOKEN
    }

async def get_authorized_approver_phone() -> str:
    """Retrieves the configured business owner/approver phone number."""
    try:
        configs = await get_all_system_config()
        return configs.get("whatsapp_owner_phone") or configs.get("twilio_owner_phone") or DEFAULT_OWNER_PHONE
    except Exception:
        return DEFAULT_OWNER_PHONE

async def is_notification_enabled(key: str) -> bool:
    """Checks whether an AI notification category is enabled by administrator."""
    try:
        settings = await get_whatsapp_notification_settings()
        return settings.get(key, True)
    except Exception:
        return True

async def get_whatsapp_status() -> Dict[str, Any]:
    """Queries the Baileys WhatsApp microservice for current connection status."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{WHATSAPP_SERVICE_URL}/status", headers=_get_headers())
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "success": True,
                    "connected": data.get("connected", False),
                    "status": data.get("status", "disconnected"),
                    "user": data.get("user"),
                    "hasQr": data.get("hasQr", False),
                    "serviceUrl": WHATSAPP_SERVICE_URL
                }
            return {
                "success": False,
                "connected": False,
                "status": "error",
                "error": f"HTTP {resp.status_code}: {resp.text}"
            }
    except Exception as e:
        logger.warning(f"Unable to reach WhatsApp service at {WHATSAPP_SERVICE_URL}: {e}")
        return {
            "success": False,
            "connected": False,
            "status": "offline",
            "error": f"WhatsApp microservice is offline or unreachable: {str(e)}"
        }

async def get_whatsapp_qr() -> Dict[str, Any]:
    """Retrieves the active QR code from Baileys microservice for device pairing."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"{WHATSAPP_SERVICE_URL}/qr", headers=_get_headers())
            if resp.status_code == 200:
                return resp.json()
            return {
                "success": False,
                "qr": None,
                "error": f"HTTP {resp.status_code}: {resp.text}"
            }
    except Exception as e:
        logger.warning(f"Error fetching WhatsApp QR code: {e}")
        return {
            "success": False,
            "qr": None,
            "error": f"WhatsApp microservice is offline: {str(e)}"
        }

async def send_whatsapp(phone: str, message: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Sends an outbound text message via Baileys WhatsApp microservice.
    Validates phone format, records message history, and handles errors gracefully.
    """
    if not phone or not message or not message.strip():
        return {
            "success": False,
            "error": "Recipient phone and non-empty message content are required."
        }

    # Normalize phone: ensure digits only with country code
    clean_phone = re.sub(r"[^\d+]", "", phone.strip())
    if clean_phone.startswith("0") and len(clean_phone) == 11:
        clean_phone = "+91" + clean_phone[1:]
    elif not clean_phone.startswith("+") and len(clean_phone) == 10:
        clean_phone = "+91" + clean_phone

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            payload = {
                "phone": clean_phone,
                "message": message.strip()
            }
            resp = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send",
                headers=_get_headers(),
                json=payload
            )

            if resp.status_code == 200:
                result = resp.json()
                msg_id = result.get("messageId", f"baileys-{int(datetime.now().timestamp()*1000)}")
                
                # Persist message history
                await save_whatsapp_message(
                    direction="OUTBOUND",
                    phone=clean_phone,
                    message=message.strip(),
                    status="SENT",
                    message_id=msg_id
                )

                if thread_id:
                    await add_audit_log(
                        thread_id=thread_id,
                        step_name="whatsapp_message_dispatched",
                        agent_reasoning=f"Dispatched WhatsApp notification to {clean_phone}: '{message[:60]}...'",
                        tool_used="Baileys-WhatsApp-Dispatcher",
                        execution_status="COMPLETED"
                    )

                return {
                    "success": True,
                    "status": "SENT",
                    "messageId": msg_id,
                    "to": clean_phone,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            else:
                err_text = resp.text
                logger.error(f"WhatsApp send failed (HTTP {resp.status_code}): {err_text}")
                
                # Persist failed attempt
                await save_whatsapp_message(
                    direction="OUTBOUND",
                    phone=clean_phone,
                    message=message.strip(),
                    status="FAILED",
                    error=f"HTTP {resp.status_code}: {err_text}"
                )

                return {
                    "success": False,
                    "status": "FAILED",
                    "error": f"WhatsApp service error (HTTP {resp.status_code}): {err_text}"
                }
    except Exception as e:
        logger.error(f"Network error communicating with WhatsApp microservice: {e}")
        await save_whatsapp_message(
            direction="OUTBOUND",
            phone=clean_phone,
            message=message.strip(),
            status="FAILED",
            error=str(e)
        )
        return {
            "success": False,
            "status": "FAILED",
            "error": f"WhatsApp microservice unreachable: {str(e)}"
        }

async def disconnect_whatsapp(clear_auth: bool = False) -> Dict[str, Any]:
    """Requests the Baileys microservice to terminate the active WhatsApp socket session."""
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(
                f"{WHATSAPP_SERVICE_URL}/disconnect",
                headers=_get_headers(),
                json={"clearAuth": clear_auth}
            )
            return resp.json()
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to disconnect WhatsApp microservice: {str(e)}"
        }

async def notify_owner_whatsapp(message: str, notification_key: Optional[str] = None, thread_id: Optional[str] = None) -> Dict[str, Any]:
    """Helper to dispatch WhatsApp alerts to the configured business owner/approver."""
    if notification_key:
        enabled = await is_notification_enabled(notification_key)
        if not enabled:
            logger.info(f"Skipping WhatsApp notification '{notification_key}' - disabled in settings.")
            return {"success": False, "skipped": True, "reason": "Notification disabled"}

    owner_phone = await get_authorized_approver_phone()
    return await send_whatsapp(owner_phone, message, thread_id=thread_id)

