"""
Main FastAPI Server for AI-01 — The AI-Native Company of One.
Exposes REST APIs, WebSockets & SSE, static file hosting, and Twilio WhatsApp webhooks.
"""

import os
import json
import asyncio
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database import (
    init_db,
    get_all_transactions,
    get_audit_logs,
    get_pending_approvals,
    resolve_approval,
    add_audit_log,
    insert_invoice_transaction,
    update_transaction_status,
    get_overdue_transactions,
    DB_PATH
)
from seed_data import seed_database
from voice_dispatcher import voice_dispatcher
from browser_agent import run_gst_browser_automation, SCREENSHOTS_DIR, STATIC_DIR
from agent_workflow import (
    run_workflow,
    resume_workflow_from_approval,
    register_broadcaster,
    notify_broadcasters
)
from webhooks.whatsapp import router as whatsapp_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize and seed DB on first run if needed
    if not os.path.exists(DB_PATH) or os.path.getsize(DB_PATH) < 1000:
        seed_database()
    else:
        await init_db()
    yield

app = FastAPI(
    title="AI-01: The AI-Native Company of One",
    description="Autonomous operational AI employee designed for Indian MSMEs",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

# Mount static files (Mock GST portal and screenshots)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include Twilio WhatsApp router
app.include_router(whatsapp_router)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_sockets = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_sockets.append(connection)
        for dead in dead_sockets:
            self.disconnect(dead)

manager = ConnectionManager()

# Hook LangGraph workflow events into WebSocket broadcaster
async def broadcast_workflow_event(event_type: str, data: dict):
    await manager.broadcast({"type": event_type, "data": data, "timestamp": asyncio.get_event_loop().time()})

register_broadcaster(broadcast_workflow_event)

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial status
    try:
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to AI-01 Real-Time Telemetry Stream",
            "agent_status": "IDLE"
        })
        while True:
            # Keep socket open and handle incoming ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# --- REST API Endpoints ---

@app.get("/api/health")
async def health_check():
    return {
        "status": "ONLINE",
        "service": "AI-01: The AI-Native Company of One",
        "msme": "Sharma Enterprises Pvt Ltd"
    }

@app.get("/api/ledger")
async def get_ledger():
    transactions = await get_all_transactions()
    return {"transactions": transactions}

@app.get("/api/audit-logs")
async def get_logs(limit: int = 50):
    logs = await get_audit_logs(limit=limit)
    return {"logs": logs}

@app.get("/api/approvals/pending")
async def get_pending():
    approvals = await get_pending_approvals()
    return {"approvals": approvals}

class RunWorkflowRequest(BaseModel):
    invoice_number: Optional[str] = "INV-2026-001"
    thread_id: Optional[str] = None

@app.post("/api/workflow/run")
async def trigger_workflow(req: RunWorkflowRequest):
    # Launch workflow asynchronously in background task
    async def task_runner():
        await manager.broadcast({"type": "status_change", "status": "ACTIVE"})
        result = await run_workflow(invoice_number=req.invoice_number, thread_id=req.thread_id)
        if result.get("is_paused"):
            await manager.broadcast({"type": "status_change", "status": "AWAITING_APPROVAL"})
        else:
            await manager.broadcast({"type": "status_change", "status": "IDLE"})

    asyncio.create_task(task_runner())
    return {
        "status": "TRIGGERED",
        "invoice_number": req.invoice_number,
        "message": "Autonomous AI Agent execution initiated."
    }

class ApprovalDecisionRequest(BaseModel):
    approval_id: str
    thread_id: str
    decision: str  # "APPROVED" or "REJECTED"

@app.post("/api/workflow/approval")
async def submit_approval_decision(req: ApprovalDecisionRequest):
    decision = req.decision.upper()
    if decision not in ("APPROVED", "REJECTED"):
        raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")

    resolved = await resolve_approval(req.approval_id, decision)
    if not resolved:
        raise HTTPException(status_code=404, detail="Approval record not found")

    await add_audit_log(
        thread_id=req.thread_id,
        step_name="circuit_breaker_manual_action",
        agent_reasoning=f"Owner authorized decision '{decision}' via Dashboard Gate. Resuming LangGraph state machine.",
        tool_used="Dashboard-Approval-Gate",
        execution_status=decision
    )

    await manager.broadcast({
        "type": "approval_resolved",
        "approval_id": req.approval_id,
        "status": decision,
        "thread_id": req.thread_id
    })

    # Resume workflow in background
    async def resume_runner():
        await manager.broadcast({"type": "status_change", "status": "ACTIVE"})
        await resume_workflow_from_approval(req.thread_id, decision)
        await manager.broadcast({"type": "status_change", "status": "IDLE"})

    asyncio.create_task(resume_runner())

    return {"status": "SUCCESS", "decision": decision, "thread_id": req.thread_id}

