import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  Eye, 
  Play, 
  PauseOctagon, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Building2,
  Lock,
  Layers,
  FileText
} from 'lucide-react';

export default function ApprovalQueue({ onResolveApproval }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedThread, setSelectedThread] = useState('th-12041');
  const [isEmergencyPaused, setIsEmergencyPaused] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [activeInspection, setActiveInspection] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  // Initial realistic records matching user screenshot
  const initialPending = [
    {
      approval_id: 'appr-12041',
      thread_id: 'th-12041',
      action_type: 'GST_RETURN_FILING',
      title: 'GST Return Filing & Tax Submission',
      risk_level: 'HIGH_RISK',
      description: 'AI Agent attempted to submit GSTR-1 form on the GST portal for month-end close. Auto-paused by Circuit Breaker: Tax filing requires final human authorization before final submit.',
      invoice_count: 24,
      tax_to_file: '₹42,500',
      portal: 'mock GST India Portal',
      trigger_reason: 'Circuit Breaker Gate (financial submission)',
      whatsapp_status: 'Delivered (+91 98765 43210)',
      time: '18:42',
      status: 'PENDING'
    },
    {
      approval_id: 'appr-12045',
      thread_id: 'th-12045',
      action_type: 'VENDOR_PAYOUT',
      title: 'Vendor Payout - Jai Hind Traders',
      risk_level: 'MEDIUM_RISK',
      description: 'Request to trigger bank payout of ₹82,600 to Jai Hind Traders. Paused: Bank payout amount is over the automated limit of ₹50,000.',
      account: 'HDFC Bank *4321',
      invoice_reconciled: 'INV-024 (100% Match)',
      trigger_reason: 'Single Transaction > ₹50,000 threshold',
      whatsapp_status: 'Delivered (+91 98765 43210)',
      time: '17:15',
      status: 'PENDING'
    }
  ];

  const initialHistory = [
    {
      approval_id: 'appr-12040',
      thread_id: 'th-12040',
      action_type: 'PAYOUT_DISPATCH',
      target_entity: 'Jai Hind Traders',
      amount: '₹82,600.00',
      resolved_via: 'WhatsApp',
      status: 'APPROVED',
      timestamp: '28 Oct 2026, 16:45 IST',
      notes: 'Approved by Owner via WhatsApp quick-action reply'
    },
    {
      approval_id: 'appr-12039',
      thread_id: 'th-12039',
      action_type: 'LEDGER_AUTO_CLOSE',
      target_entity: 'System Batch',
      amount: '₹1,24,000.00',
      resolved_via: 'Web Dashboard',
      status: 'APPROVED',
      timestamp: '28 Oct 2026, 14:10 IST',
      notes: 'Auto-Close ledger reconciliation verified by financial supervisor'
    },
    {
      approval_id: 'appr-12038',
      thread_id: 'th-12038',
      action_type: 'INVOICE_CANCELLATION',
      target_entity: 'Verma Logistics',
      amount: '₹18,500.00',
      resolved_via: 'WhatsApp',
      status: 'REJECTED',
      timestamp: '28 Oct 2026, 11:32 IST',
      notes: 'Cancelled incorrect invoice draft INV-026 (Duplicate detected, rejected by Owner)'
    }
  ];

  const [pendingList, setPendingList] = useState(initialPending);
  const [historyList, setHistoryList] = useState(initialHistory);

  // Sync from backend
  const fetchApprovals = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/approvals');
      if (res.ok) {
        const data = await res.json();
        if (data.pending) {
          const parsed = data.pending.map((item) => {
            let payload = {};
            if (typeof item.payload === 'object' && item.payload !== null) {
              payload = item.payload;
            } else if (typeof item.payload === 'string') {
              try {
                payload = JSON.parse(item.payload || '{}');
              } catch (e) {}
            }
            return {
              approval_id: item.approval_id,
              thread_id: item.thread_id,
              action_type: item.action_type,
              title: item.description,
              risk_level: payload.risk_level || 'HIGH_RISK',
              description: payload.reasoning || item.description,
              invoice_count: payload.invoice_count || 24,
              tax_to_file: payload.tax_to_file ? ('₹' + Number(payload.tax_to_file).toLocaleString('en-IN')) : '₹42,500',
              portal: payload.portal || 'mock GST India Portal',
              trigger_reason: payload.trigger || 'Circuit Breaker Gate (financial submission)',
              account: payload.account || 'HDFC Bank *4321',
              invoice_reconciled: payload.invoice_reconciled || 'INV-024 (100% Match)',
              whatsapp_status: 'Delivered (+91 98765 43210)',
              time: '18:42',
              status: item.status
            };
          });
          setPendingList(parsed);
        }
        if (data.resolved && data.resolved.length > 0) {
          const parsedResolved = data.resolved.map((item) => {
            let p = {};
            if (typeof item.payload === 'object' && item.payload !== null) {
              p = item.payload;
            } else if (typeof item.payload === 'string') {
              try { p = JSON.parse(item.payload || '{}'); } catch (e) {}
            }
            return {
              approval_id: item.approval_id,
              thread_id: item.thread_id,
              action_type: item.action_type,
              target_entity: p.entity_name || item.description,
              amount: p.amount ? ('₹' + Number(p.amount).toLocaleString('en-IN')) : '₹42,500.00',
              resolved_via: p.resolved_via || 'WhatsApp',
              status: item.status,
              timestamp: item.resolved_at || item.created_at || 'Just now',
              notes: item.description
            };
          });
          setHistoryList(parsedResolved);
        }
      }
    } catch (e) {
      console.warn('Backend approvals sync:', e);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 4000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handle single decision (Approve / Reject)
  const handleDecision = async (item, decision) => {
    setResolvingId(item.approval_id);
    try {
      const res = await fetch('http://localhost:8000/api/approvals/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: item.approval_id,
          thread_id: item.thread_id,
          action: decision
        })
      });

      if (res.ok) {
        showNotification(`Thread ${item.thread_id} ${decision}! LangGraph state resumed.`);
        // Move item from pending to history
        setPendingList((prev) => prev.filter((p) => p.approval_id !== item.approval_id));
        setHistoryList((prev) => [
          {
            approval_id: item.approval_id,
            thread_id: item.thread_id,
            action_type: item.action_type,
            target_entity: item.title.includes('GST') ? 'Sharma Metal Works' : 'Jai Hind Traders',
            amount: item.tax_to_file || '₹82,600.00',
            resolved_via: 'Web Dashboard',
            status: decision,
            timestamp: 'Just now',
            notes: `Decision '${decision}' confirmed by Business Owner`
          },
          ...prev
        ]);

        if (onResolveApproval) {
          onResolveApproval(item.approval_id, item.thread_id, decision);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification(`Thread ${item.thread_id} ${decision} (offline mode).`);
      setPendingList((prev) => prev.filter((p) => p.approval_id !== item.approval_id));
    } finally {
      setResolvingId(null);
    }
  };

  // Emergency Pause Toggle
  const handleToggleEmergencyPause = async () => {
    const nextState = !isEmergencyPaused;
    setIsEmergencyPaused(nextState);
    try {
      await fetch('http://localhost:8000/api/agent/emergency-pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paused: nextState })
      });
      showNotification(
        nextState 
          ? 'EMERGENCY KILLSWITCH ACTIVATED: All autonomous actions halted.' 
          : 'Emergency pause disengaged: Autonomous agent resumed.'
      );
    } catch (e) {
      showNotification(nextState ? 'Emergency killswitch active.' : 'Agent resumed.');
    }
  };

  // Bulk Approve All
  const handleBulkApprove = async () => {
    if (pendingList.length === 0) return;
    for (const item of pendingList) {
      await handleDecision(item, 'APPROVED');
    }
    showNotification('All pending high-stakes actions approved and resumed.');
  };

  // Open Visual DOM inspection modal
  const handleOpenDOMInspect = (item) => {
    setActiveInspection(item);
    setInspectModalOpen(true);
  };

  // Filtered lists
  const filteredPending = pendingList.filter((item) => {
    const matchesSearch = 
      item.thread_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = riskFilter === 'ALL' || item.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner: Circuit Breaker Approval Queue + WhatsApp Sync Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#1c2436]">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Circuit Breaker Approval Queue</span>
            {pendingList.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center font-mono">
                {pendingList.length}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">
            Mission-critical human-in-the-loop governance & state pause checkpoints
          </p>
        </div>

        {/* WhatsApp Notification Sync Pill (Matching Screenshot) */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">WhatsApp Notification Sync:</span>
          <span className="bg-emerald-500/20 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
          <span className="text-slate-300">(+91 XXXXX XXXXX)</span>
        </div>
      </div>

      {/* 1. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pending Approvals (Amber Alert) */}
        <div className="bg-[#101726] border-2 border-amber-500/80 rounded-2xl p-4 shadow-lg shadow-amber-500/10 relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {pendingList.length} {pendingList.length === 1 ? 'Request' : 'Requests'}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            Requires owner sign-off before submission
          </div>
        </div>

        {/* Card 2: High-Risk Actions Blocked */}
        <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm relative">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>High-Risk Actions Blocked</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            14 Total
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Circuit Breaker protected ₹3,12,000 in payouts
          </div>
        </div>

        {/* Card 3: Avg Owner Response Time */}
        <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Avg Owner Response Time</span>
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            4m 12s
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Via WhatsApp Quick Reply buttons
          </div>
        </div>

        {/* Card 4: Approval Resolution Rate */}
        <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Approval Resolution Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">
            98.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            12 Approved, 1 Rejected this month
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Queue Filtering */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Thread ID, Action, or Entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111622] border border-[#1d2538] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#111622] border border-[#1d2538] p-1 rounded-xl text-xs">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'PENDING' ? `Pending (${pendingList.length})` : st}
              </button>
            ))}
          </div>

          {/* Risk Level Dropdown */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#111622] border border-[#1d2538] rounded-xl px-3 py-2 text-xs text-slate-300 appearance-none pr-8 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH_RISK">High Risk</option>
              <option value="MEDIUM_RISK">Medium Risk</option>
              <option value="LOW_RISK">Low Risk</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Emergency Pause Killswitch */}
          <button
            onClick={handleToggleEmergencyPause}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isEmergencyPaused
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
            title="Immediate emergency killswitch halting all autonomous LangGraph and Playwright steps"
          >
            <PauseOctagon className="w-3.5 h-3.5" />
            <span>{isEmergencyPaused ? 'AGENT HALTED (RESUME)' : 'Emergency Pause Agent'}</span>
          </button>

          {/* Bulk Approve Selected */}
          <button
            onClick={handleBulkApprove}
            disabled={pendingList.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Bulk Approve All</span>
          </button>
        </div>
      </div>

      {/* 3. Main Two-Column Cockpit Section (Exact Match to Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8-Cols): PENDING APPROVALS */}
        <div className="lg:col-span-8 bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                PENDING APPROVALS
              </h3>
              <p className="text-[11px] text-slate-400">
                High-Stakes Human Validation Queue
              </p>
            </div>
            <button className="text-slate-500 hover:text-slate-300 transition-colors p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Pending Approval Cards */}
          <AnimatePresence>
            {filteredPending.length === 0 ? (
              <div className="py-12 text-center bg-[#0d121c] rounded-xl border border-dashed border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-semibold text-slate-200">
                  Zero Pending Approvals
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  All high-stakes gates authorized. Autonomous agent operating normally.
                </div>
              </div>
            ) : (
              filteredPending.map((item, idx) => {
                const isSelected = selectedThread === item.thread_id || idx === 0;
                const isResolving = resolvingId === item.approval_id;

                return (
                  <motion.div
                    key={item.approval_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedThread(item.thread_id)}
                    className={`rounded-2xl p-5 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#101624] border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.22)]'
                        : 'bg-[#111622] border border-[#1d2538] hover:border-slate-700'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {item.title}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Thread ID: {item.thread_id} (LangGraph)
                        </div>
                      </div>

                      {/* Risk Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border ${
                        item.risk_level === 'HIGH_RISK'
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                          : 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      }`}>
                        {item.risk_level === 'HIGH_RISK' ? 'HIGH RISK' : 'MEDIUM RISK'}
                      </span>
                    </div>

                    {/* Agent Reasoning Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Parameter Box Grid */}
                    <div className="bg-[#0b0f17] border border-[#1a2335] rounded-xl p-3 mb-4 text-xs font-mono">
                      {item.action_type === 'GST_RETURN_FILING' ? (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
                            <span>Invoice count: <strong className="text-white">{item.invoice_count}</strong></span>
                            <span className="text-slate-600">|</span>
                            <span>Tax to file: <strong className="text-sky-400">{item.tax_to_file}</strong></span>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-400">Portal: {item.portal}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            Trigger: <span className="text-slate-200">{item.trigger_reason}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
                            <span>Account: <strong className="text-white">{item.account}</strong></span>
                            <span className="text-slate-600">|</span>
                            <span>Invoice reconciled: <strong className="text-emerald-400">{item.invoice_reconciled}</strong></span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            Trigger: <span className="text-slate-200">{item.trigger_reason}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer / Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      {/* WhatsApp Delivery Pill */}
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-300">Waiting for Owner's Approval...</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Inspect Visual DOM Button */}
                        <button
                          onClick={() => handleOpenDOMInspect(item)}
                          className="p-2 rounded-xl bg-[#141d2e] hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                          title="Inspect Visual DOM & Form Target Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => handleDecision(item, 'REJECTED')}
                          disabled={isResolving}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>

                        {/* Approve Button (Glowing Cyan Highlight) */}
                        <button
                          onClick={() => handleDecision(item, 'APPROVED')}
                          disabled={isResolving}
                          className="px-6 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isResolving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Right Column (4-Cols): AGENT AUDIT TRAILS (LIVE) */}
        <div className="lg:col-span-4 bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2436] mb-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                <span>AGENT AUDIT TRAILS (LIVE)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">SQLite Checkpointer</span>
            </div>

            {/* Audit Trail Timeline Items Matching Screenshot */}
            <div className="space-y-3.5">
              {/* Item 1 */}
              <div className="p-2.5 rounded-xl bg-[#0d121c] border border-[#1b2334] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">18:42</span>
                  <span className="text-slate-300 font-semibold">Thread th-12041</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                    PAUSED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Submit GST Return (Requires manual signature check)
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-2.5 rounded-xl bg-[#0d121c] border border-[#1b2334] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">16:45</span>
                  <span className="text-slate-300 font-semibold">Thread th-12040</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                    APPROVED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Vendor payment to Jai Hind Traders (INR 82,600) (Approved by Owner via WhatsApp)
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-2.5 rounded-xl bg-[#0d121c] border border-[#1b2334] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">14:10</span>
                  <span className="text-slate-300 font-semibold">Thread th-12039</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                    APPROVED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Auto-Close ledger reconciliation (approved by system)
                </p>
              </div>

              {/* Item 4 */}
              <div className="p-2.5 rounded-xl bg-[#0d121c] border border-[#1b2334] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">11:32</span>
                  <span className="text-slate-300 font-semibold">Thread th-12038</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-bold">
                    REJECTED
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Cancelled incorrect invoice draft INV-026 (Duplicate detected, rejected by Owner)
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Banner: ACTION INTERRUPT - RESOLVED (Matching Screenshot) */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-rose-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <span>🚨 ACTION INTERRUPT - RESOLVED</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Approval for GST submitted via WhatsApp (Thread: th-12041)
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                Status: RESUMED
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* 4. Resolved Approvals History Table */}
      <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c2436] mb-3">
          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
              RESOLVED APPROVALS HISTORY & COMPLIANCE LOG
            </h3>
            <p className="text-[11px] text-slate-400">
              Immutable audit trail required for financial compliance and business peace of mind
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {historyList.length} Archived Decisions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-[#1c2436] text-[11px] text-slate-400 font-medium">
                <th className="py-2.5 font-normal">Thread ID</th>
                <th className="py-2.5 font-normal">Action Type</th>
                <th className="py-2.5 font-normal">Target Entity</th>
                <th className="py-2.5 font-normal">Amount / Value</th>
                <th className="py-2.5 font-normal">Resolved Via</th>
                <th className="py-2.5 font-normal">Status</th>
                <th className="py-2.5 font-normal text-right pr-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182030]">
              {historyList.map((item) => {
                const isApproved = item.status === 'APPROVED';
                return (
                  <tr key={item.approval_id} className="hover:bg-[#141b2a] transition-colors">
                    <td className="py-3 font-mono text-sky-400 font-semibold">
                      {item.thread_id}
                    </td>
                    <td className="py-3 text-slate-300 font-mono text-[11px]">
                      {item.action_type}
                    </td>
                    <td className="py-3 text-slate-200 font-medium">
                      {item.target_entity}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-100">
                      {item.amount}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        item.resolved_via === 'WhatsApp'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/10 text-sky-400 border-blue-500/30'
                      }`}>
                        {item.resolved_via}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[11px]">
                      {isApproved ? (
                        <span className="text-emerald-400">[APPROVED]</span>
                      ) : (
                        <span className="text-rose-400">[REJECTED]</span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2 text-slate-400 font-mono text-[11px]">
                      {item.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Playwright Visual DOM Inspection Modal */}
      <AnimatePresence>
        {inspectModalOpen && activeInspection && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setInspectModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Visual DOM Checkpoint Preview</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Thread: {activeInspection.thread_id} | Portal: {activeInspection.portal}
                  </p>
                </div>
              </div>

              {/* Scanned DOM Screenshot */}
              <div className="bg-[#0c1018] rounded-xl p-2 border border-slate-700/60 mb-4 overflow-hidden">
                <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center justify-between px-1">
                  <span>Target DOM: input#submitChallanBtn (Authorized by Owner)</span>
                  <span className="text-emerald-400">Resolution: 1280x800</span>
                </div>
                <img
                  src="/static/screenshots/thread-7bb03497_step5_challan_generated.png"
                  alt="Playwright DOM checkpoint"
                  className="rounded max-h-72 w-full object-contain bg-slate-900"
                  onError={(e) => {
                    e.target.src = '/sample_invoice.jpg';
                  }}
                />
              </div>

              {/* Action Breakdown Summary */}
              <div className="bg-[#0e1420] p-3 rounded-xl border border-[#1b2334] text-xs font-mono mb-4 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Simulated Impact Preview:</div>
                <div className="text-emerald-400">
                  ✓ Submitting ₹42,500 ITC claim to GST Portal; ₹0 liability payable.
                </div>
                <div className="text-slate-400 text-[11px]">
                  ✓ Destination: Central Board of Indirect Taxes and Customs (CBIC) GSTR-3B Table 4(A)(5).
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-[#141b29] border border-[#1e273a]"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDecision(activeInspection, 'APPROVED');
                    setInspectModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Authorize & Submit</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
