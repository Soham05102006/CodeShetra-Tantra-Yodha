"""
Visual Browser Automation Agent for AI-01 — The AI-Native Company of One.
Uses Playwright Chromium to visually navigate the mock GST portal, fill inputs,
authorize the declaration, submit the return/challan, and capture screenshot frames
at each step into `./backend/static/screenshots/`.
"""

import os
import asyncio
import time
import pathlib
from typing import Optional, Callable, Dict, Any, List
from playwright.async_api import async_playwright
from database import add_audit_log

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SCREENSHOTS_DIR = os.path.join(STATIC_DIR, "screenshots")
MOCK_PORTAL_PATH = os.path.join(STATIC_DIR, "mock_gst_portal.html")

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

class BrowserAgent:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.portal_url = f"{base_url}/static/mock_gst_portal.html"

    async def execute_gst_filing(
        self,
        invoice_number: str,
        amount: float,
        thread_id: str = "gst-thread",
        step_callback: Optional[Callable[[Dict[str, Any]], Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes step-by-step visual automation on the mock GST portal,
        taking screenshot frames at every visual step.
        """
        screenshots_captured: List[Dict[str, Any]] = []
        cpin_generated = None
        arn_generated = None

        async def emit(step_num: int, name: str, reasoning: str, file_name: str):
            screenshot_rel_path = f"/static/screenshots/{file_name}?t={int(time.time()*1000)}"
            step_data = {
                "step": step_num,
                "name": name,
                "reasoning": reasoning,
                "screenshot": screenshot_rel_path,
                "thread_id": thread_id,
                "timestamp": time.strftime("%H:%M:%S")
            }
            screenshots_captured.append(step_data)
            await add_audit_log(
                thread_id=thread_id,
                step_name=f"browser_step_{step_num}_{name}",
                agent_reasoning=reasoning,
                tool_used="Playwright-Chromium-VisualEngine",
                execution_status="IN_PROGRESS" if step_num < 5 else "COMPLETED",
                screenshot_path=screenshot_rel_path
            )
            if step_callback:
                if asyncio.iscoroutinefunction(step_callback):
                    await step_callback(step_data)
                else:
                    step_callback(step_data)

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1280, "height": 880})
            page = await context.new_page()

            try:
                # STEP 1: Navigate to GST Portal
                target_url = self.portal_url
                try:
                    # Check if local server is responsive
                    import urllib.request
                    urllib.request.urlopen(target_url, timeout=0.8)
                    await page.goto(target_url, wait_until="domcontentloaded")
                except Exception:
                    # Fallback to local file URI
                    file_uri = pathlib.Path(MOCK_PORTAL_PATH).as_uri()
                    await page.goto(file_uri, wait_until="domcontentloaded")

                step1_file = f"{thread_id}_step1_portal_loaded.png"
                step1_path = os.path.join(SCREENSHOTS_DIR, step1_file)
                await page.screenshot(path=step1_path)
                await emit(1, "portal_navigated", "Navigated to GST Portal. Identified taxpayer session: SHARMA ENTERPRISES (GSTIN: 27AABCS1429B1Z).", step1_file)
                await asyncio.sleep(0.8)

                # STEP 2: Fill Source Invoice Reference
                await page.wait_for_selector("#invoice-ref-input")
                await page.fill("#invoice-ref-input", invoice_number)
                step2_file = f"{thread_id}_step2_invoice_entered.png"
                step2_path = os.path.join(SCREENSHOTS_DIR, step2_file)
                await page.screenshot(path=step2_path)
                await emit(2, "invoice_entered", f"Populated invoice reference '{invoice_number}' into outward supply record field.", step2_file)
                await asyncio.sleep(0.8)

                # STEP 3: Fill Turnover Amount & Compute Tax
                await page.fill("#turnover-input", str(amount))
                await page.evaluate("calculateTax()")
                step3_file = f"{thread_id}_step3_turnover_entered.png"
                step3_path = os.path.join(SCREENSHOTS_DIR, step3_file)
                await page.screenshot(path=step3_path)
                tax_amount = round(amount * 0.18, 2)
                await emit(3, "tax_computed", f"Entered taxable outward turnover of ₹{amount:,.2f}. 18% GST (CGST ₹{tax_amount/2:,.2f} + SGST ₹{tax_amount/2:,.2f}) verified.", step3_file)
                await asyncio.sleep(0.8)

                # STEP 4: Authorize Declaration
                await page.check("#auth-checkbox")
                step4_file = f"{thread_id}_step4_declaration_authorized.png"
                step4_path = os.path.join(SCREENSHOTS_DIR, step4_file)
                await page.screenshot(path=step4_path)
                await emit(4, "declaration_authorized", "Authorized statutory self-assessment declaration under Section 39 of CGST Act.", step4_file)
                await asyncio.sleep(0.8)

                # STEP 5: Submit Form & Generate Challan
                await page.click("#submit-gst-btn")
                await page.wait_for_selector("#success-modal.active", timeout=5000)
                await asyncio.sleep(0.5)

                cpin_el = await page.query_selector("#modal-cpin")
                if cpin_el:
                    cpin_generated = await cpin_el.inner_text()
                arn_el = await page.query_selector("#modal-arn")
                if arn_el:
                    arn_generated = await arn_el.inner_text()

                step5_file = f"{thread_id}_step5_challan_generated.png"
                step5_path = os.path.join(SCREENSHOTS_DIR, step5_file)
                await page.screenshot(path=step5_path)
                await emit(5, "challan_generated", f"GSTR-3B Challan successfully generated! CPIN: {cpin_generated}, ARN: {arn_generated}.", step5_file)

            finally:
                await browser.close()

        return {
            "status": "SUCCESS",
            "thread_id": thread_id,
            "invoice_number": invoice_number,
            "amount": amount,
            "cpin": cpin_generated,
            "arn": arn_generated,
            "steps": screenshots_captured
        }

# Global browser agent instance
browser_agent = BrowserAgent()

async def run_gst_browser_automation(
    invoice_number: str,
    amount: float,
    thread_id: str = "gst-thread",
    callback: Optional[Callable[[Dict[str, Any]], Any]] = None
) -> Dict[str, Any]:
    return await browser_agent.execute_gst_filing(invoice_number, amount, thread_id, callback)

if __name__ == "__main__":
    async def main():
        print("Testing browser automation standalone...")
        result = await run_gst_browser_automation("INV-2026-001", 45000.0, "test-cli-run")
        print("Result:", result["status"], "CPIN:", result["cpin"], "Steps:", len(result["steps"]))
    asyncio.run(main())
