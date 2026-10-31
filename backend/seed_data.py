"""
Database seeding script for AI-01 — The AI-Native Company of One.
Initializes clean tables and seeds realistic Indian MSME records.
"""

import sqlite3
import os
import json
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
        cursor.execute("DROP TABLE IF EXISTS party_directory")
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
        
        # Seed initial pending and resolved approvals matching the Circuit Breaker dashboard
        approvals_seed = [
            (
                "appr-12041",
                "th-12041",
                "GST_RETURN_FILING",
                "GST Return Filing & Tax Submission",
                json.dumps({
                    "entity_name": "Sharma Metal Works",
                    "invoice_count": 24,
                    "tax_to_file": 42500,
                    "portal": "mock GST India Portal",
                    "trigger": "Circuit Breaker Gate (financial submission)",
                    "itc_claimed": 42500.0,
                    "destination": "GST Portal (Mock - localhost:8000)",
                    "reasoning": "Reconciled 14 invoices. Tax credit calculation verified against bank statements. Halting at final submit button for owner authorization.",
                    "risk_level": "HIGH_RISK"
                }),
                "PENDING"
            ),
            (
                "appr-12045",
                "th-12045",
                "VENDOR_PAYOUT",
                "Vendor Payout - Jai Hind Traders",
                json.dumps({
                    "entity_name": "Jai Hind Traders",
                    "amount": 82600.0,
                    "account": "HDFC Bank *4321",
                    "invoice_reconciled": "INV-024 (100% Match)",
                    "trigger": "Bank payout amount is over the automated limit of ₹50,000.",
                    "reasoning": "Vendor payment request of ₹82,600 exceeds single payout limit of ₹50,000. Auto-paused by safety circuit breaker.",
                    "risk_level": "MEDIUM_RISK"
                }),
                "PENDING"
            ),
            (
                "appr-12040",
                "th-12040",
                "PAYOUT_DISPATCH",
                "Vendor payment to Jai Hind Traders (INR 82,600)",
                json.dumps({
                    "entity_name": "Jai Hind Traders",
                    "amount": 82600.0,
                    "resolved_via": "WhatsApp",
                    "risk_level": "HIGH_RISK"
                }),
                "APPROVED"
            ),
            (
                "appr-12039",
                "th-12039",
                "LEDGER_AUTO_CLOSE",
                "Auto-Close ledger reconciliation (approved by system)",
                json.dumps({
                    "entity_name": "System Batch",
                    "amount": 124000.0,
                    "resolved_via": "Web Dashboard",
                    "risk_level": "LOW_RISK"
                }),
                "APPROVED"
            ),
            (
                "appr-12038",
                "th-12038",
                "INVOICE_CANCELLATION",
                "Cancelled incorrect invoice draft INV-026 (Duplicate detected)",
                json.dumps({
                    "entity_name": "Verma Logistics",
                    "amount": 18500.0,
                    "resolved_via": "WhatsApp",
                    "risk_level": "MEDIUM_RISK"
                }),
                "REJECTED"
            )
        ]

        for app_item in approvals_seed:
            cursor.execute(
                """
                INSERT INTO approval_queue (approval_id, thread_id, action_type, description, payload, status)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                app_item
            )

        # Seed realistic audit trail entries matching screenshot and specifications
        audit_seed = [
            (
                "run-7482",
                "Playwright Computer-Use",
                "Automated GST Portal data entry & interactive button click",
                "browser-use (Computer Use)",
                "EXECUTING",
                "/static/screenshots/demo-104451_step5_challan_generated.png",
                json.dumps({
                    "action": "click",
                    "selector": "#gst-submit",
                    "args": {"force": True},
                    "target": "https://gst.gov.in/portal/filing",
                    "timestamp": "2026-10-31T20:45:12.801Z"
                }, indent=2),
                json.dumps([
                    "Parsed GSTR data input from thread (Pending Audit).",
                    "Navigated to gst.gov.in mock filing interface.",
                    "Identified #gst-submit button via visual anchor.",
                    "Dispatched Playwright CLICK event on Submit (pending validation)."
                ]),
                "1.24s",
                "0x8f2a71d49e10c4b1",
                "2026-10-31 20:45:12"
            ),
            (
                "run-7481",
                "WhatsApp Circuit Breaker",
                "Auto-escalated for owner signature; manual approval received",
                "twilio-whatsapp (Approval Gate)",
                "RESOLVED",
                "/static/screenshots/demo-104451_step4_declaration_authorized.png",
                json.dumps({
                    "event": "whatsapp_approval_received",
                    "from": "whatsapp:+919876543210",
                    "decision": "APPROVED",
                    "thread_id": "run-7481",
                    "approval_id": "appr-12041",
                    "timestamp": "2026-10-31T20:42:01.420Z"
                }, indent=2),
                json.dumps([
                    "Reconciled invoice INV-025 with GST filing form. Total amount ₹42,500.",
                    "Financial liability exceeds auto-filing threshold of ₹25,000.",
                    "Triggered Circuit Breaker interruption to wait for owner WhatsApp signature.",
                    "WhatsApp approval callback received from business owner (+91 98XXX XXXXX): 'APPROVE'."
                ]),
                "0.85s",
                "0x3c99f1a28d447e12",
                "2026-10-31 20:42:01"
            ),
            (
                "run-7479",
                "Hindi Voice Call (Vernacular Outbound)",
                "Dialed +91 98XXX XXXXX. Secured ₹15,000 promise",
                "vapi-voice (Vernacular Calls)",
                "SUCCESS",
                None,
                json.dumps({
                    "call_id": "vapi_call_849204",
                    "customer": "Sharma Metal Works",
                    "phone": "+919876543210",
                    "language": "hi-IN",
                    "duration": "1m 42s",
                    "outcome": "PAYMENT_PROMISE",
                    "promised_amount": 15000,
                    "timestamp": "2026-10-31T18:31:04.112Z"
                }, indent=2),
                json.dumps([
                    "Identified overdue invoice INV-025 (>25 days outstanding) for Sharma Metal Works.",
                    "Injected balance (₹45,000) and payment history into Vapi Vernacular Voice engine.",
                    "Dispatched conversational Hindi outbound phone call via Telephony Trunk.",
                    "Debtor confirmed invoice receipt and committed ₹15,000 payment via UPI by 30 Oct."
                ]),
                "102.4s",
                "0x5d10b77e8a912fa0",
                "2026-10-31 18:31:04"
            ),
            (
                "run-7475",
                "Document Extraction (AI OCR)",
                "Ingested INV-025 from WhatsApp, reconciled with bank statements",
                "gemini-ocr (Document Ingest)",
                "SUCCESS",
                "/sample_invoice.jpg",
                json.dumps({
                    "document_type": "INVOICE",
                    "invoice_number": "INV-025",
                    "supplier": "Sharma Metal Works",
                    "extracted_amount": 45000,
                    "gstin": "27AABCS1429B1Z",
                    "ocr_model": "gemini-2.0-flash",
                    "confidence": 0.984,
                    "timestamp": "2026-10-31T18:15:20.304Z"
                }, indent=2),
                json.dumps([
                    "Ingested raw invoice image INV-025 received via WhatsApp webhook attachment.",
                    "Gemini 2.0 Flash extracted: Supplier: Sharma Metal Works, Amount: ₹45,000, GSTIN: 27AABCS1429B1Z.",
                    "Cross-referenced against HDFC bank statement credit log (UTR20261028).",
                    "Reconciled ledger line item and marked status as OVERDUE for follow-up."
                ]),
                "2.10s",
                "0x91ef74c10a42b100",
                "2026-10-31 18:15:20"
            ),
            (
                "th-12041",
                "Circuit Breaker Gate",
                "Submit GST Return (Requires manual signature check for ₹42,500)",
                "twilio-whatsapp (Approval Gate)",
                "PAUSED",
                "/static/screenshots/demo-104451_step4_declaration_authorized.png",
                json.dumps({
                    "action": "CIRCUIT_BREAKER_INTERRUPT",
                    "entity": "Sharma Metal Works",
                    "tax_liability": 42500,
                    "threshold": 25000,
                    "status": "AWAITING_OWNER_SIGNATURE"
                }, indent=2),
                json.dumps([
                    "Reconciliation finished for 24 monthly invoices.",
                    "Generated GSTR-3B tax challan of ₹42,500.",
                    "Circuit breaker activated due to financial high-risk category.",
                    "Sent WhatsApp interactive approval card to Owner."
                ]),
                "0.42s",
                "0x74a019bcae4129ef",
                "2026-10-31 17:42:00"
            ),
            (
                "th-12040",
                "Vendor Payment Clearance",
                "Vendor payment to Jai Hind Traders (INR 82,600) (Approved by Owner via WhatsApp)",
                "twilio-whatsapp (Approval Gate)",
                "SUCCESS",
                None,
                json.dumps({
                    "vendor": "Jai Hind Traders",
                    "amount": 82600.0,
                    "channel": "HDFC Corporate Banking API",
                    "auth_source": "WhatsApp HMAC-SHA256"
                }, indent=2),
                json.dumps([
                    "Received invoice from Jai Hind Traders.",
                    "Reconciled against Purchase Order #PO-9912.",
                    "Dispatched WhatsApp prompt to owner for clearance.",
                    "Approval verified and payment triggered via Bank API."
                ]),
                "4.18s",
                "0x2289c84910ebf19a",
                "2026-10-31 16:45:00"
            ),
            (
                "th-12039",
                "Ledger Auto-Close",
                "Auto-Close ledger reconciliation (approved by system)",
                "gemini-ocr (Document Ingest)",
                "SUCCESS",
                None,
                json.dumps({
                    "batch_id": "BATCH-OCT-CLOSE",
                    "matched_count": 14,
                    "variance": 0.0,
                    "mode": "AUTONOMOUS"
                }, indent=2),
                json.dumps([
                    "Batch processed 14 incoming bank credits.",
                    "100% matched against active ledger invoices.",
                    "Zero discrepancy flagged.",
                    "Marked batch as RECONCILED."
                ]),
                "1.15s",
                "0x4b789110caef182a",
                "2026-10-31 14:10:00"
            ),
            (
                "th-12038",
                "Duplicate Invoice Rejection",
                "Cancelled incorrect invoice draft INV-026 (Duplicate detected, rejected by Owner)",
                "twilio-whatsapp (Approval Gate)",
                "FAILED",
                None,
                json.dumps({
                    "invoice_number": "INV-026",
                    "error": "DUPLICATE_GSTIN_INVOICE_HASH",
                    "decision": "REJECTED_BY_OWNER"
                }, indent=2),
                json.dumps([
                    "Detected duplicate invoice number INV-026 with differing dates.",
                    "Alerted business owner with anomaly score 0.94.",
                    "Owner rejected reconciliation with reason 'duplicate billing'.",
                    "Invoice voided in database."
                ]),
                "0.92s",
                "0xaa019842c174fe29",
                "2026-10-31 11:32:00"
            ),
            (
                "init-thread-001",
                "System Initialization",
                "AI-01 initialized for Sharma Enterprises. Ledger loaded with 6 MSME transactions. Claimable ITC ₹24,800. Unresolved overdue ₹45,000.",
                "browser-use (Computer Use)",
                "SUCCESS",
                None,
                json.dumps({
                    "system": "AI-01 Enterprise Core",
                    "company": "Sharma Enterprises",
                    "version": "1.0.0",
                    "status": "HEALTHY"
                }, indent=2),
                json.dumps([
                    "Loaded SQLite local operational database.",
                    "Loaded LangGraph state machines and checkpoint tables.",
                    "Verified Vapi Voice trunk connectivity.",
                    "System online and monitoring."
                ]),
                "0.12s",
                "0x110842caef918231",
                "2026-10-31 09:00:00"
            )
        ]

        for log in audit_seed:
            cursor.execute(
                """
                INSERT INTO agent_audit_log 
                (thread_id, step_name, agent_reasoning, tool_used, execution_status, screenshot_path, payload, reasoning_steps, duration, hash, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                log
            )

        # Seed master CRM party directory records
        party_seed = [
            (
                "Sharma Metal Works",
                "Supplier",
                "+91 9876543210",
                "+91 9876543210",
                "27AABCS1429B1Z",
                "VERIFIED",
                "SHARMA METAL WORKS PRIVATE LIMITED",
                "Mumbai",
                "Maharashtra",
                "Hindi (Bundeli)",
                "10:00 AM - 02:00 PM",
                "15 Days Credit",
                50000.0,
                94,
                5.1,
                342500.0,
                "LOW",
                json.dumps([
                    "Last Call: 30 Oct - Promise of ₹15k confirmed via Vernacular Call.",
                    "Document OCR: Verified & reconciled Invoice INV-025.",
                    "Logistics Sync: Auto-notified on dispatch delay.",
                    "WhatsApp Gate: Verified GST filing submission of ₹8,100."
                ])
            ),
            (
                "Jai Hind Traders",
                "Supplier",
                "+91 8576543211",
                "+91 8576543211",
                "27AAACS1234F1Z2",
                "VERIFIED",
                "JAI HIND TRADERS LLP",
                "Pune",
                "Maharashtra",
                "Marathi",
                "11:00 AM - 04:00 PM",
                "30 Days Credit",
                100000.0,
                98,
                2.3,
                182600.0,
                "LOW",
                json.dumps([
                    "WhatsApp Gate: Vendor payment of ₹82,600 authorized by Owner.",
                    "ChromaDB Memory: Preferred payment method is RTGS/NEFT.",
                    "Document Extraction: Invoice INV-024 reconciled with zero variance."
                ])
            ),
            (
                "Raj Logistics & Co.",
                "Customer",
                "+91 9976543212",
                "+91 9976543212",
                "03AABCR4589K1Z5",
                "VERIFIED",
                "RAJ LOGISTICS & FREIGHT SERVICES",
                "Ludhiana",
                "Punjab",
                "Punjabi",
                "02:00 PM - 06:00 PM",
                "15 Days Credit",
                40000.0,
                89,
                6.4,
                96400.0,
                "LOW",
                json.dumps([
                    "Outbound Call: Secured commitment for next billing cycle.",
                    "Dispatch Tracking: Freight docket #9910 cleared.",
                    "Credit Evaluation: Consistent 15-day settlement cycle."
                ])
            ),
            (
                "Karan Electricals",
                "Supplier",
                "+91 9176543213",
                "+91 9176543213",
                "27AAACK8891M1Z8",
                "PENDING",
                "KARAN ELECTRICAL INDUSTRIAL SUPPLIES",
                "Nagpur",
                "Maharashtra",
                "Hindi",
                "10:00 AM - 01:00 PM",
                "Advance Only",
                20000.0,
                72,
                12.8,
                64200.0,
                "MEDIUM",
                json.dumps([
                    "GST Portal Warning: GSTIN 27AAACK8891M1Z8 verification pending annual filing.",
                    "Follow-up Call: Customer requested extension till Friday.",
                    "Circuit Breaker Gate: Enforced manual sign-off for payouts."
                ])
            ),
            (
                "Mahata Enterprises",
                "Customer",
                "+91 7276543214",
                "+91 7276543214",
                "24AABCM9124P1Z3",
                "VERIFIED",
                "MAHATA ENTERPRISES PVT LTD",
                "Ahmedabad",
                "Gujarat",
                "Gujarati",
                "11:00 AM - 03:00 PM",
                "21 Days Credit",
                75000.0,
                91,
                4.1,
                215000.0,
                "LOW",
                json.dumps([
                    "ChromaDB Memory: Always pays within 48h when contacted in Gujarati.",
                    "Reconciliation: Matched payment UTR88192 on 29 Oct.",
                    "Ledger Audit: Zero disputed line items in past 6 months."
                ])
            ),
            (
                "Verma Logistics",
                "Customer",
                "+91 9811223344",
                "+91 9811223344",
                "27AAACM9981Q1ZX",
                "VERIFIED",
                "VERMA FREIGHT & HAULAGE SERVICES",
                "Thane",
                "Maharashtra",
                "Hinglish",
                "01:00 PM - 05:00 PM",
                "15 Days Credit",
                30000.0,
                85,
                7.0,
                145000.0,
                "MEDIUM",
                json.dumps([
                    "Circuit Breaker: Duplicate invoice draft INV-026 rejected by owner.",
                    "Follow-up: Correct invoice re-submitted.",
                    "Payment Log: Received partial payment ₹10,000 via IMPS."
                ])
            ),
            (
                "Apex Steel Fabricators",
                "Supplier",
                "+91 9423156789",
                "+91 9423156789",
                "27AAACA9012N1Z4",
                "VERIFIED",
                "APEX STEEL & FABRICATION INDUSTRIES",
                "Nashik",
                "Maharashtra",
                "Marathi",
                "10:00 AM - 02:00 PM",
                "45 Days Credit",
                150000.0,
                96,
                1.8,
                520000.0,
                "LOW",
                json.dumps([
                    "ChromaDB Memory: Tier-1 raw material supplier. High trust profile.",
                    "Automated Approval: Auto-cleared PO matching standard pricing matrix."
                ])
            )
        ]

        for p in party_seed:
            cursor.execute(
                """
                INSERT INTO party_directory 
                (entity_name, party_type, phone_number, whatsapp_number, gstin, gstin_status, legal_name, city, state, preferred_language, calling_window, credit_terms, max_auto_approval_threshold, reliability_score, avg_payment_delay_days, total_invoiced, risk_level, interaction_history)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                p
            )

        conn.commit()
        print(f"Successfully seeded {len(SEED_RECORDS)} MSME transactions, {len(approvals_seed)} approvals, audit trails, and {len(party_seed)} party directory profiles.")

if __name__ == "__main__":
    seed_database()
