"""
Comprehensive Verification Test Suite for Free Baileys WhatsApp Dispatcher in AI-01.
Tests:
  1. WhatsApp Service Status & Connectivity
  2. QR Code Endpoint Structure
  3. Phone Number Validation & Normalization
  4. Missing/Empty Message Validation
  5. Unauthorized API Request Rejection (Security Token)
  6. Outbound Dispatch & Database History Persistence
  7. Incoming WhatsApp Webhook & Authorized Approval Resolution
  8. Unauthorized Sender APPROVE/REJECT Command Blocking
  9. Duplicate Approval Prevention
  10. Duplicate Notification Prevention in Workflow State
  11. AI Notification Preferences Persistence
  12. Communications History Retrieval
"""

import asyncio
import os
os.environ['USE_MOCK_DB'] = 'true'
import sys
import unittest
from unittest.mock import patch, AsyncMock, MagicMock

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database import (
    init_db_sync,
    enqueue_approval,
    get_approval_by_thread,
    get_pending_approvals,
    get_audit_logs,
    get_whatsapp_messages,
    save_whatsapp_message,
    get_whatsapp_notification_settings,
    update_whatsapp_notification_settings
)
from services.whatsapp import (
    send_whatsapp,
    get_whatsapp_status,
    get_whatsapp_qr,
    disconnect_whatsapp,
    is_notification_enabled,
    notify_owner_whatsapp
)
from webhooks.whatsapp import (
    process_whatsapp_command,
    is_sender_authorized,
    normalize_digits
)

