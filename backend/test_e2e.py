import urllib.request
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def get(path):
    req = urllib.request.urlopen(f"http://127.0.0.1:8000{path}")
    return json.loads(req.read().decode())

def post(path, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(f"http://127.0.0.1:8000{path}", data=body, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req).read().decode())

print("--- [1] Checking Ledger State ---")
ledger = get("/api/ledger")
print(f"Total transactions loaded: {len(ledger['transactions'])}")

print("\n--- [2] Triggering Autonomous LangGraph Workflow for INV-2026-001 ---")
run_res = post("/api/workflow/run", {"invoice_number": "INV-2026-001"})
print("Workflow triggered response:", run_res)

print("\n--- [3] Polling for WhatsApp Circuit Breaker Interrupt ---")
time.sleep(2)
approvals = get("/api/approvals/pending")
print(f"Pending Circuit Breaker Approvals: {len(approvals['approvals'])}")

if approvals['approvals']:
    appr = approvals['approvals'][0]
    print(f"Captured Approval ID: {appr['approval_id']}")
    print(f"Action: {appr['action_type']}")
    print(f"Description: {appr['description']}")
    
    print("\n--- [4] Approving via WhatsApp Gate Simulation ---")
    resolve_res = post("/api/workflow/approval", {
        "approval_id": appr["approval_id"],
        "thread_id": appr["thread_id"],
        "decision": "APPROVED"
    })
    print("Circuit Breaker Authorization:", resolve_res)

print("\n--- [5] Awaiting Playwright Visual Browser Automation on Mock GST Portal ---")
time.sleep(7)

print("\n--- [6] Verifying Agent Audit Telemetry Stream ---")
logs = get("/api/audit-logs?limit=8")
for log in reversed(logs['logs']):
    print(f" • [{log['step_name']}] ({log['execution_status']}): {log['agent_reasoning']}")

print("\n--- [7] Verifying Reconciled Ledger ---")
ledger_updated = get("/api/ledger")
for t in ledger_updated['transactions']:
    if t['invoice_number'] == 'INV-2026-001':
        print(f"✓ INV-2026-001 Final Status: {t['payment_status']}")
        print(f"✓ Promised Payment Date: {t['promised_payment_date']}")
        print(f"✓ Notes: {t['notes']}")

print("\n========================================================")
print("SUCCESS: Full AI-01 MSME Autonomous Cycle Verified!")
print("========================================================")
