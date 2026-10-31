"""
Comprehensive verification test suite for MongoDB Atlas integration in AI-01.
Tests every API endpoint and verifies database round-trips against MongoDB Atlas.
"""

import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def request_json(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
        encoded = json.dumps(data).encode("utf-8")
    else:
        encoded = None
    try:
        with urllib.request.urlopen(req, data=encoded, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    passed = 0
    failed = 0
    total = 0

    print("="*65)
    print("RUNNING AI-01 MONGODB ATLAS INTEGRATION TEST SUITE")
    print("="*65)

    def test(name, status_code, data, condition):
        nonlocal passed, failed, total
        total += 1
        if condition(status_code, data):
            print(f" [PASS] {name} (HTTP {status_code})")
            passed += 1
        else:
            print(f" [FAIL] {name} (HTTP {status_code}) -> Response: {data}")
            failed += 1

    # 1. Health check
    code, data = request_json("/api/health")
    test("Health Check & Atlas Status", code, data, lambda c, d: c == 200 and d.get("database", {}).get("connected") is True)

    # 2. Get Ledger Transactions
    code, data = request_json("/api/ledger")
    tx_count = len(data.get("transactions", []))
    test(f"Get Ledger (Count: {tx_count})", code, data, lambda c, d: c == 200 and len(d.get("transactions", [])) >= 6)

    # 3. Create/Upload Invoice
    code, data = request_json("/api/ledger/upload", method="POST", data={
        "invoice_number": "INV-TEST-999",
        "entity_name": "Test Metals Ltd",
        "amount_due": 25000.0,
        "tax_amount": 4500.0,
        "payment_status": "OVERDUE",
        "gstin": "27AABCT9999Z1Z"
    })
    test("Insert Invoice Transaction", code, data, lambda c, d: c == 200 and d.get("status") == "SUCCESS")

    # 4. Mark Paid
    code, data = request_json("/api/ledger/mark-paid", method="POST", data={"invoice_number": "INV-TEST-999"})
    test("Mark Invoice as Paid", code, data, lambda c, d: c == 200 and d.get("payment_status") == "PAID")

    # 5. Delete Test Invoice
    code, data = request_json("/api/ledger/INV-TEST-999", method="DELETE")
    test("Delete Invoice Record", code, data, lambda c, d: c == 200 and d.get("status") == "SUCCESS")

    # 6. Approvals List
    code, data = request_json("/api/approvals")
    test("Get Approvals List & Stats", code, data, lambda c, d: c == 200 and "pending" in d and "resolved" in d)

    # 7. Audit Logs
    code, data = request_json("/api/audit/logs")
    test("Get Audit Logs & Summary", code, data, lambda c, d: c == 200 and d.get("total_count", 0) >= 10)

    # 8. Party Directory List
    code, data = request_json("/api/parties")
    parties_count = len(data.get("parties", []))
    test(f"Get Party Directory (Count: {parties_count})", code, data, lambda c, d: c == 200 and parties_count >= 7)

    # 9. Create Party Profile
    code, data = request_json("/api/parties/create", method="POST", data={
        "entity_name": "Atlas Test Fabricators",
        "party_type": "Supplier",
        "phone_number": "+91 99999 11111",
        "gstin": "27TEST9999F1Z1",
        "city": "Pune",
        "state": "Maharashtra",
        "preferred_language": "Marathi",
        "reliability_score": 95
    })
    test_party_id = data.get("party_id")
    test(f"Create Party Profile (party_id={test_party_id})", code, data, lambda c, d: c == 200 and d.get("status") == "SUCCESS")

    # 10. Update Party Config
    if test_party_id:
        code, data = request_json(f"/api/parties/{test_party_id}/config", method="PUT", data={"risk_level": "LOW", "max_auto_approval_threshold": 75000.0})
        test("Update Party Configuration", code, data, lambda c, d: c == 200 and d.get("party", {}).get("risk_level") == "LOW")

        # 11. Delete Test Party
        code, data = request_json(f"/api/parties/{test_party_id}", method="DELETE")
        test(f"Delete Party Profile (party_id={test_party_id})", code, data, lambda c, d: c == 200 and d.get("status") == "SUCCESS")

    # 12. Voice Calls List
    code, data = request_json("/api/voice/calls")
    calls_count = len(data.get("calls", []))
    test(f"Get Voice Calls List (Count: {calls_count})", code, data, lambda c, d: c == 200 and calls_count >= 5)

    # 13. System Configuration
    code, data = request_json("/api/config")
    test("Get System Config & Mongo Diagnostics", code, data, lambda c, d: c == 200 and d.get("database_info", {}).get("database") == "ai01_db")

    # 14. Test APIs Health Diagnostic
    code, data = request_json("/api/config/test-apis", method="POST", data={"service": "all"})
    test("API Diagnostics Ping (MongoDB, Gemini, Twilio, Vapi)", code, data, lambda c, d: c == 200 and d.get("results", {}).get("mongodb", {}).get("status") == "CONNECTED")

    print("-"*65)
    print(f"RESULTS: {passed}/{total} Passed, {failed} Failed.")
    print("="*65)
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

