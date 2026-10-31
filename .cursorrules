# SYSTEM DIRECTIVE: BUILD "AI-01 — THE AI-NATIVE COMPANY OF ONE"

You are an expert Senior Full-Stack Software Engineer and AI Architect. Your task is to build and polish **"AI-01: The AI-Native Company of One"**, an autonomous operational AI employee designed for Indian MSMEs operating on non-API portals, unstructured messaging, and vernacular voice communications.

---

## 1. Core Technical Stack ($0 Zero-Cost Architecture)

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, WebSockets / SSE.
- **Backend**: FastAPI (Python 3.11+), Uvicorn.
- **Agent Framework**: LangGraph with `AsyncSqliteSaver` checkpointer and `interrupt()` human-in-the-loop state engine.
- **Primary LLM Engine**: `ChatGoogleGenerativeAI` (`gemini-2.0-flash`) via Google AI Studio.
- **Browser Automation**: `browser-use` + Playwright Chromium.
- **Voice Operations**: Vapi.ai API (Outbound vernacular voice calls in Hindi/Hinglish) + Gemini Transcript Analyzer.
- **Messaging Gate**: Twilio WhatsApp Sandbox (Circuit Breaker Approval Gate).
- **Databases**: SQLite (`./backend/data/app.db`) + ChromaDB (`./backend/chroma_db`).

---

## 2. System Architecture & Component Responsibilities

```
+-----------------------------------------------------------------------------------+
|                        REACT + VITE DASHBOARD (Dark Theme)                        |
|  - Overdue Ledger Table  |  - Live Playwright Stream Feed  |  - Agent Audit Log   |
+-----------------------------------------+-----------------------------------------+
                                          | WebSockets / SSE
                                          v
+-----------------------------------------------------------------------------------+
|                           FASTAPI + LANGGRAPH RUNTIME                             |
|                                                                                   |
| [ Invoice OCR Node ] -> [ Ledger Reconciliation ] -> [ Vernacular Voice Call ]    |
|                                                              |                    |
| [ Execution Resumed ] <- [ WhatsApp Approval Gate ] <--------+                    |
|           |                                                                       |
|           v                                                                       |
| [ Visual Browser-Use (Local GST Portal Automation) ]                              |
+-----------------------------------------------------------------------------------+
```

---

## 3. UI/UX & Website Polish Guidelines (Smooth Frontend Focus)

1. **Design System & Theme**:
   - Dark Mode Primary: Deep slate background (`#0B0F17` / `bg-slate-950`).
   - Glassmorphism: Cards with subtle borders (`border-slate-800/80`), translucent backgrounds (`bg-slate-900/60 backdrop-blur-md`), and rounded-2xl corners.
   - Accent Colors: Electric Blue (`#3B82F6`) for active execution, Amber (`#F59E0B`) for pending WhatsApp approvals, Emerald (`#10B981`) for completed tasks, and Rose (`#F43F5E`) for overdues.
2. **Animation & Transitions**:
   - Use `framer-motion` for page load transitions, tab switches, badge state changes, and live log insertions.
   - Live stream panel showing Playwright screenshots updated smoothly with layout animations.
3. **Dashboard Layout**:
   - **Header**: Business Title ("Sharma Enterprises AI Employee"), Live Agent Status Badge (`ACTIVE` / `AWAITING_APPROVAL` / `IDLE`), and Run Workflow Button.
   - **Left Panel (Ledger & Voice Commitments)**: Displays overdue invoices, vendor contacts, and committed payment dates extracted from voice calls.
   - **Middle Panel (Live Agent Visual Feed)**: Displays live browser screenshots captured during computer-use steps on the mock GST portal.
   - **Right Panel (Real-Time Audit Stream)**: Timestamped log feed showing agent reasoning, tools executed, and approval statuses.

---

## 4. Backend Implementation Requirements

### A. SQLite & Data Layer (`backend/database.py`)
Implement the following schema and export synchronous & asynchronous helper functions:
- `ledger_transactions`: `id`, `entity_name`, `phone_number`, `invoice_number`, `invoice_date`, `amount_due`, `tax_amount`, `payment_status` (`OVERDUE`/`PENDING`/`PAID`), `promised_payment_date`, `notes`.
- `approval_queue`: `approval_id`, `thread_id`, `action_type`, `description`, `payload`, `status` (`PENDING`/`APPROVED`/`REJECTED`).
- `agent_audit_log`: `log_id`, `thread_id`, `step_name`, `agent_reasoning`, `tool_used`, `execution_status`, `screenshot_path`, `timestamp`.

### B. LangGraph Workflow & Circuit Breaker (`backend/agent_workflow.py`)
- Define nodes: `ingest_invoices` -> `reconcile_ledger` -> `dispatch_voice_call` -> `whatsapp_circuit_breaker` -> `browser_automation`.
- Use `langgraph.types.interrupt` inside `whatsapp_circuit_breaker` to pause execution state when hitting high-stakes tax filing or payment transfers.
- Save execution state to SQLite checkpointer `checkpoints.db`.

### C. WhatsApp Webhook (`backend/webhooks/whatsapp.py`)
- Handle incoming POST requests from Twilio WhatsApp Sandbox.
- Parse `APPROVE <thread_id>` and `REJECT <thread_id>` messages.
- Call `app.update_state()` on LangGraph and resume execution automatically.

### D. Vernacular Voice Call Dispatcher (`backend/voice_dispatcher.py`)
- Trigger outbound call via Vapi.ai API to customer phone numbers for overdue payments.
- Inject system prompt for polite Hinglish/Hindi communication.
- Webhook endpoint `/api/webhooks/voice-callback` parses post-call transcripts using `gemini-2.0-flash` to update `promised_payment_date` in SQLite.

### E. Visual Browser Automation (`backend/browser_agent.py`)
- Serve local mock portal at `http://localhost:8000/static/mock_gst_portal.html`.
- Use `browser-use` driven by `gemini-2.0-flash` to visually navigate the form, fill inputs, click submit, and capture screenshot frames at every click step to `./backend/static/screenshots/`.

---

## 5. Development Steps & Execution Order

When building or updating the codebase, follow this strict sequence:

1. **Database & Seeding**: Ensure `backend/database.py` and `backend/seed_data.py` initialize clean tables and insert realistic demo MSME records (*Sharma Metal Works*, *INV-2026-001*, ₹45,000 overdue).
2. **Mock Portal & Automation**: Build `backend/static/mock_gst_portal.html` and verify `browser_agent.py` takes Playwright screenshots without errors.
3. **WhatsApp Approval**: Set up Twilio sandbox endpoints and ensure `interrupt()` properly pauses/resumes graph execution.
4. **Voice Dispatcher**: Build Vapi voice trigger and transcript processing pipeline.
5. **Frontend Polish**: Wire React components with Tailwind CSS and Framer Motion, connecting live SSE/WebSocket events to real-time UI updates.
6. **Graceful Fallbacks**: Include mock data fallbacks for all network APIs (Vapi/Twilio) to ensure smooth execution during offline or low-connectivity demo environments.

---

## 6. Code Style & Quality Standards

- Maintain modular, strictly typed Python code (`type hints`, `pydantic` schemas).
- No unhandled promises or silent failures in React/FastAPI.
- Keep UI responsive, visually striking, dark-themed, and production-ready.
- All code must execute out of the box with `uvicorn backend.main:app --reload` and `npm run dev`.