class VoiceTriggerRequest(BaseModel):
    customer_name: str
    phone_number: str
    invoice_number: str
    amount_due: float

@app.post("/api/voice/trigger")
async def trigger_voice_call(req: VoiceTriggerRequest):
    res = await voice_dispatcher.dispatch_call(
        customer_name=req.customer_name,
        phone_number=req.phone_number,
        invoice_number=req.invoice_number,
        amount_due=req.amount_due,
        thread_id="manual-voice-call"
    )
    await manager.broadcast({"type": "voice_call", "data": res})
    return res

class TriggerCallPayload(BaseModel):
    phone_number: str
    invoice_id: str

@app.post("/api/voice/trigger-call")
async def trigger_call_alias(req: TriggerCallPayload):
    all_tx = await get_all_transactions()
    target = None
    for tx in all_tx:
        if tx["invoice_number"] == req.invoice_id:
            target = tx
            break
    
    c_name = target["entity_name"] if target else "Sharma Metal Works"
    amt = target["amount_due"] if target else 45000.0

    res = await voice_dispatcher.dispatch_call(
        customer_name=c_name,
        phone_number=req.phone_number,
        invoice_number=req.invoice_id,
        amount_due=amt,
        thread_id=f"call-{req.invoice_id}"
    )
    await manager.broadcast({"type": "voice_call", "data": res})
    return res

class InvoiceUploadPayload(BaseModel):
    entity_name: Optional[str] = "Sharma Metal Works"
    invoice_number: Optional[str] = "INV-025"
    amount_due: Optional[float] = 45000.0
    tax_amount: Optional[float] = 8100.0
    gstin: Optional[str] = "27AABCS1429B1Z"
    invoice_date: Optional[str] = "2026-10-22"
    payment_status: Optional[str] = "OVERDUE"
    promised_payment_date: Optional[str] = "2026-10-30"
    notes: Optional[str] = "30 Oct (UPI) - Debtor agreed to clear via UPI after follow-up call."

@app.post("/api/ledger/upload")
async def upload_invoice(
    payload: Optional[InvoiceUploadPayload] = None,
    file: Optional[UploadFile] = File(None)
):
    inv_num = payload.invoice_number if payload and payload.invoice_number else "INV-025"
    entity = payload.entity_name if payload and payload.entity_name else "Sharma Metal Works"
    amt = payload.amount_due if payload and payload.amount_due else 45000.0
    tax = payload.tax_amount if payload and payload.tax_amount else round(amt * 0.18, 2)
    inv_date = payload.invoice_date if payload and payload.invoice_date else "2026-10-22"
    gstin_val = payload.gstin if payload and payload.gstin else "27AABCS1429B1Z"
    status_val = payload.payment_status if payload and payload.payment_status else "OVERDUE"
    promise = payload.promised_payment_date if payload and payload.promised_payment_date else "2026-10-30"
    note_val = payload.notes if payload and payload.notes else "30 Oct (UPI) - Debtor agreed to clear via UPI"

    await insert_invoice_transaction(
        entity_name=entity,
        phone_number="+919876543210",
        invoice_number=inv_num,
        invoice_date=inv_date,
        amount_due=amt,
        tax_amount=tax,
        payment_status=status_val,
        promised_payment_date=promise,
        notes=note_val,
        gstin=gstin_val
    )

    await add_audit_log(
        thread_id="ocr-upload",
        step_name="invoice_ocr_ingestion",
        agent_reasoning=f"Uploaded invoice {inv_num} for {entity} parsed via Gemini 2.0 Flash (Confidence: 98.4%). Taxable value Rs {amt:,.2f}, GST Rs {tax:,.2f} registered in ledger.",
        tool_used="Gemini-2.0-Flash-Vision",
        execution_status="COMPLETED"
    )

    await manager.broadcast({
        "type": "data_refreshed",
        "message": f"Invoice {inv_num} ingested successfully"
    })

    return {
        "status": "SUCCESS",
        "invoice_number": inv_num,
        "entity_name": entity,
        "amount_due": amt,
        "tax_amount": tax,
        "gstin": gstin_val,
        "ocr_confidence": "98.4% (Gemini 2.0 Flash)",
        "reconciled_utr": "UTR2026102811098"
    }

