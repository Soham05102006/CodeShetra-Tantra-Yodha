import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Activity,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  Download,
  Search,
  Lock,
  ShieldCheck,
  Eye,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Radio,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Table as TableIcon,
  Workflow,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowRight,
  MousePointer
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    total_steps: '1,284 Steps',
    automated_decisions_pct: '94.6%',
    circuit_breaker_intercepts: 14,
    audit_health_score: '100% Verifiable',
    runs_today: 124,
    interrupted_today: 3
  });
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toolFilter, setToolFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' (cockpit) or 'table'
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [zoomScreenshot, setZoomScreenshot] = useState(false);

  // Fetch audit logs from backend
  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (toolFilter !== 'ALL') params.append('tool', toolFilter);

      const res = await fetch(`http://localhost:8000/api/audit/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const fetchedLogs = data.logs || [];
        setLogs(fetchedLogs);
        if (data.summary) {
          setSummary(data.summary);
        }
        if (fetchedLogs.length > 0 && selectedLogId === null) {
          setSelectedLogId(fetchedLogs[0].log_id);
          setExpandedLogId(fetchedLogs[0].log_id);
        }
      }
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, statusFilter, toolFilter]);

  // Live polling interval when live stream toggle is active
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, [isLiveStreaming, searchQuery, statusFilter, toolFilter]);

  // Handle Export CSV
  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/audit/export?format=csv', '_blank');
  };

  // Currently selected log for Inspector panel
  const selectedLog = logs.find((l) => l.log_id === selectedLogId) || logs[0] || null;

  // Parse reasoning steps safely
  const parseReasoningSteps = (log) => {
    if (!log) return [];
    if (log.reasoning_steps) {
      try {
        if (typeof log.reasoning_steps === 'string') {
          return JSON.parse(log.reasoning_steps);
        }
        return log.reasoning_steps;
      } catch (e) {
        return [log.agent_reasoning];
      }
    }
    return [log.agent_reasoning];
  };

  // Parse payload safely
  const parsePayload = (log) => {
    if (!log) return null;
    if (log.payload) {
      try {
        if (typeof log.payload === 'string') {
          return JSON.parse(log.payload);
        }
        return log.payload;
      } catch (e) {
        return { raw: log.payload };
      }
    }
    return {
      thread_id: log.thread_id,
      step_name: log.step_name,
      tool: log.tool_used,
      status: log.execution_status,
      timestamp: log.timestamp
    };
  };

  const handleCopyPayload = () => {
    if (!selectedLog) return;
    const p = parsePayload(selectedLog);
    navigator.clipboard.writeText(JSON.stringify(p, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('EXEC') || s.includes('PROGRESS')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
          EXECUTING
        </span>
      );
    }
    if (s.includes('RESOLV')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
          RESOLVED
        </span>
      );
    }
    if (s.includes('SUCC') || s.includes('COMPLET') || s.includes('APPROV')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          SUCCESS
        </span>
      );
    }
    if (s.includes('PAUS') || s.includes('INTERRUPT') || s.includes('AWAIT')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
          PAUSED
        </span>
      );
    }
    if (s.includes('FAIL') || s.includes('REJECT')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.25)]">
          FAILED
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700 bg-slate-800/80 text-slate-300">
        {status}
      </span>
    );
  };

  const getNodeIcon = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('EXEC') || s.includes('PROGRESS')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#0a1b2a] border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.4)] animate-pulse">
          <Activity className="w-4 h-4" />
        </div>
      );
    }
    if (s.includes('RESOLV') || s.includes('SUCC') || s.includes('COMPLET') || s.includes('APPROV')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#0a2318] border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
          <Activity className="w-4 h-4" />
        </div>
      );
    }
    if (s.includes('PAUS') || s.includes('INTERRUPT') || s.includes('AWAIT')) {
      return (
        <div className="w-8 h-8 rounded-full bg-[#271a06] border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <PauseCircle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-[#2a0b12] border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
        <XCircle className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1a2335]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Dashboard</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400">Audit Logs</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            Agent Execution Audit Timeline
          </h1>
        </div>

        {/* Top Right Pills matching screenshot */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-[#111726] border border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>Total Runs Today:</span>
            <span className="font-bold text-emerald-400">{summary.runs_today || 124}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#111726] border border-slate-800 flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>Interrupted:</span>
            <span className="font-bold text-rose-400">{summary.interrupted_today || 3}</span>
          </div>
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
              isLiveStreaming
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-cyan-400' : ''}`} />
            {isLiveStreaming ? 'Live Stream Active' : 'Stream Paused'}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. TOP SUMMARY METRIC CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Executed Actions</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{summary.total_steps || '1,284 Steps'}</div>
          <p className="text-[11px] text-emerald-400/90 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            100% Logged with audit trail
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Automated Decisions</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{summary.automated_decisions_pct || '94.6%'}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Auto-executed without human intervention
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Circuit Breaker Intercepts</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{summary.circuit_breaker_intercepts || 14} Pauses</div>
          <p className="text-[11px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
            <PauseCircle className="w-3 h-3 shrink-0" />
            Safely interrupted for owner approval
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl bg-[#0f1623]/80 border border-slate-800/80 p-4 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Audit Health Score</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{summary.audit_health_score || '100% Verifiable'}</div>
          <p className="text-[11px] text-cyan-400/90 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            Backed by Playwright screenshots
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* 3. TOOLBAR & FILTERING */}
      <div className="p-3.5 rounded-xl bg-[#0e1420]/90 border border-[#1a2335] flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Run ID (e.g. run-7482), Keyword, or Tool..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#121927] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns & View Mode */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Tool Dropdown */}
          <div className="flex items-center gap-1 bg-[#121927] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Tool:</span>
            <select
              value={toolFilter}
              onChange={(e) => setToolFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Tools</option>
              <option value="browser-use" className="bg-slate-900">browser-use (Computer Use)</option>
              <option value="vapi-voice" className="bg-slate-900">vapi-voice (Vernacular Calls)</option>
              <option value="twilio-whatsapp" className="bg-slate-900">twilio-whatsapp (Approval Gate)</option>
              <option value="gemini-ocr" className="bg-slate-900">gemini-ocr (Document Ingest)</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1 bg-[#121927] border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="SUCCESS" className="bg-slate-900">Success</option>
              <option value="PAUSED" className="bg-slate-900">Paused / Interrupted</option>
              <option value="EXECUTING" className="bg-slate-900">Executing</option>
              <option value="FAILED" className="bg-slate-900">Failed</option>
            </select>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center bg-[#121927] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              Cockpit View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Data Table
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA: COCKPIT SPLIT-VIEW (TIMELINE + INSPECTOR) OR DATA TABLE */}
      {viewMode === 'timeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT 7-COLS: EXECUTION LOG TIMELINE */}
          <div className="lg:col-span-7 rounded-xl bg-[#0d131f]/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/70 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  EXECUTION LOG TIMELINE
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {logs.length} Events Logged
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-emerald-500/50 before:to-slate-800">
              {logs.map((log) => {
                const isSelected = selectedLog && selectedLog.log_id === log.log_id;
                const isExpanded = expandedLogId === log.log_id;
                const timeString = log.timestamp
                  ? log.timestamp.split(' ')[1] || log.timestamp
                  : '20:45:12';

                return (
                  <div key={log.log_id} className="relative group">
                    {/* Glowing node connector */}
                    <div className="absolute -left-[35px] top-3.5 z-10 transition-transform group-hover:scale-110">
                      {getNodeIcon(log.execution_status)}
                    </div>

                    {/* Step Card */}
                    <div
                      onClick={() => {
                        setSelectedLogId(log.log_id);
                        setExpandedLogId(isExpanded ? null : log.log_id);
                      }}
                      className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border ${
                        isSelected
                          ? 'bg-[#121a29] border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.18)] ring-1 ring-cyan-500/40'
                          : 'bg-[#0f1522] border-slate-800 hover:border-slate-700 hover:bg-[#121826]'
                      }`}
                    >
                      {/* Top Row: Title, Timestamp, Status Badge */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-white tracking-wide">
                            {log.step_name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-400">
                            {timeString}
                          </span>
                          {getStatusBadge(log.execution_status)}
                        </div>
                      </div>

                      {/* Subtext: Monospace Run ID & Time */}
                      <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-2">
                        <span>{timeString}</span>
                        <span className="text-slate-600">|</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-semibold border border-slate-700/60">
                          ID: {log.thread_id}
                        </span>
                        {log.duration && (
                          <>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {log.duration}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                        {log.agent_reasoning}
                      </p>

                      {/* Expandable/Collapsible Detail Anchors (Matching Screenshot) */}
                      {log.step_name.includes('Playwright') ? (
                        <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                          <div className="flex items-center gap-1.5 text-cyan-400/90">
                            <span className="text-slate-500">⌄</span>
                            <span>Selector matching ('Playwright Computer-Use')</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-cyan-400/90">
                            <span className="text-slate-500">⌄</span>
                            <span>Focus state matching (#Summit Filing)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="text-slate-400 font-mono">
                            Tool: <span className="text-slate-200 font-medium">{log.tool_used || 'Autonomous Kernel'}</span>
                          </span>
                          <span className="text-cyan-400 flex items-center gap-1 text-[11px] font-semibold hover:underline">
                            Inspect step <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 5-COLS: INSPECTOR & STEP DETAILS PANEL (Framed in Amber Glow) */}
          <div className="lg:col-span-5 rounded-xl bg-[#111726]/95 border border-amber-500/40 p-5 shadow-[0_0_25px_rgba(245,158,11,0.12)] sticky top-6">
            {selectedLog ? (
              <div className="space-y-5">
                {/* Panel Title */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                      INSPECTOR & STEP DETAILS ({selectedLog.thread_id})
                    </h2>
                  </div>
                  {getStatusBadge(selectedLog.execution_status)}
                </div>

                {/* 1. STEP REASONING LOG (XAI / Thought Process) */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    STEP REASONING LOG
                  </div>
                  <div className="bg-[#0b0f19] rounded-lg p-3.5 border border-slate-800/80 space-y-2 text-xs font-mono text-slate-300">
                    {parseReasoningSteps(selectedLog).map((stepText, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>
                          {stepText.includes('#gst-submit') ? (
                            <>
                              Identified{' '}
                              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/30">
                                #gst-submit
                              </span>{' '}
                              button via visual anchor.
                            </>
                          ) : stepText.includes('gst.gov.in') ? (
                            <>
                              Navigated to{' '}
                              <span className="text-cyan-400 font-bold underline">
                                gst.gov.in
                              </span>{' '}
                              mock filing interface.
                            </>
                          ) : (
                            stepText
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. BROWSER AUTOMATION PREVIEW (Playwright screenshot with bounding box) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      BROWSER AUTOMATION PREVIEW (Playwright screenshot)
                    </span>
                    <button
                      onClick={() => setZoomScreenshot(true)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Enlarge View"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Screenshot Viewport with interactive bounding box */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group">
                    <img
                      src={
                        selectedLog.screenshot_path
                          ? `http://localhost:8000${selectedLog.screenshot_path}`
                          : 'http://localhost:8000/static/screenshots/demo-104451_step5_challan_generated.png'
                      }
                      alt="Playwright DOM Viewport"
                      className="w-full h-44 object-cover object-top opacity-90 transition-opacity group-hover:opacity-100"
                    />

                    {/* Visual Bounding Box Overlay Matching Screenshot */}
                    <div className="absolute right-6 bottom-10 z-10 pointer-events-none">
                      {/* Red Bounding Box */}
                      <div className="relative border-2 border-red-500 rounded bg-red-500/20 px-3 py-1.5 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center justify-center">
                        <span className="absolute -top-6 right-0 bg-red-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                          Click [Submit Filing] (#gst-submit)
                        </span>
                        {/* Cursor pointer pointing at button */}
                        <div className="absolute -bottom-4 -right-3 text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce">
                          <MousePointer className="w-5 h-5 fill-amber-400 text-slate-950" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Caption Pill */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/85 text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-700/70 shadow-md">
                      Playwright Active Viewport Screenshot
                    </div>
                  </div>
                </div>

                {/* 3. RAW JSON PAYLOAD ACCORDION */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      RAW JSON PAYLOAD
                    </span>
                    <button
                      onClick={handleCopyPayload}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 transition-colors"
                    >
                      {copiedPayload ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#0b0f19] rounded-lg p-3.5 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-700">
                    {JSON.stringify(parsePayload(selectedLog), null, 2)}
                  </pre>
                </div>

                {/* 4. AUDIT VERIFICATION STAMP */}
                <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Verified by SQLite Local Ledger</span>
                  </div>
                  <span className="font-mono text-slate-500">
                    (Hash: {selectedLog.hash || '0x8f2a71d49e10c4b1'})
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an execution step from the timeline to inspect details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TABULAR DATA TABLE VIEW */
        <div className="rounded-xl bg-[#0d131f]/90 border border-slate-800 p-4 shadow-xl backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Thread ID</th>
                <th className="py-3 px-3">Step Name & Tool</th>
                <th className="py-3 px-3">Agent Reasoning Summary</th>
                <th className="py-3 px-3">Execution Status</th>
                <th className="py-3 px-3">Visual Proof</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {logs.map((log) => (
                <tr
                  key={log.log_id}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSelectedLogId(log.log_id);
                    setViewMode('timeline');
                  }}
                >
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-300 font-semibold whitespace-nowrap">
                    {log.thread_id}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-white">{log.step_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.tool_used || 'Kernel'}</div>
                  </td>
                  <td className="py-3 px-3 max-w-md text-slate-300 line-clamp-2">
                    {log.agent_reasoning}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusBadge(log.execution_status)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {log.screenshot_path ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                        <Eye className="w-3 h-3" /> DOM Capture
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLogId(log.log_id);
                        setViewMode('timeline');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      [ Inspect Step ]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SCREENSHOT FULLSCREEN MODAL */}
      {zoomScreenshot && selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0e1420] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Playwright DOM Screenshot ({selectedLog.thread_id})
                </h3>
              </div>
              <button
                onClick={() => setZoomScreenshot(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <img
              src={
                selectedLog.screenshot_path
                  ? `http://localhost:8000${selectedLog.screenshot_path}`
                  : 'http://localhost:8000/static/screenshots/demo-104451_step5_challan_generated.png'
              }
              alt="High-Res DOM Inspector"
              className="w-full rounded-lg border border-slate-800 max-h-[70vh] object-contain"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Target: {selectedLog.step_name}</span>
              <span className="font-mono text-emerald-400">
                Verified Hash: {selectedLog.hash || '0x8f2a71d49e10c4b1'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
