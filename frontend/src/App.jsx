import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LiveWorkflowBar from './components/LiveWorkflowBar';
import MetricsRow from './components/MetricsRow';
import LiveComputerUseCard from './components/LiveComputerUseCard';
import LedgerTableCard from './components/LedgerTableCard';
import AgentAuditTrailsCard from './components/AgentAuditTrailsCard';
import ApprovalModal from './components/ApprovalModal';
import LedgerAndInvoices from './components/LedgerAndInvoices';
import VernacularCalls from './components/VernacularCalls';
import ApprovalQueue from './components/ApprovalQueue';
import AuditLogs from './components/AuditLogs';
import PartyDirectory from './components/PartyDirectory';
import Configuration from './components/Configuration';
import EcommerceModule from './components/EcommerceModule';
import { 
  PhoneCall, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Sliders, 
  Terminal, 
  Building2, 
  X,
  Play
} from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState('Operational Hub');
  const [workflowStatus, setWorkflowStatus] = useState('RUNNING WEB AUTOMATION');
  const [activeStep, setActiveStep] = useState(3); // 0: Ingest, 1: Reconcile, 2: Voice, 3: GST Filing, 4: Verify
  const [isRunning, setIsRunning] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Real-time live browser automation state
  const [browserSteps, setBrowserSteps] = useState([]);
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [currentReasoning, setCurrentReasoning] = useState('');
  
  // Voice call toast notification banner
  const [voiceToast, setVoiceToast] = useState(null);

  const wsRef = useRef(null);

  // Fetch live state from backend
  const fetchData = async () => {
    try {
      const [ledgerRes, logsRes, apprRes] = await Promise.all([
        fetch('http://localhost:8000/api/ledger'),
        fetch('http://localhost:8000/api/audit-logs'),
        fetch('http://localhost:8000/api/approvals/pending')
      ]);

      if (ledgerRes.ok) {
        const data = await ledgerRes.json();
        setTransactions(data.transactions || []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }
      if (apprRes.ok) {
        const data = await apprRes.json();
        setPendingApprovals(data.approvals || []);
        if (data.approvals && data.approvals.length > 0) {
          setWorkflowStatus('AWAITING APPROVAL');
        }
      }
    } catch (e) {
      console.warn('Backend sync notice:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real-time WebSockets connection to backend telemetry stream
  useEffect(() => {
    let reconnectTimeout = null;

    const connectWs = () => {
      try {
        const socket = new WebSocket('ws://localhost:8000/ws/stream');
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[Telemetry WS] Connected to AI-01 runtime stream');
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            const { type, data, status } = payload;

            if (type === 'browser_step' && data) {
              setBrowserSteps((prev) => [...prev, data]);
              if (data.screenshot) {
                const fullUrl = data.screenshot.startsWith('http')
                  ? data.screenshot
                  : `http://localhost:8000${data.screenshot}`;
                setCurrentScreenshot(fullUrl);
              }
              if (data.reasoning) {
                setCurrentReasoning(data.reasoning);
              }
              setWorkflowStatus('RUNNING WEB AUTOMATION');
              setActiveStep(3);
            } else if (type === 'approval_required') {
              setWorkflowStatus('AWAITING APPROVAL');
              setIsModalOpen(true);
              fetchData();
            } else if (type === 'approval_resolved') {
              setWorkflowStatus('RUNNING WEB AUTOMATION');
              setIsModalOpen(false);
              fetchData();
            } else if (type === 'status_change') {
              if (status === 'ACTIVE') {
                setIsRunning(true);
                setWorkflowStatus('RUNNING WEB AUTOMATION');
              } else if (status === 'AWAITING_APPROVAL') {
                setWorkflowStatus('AWAITING APPROVAL');
                setIsModalOpen(true);
              } else if (status === 'IDLE') {
                setIsRunning(false);
              }
            } else if (type === 'voice_call' && data) {
              setVoiceToast(data);
              fetchData();
              setTimeout(() => setVoiceToast(null), 8000);
            } else if (type === 'completed') {
              setWorkflowStatus('MONTH-END CLOSE COMPLETE');
              setActiveStep(4);
              setIsRunning(false);
              fetchData();
            } else if (type === 'data_refreshed') {
              fetchData();
            }
          } catch (err) {
            console.error('[WS Parse Error]:', err);
          }
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (err) {
        console.warn('[WS Connect]', err);
      }
    };

    connectWs();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Workflow Triggers
  const handlePlay = async (targetInvoice = 'INV-2026-001') => {
    setIsRunning(true);
    setWorkflowStatus('RUNNING WEB AUTOMATION');
    setActiveStep(1);
    setBrowserSteps([]);

    try {
      await fetch('http://localhost:8000/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_number: targetInvoice })
      });
      fetchData();
    } catch (e) {
      console.error(e);
      setIsRunning(false);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    setWorkflowStatus('IDLE / PAUSED');
  };

  const handleResolveApproval = async (approvalId, threadId, decision) => {
    try {
      await fetch('http://localhost:8000/api/workflow/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: approvalId,
          thread_id: threadId,
          decision: decision
        })
      });
      setIsModalOpen(false);
      setWorkflowStatus('RUNNING WEB AUTOMATION');
      setActiveStep(3);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerVoice = async (invoiceItem) => {
    const target = invoiceItem || transactions[0] || {
      entity_name: 'Sharma Metal Works',
      phone_number: '+919876543210',
      invoice_number: 'INV-2026-001',
      amount_due: 45000.0
    };

    try {
      const res = await fetch('http://localhost:8000/api/voice/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: target.entity_name,
          phone_number: target.phone_number,
          invoice_number: target.invoice_number,
          amount_due: target.amount_due
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVoiceToast(data);
        fetchData();
        setTimeout(() => setVoiceToast(null), 8000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerBrowserDemo = async () => {
    setIsRunning(true);
    setWorkflowStatus('RUNNING WEB AUTOMATION');
    setActiveStep(3);
    setBrowserSteps([]);
    try {
      await fetch('http://localhost:8000/api/browser/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_number: 'INV-2026-001', amount: 45000.0 })
      });
    } catch (e) {
      console.error(e);
      setIsRunning(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      await fetch('http://localhost:8000/api/reset-demo', { method: 'POST' });
      setBrowserSteps([]);
      setCurrentScreenshot(null);
      setCurrentReasoning('');
      setWorkflowStatus('STANDBY / READY');
      setActiveStep(0);
      setIsRunning(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavSelect = (navItem) => {
    setActiveNav(navItem);
  };

  // Metrics calculation
  const totalInvoicedSum = transactions.reduce((acc, curr) => acc + curr.amount_due, 0);
  const totalOverdueSum = transactions
    .filter(t => t.payment_status === 'OVERDUE')
    .reduce((acc, curr) => acc + curr.amount_due, 0);

  const activeApproval = pendingApprovals.length > 0 ? pendingApprovals[0] : {
    approval_id: 'appr-demo-01',
    thread_id: 'th-12041',
    action_type: 'GST_CHALLAN_FILING',
    description: 'File GSTR-3B Tax Challan of ₹8,100 for Sharma Metal Works (INV-2026-001)',
    payload: JSON.stringify({
      entity_name: 'Sharma Metal Works',
      tax_amount: 8100,
      invoice_number: 'INV-2026-001'
    })
  };

  return (
    <div className="flex h-screen bg-[#0c1017] text-slate-100 overflow-hidden font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar 
        activeNav={activeNav} 
        onNavSelect={handleNavSelect}
        pendingApprovalCount={pendingApprovals.length > 0 ? pendingApprovals.length : 1}
      />

      {/* 2. Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header with Working Actions */}
        <TopBar 
          activeNav={activeNav}
          onOpenNotifications={() => setIsModalOpen(true)}
          onOpenSettings={() => setActiveNav('Configuration')}
          onTriggerVoice={() => handleTriggerVoice()}
          onTriggerBrowserDemo={handleTriggerBrowserDemo}
          onResetDemo={handleResetDemo}
          isRunning={isRunning}
        />

        {/* Voice Call Toast Banner */}
        {voiceToast && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg flex items-start justify-between gap-3 text-xs animate-in fade-in duration-300">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-emerald-400">
                  Vernacular Voice Call Completed ({voiceToast.phone || '+91 98765 43210'})
                </div>
                <div className="text-slate-300 mt-0.5 leading-relaxed font-sans">
                  "{voiceToast.notes || voiceToast.transcript || 'Customer confirmed receipt of goods. Promised payment next Tuesday via UPI.'}"
                </div>
                {voiceToast.promised_payment_date && (
                  <div className="text-[11px] font-mono text-emerald-400 mt-1 font-semibold">
                    ✓ Promise Committed: {voiceToast.promised_payment_date} (Ledger Reconciled)
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setVoiceToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="p-6 space-y-5 max-w-[1700px] w-full mx-auto">
          {activeNav === 'E-Commerce' ? (
            <EcommerceModule onTriggerVoice={handleTriggerVoice} />
          ) : activeNav === 'Ledger & Invoices' ? (
            <LedgerAndInvoices 
              transactions={transactions}
              onTriggerVoice={(inv) => handleTriggerVoice(inv)}
              onRunWorkflow={(inv) => handlePlay(inv)}
              onUploadSuccess={fetchData}
            />
          ) : activeNav === 'Vernacular Calls' ? (
            <VernacularCalls 
              onTriggerVoice={(inv) => handleTriggerVoice(inv)}
            />
          ) : activeNav === 'Approval Queue' ? (
            <ApprovalQueue 
              onResolveApproval={handleResolveApproval}
            />
          ) : activeNav === 'Audit Logs' ? (
            <AuditLogs />
          ) : activeNav === 'Party Directory' ? (
            <PartyDirectory onTriggerVoice={handleTriggerVoice} />
          ) : activeNav === 'Configuration' ? (
            <Configuration />
          ) : (
            <>
              {/* Live Workflow Stepper Bar */}
              <LiveWorkflowBar 
                workflowStatus={workflowStatus}
                activeStep={activeStep}
                isRunning={isRunning}
                onPlay={() => handlePlay()}
                onPause={handlePause}
                onStepClick={(stepIdx) => {
                  setActiveStep(stepIdx);
                  if (stepIdx === 3) setIsModalOpen(true);
                }}
              />

              {/* 4 Metric Cards */}
              <MetricsRow 
                totalInvoiced={`₹${totalInvoicedSum > 0 ? totalInvoicedSum.toLocaleString('en-IN') : '3,42,500'}`}
                unresolvedOverdue={`₹${totalOverdueSum > 0 ? totalOverdueSum.toLocaleString('en-IN') : '45,000'}`}
                completedCalls="3 Today"
                pendingApprovals={pendingApprovals.length > 0 ? pendingApprovals.length : 1}
                onOpenApprovalQueue={() => setIsModalOpen(true)}
              />

              {/* Main 2-Column Cockpit Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Left 8-Cols: Live Computer Use + Ledger Table */}
                <div className="lg:col-span-8 space-y-5">
                  <LiveComputerUseCard 
                    screenshotUrl={currentScreenshot}
                    browserSteps={browserSteps}
                    currentAction={
                      isRunning 
                        ? "Executing Autonomous Playwright Browser Steps..." 
                        : "Filling out Form ITC ₹42,500..."
                    }
                    subAction={currentReasoning || "Action Logs..."}
                    currentReasoning={currentReasoning}
                    isRunning={isRunning}
                    onSubmitFiling={handleTriggerBrowserDemo}
                    onActionMenu={() => {}}
                  />

                  <LedgerTableCard 
                    transactions={transactions}
                    onCallDebtor={(row) => handleTriggerVoice(row)}
                    onRunAgent={(inv) => handlePlay(inv)}
                    onActionMenu={() => {}}
                  />
                </div>

                {/* Right 4-Cols: Agent Audit Trails (Live) */}
                <div className="lg:col-span-4">
                  <AgentAuditTrailsCard logs={auditLogs} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Circuit Breaker Approval Modal (Triggered on click or pending state) */}
      {isModalOpen && (
        <ApprovalModal 
          pendingApproval={activeApproval}
          onResolveApproval={handleResolveApproval}
          onClose={() => setIsModalOpen(false)}
          isResolving={false}
        />
      )}
    </div>
  );
}
