"""
Provider-Independent Voice Architecture for AI-01 — The AI-Native Company of One.
Defines the standard VoiceProvider interface and implementations for Retell AI,
Vapi.ai, and Zero-Cost Simulation fallbacks for LangGraph and dashboard operations.
"""

import os
import abc
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from services.retell_service import (
    initiate_retell_call,
    get_retell_status,
    validate_e164_phone,
    process_retell_webhook
)

logger = logging.getLogger("ai01.voice_provider")


class BaseVoiceProvider(abc.ABC):
    """Abstract interface for all telephony voice providers."""

    @property
    @abc.abstractmethod
    def provider_name(self) -> str:
        pass

    @abc.abstractmethod
    async def initiate_call(
        self,
        to_number: str,
        customer_name: str,
        invoice_number: str,
        amount_due: float,
        thread_id: str = "voice-thread"
    ) -> Dict[str, Any]:
        """Initiates an outbound phone call and returns structured call execution status."""
        pass

    @abc.abstractmethod
    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """Queries status of an active or completed call."""
        pass

    @abc.abstractmethod
    async def handle_webhook(self, payload: Dict[str, Any], signature: Optional[str] = None) -> Dict[str, Any]:
        """Processes provider webhooks."""
        pass

    @abc.abstractmethod
    async def get_transcript(self, call_id: str) -> Optional[str]:
        """Retrieves call transcript."""
        pass


class RetellVoiceProvider(BaseVoiceProvider):
    """Retell AI Telephony Voice Provider."""

    @property
    def provider_name(self) -> str:
        return "RETELL_AI"

    async def initiate_call(
        self,
        to_number: str,
        customer_name: str,
        invoice_number: str,
        amount_due: float,
        thread_id: str = "voice-thread"
    ) -> Dict[str, Any]:
        return await initiate_retell_call(
            to_number=to_number,
            customer_name=customer_name,
            invoice_number=invoice_number,
            amount_due=amount_due,
            thread_id=thread_id
        )

    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        from mongo_client import get_mongo_collection, serialize_mongo_doc
        col = get_mongo_collection("voice_calls")
        call = col.find_one({"id": call_id})
        return serialize_mongo_doc(call) if call else {"status": "UNKNOWN", "call_id": call_id}

    async def handle_webhook(self, payload: Dict[str, Any], signature: Optional[str] = None) -> Dict[str, Any]:
        return await process_retell_webhook(payload)

    async def get_transcript(self, call_id: str) -> Optional[str]:
        status = await self.get_call_status(call_id)
        return status.get("customer_transcript") or status.get("ai_transcript")


class VapiVoiceProvider(BaseVoiceProvider):
    """Vapi.ai Outbound Voice Provider with genuine API calls."""

    @property
    def provider_name(self) -> str:
        return "VAPI_AI"

    async def initiate_call(
        self,
        to_number: str,
        customer_name: str,
        invoice_number: str,
        amount_due: float,
        thread_id: str = "voice-thread"
    ) -> Dict[str, Any]:
        vapi_key = os.getenv("VAPI_API_KEY", "").strip()
        vapi_phone_id = os.getenv("VAPI_PHONE_NUMBER_ID", "").strip()

        if not vapi_key or len(vapi_key) < 10:
            return {
                "success": False,
                "status": "NOT_CONFIGURED",
                "error": "VAPI_API_KEY is not configured in environment.",
                "phone": to_number
            }

        import httpx
        prompt = (
            f"You are Priya, collection executive for Sharma Enterprises. "
            f"Inform {customer_name} that invoice {invoice_number} of ₹{amount_due:,.2f} is overdue. "
            f"Politely secure a promised settlement date."
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    "https://api.vapi.ai/call/phone",
                    headers={"Authorization": f"Bearer {vapi_key}", "Content-Type": "application/json"},
                    json={
                        "phoneNumberId": vapi_phone_id,
                        "customer": {"number": to_number, "name": customer_name},
                        "assistant": {
                            "firstMessage": f"Namaste {customer_name} ji! Main Sharma Enterprises se baat kar rahi hoon.",
                            "model": {"provider": "google", "model": "gemini-2.0-flash", "messages": [{"role": "system", "content": prompt}]}
                        }
                    }
                )
                if resp.status_code in (200, 201):
                    data = resp.json()
                    return {"success": True, "status": "INITIATED", "call_id": data.get("id"), "provider": "VAPI_AI"}
                return {"success": False, "status": "FAILED", "error": resp.text, "provider": "VAPI_AI"}
        except Exception as e:
            return {"success": False, "status": "FAILED", "error": str(e), "provider": "VAPI_AI"}

    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        return {"status": "UNKNOWN", "call_id": call_id}

    async def handle_webhook(self, payload: Dict[str, Any], signature: Optional[str] = None) -> Dict[str, Any]:
        return {"success": True}

    async def get_transcript(self, call_id: str) -> Optional[str]:
        return None


class SimulationVoiceProvider(BaseVoiceProvider):
    """High-Fidelity $0 Zero-Cost Vernacular Simulation Provider for Demos & Offline Testing."""

    @property
    def provider_name(self) -> str:
        return "SIMULATION"

    async def initiate_call(
        self,
        to_number: str,
        customer_name: str,
        invoice_number: str,
        amount_due: float,
        thread_id: str = "voice-thread"
    ) -> Dict[str, Any]:
        from voice_dispatcher import voice_dispatcher
        res = await voice_dispatcher.dispatch_call(
            customer_name=customer_name,
            phone_number=to_number,
            invoice_number=invoice_number,
            amount_due=amount_due,
            thread_id=thread_id
        )
        return {
            "success": True,
            "status": "COMPLETED",
            "call_id": res.get("call_id"),
            "provider": "SIMULATION",
            "transcript": res.get("transcript"),
            "promised_payment_date": res.get("promised_payment_date")
        }

    async def get_call_status(self, call_id: str) -> Dict[str, Any]:
        return {"status": "COMPLETED", "call_id": call_id}

    async def handle_webhook(self, payload: Dict[str, Any], signature: Optional[str] = None) -> Dict[str, Any]:
        return {"success": True}

    async def get_transcript(self, call_id: str) -> Optional[str]:
        return "Simulated vernacular dialogue completed."


# Factory Provider Selector
def get_voice_provider(preferred: Optional[str] = None) -> BaseVoiceProvider:
    """
    Returns the appropriate VoiceProvider instance based on system settings or preference.
    Defaults to Retell AI if configured, with graceful fallback to simulation.
    """
    provider_key = (preferred or os.getenv("VOICE_CALL_PROVIDER", "")).strip().upper()

    if provider_key in ("RETELL", "RETELL_AI"):
        return RetellVoiceProvider()
    elif provider_key in ("VAPI", "VAPI_AI"):
        return VapiVoiceProvider()
    elif provider_key in ("SIMULATION", "DEMO"):
        return SimulationVoiceProvider()

    # Automatic selection based on active credentials
    retell_status = get_retell_status()
    if retell_status["connected"]:
        return RetellVoiceProvider()

    vapi_key = os.getenv("VAPI_API_KEY", "").strip()
    if vapi_key and len(vapi_key) > 10:
        return VapiVoiceProvider()

    # Default to Simulation provider for reliable offline/demo MSME presentations
    return SimulationVoiceProvider()

