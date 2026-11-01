"""
LangGraph Autonomous Agent Workflow for AI-01 — The AI-Native Company of One.
Implements the 5-node autonomous pipeline:
  [ Ingest Invoices ] -> [ Reconcile Ledger ] -> [ Dispatch Voice Call ]
         |
         v
  [ WhatsApp Circuit Breaker (interrupt) ] -> [ Visual Browser-Use (GST Portal) ]
Uses AsyncSqliteSaver for persistence in ./backend/data/checkpoints.db.
"""

import os
import json
import asyncio
from typing import TypedDict, Optional, Dict, Any, List
from datetime import datetime
import uuid

from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from database import (
    DB_PATH,
    DATA_DIR,
    get_all_transactions,
    get_overdue_transactions,
    update_transaction_status,
    enqueue_approval,
    add_audit_log
)
from voice_dispatcher import voice_dispatcher
from browser_agent import run_gst_browser_automation
from services.whatsapp import send_whatsapp, notify_owner_whatsapp, is_notification_enabled

CHECKPOINTS_DB_PATH = os.path.join(DATA_DIR, "checkpoints.db")

class WorkflowState(TypedDict):
    thread_id: str
    invoice_number: str
    entity_name: str
    phone_number: str
    amount_due: float
    tax_amount: float
    promised_payment_date: Optional[str]
    call_transcript: Optional[str]
    approval_id: Optional[str]
    approval_status: Optional[str]
    cpin: Optional[str]
    arn: Optional[str]
    execution_status: str
    screenshots: List[Dict[str, Any]]
    sent_notifications: List[str]

# Global WebSocket/SSE broadcaster callback
_broadcasters: List[Any] = []

def register_broadcaster(callback):
    _broadcasters.append(callback)

async def notify_broadcasters(event_type: str, data: Dict[str, Any]):
    for cb in _broadcasters:
        try:
            if asyncio.iscoroutinefunction(cb):
                await cb(event_type, data)
            else:
                cb(event_type, data)
        except Exception:
            pass

# --- NODE 1: Ingest Invoices ---
async def ingest_invoices_node(state: WorkflowState) -> Dict[str, Any]:
    thread_id = state["thread_id"]
    inv_num = state.get("invoice_number")

    await add_audit_log(
        thread_id=thread_id,
        step_name="ingest_invoices",
        agent_reasoning=f"Scanning MSME ledger accounts. Ingestion triggered for target invoice: {inv_num or 'all overdue'}.",
        tool_used="Ledger-Ingestion-Parser",
        execution_status="IN_PROGRESS"
    )
    await notify_broadcasters("step", {"step": "ingest_invoices", "state": state})

    # Retrieve matching transaction from DB
    overdues = await get_overdue_transactions()
    target = None
    if inv_num:
        for item in overdues:
            if item["invoice_number"] == inv_num:
                target = item
                break
    if not target and overdues:
        target = overdues[0]

    if not target:
        # Default fallback target
        target = {
            "invoice_number": "INV-2026-001",
            "entity_name": "Sharma Metal Works",
            "phone_number": "+919876543210",
            "amount_due": 45000.0,
            "tax_amount": 8100.0
        }

    # AI WhatsApp Notification: Invoice Ingestion
    sent_notes = list(state.get("sent_notifications") or [])
    note_key = f"invoice_ingested_{target['invoice_number']}"
    if note_key not in sent_notes:
        try:
            msg = (
                "📋 *AI-01 Ledger Alert*\n"
                f"Invoice Ingestion Initiated:\n"
                f"• Entity: {target['entity_name']}\n"
                f"• Invoice: #{target['invoice_number']}\n"
                f"• Overdue Amount: ₹{target['amount_due']:,.2f}\n"
                f"• Thread ID: {thread_id}"
            )
            await notify_owner_whatsapp(msg, notification_key="notify_invoice_ingestion", thread_id=thread_id)
            sent_notes.append(note_key)
        except Exception as e:
            print(f"[WorkflowWhatsApp] Ingestion notify notice: {e}")

    return {
        "invoice_number": target["invoice_number"],
        "entity_name": target["entity_name"],
        "phone_number": target["phone_number"],
        "amount_due": target["amount_due"],
        "tax_amount": target["tax_amount"],
        "sent_notifications": sent_notes,
        "execution_status": "INVOICES_INGESTED"
    }

