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
        "invoice_number": "INV-025",
        "invoice_date": "2026-10-22",
        "amount_due": 45000.00,
        "tax_amount": 8100.00,  # 18% GST
        "payment_status": "OVERDUE",
        "promised_payment_date": "2026-10-30",
        "notes": "30 Oct (UPI) - Debtor agreed to clear via UPI after follow-up call.",
        "gstin": "27AABCS1429B1Z"
    },
    {
        "entity_name": "Jai Hind Traders",
        "phone_number": "+919822019988",
        "invoice_number": "INV-024",
        "invoice_date": "2026-10-18",
        "amount_due": 82600.00,
        "tax_amount": 14868.00,
        "payment_status": "PAID",
        "promised_payment_date": "2026-10-18",
        "notes": "18 Oct (Bank) - Reconciled via Bank IMPS ref #UTR202610188902.",
        "gstin": "27AAACJ8921K1ZZ"
    },
    {
        "entity_name": "Raj Logistics & Co.",
        "phone_number": "+919811224455",
        "invoice_number": "INV-023",
        "invoice_date": "2026-10-15",
        "amount_due": 124000.00,
        "tax_amount": 22320.00,
        "payment_status": "PAID",
        "promised_payment_date": "2026-10-15",
        "notes": "15 Oct (NEFT) - Reconciled via Corporate NEFT transfer.",
        "gstin": "27AAACR4412M1Z8"
    },
    {
        "entity_name": "Karan Electricals",
        "phone_number": "+919977881122",
        "invoice_number": "INV-022",
        "invoice_date": "2026-10-12",
        "amount_due": 35000.00,
        "tax_amount": 6300.00,
        "payment_status": "PARTIAL",
        "promised_payment_date": "2026-11-05",
        "notes": "05 Nov (Cash) - ₹15,000 paid, remaining ₹20,000 promised on Nov 5th.",
        "gstin": "27AAACK1109P1ZU"
    },
    {
        "entity_name": "Mahata Enterprises",
        "phone_number": "+919444129900",
        "invoice_number": "INV-021",
        "invoice_date": "2026-10-08",
        "amount_due": 55900.00,
        "tax_amount": 10062.00,
        "payment_status": "OVERDUE",
        "promised_payment_date": "2026-10-25",
        "notes": "25 Oct (UPI) - Follow up completed. High priority for GST Challan.",
        "gstin": "27AAACM9981Q1ZX"
    },
    {
        "entity_name": "Sharma Metal Works",
        "phone_number": "+919876543210",
        "invoice_number": "INV-2026-001",
        "invoice_date": "2026-10-05",
        "amount_due": 45000.00,
        "tax_amount": 8100.00,
        "payment_status": "OVERDUE",
        "promised_payment_date": "2026-11-05",
        "notes": "Voice Call: Promised payment by Tuesday, Nov 5th.",
        "gstin": "27AABCS1429B1Z"
    }
]

def seed_database():
    print(f"Initializing database at: {DB_PATH}")
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS ledger_transactions")
        cursor.execute("DROP TABLE IF EXISTS approval_queue")
        cursor.execute("DROP TABLE IF EXISTS agent_audit_log")
        conn.commit()

    init_db_sync()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        for rec in SEED_RECORDS:
            cursor.execute(
                """
                INSERT INTO ledger_transactions 
                (entity_name, phone_number, invoice_number, invoice_date, amount_due, tax_amount, payment_status, promised_payment_date, notes, gstin)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    rec["notes"],
                    rec.get("gstin", "27AABCS1429B1Z")
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
                "AI-01 initialized for Sharma Enterprises. Ledger loaded with 6 MSME transactions. Claimable ITC ₹24,800. Unresolved overdue ₹45,000.",
                "database_bootstrapper",
                "INITIALIZED"
            )
        )

        conn.commit()
        print(f"Successfully seeded {len(SEED_RECORDS)} MSME transactions and initial audit logs.")

if __name__ == "__main__":
    seed_database()
