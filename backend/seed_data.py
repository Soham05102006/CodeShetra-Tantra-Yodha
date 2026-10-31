"""
Database seeding script for AI-01 — The AI-Native Company of One.
Initializes clean tables and seeds realistic Indian MSME records.
"""

import sqlite3
import os
from database import DB_PATH, init_db_sync

SEED_RECORDS = [
    {
        "entity_name": "Sharma Metal Works",
        "phone_number": "+919876543210",
        "invoice_number": "INV-2026-001",
        "invoice_date": "2026-10-05",
        "amount_due": 45000.00,
        "tax_amount": 8100.00,  # 18% GST
        "payment_status": "OVERDUE",
        "promised_payment_date": None,
        "notes": "30 days payment term exceeded. Outstanding batch of brass fittings."
    },
    {
        "entity_name": "Patel Precision Lathes & Tools",
        "phone_number": "+919822012345",
        "invoice_number": "INV-2026-004",
        "invoice_date": "2026-10-12",
        "amount_due": 78500.00,
        "tax_amount": 14130.00,
        "payment_status": "OVERDUE",
        "promised_payment_date": None,
        "notes": "CNC machine spare parts. Client notified once via WhatsApp."
    },
    {
        "entity_name": "Gupta Textile Mill Supplies",
        "phone_number": "+919811223344",
        "invoice_number": "INV-2026-009",
        "invoice_date": "2026-10-18",
        "amount_due": 32000.00,
        "tax_amount": 5760.00,
        "payment_status": "PENDING",
        "promised_payment_date": "2026-11-05",
        "notes": "Committed over vernacular follow-up call on Nov 5th."
    },
    {
        "entity_name": "Bajaj Auto Die Castings Pune",
        "phone_number": "+919977889900",
        "invoice_number": "INV-2026-015",
        "invoice_date": "2026-09-28",
        "amount_due": 112000.00,
        "tax_amount": 20160.00,
        "payment_status": "OVERDUE",
        "promised_payment_date": None,
        "notes": "High priority supplier. Flagged for GST Challan reconciliation."
    },
    {
        "entity_name": "Venkateshwara Industrial Fasteners",
        "phone_number": "+919444123890",
        "invoice_number": "INV-2026-021",
        "invoice_date": "2026-10-22",
        "amount_due": 18400.00,
        "tax_amount": 3312.00,
        "payment_status": "PAID",
        "promised_payment_date": "2026-10-28",
        "notes": "Payment reconciled via NEFT ref #UTR89401923."
    }
]

def seed_database():
    print(f"Initializing database at: {DB_PATH}")
    init_db_sync()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        # Clean existing test transactions
        cursor.execute("DELETE FROM ledger_transactions")
        cursor.execute("DELETE FROM approval_queue")
        cursor.execute("DELETE FROM agent_audit_log")

        for rec in SEED_RECORDS:
            cursor.execute(
                """
                INSERT INTO ledger_transactions 
                (entity_name, phone_number, invoice_number, invoice_date, amount_due, tax_amount, payment_status, promised_payment_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rec["entity_name"],
                    rec["phone_number"],
                    rec["invoice_number"],
                    rec["invoice_date"],
                    rec["amount_due"],
                    rec["tax_amount"],
                    rec["payment_status"],
                    rec["promised_payment_date"],
                    rec["notes"]
                )
            )
        
        # Add initial audit log entry
        cursor.execute(
            """
            INSERT INTO agent_audit_log (thread_id, step_name, agent_reasoning, tool_used, execution_status)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                "init-thread-001",
                "system_initialization",
                "AI-01 initialized for Sharma Enterprises. Ledger loaded with 5 MSME transactions. 3 overdue accounts detected totaling ₹235,500.",
                "database_bootstrapper",
                "INITIALIZED"
            )
        )

        conn.commit()
        print(f"Successfully seeded {len(SEED_RECORDS)} MSME transactions and initial audit logs.")

if __name__ == "__main__":
    seed_database()
