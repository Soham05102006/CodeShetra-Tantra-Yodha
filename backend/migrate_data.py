"""
Data Migration Script: Migrate all existing mock/dummy data into MongoDB Atlas.
Fully idempotent: Safe to run multiple times without duplicating or overwriting data blindly.
Generates an auditable migration report upon completion.
"""

import os
import sys
import json
import sqlite3
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from mongo_client import (
    get_mongo_db,
    init_mongo_collections,
    verify_mongo_connection,
    logger
)
from seed_data import SEED_RECORDS

DB_PATH = os.path.join(BASE_DIR, "data", "app.db")

# Static Vernacular Voice Calls Dataset (previously hardcoded in main.py & VernacularCalls.jsx)
SEED_VOICE_CALLS = [
    {
        "id": "call-001",
        "contact_name": "Sharma Metal Works",
        "phone_number": "+91 98765 43210",
        "masked_phone": "+91 98XXX XXXXX",
        "invoice_number": "INV-025",
        "amount_due": 45000.0,
        "language": "Hindi (Bundeli)",
        "call_status": "CONNECTED",
        "extracted_promise": "30 Oct (UPI)",
        "promised_date": "2026-10-30",
        "duration": "01:24",
        "sentiment": "COOPERATIVE (85%)",
        "sentiment_score": 0.85,
        "sentiment_type": "cooperative",
        "model_used": "Vapi.ai + Azure Hindi Swara",
        "ai_transcript": "...बकाया है, आप कब तक भुगतान करेंगे? (your payment is pending, when can you pay?)",
        "ai_spoken": "Namaste Sharma ji! Main Sharma Enterprises se AI assistant baat kar rahi hoon. Aapka invoice number INV-025 ka 45,000 rupaye overdue hai. Aap kab tak bhugtan karenge?",
        "customer_transcript": "हाँ भैया, मैं कल शाम तक ₹15,000 UPI के ज़रिये भेज दूँगा पक्का। बाकी अगले हफ्ते।",
        "cust_spoken": "Haan bhaiya, maal to mil gaya tha. Main kal shaam tak 15,000 rupaye UPI ke zariye bhej doonga pakka. Baaki agle hafte tak clear kar denge.",
        "extracted_entity": "Promised ₹15,000 via UPI on 30 Oct",
        "system_action": "Updating Ledger with promise date.",
        "created_at": datetime.fromisoformat("2026-10-31T18:31:04")
    },
    {
        "id": "call-002",
        "contact_name": "Jai Hind Traders",
        "phone_number": "+91 85220 19988",
        "masked_phone": "+91 85XXX XXXXX",
        "invoice_number": "INV-024",
        "amount_due": 82600.0,
        "language": "Marathi",
        "call_status": "PROMISE SECURED",
        "extracted_promise": "03 Nov (Bank)",
        "promised_date": "2026-11-03",
        "duration": "00:58",
        "sentiment": "COOPERATIVE (92%)",
        "sentiment_score": 0.92,
        "sentiment_type": "cooperative",
        "model_used": "Vapi.ai + Indic Marathi Whisper",
        "ai_transcript": "नमस्कार पाटील साहेब, शर्मा एंटरप्रायझेस कडून ₹82,600 चे बिल बाकी आहे. (Greetings Mr. Patil, invoice of ₹82,600 is due.)",
        "ai_spoken": "Namaskar Patil saheb, Sharma Enterprises kadun 82,600 rupayanche bill baaki aahe.",
        "customer_transcript": "हो, सोमवारी ३ नोव्हेंबरला आरटीजीएस ने पाठवून देतो. (Yes, will send via RTGS on Monday, Nov 3rd.)",
        "cust_spoken": "Ho, Somwari 3 Novemberla RTGS ne pathvoon deto.",
        "extracted_entity": "Promised ₹82,600 via Bank on 03 Nov",
        "system_action": "Ledger reconciled. Status changed to PAID.",
        "created_at": datetime.fromisoformat("2026-10-31T16:45:00")
    },
    {
        "id": "call-003",
        "contact_name": "Karan Electricals",
        "phone_number": "+91 91778 81122",
        "masked_phone": "+91 91XXX XXXXX",
        "invoice_number": "INV-022",
        "amount_due": 35000.0,
        "language": "Hindi",
        "call_status": "CONNECTED",
        "extracted_promise": "05 Nov (Cash)",
        "promised_date": "2026-11-05",
        "duration": "01:42",
        "sentiment": "HESITANT (65%)",
        "sentiment_score": 0.65,
        "sentiment_type": "hesitant",
        "model_used": "Vapi.ai + Azure Hindi Swara",
        "ai_transcript": "नमस्ते करन जी, ₹35,000 का बकाया चालान पेंडिंग है। (Invoice of ₹35,000 is pending.)",
        "ai_spoken": "Namaste Karan ji, 35,000 rupaye ka bakaya chalan pending hai.",
        "customer_transcript": "मार्केट बहुत मंदा है। 5 नवंबर को आधा कैश दे पाऊंगा। (Market is slow. Can give half in cash by Nov 5th.)",
        "cust_spoken": "Market bahut manda hai. 5 November ko aadha cash de paunga.",
        "extracted_entity": "Promised ₹15,000 via Cash on 05 Nov",
        "system_action": "Status updated to PARTIAL in ledger.",
        "created_at": datetime.fromisoformat("2026-10-31T14:10:00")
    },
    {
        "id": "call-004",
        "contact_name": "Mahata Enterprises",
        "phone_number": "+91 72441 29900",
        "masked_phone": "+91 72XXX XXXXX",
        "invoice_number": "INV-021",
        "amount_due": 55900.0,
        "language": "Gujarati",
        "call_status": "RETRY SCHEDULED",
        "extracted_promise": "--",
        "promised_date": None,
        "duration": "00:15",
        "sentiment": "RESISTANT (40%)",
        "sentiment_score": 0.40,
        "sentiment_type": "resistant",
        "model_used": "Vapi.ai + Indic Gujarati",
        "ai_transcript": "નમસ્તે મહેતા સાહેબ, શર્મા એન્ટરપ્રાઇઝિસ માંથી કોલ છે. (Greetings Mr. Mahata, call from Sharma Enterprises.)",
        "ai_spoken": "Namaste Mehta saheb, Sharma Enterprises maathi call chhe.",
        "customer_transcript": "હું ડ્રાઇવિંગ કરી રહ્યો છું, પછી કોલ કરો. (I am driving, call back later.)",
        "cust_spoken": "Hu driving kari rahyo chhu, pachhi call karo.",
        "extracted_entity": "Scheduled retry in 2 hours",
        "system_action": "Queued for automated vernacular callback.",
        "created_at": datetime.fromisoformat("2026-10-31T11:32:00")
    },
    {
        "id": "call-005",
        "contact_name": "Raj Logistics & Co.",
        "phone_number": "+91 99112 24455",
        "masked_phone": "+91 99XXX XXXXX",
        "invoice_number": "INV-023",
        "amount_due": 124000.0,
        "language": "Punjabi",
        "call_status": "NO ANSWER",
        "extracted_promise": "--",
        "promised_date": None,
        "duration": "00:00",
        "sentiment": "UNREACHABLE",
        "sentiment_score": 0.0,
        "sentiment_type": "unreachable",
        "model_used": "Vapi.ai + Indic Punjabi",
        "ai_transcript": "Outbound ringing... (No answer / Subscriber busy)",
        "ai_spoken": "Outbound ringing to Raj Logistics...",
        "customer_transcript": "[No Response / Unreachable]",
        "cust_spoken": "[No Response / Unreachable]",
        "extracted_entity": "Unreachable via voice call",
        "system_action": "Triggered Twilio WhatsApp sandbox nudge.",
        "created_at": datetime.fromisoformat("2026-10-31T09:00:00")
    }
]