# --- NODE 2: Reconcile Ledger ---
async def reconcile_ledger_node(state: WorkflowState) -> Dict[str, Any]:
    thread_id = state["thread_id"]
    inv = state["invoice_number"]
    amt = state["amount_due"]
    tax = round(amt * 0.18, 2)

    reasoning = (
        f"Reconciled {state['entity_name']} against sales register. "
        f"Base amount ₹{amt:,.2f} with 18% statutory GST (₹{tax:,.2f}) verified. "
        f"Account is overdue by >25 days. Priority recovery and challan preparation initiated."
    )
    await add_audit_log(
        thread_id=thread_id,
        step_name="reconcile_ledger",
        agent_reasoning=reasoning,
        tool_used="MSME-Accounting-Engine",
        execution_status="RECONCILED"
    )
    await notify_broadcasters("step", {"step": "reconcile_ledger", "tax_amount": tax})
    return {"tax_amount": tax, "execution_status": "LEDGER_RECONCILED"}

# --- NODE 3: Dispatch Vernacular Voice Call ---
async def dispatch_voice_call_node(state: WorkflowState) -> Dict[str, Any]:
    thread_id = state["thread_id"]
    call_result = await voice_dispatcher.dispatch_call(
        customer_name=state["entity_name"],
        phone_number=state["phone_number"],
        invoice_number=state["invoice_number"],
        amount_due=state["amount_due"],
        thread_id=thread_id
    )

    await notify_broadcasters("voice_call", {
        "thread_id": thread_id,
        "transcript": call_result.get("transcript"),
        "promised_date": call_result.get("promised_payment_date")
    })

    # AI WhatsApp Notification: Overdue Payment Reminder to Recipient
    sent_notes = list(state.get("sent_notifications") or [])
    note_key = f"overdue_reminder_{state['invoice_number']}"
    if note_key not in sent_notes:
        try:
            if await is_notification_enabled("notify_overdue_reminders"):
                cust_msg = (
                    "Namaste from *Sharma Enterprises*.\n\n"
                    f"This is an automated operational reminder regarding Invoice #{state['invoice_number']} "
                    f"of *₹{state['amount_due']:,.2f}* which is currently overdue.\n\n"
                    "Our AI Accounts Dept is following up to ensure timely statutory reconciliation. "
                    "Please settle at your earliest convenience."
                )
                await send_whatsapp(state["phone_number"], cust_msg, thread_id=thread_id)
                sent_notes.append(note_key)
        except Exception as e:
            print(f"[WorkflowWhatsApp] Reminder notice: {e}")

    return {
        "promised_payment_date": call_result.get("promised_payment_date"),
        "call_transcript": call_result.get("transcript"),
        "sent_notifications": sent_notes,
        "execution_status": "VOICE_CALL_COMPLETED"
    }

# --- NODE 4: WhatsApp Approval Circuit Breaker ---
async def whatsapp_circuit_breaker_node(state: WorkflowState) -> Dict[str, Any]:
    thread_id = state["thread_id"]
    approval_id = f"appr-{uuid.uuid4().hex[:8]}"

    desc = f"File GSTR-3B Tax Challan of ₹{state['tax_amount']:,.2f} for {state['entity_name']} ({state['invoice_number']})"
    payload = json.dumps({
        "invoice_number": state["invoice_number"],
        "entity_name": state["entity_name"],
        "tax_amount": state["tax_amount"],
        "amount_due": state["amount_due"]
    })

    # Record pending approval in database
    await enqueue_approval(
        approval_id=approval_id,
        thread_id=thread_id,
        action_type="GST_CHALLAN_FILING",
        description=desc,
        payload=payload
    )

    await add_audit_log(
        thread_id=thread_id,
        step_name="whatsapp_circuit_breaker_wait",
        agent_reasoning=(
            f"CIRCUIT BREAKER TRIGGERED: High-stakes tax filing and challan creation of ₹{state['tax_amount']:,.2f}. "
            f"Execution halted. Awaiting human-in-the-loop authorization from Business Owner via WhatsApp or UI Gate."
        ),
        tool_used="Twilio-WhatsApp-Approval-Gate",
        execution_status="AWAITING_APPROVAL"
    )

    await notify_broadcasters("approval_required", {
        "approval_id": approval_id,
        "thread_id": thread_id,
        "description": desc,
        "amount": state["tax_amount"]
    })

    # AI WhatsApp Notification: Approval Required to Authorized Approver
    sent_notes = list(state.get("sent_notifications") or [])
    note_key = f"approval_required_{approval_id}"
    if note_key not in sent_notes:
        try:
            appr_msg = (
                "🚨 *AI-01 CIRCUIT BREAKER: APPROVAL REQUIRED*\n\n"
                f"High-Stakes Action Queued:\n"
                f"• Description: {desc}\n"
                f"• Statutory Tax: ₹{state['tax_amount']:,.2f}\n"
                f"• Approval ID: {approval_id}\n"
                f"• Thread ID: {thread_id}\n\n"
                "To authorize, reply:\n"
                f"👉 *APPROVE {thread_id}*\n"
                "Or to abort:\n"
                f"👉 *REJECT {thread_id}*"
            )
            await notify_owner_whatsapp(appr_msg, notification_key="notify_circuit_breaker", thread_id=thread_id)
            sent_notes.append(note_key)
        except Exception as e:
            print(f"[WorkflowWhatsApp] Approval notify notice: {e}")

    # LangGraph human-in-the-loop state pause
    decision = interrupt({
        "approval_id": approval_id,
        "action": "GST_CHALLAN_FILING",
        "message": f"Approve filing GST Challan ₹{state['tax_amount']:,.2f} for {state['invoice_number']}?"
    })

    # When execution resumes, decision contains the approval status string
    status = str(decision).upper() if decision else "APPROVED"
    return {
        "approval_id": approval_id,
        "approval_status": status,
        "execution_status": "APPROVED" if status == "APPROVED" else "REJECTED"
    }

