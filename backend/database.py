"""
Database layer for AI-01 — The AI-Native Company of One.
Manages SQLite schemas for ledger_transactions, approval_queue, and agent_audit_log.
Provides both asynchronous (aiosqlite) and synchronous (sqlite3) helper functions.
"""

import os
import sqlite3
import aiosqlite
from typing import List, Dict, Any, Optional
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "app.db")

os.makedirs(DATA_DIR, exist_ok=True)

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date TEXT NOT NULL,
    amount_due REAL NOT NULL,
    tax_amount REAL NOT NULL,
    payment_status TEXT CHECK(payment_status IN ('OVERDUE', 'PENDING', 'PAID')) NOT NULL DEFAULT 'PENDING',
    promised_payment_date TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_queue (
    approval_id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_audit_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    agent_reasoning TEXT NOT NULL,
    tool_used TEXT,
    execution_status TEXT NOT NULL,
    screenshot_path TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db_sync():
    """Synchronously initializes database tables."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(CREATE_TABLES_SQL)
        conn.commit()

async def init_db():
    """Asynchronously initializes database tables."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(CREATE_TABLES_SQL)
        await db.commit()

# --- Async Helper Functions for FastAPI ---

async def get_all_transactions() -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM ledger_transactions ORDER BY id DESC") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_overdue_transactions() -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM ledger_transactions WHERE payment_status = 'OVERDUE' ORDER BY id ASC") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def update_transaction_promise(invoice_number: str, promised_date: str, notes: Optional[str] = None) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        now = datetime.utcnow().isoformat()
        if notes:
            await db.execute(
                "UPDATE ledger_transactions SET promised_payment_date = ?, notes = ?, updated_at = ? WHERE invoice_number = ?",
                (promised_date, notes, now, invoice_number)
            )
        else:
            await db.execute(
                "UPDATE ledger_transactions SET promised_payment_date = ?, updated_at = ? WHERE invoice_number = ?",
                (promised_date, now, invoice_number)
            )
        await db.commit()
        return True

async def update_transaction_status(invoice_number: str, status: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        now = datetime.utcnow().isoformat()
        await db.execute(
            "UPDATE ledger_transactions SET payment_status = ?, updated_at = ? WHERE invoice_number = ?",
            (status, now, invoice_number)
        )
        await db.commit()
        return True

async def add_audit_log(
    thread_id: str,
    step_name: str,
    agent_reasoning: str,
    tool_used: Optional[str] = None,
    execution_status: str = "COMPLETED",
    screenshot_path: Optional[str] = None
) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """
            INSERT INTO agent_audit_log (thread_id, step_name, agent_reasoning, tool_used, execution_status, screenshot_path)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (thread_id, step_name, agent_reasoning, tool_used, execution_status, screenshot_path)
        )
        await db.commit()
        return cursor.lastrowid

async def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM agent_audit_log ORDER BY log_id DESC LIMIT ?", (limit,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def enqueue_approval(
    approval_id: str,
    thread_id: str,
    action_type: str,
    description: str,
    payload: str
) -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT OR REPLACE INTO approval_queue (approval_id, thread_id, action_type, description, payload, status)
            VALUES (?, ?, ?, ?, ?, 'PENDING')
            """,
            (approval_id, thread_id, action_type, description, payload)
        )
        await db.commit()

async def resolve_approval(approval_id: str, status: str) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        now = datetime.utcnow().isoformat()
        await db.execute(
            "UPDATE approval_queue SET status = ?, resolved_at = ? WHERE approval_id = ?",
            (status, now, approval_id)
        )
        await db.commit()
        async with db.execute("SELECT * FROM approval_queue WHERE approval_id = ?", (approval_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def get_pending_approvals() -> List[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM approval_queue WHERE status = 'PENDING' ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_approval_by_thread(thread_id: str) -> Optional[Dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM approval_queue WHERE thread_id = ? AND status = 'PENDING' ORDER BY created_at DESC LIMIT 1",
            (thread_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None