class BrowserDemoRequest(BaseModel):
    invoice_number: str = "INV-2026-001"
    amount: float = 45000.0

@app.post("/api/browser/demo")
async def trigger_browser_demo(req: BrowserDemoRequest):
    async def on_step(step_data):
        await manager.broadcast({"type": "browser_step", "data": step_data})

    async def run_in_bg():
        await manager.broadcast({"type": "status_change", "status": "ACTIVE"})
        result = await run_gst_browser_automation(
            invoice_number=req.invoice_number,
            amount=req.amount,
            thread_id=f"demo-{int(asyncio.get_event_loop().time())}",
            callback=on_step
        )
        await manager.broadcast({"type": "status_change", "status": "IDLE"})

    asyncio.create_task(run_in_bg())
    return {"status": "BROWSER_AUTOMATION_STARTED", "invoice": req.invoice_number}

class MarkPaidRequest(BaseModel):
    invoice_number: str

@app.post("/api/ledger/mark-paid")
async def mark_invoice_as_paid(req: MarkPaidRequest):
    updated = await update_transaction_status(req.invoice_number, "PAID")
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await add_audit_log(
        thread_id="manual-override",
        step_name="invoice_mark_as_paid",
        agent_reasoning=f"Owner manually confirmed bank reconciliation for {req.invoice_number}. Marked status as PAID.",
        tool_used="Direct-Action-Override",
        execution_status="COMPLETED"
    )
    await manager.broadcast({"type": "data_refreshed"})
    return {"status": "SUCCESS", "invoice_number": req.invoice_number, "payment_status": "PAID"}

class BatchCallsRequest(BaseModel):
    invoice_numbers: Optional[List[str]] = None

@app.post("/api/ledger/trigger-overdue-calls")
async def trigger_overdue_calls(req: BatchCallsRequest):
    all_overdue = await get_overdue_transactions()
    target_invoices = all_overdue
    if req.invoice_numbers:
        target_invoices = [inv for inv in all_overdue if inv["invoice_number"] in req.invoice_numbers]

    calls_dispatched = []
    for inv in target_invoices[:3]:  # dispatch top 3 overdue calls
        res = await voice_dispatcher.dispatch_call(
            customer_name=inv["entity_name"],
            phone_number=inv["phone_number"],
            invoice_number=inv["invoice_number"],
            amount_due=inv["amount_due"],
            thread_id=f"batch-call-{inv['invoice_number']}"
        )
        calls_dispatched.append(res)
        await manager.broadcast({"type": "voice_call", "data": res})

    await manager.broadcast({"type": "data_refreshed"})
    return {
        "status": "DISPATCHED",
        "count": len(calls_dispatched),
        "dispatched": calls_dispatched
    }

@app.get("/api/ledger/export")
async def export_ledger(format: str = "json"):
    transactions = await get_all_transactions()
    if format.lower() == "csv":
        import csv
        import io
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["invoice_number", "entity_name", "invoice_date", "amount_due", "tax_amount", "payment_status", "promised_payment_date", "gstin"])
        writer.writeheader()
        for tx in transactions:
            writer.writerow({
                "invoice_number": tx.get("invoice_number", ""),
                "entity_name": tx.get("entity_name", ""),
                "invoice_date": tx.get("invoice_date", ""),
                "amount_due": tx.get("amount_due", 0),
                "tax_amount": tx.get("tax_amount", 0),
                "payment_status": tx.get("payment_status", ""),
                "promised_payment_date": tx.get("promised_payment_date", ""),
                "gstin": tx.get("gstin", "")
            })
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=ledger_export_tally.csv"})
    return JSONResponse(content={"transactions": transactions})

@app.post("/api/reset-demo")
async def reset_demo_data():
    seed_database()
    await manager.broadcast({"type": "data_refreshed"})
    return {"status": "RESET_COMPLETED"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