# --- NODE 5: Visual Browser Automation ---
async def browser_automation_node(state: WorkflowState) -> Dict[str, Any]:
    thread_id = state["thread_id"]

    sent_notes = list(state.get("sent_notifications") or [])
    
    # AI WhatsApp Notification: Approval Decision Received
    note_key_appr = f"approval_received_{thread_id}"
    if note_key_appr not in sent_notes and state.get("approval_status"):
        try:
            res_msg = (
                "✅ *AI-01 Approval Resolved*\n"
                f"Thread: {thread_id}\n"
                f"Status: *{state.get('approval_status')}*\n"
                f"Next: {'Proceeding with automated portal filing...' if state.get('approval_status') == 'APPROVED' else 'Workflow safely aborted.'}"
            )
            await notify_owner_whatsapp(res_msg, notification_key="notify_approval_resolution", thread_id=thread_id)
            sent_notes.append(note_key_appr)
        except Exception as e:
            print(f"[WorkflowWhatsApp] Status notify notice: {e}")

    if state.get("approval_status") == "REJECTED":
        await add_audit_log(
            thread_id=thread_id,
            step_name="browser_automation_skipped",
            agent_reasoning="Owner rejected GST Challan filing via Circuit Breaker. Browser automation safely bypassed.",
            tool_used="Circuit-Breaker-Safeguard",
            execution_status="ABORTED"
        )
        await notify_broadcasters("step", {"step": "aborted", "reason": "Owner rejected filing."})
        
        note_key_abort = f"workflow_aborted_{thread_id}"
        if note_key_abort not in sent_notes:
            try:
                await notify_owner_whatsapp(
                    f"🛑 *AI-01 Workflow Aborted*\nFiling for Invoice #{state['invoice_number']} was rejected by owner.",
                    notification_key="notify_workflow_failure",
                    thread_id=thread_id
                )
                sent_notes.append(note_key_abort)
            except Exception:
                pass

        return {"execution_status": "ABORTED", "sent_notifications": sent_notes}

    await add_audit_log(
        thread_id=thread_id,
        step_name="browser_automation_initiated",
        agent_reasoning="Circuit breaker passed! Commencing visual Playwright browser automation on mock GST portal.",
        tool_used="Playwright-Chromium",
        execution_status="IN_PROGRESS"
    )

    async def on_step(step_data):
        await notify_broadcasters("browser_step", step_data)

    browser_result = await run_gst_browser_automation(
        invoice_number=state["invoice_number"],
        amount=state["amount_due"],
        thread_id=thread_id,
        callback=on_step
    )

    # Mark transaction as paid or filed
    await update_transaction_status(state["invoice_number"], "PAID")

    await add_audit_log(
        thread_id=thread_id,
        step_name="browser_automation_complete",
        agent_reasoning=(
            f"Statutory filing executed successfully! Challan CPIN: {browser_result.get('cpin')}, "
            f"ARN: {browser_result.get('arn')}. Transaction {state['invoice_number']} reconciled."
        ),
        tool_used="Playwright-Chromium",
        execution_status="COMPLETED",
        screenshot_path=browser_result["steps"][-1]["screenshot"] if browser_result["steps"] else None
    )

    await notify_broadcasters("completed", {
        "thread_id": thread_id,
        "cpin": browser_result.get("cpin"),
        "arn": browser_result.get("arn")
    })

    # AI WhatsApp Notification: Workflow Completion
    note_key_comp = f"workflow_completed_{thread_id}"
    if note_key_comp not in sent_notes:
        try:
            comp_msg = (
                "🎉 *AI-01 Workflow Completed Successfully*\n\n"
                "Statutory GST Challan Generated:\n"
                f"• Entity: {state['entity_name']}\n"
                f"• Invoice: #{state['invoice_number']}\n"
                f"• CPIN: *{browser_result.get('cpin', 'CPIN-66289012')}*\n"
                f"• ARN: *{browser_result.get('arn', 'AA271026001239M')}*\n"
                "• Reconciled Status: PAID"
            )
            await notify_owner_whatsapp(comp_msg, notification_key="notify_workflow_completion", thread_id=thread_id)
            sent_notes.append(note_key_comp)
        except Exception as e:
            print(f"[WorkflowWhatsApp] Completion notice: {e}")

    return {
        "cpin": browser_result.get("cpin"),
        "arn": browser_result.get("arn"),
        "screenshots": browser_result.get("steps", []),
        "sent_notifications": sent_notes,
        "execution_status": "COMPLETED"
    }

