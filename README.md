# AI-01 — The AI-Native Company of One

> **Autonomous Operational AI Employee for Indian MSMEs**  
> Operating on non-API portals, unstructured messaging, and vernacular voice communications with a **$0 Zero-Cost Architecture**.

---

## 🏛️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                        REACT + VITE DASHBOARD (Dark Theme)                        |
|  - Overdue Ledger Table  |  - Live Playwright Stream Feed  |  - Agent Audit Log   |
+-----------------------------------------+-----------------------------------------+
                                          | WebSockets / SSE (/ws/stream)
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

## ✨ Key Capabilities

1. **Vernacular Voice Operations (Hindi / Hinglish)**:
   - Outbound voice calls via **Vapi.ai** API (with automatic fallback to realistic MSME vernacular conversation simulations).
   - Natural Hindi/Hinglish dialog negotiating payment terms.
   - Post-call transcript analysis extracting committed settlement dates directly into the SQLite ledger.

2. **WhatsApp Circuit Breaker Approval Gate**:
   - Built on **LangGraph with `AsyncSqliteSaver` checkpointer and `interrupt()`**.
   - Halts autonomous execution whenever high-stakes tax filing or money transfers are queued.
   - Supports both real **Twilio WhatsApp Sandbox** incoming webhooks (`APPROVE <thread_id>` / `REJECT <thread_id>`) and interactive Dashboard Gate approval simulation.

3. **Visual Computer-Use Browser Automation**:
   - **Playwright Chromium** automates statutory form filing on non-API government portals.
   - Built-in authentic **Mock GST Portal** (`/static/mock_gst_portal.html`) matching CBIC Govt. of India aesthetics.
   - Visual step-by-step frame capture into `./backend/static/screenshots/` streamed live to the UI feed.

4. **Sleek Glassmorphic Dark-Themed Cockpit**:
   - Designed with **React (Vite), Tailwind CSS v4, Framer Motion, and Lucide Icons**.
   - Three-panel cockpit:
     - **Left**: Overdue Ledger & Voice Commitments Table
     - **Middle**: Live Playwright Browser Screenshot Stream & Visual Pointer
     - **Right**: Real-time Agent Audit Log & Deterministic Telemetry Stream

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+

### 2. Backend Setup & Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install fastapi uvicorn pydantic playwright langgraph langgraph-checkpoint-sqlite aiosqlite python-dotenv httpx websockets

# Install Playwright browser
python -m playwright install chromium

# Seed demo MSME transactions (Sharma Metal Works, etc.)
python seed_data.py

# Launch FastAPI backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at: `http://127.0.0.1:8000`  
Mock GST Portal: `http://127.0.0.1:8000/static/mock_gst_portal.html`

### 3. Frontend Setup & Startup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend Dashboard will be live at: `http://127.0.0.1:5173`

---

## 🧪 Automated End-to-End Test

To verify the entire autonomous cycle (Ingestion ➔ Reconciliation ➔ Voice Call ➔ WhatsApp Circuit Breaker Pause ➔ Authorization ➔ Playwright Portal Automation ➔ Challan Generation):

```bash
python backend/test_e2e.py
```

---

## ⚙️ Environment Variables ($0 Zero-Cost Architecture)

The system works **100% out of the box** without external API keys thanks to built-in local simulations. To activate live cloud services, configure `.env`:

```env
# Google AI Studio Gemini API Key
GEMINI_API_KEY=your_gemini_key_here

# Vapi.ai Vernacular Voice
VAPI_API_KEY=your_vapi_key_here
VAPI_PHONE_NUMBER_ID=your_phone_id_here

# Twilio WhatsApp Sandbox
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```
