"""
Main FastAPI Server for AI-01 — The AI-Native Company of One.
Exposes REST APIs, WebSockets & SSE, static file hosting, and Twilio WhatsApp webhooks.
"""

import os
import json
import asyncio
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Response
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

@app.post("/api/reset-demo")
async def reset_demo_data():
    seed_database()
    await manager.broadcast({"type": "data_refreshed"})
    return {"status": "RESET_COMPLETED"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