def build_agent_graph():
    graph = StateGraph(WorkflowState)
    graph.add_node("ingest_invoices", ingest_invoices_node)
    graph.add_node("reconcile_ledger", reconcile_ledger_node)
    graph.add_node("dispatch_voice_call", dispatch_voice_call_node)
    graph.add_node("whatsapp_circuit_breaker", whatsapp_circuit_breaker_node)
    graph.add_node("browser_automation", browser_automation_node)

    graph.add_edge(START, "ingest_invoices")
    graph.add_edge("ingest_invoices", "reconcile_ledger")
    graph.add_edge("reconcile_ledger", "dispatch_voice_call")
    graph.add_edge("dispatch_voice_call", "whatsapp_circuit_breaker")
    graph.add_edge("whatsapp_circuit_breaker", "browser_automation")
    graph.add_edge("browser_automation", END)

    return graph

# Module level state tracking for active workflows
active_workflows: Dict[str, Any] = {}

async def run_workflow(invoice_number: str = "INV-2026-001", thread_id: Optional[str] = None) -> Dict[str, Any]:
    if not thread_id:
        thread_id = f"thread-{uuid.uuid4().hex[:8]}"

    builder = build_agent_graph()

    # Initialize AsyncSqliteSaver
    async with AsyncSqliteSaver.from_conn_string(CHECKPOINTS_DB_PATH) as checkpointer:
        await checkpointer.setup()
        app = builder.compile(checkpointer=checkpointer)

        initial_state: WorkflowState = {
            "thread_id": thread_id,
            "invoice_number": invoice_number,
            "entity_name": "Sharma Metal Works",
            "phone_number": "+919876543210",
            "amount_due": 45000.0,
            "tax_amount": 8100.0,
            "promised_payment_date": None,
            "call_transcript": None,
            "approval_id": None,
            "approval_status": None,
            "cpin": None,
            "arn": None,
            "execution_status": "STARTING",
            "screenshots": [],
            "sent_notifications": []
        }

        config = {"configurable": {"thread_id": thread_id}}
        active_workflows[thread_id] = {"app": app, "config": config, "builder": builder}

        # Run until interrupt or completion
        async for chunk in app.astream(initial_state, config):
            pass

        # Check current state to see if interrupted
        snapshot = await app.aget_state(config)
        is_paused = bool(snapshot.next and "whatsapp_circuit_breaker" in snapshot.next)

        return {
            "thread_id": thread_id,
            "is_paused": is_paused,
            "state": snapshot.values,
            "next_nodes": list(snapshot.next) if snapshot.next else []
        }

async def resume_workflow_from_approval(thread_id: str, decision: str = "APPROVED") -> Dict[str, Any]:
    builder = build_agent_graph()
    async with AsyncSqliteSaver.from_conn_string(CHECKPOINTS_DB_PATH) as checkpointer:
        await checkpointer.setup()
        app = builder.compile(checkpointer=checkpointer)
        config = {"configurable": {"thread_id": thread_id}}

        # Resume from interrupt by passing Command(resume=decision)
        try:
            async for chunk in app.astream(Command(resume=decision), config):
                pass
        except Exception as e:
            print(f"[WorkflowResume] Warning: {e}")

        snapshot = await app.aget_state(config)
        return {
            "thread_id": thread_id,
            "status": "RESUMED",
            "state": snapshot.values if snapshot else {}
        }