def load_sqlite_data() -> Dict[str, List[Dict[str, Any]]]:
    """Extracts existing records from SQLite if available, else falls back to seed definitions."""
    extracted = {
        "ledger_transactions": [],
        "approval_queue": [],
        "agent_audit_log": [],
        "party_directory": [],
        "system_configuration": []
    }

    if os.path.exists(DB_PATH):
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                for table in extracted.keys():
                    try:
                        cursor.execute(f"SELECT * FROM {table}")
                        rows = cursor.fetchall()
                        extracted[table] = [dict(row) for row in rows]
                    except sqlite3.OperationalError:
                        pass
        except Exception as e:
            logger.warning(f"Could not read from SQLite db: {e}")

    # Fallback to seed definitions if SQLite tables are empty
    if not extracted["ledger_transactions"]:
        extracted["ledger_transactions"] = SEED_RECORDS

    return extracted

def migrate_data() -> Dict[str, Any]:
    """Executes idempotent migration from SQLite & hardcoded datasets into MongoDB Atlas."""
    db = get_mongo_db()
    init_mongo_collections(db)

    report = {
        "database": db.name,
        "total_dummy_identified": 0,
        "total_migrated": 0,
        "total_already_existing": 0,
        "total_skipped": 0,
        "total_errors": 0,
        "collections": {}
    }

    sqlite_data = load_sqlite_data()

    # 1. Migrate ledger_transactions
    lt_col = db["ledger_transactions"]
    tx_records = sqlite_data["ledger_transactions"]
    report["total_dummy_identified"] += len(tx_records)
    c_stats = {"identified": len(tx_records), "migrated": 0, "existing": 0, "errors": 0}

    for tx in tx_records:
        inv_num = tx.get("invoice_number")
        if not inv_num:
            continue
        try:
            existing = lt_col.find_one({"invoice_number": inv_num})
            if existing:
                c_stats["existing"] += 1
                report["total_already_existing"] += 1
            else:
                doc = {
                    "entity_name": tx.get("entity_name"),
                    "phone_number": tx.get("phone_number"),
                    "invoice_number": inv_num,
                    "invoice_date": tx.get("invoice_date"),
                    "amount_due": float(tx.get("amount_due", 0.0)),
                    "tax_amount": float(tx.get("tax_amount", 0.0)),
                    "payment_status": tx.get("payment_status", "PENDING"),
                    "promised_payment_date": tx.get("promised_payment_date"),
                    "notes": tx.get("notes"),
                    "gstin": tx.get("gstin", "27AABCS1429B1Z"),
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                lt_col.update_one({"invoice_number": inv_num}, {"$setOnInsert": doc}, upsert=True)
                c_stats["migrated"] += 1
                report["total_migrated"] += 1
        except Exception as e:
            logger.error(f"Error migrating ledger transaction {inv_num}: {e}")
            c_stats["errors"] += 1
            report["total_errors"] += 1

    report["collections"]["ledger_transactions"] = c_stats

    # 2. Migrate approval_queue
    aq_col = db["approval_queue"]
    appr_records = sqlite_data["approval_queue"]
    report["total_dummy_identified"] += len(appr_records)
    c_stats = {"identified": len(appr_records), "migrated": 0, "existing": 0, "errors": 0}

    for app_item in appr_records:
        app_id = app_item.get("approval_id")
        if not app_id:
            continue
        try:
            existing = aq_col.find_one({"approval_id": app_id})
            if existing:
                c_stats["existing"] += 1
                report["total_already_existing"] += 1
            else:
                payload = app_item.get("payload")
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except Exception:
                        pass

                doc = {
                    "approval_id": app_id,
                    "thread_id": app_item.get("thread_id"),
                    "action_type": app_item.get("action_type"),
                    "description": app_item.get("description"),
                    "payload": payload,
                    "status": app_item.get("status", "PENDING"),
                    "created_at": datetime.now(timezone.utc),
                    "resolved_at": app_item.get("resolved_at")
                }
                aq_col.update_one({"approval_id": app_id}, {"$setOnInsert": doc}, upsert=True)
                c_stats["migrated"] += 1
                report["total_migrated"] += 1
        except Exception as e:
            logger.error(f"Error migrating approval {app_id}: {e}")
            c_stats["errors"] += 1
            report["total_errors"] += 1

    report["collections"]["approval_queue"] = c_stats

    # 3. Migrate agent_audit_log
    aal_col = db["agent_audit_log"]
    audit_records = sqlite_data["agent_audit_log"]
    report["total_dummy_identified"] += len(audit_records)
    c_stats = {"identified": len(audit_records), "migrated": 0, "existing": 0, "errors": 0}

    for log in audit_records:
        t_id = log.get("thread_id")
        step = log.get("step_name")
        ts = log.get("timestamp") or datetime.now(timezone.utc).isoformat()
        try:
            existing = aal_col.find_one({"thread_id": t_id, "step_name": step, "timestamp": ts})
            if existing:
                c_stats["existing"] += 1
                report["total_already_existing"] += 1
            else:
                payload = log.get("payload")
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except Exception:
                        pass

                reasoning_steps = log.get("reasoning_steps")
                if isinstance(reasoning_steps, str):
                    try:
                        reasoning_steps = json.loads(reasoning_steps)
                    except Exception:
                        pass

                doc = {
                    "thread_id": t_id,
                    "step_name": step,
                    "agent_reasoning": log.get("agent_reasoning"),
                    "tool_used": log.get("tool_used"),
                    "execution_status": log.get("execution_status", "COMPLETED"),
                    "screenshot_path": log.get("screenshot_path"),
                    "payload": payload,
                    "reasoning_steps": reasoning_steps or [],
                    "duration": log.get("duration", "0.5s"),
                    "hash": log.get("hash"),
                    "timestamp": ts
                }
                aal_col.insert_one(doc)
                c_stats["migrated"] += 1
                report["total_migrated"] += 1
        except Exception as e:
            logger.error(f"Error migrating audit log {t_id}/{step}: {e}")
            c_stats["errors"] += 1
            report["total_errors"] += 1

    report["collections"]["agent_audit_log"] = c_stats

    # 4. Migrate party_directory
    pd_col = db["party_directory"]
    party_records = sqlite_data["party_directory"]
    report["total_dummy_identified"] += len(party_records)
    c_stats = {"identified": len(party_records), "migrated": 0, "existing": 0, "errors": 0}

    for p in party_records:
        entity = p.get("entity_name")
        if not entity:
            continue
        try:
            existing = pd_col.find_one({"entity_name": entity})
            if existing:
                c_stats["existing"] += 1
                report["total_already_existing"] += 1
            else:
                history = p.get("interaction_history")
                if isinstance(history, str):
                    try:
                        history = json.loads(history)
                    except Exception:
                        pass

                doc = {
                    "party_id": p.get("party_id") or p.get("id"),
                    "entity_name": entity,
                    "party_type": p.get("party_type", "Supplier"),
                    "phone_number": p.get("phone_number"),
                    "whatsapp_number": p.get("whatsapp_number", p.get("phone_number")),
                    "gstin": p.get("gstin", "27AABCS1429B1Z"),
                    "gstin_status": p.get("gstin_status", "VERIFIED"),
                    "legal_name": p.get("legal_name", entity),
                    "city": p.get("city", "Mumbai"),
                    "state": p.get("state", "Maharashtra"),
                    "preferred_language": p.get("preferred_language", "Hindi (Bundeli)"),
                    "calling_window": p.get("calling_window", "10:00 AM - 02:00 PM"),
                    "credit_terms": p.get("credit_terms", "15 Days Credit"),
                    "max_auto_approval_threshold": float(p.get("max_auto_approval_threshold", 50000.0)),
                    "reliability_score": int(p.get("reliability_score", 90)),
                    "avg_payment_delay_days": float(p.get("avg_payment_delay_days", 4.0)),
                    "total_invoiced": float(p.get("total_invoiced", 100000.0)),
                    "risk_level": p.get("risk_level", "LOW"),
                    "interaction_history": history or [],
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                pd_col.update_one({"entity_name": entity}, {"$setOnInsert": doc}, upsert=True)
                c_stats["migrated"] += 1
                report["total_migrated"] += 1
        except Exception as e:
            logger.error(f"Error migrating party {entity}: {e}")
            c_stats["errors"] += 1
            report["total_errors"] += 1

    report["collections"]["party_directory"] = c_stats

    # 5. Migrate system_configuration
    sc_col = db["system_configuration"]
    config_records = sqlite_data["system_configuration"]
    report["total_dummy_identified"] += len(config_records)
    c_stats = {"identified": len(config_records), "migrated": 0, "existing": 0, "errors": 0}

    for c in config_records:
        k = c.get("config_key")
        if not k:
            continue
        try:
            existing = sc_col.find_one({"config_key": k})
            if existing:
                c_stats["existing"] += 1
                report["total_already_existing"] += 1
            else:
                doc = {
                    "config_key": k,
                    "config_value": c.get("config_value"),
                    "category": c.get("category", "GENERAL"),
                    "updated_at": datetime.now(timezone.utc)
                }
                sc_col.update_one({"config_key": k}, {"$setOnInsert": doc}, upsert=True)
                c_stats["migrated"] += 1
                report["total_migrated"] += 1
        except Exception as e:
            logger.error(f"Error migrating config {k}: {e}")
            c_stats["errors"] += 1
            report["total_errors"] += 1

    report["collections"]["system_configuration"] = c_stats

    # 6. Migrate voice_calls
    vc_col = db["voice_calls"]
    report["total_dummy_identified"] += len(SEED_VOICE_CALLS)
    c_stats = {"identified": len(SEED_VOICE_CALLS), "migrated": 0, "existing": 0, "errors": 0}

    for call in SEED_VOICE_CALLS:
        cid = call["id"]
        try:
            existing = vc_col.find_one({"id": cid})
            if existing:
                c_stats["existing"] += 1
                report["total_already_existing"] += 1
            else:
                vc_col.update_one({"id": cid}, {"$setOnInsert": call}, upsert=True)
                c_stats["migrated"] += 1
                report["total_migrated"] += 1
        except Exception as e:
            logger.error(f"Error migrating voice call {cid}: {e}")
            c_stats["errors"] += 1
            report["total_errors"] += 1

    report["collections"]["voice_calls"] = c_stats

    return report

def print_migration_summary(report: Dict[str, Any]):
    print("\n" + "="*70)
    print(f"MONGODB ATLAS MIGRATION REPORT - DATABASE: '{report['database']}'")
    print("="*70)
    print(f"Total Dummy Records Identified: {report['total_dummy_identified']}")
    print(f"Total Records Migrated:         {report['total_migrated']}")
    print(f"Total Records Already Existing: {report['total_already_existing']}")
    print(f"Total Records Skipped:          {report['total_skipped']}")
    print(f"Total Errors Encountered:       {report['total_errors']}")
    print("-"*70)
    print("COLLECTION-WISE BREAKDOWN:")
    for col_name, stats in report["collections"].items():
        print(f"  * {col_name:<25}: Identified={stats['identified']:<3} | Migrated={stats['migrated']:<3} | Existing={stats['existing']:<3} | Errors={stats['errors']}")
    print("="*70 + "\n")

if __name__ == "__main__":
    rep = migrate_data()
    print_migration_summary(rep)