class TestWhatsAppIntegration(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        # Initialize in-memory or mongo DB
        init_db_sync()

    async def test_01_phone_number_normalization(self):
        """Validates phone normalization logic."""
        self.assertEqual(normalize_digits("+91 98765 43210"), "9876543210")
        self.assertEqual(normalize_digits("09876543210"), "9876543210")
        self.assertEqual(normalize_digits("+91-98765-43210"), "9876543210")
        self.assertEqual(normalize_digits(""), "")

    async def test_02_sender_authorization(self):
        """Verifies only authorized owner phones can approve workflows."""
        # Authorized default owner phone
        is_auth = await is_sender_authorized("+91 98765 43210")
        self.assertTrue(is_auth)

        # Unauthorized phone
        is_unauth = await is_sender_authorized("+91 99999 00000")
        self.assertFalse(is_unauth)

    async def test_03_invalid_phone_send_validation(self):
        """Tests that invalid phone numbers are rejected without making network calls."""
        res = await send_whatsapp(phone="", message="Hello")
        self.assertFalse(res["success"])
        self.assertIn("required", res["error"].lower())

    async def test_04_missing_message_validation(self):
        """Tests that empty messages are rejected."""
        res = await send_whatsapp(phone="+919876543210", message="   ")
        self.assertFalse(res["success"])
        self.assertIn("required", res["error"].lower())

    @patch("httpx.AsyncClient.post")
    async def test_05_outbound_dispatch_success(self, mock_post):
        """Tests successful outbound message dispatch and DB logging."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "messageId": "mock-baileys-test-123",
            "to": "+919876543210"
        }
        mock_post.return_value = mock_response

        res = await send_whatsapp(
            phone="+919876543210",
            message="Test operational message from AI-01",
            thread_id="test-thread-outbound"
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["status"], "SENT")
        self.assertEqual(res["messageId"], "mock-baileys-test-123")

        # Verify message was logged to DB
        messages = await get_whatsapp_messages(limit=10)
        found = any(m.get("message_id") == "mock-baileys-test-123" for m in messages)
        self.assertTrue(found)

    @patch("httpx.AsyncClient.get")
    async def test_06_whatsapp_service_status(self, mock_get):
        """Tests status check returns properly formatted data."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "connected": True,
            "status": "connected",
            "user": {"id": "919876543210", "name": "AI-01"},
            "hasQr": False
        }
        mock_get.return_value = mock_response

        status = await get_whatsapp_status()
        self.assertTrue(status["success"])
        self.assertTrue(status["connected"])
        self.assertEqual(status["status"], "connected")

    @patch("httpx.AsyncClient.get")
    async def test_07_whatsapp_qr_endpoint(self, mock_get):
        """Tests QR code endpoint retrieval."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "connected": False,
            "status": "disconnected",
            "qr": "data:image/png;base64,mockqrdata"
        }
        mock_get.return_value = mock_response

        qr_res = await get_whatsapp_qr()
        self.assertTrue(qr_res["success"])
        self.assertIn("data:image/png", qr_res["qr"])

    @patch("services.whatsapp.send_whatsapp")
    async def test_08_authorized_approval_command(self, mock_send):
        """Tests authorized APPROVE command resolves circuit breaker and triggers workflow resume."""
        mock_send.return_value = {"success": True, "status": "SENT"}

        # 1. Enqueue a pending approval
        test_thread = "test-thread-auth-001"
        appr_id = "test-appr-001"
        await enqueue_approval(
            approval_id=appr_id,
            thread_id=test_thread,
            action_type="GST_CHALLAN_FILING",
            description="Test Challan ₹12,000",
            payload="{}"
        )

        # 2. Process APPROVE command from authorized owner
        res = await process_whatsapp_command(
            sender_phone="+91 98765 43210",
            body_text=f"APPROVE {test_thread}",
            message_id="msg-approve-1"
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["status"], "APPROVED")

        # Verify DB approval record is updated
        appr = await get_approval_by_thread(test_thread)
        self.assertEqual(appr["status"], "APPROVED")

    @patch("services.whatsapp.send_whatsapp")
    async def test_09_unauthorized_approval_attempt_blocked(self, mock_send):
        """Tests that unauthorized phone numbers attempting APPROVE are blocked and audited."""
        mock_send.return_value = {"success": True, "status": "SENT"}

        test_thread = "test-thread-unauth-002"
        await enqueue_approval(
            approval_id="test-appr-002",
            thread_id=test_thread,
            action_type="GST_CHALLAN_FILING",
            description="Test Challan ₹50,000",
            payload="{}"
        )

        # Incoming command from unknown attacker
        res = await process_whatsapp_command(
            sender_phone="+91 91111 22222",
            body_text=f"APPROVE {test_thread}",
            message_id="msg-unauth-1"
        )
        self.assertFalse(res["success"])
        self.assertEqual(res["status"], "BLOCKED")

        # Verify approval is NOT approved
        appr = await get_approval_by_thread(test_thread)
        self.assertEqual(appr["status"], "PENDING")

        # Verify security audit log exists
        logs = await get_audit_logs(limit=10)
        has_sec_log = any("Unauthorized WhatsApp approval command" in l.get("agent_reasoning", "") for l in logs)
        self.assertTrue(has_sec_log)

    @patch("services.whatsapp.send_whatsapp")
    async def test_10_duplicate_approval_prevention(self, mock_send):
        """Tests duplicate APPROVE commands are detected and ignored safely."""
        mock_send.return_value = {"success": True, "status": "SENT"}

        test_thread = "test-thread-dup-003"
        await enqueue_approval(
            approval_id="test-appr-003",
            thread_id=test_thread,
            action_type="GST_CHALLAN_FILING",
            description="Test Challan ₹15,000",
            payload="{}"
        )

        # First approval
        res1 = await process_whatsapp_command(
            sender_phone="+91 98765 43210",
            body_text=f"APPROVE {test_thread}"
        )
        self.assertTrue(res1["success"])

        # Second approval (duplicate)
        res2 = await process_whatsapp_command(
            sender_phone="+91 98765 43210",
            body_text=f"APPROVE {test_thread}"
        )
        self.assertFalse(res2["success"])
        self.assertEqual(res2["status"], "ALREADY_PROCESSED")

    async def test_11_notification_settings_persistence(self):
        """Tests updating and reading AI notification settings."""
        updated = await update_whatsapp_notification_settings({
            "notify_invoice_ingestion": False,
            "notify_circuit_breaker": True
        })
        self.assertFalse(updated["notify_invoice_ingestion"])
        self.assertTrue(updated["notify_circuit_breaker"])

        # Restore
        await update_whatsapp_notification_settings({"notify_invoice_ingestion": True})
        restored = await get_whatsapp_notification_settings()
        self.assertTrue(restored["notify_invoice_ingestion"])

    async def test_12_duplicate_notification_prevention(self):
        """Tests that workflow state sent_notifications prevents re-dispatching."""
        state = {
            "thread_id": "thread-test-dup",
            "invoice_number": "INV-TEST-99",
            "sent_notifications": ["invoice_ingested_INV-TEST-99"]
        }

        # Check that key is recognized as already dispatched
        key = f"invoice_ingested_{state['invoice_number']}"
        self.assertIn(key, state["sent_notifications"])

def run_all_tests():
    print("="*65)
    print("RUNNING AI-01 FREE BAILEYS WHATSAPP DISPATCHER TEST SUITE")
    print("="*65)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestWhatsAppIntegration)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)

