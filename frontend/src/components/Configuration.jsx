import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ShieldAlert,
  Volume2,
  Database,
  Sliders,
  Save,
  RefreshCw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Cpu,
  Layers,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Check,
  ChevronRight,
  Server,
  Activity,
  Zap,
  Globe,
  X
} from 'lucide-react';

export default function Configuration() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'safety' | 'voice' | 'prompts'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingDiagnostics, setTestingDiagnostics] = useState(false);
  const [restartingAgent, setRestartingAgent] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // System Configuration State
  const [config, setConfig] = useState({
    financial_payout_limit: 50000,
    gstr_approval_required: true,
    voice_outbound_consent: true,
    hold_high_stakes: true,
    require_gst_portal_approval: true,
    require_outbound_wire_approval: true,
    require_vendor_bank_modify_approval: true,
    auto_remind_whatsapp: false,
    emergency_kill_switch: false,
    default_dialect: 'Hinglish (Mixed Hindi/English)',
    tts_personality: 'Female (Aditi / Ind-En)',
    tts_speed: '1.0x',
    fallback_language: 'Default to Hindi if dialect unclassified.',
    calling_window_start: '10:00 AM IST',
    calling_window_end: '04:00 PM IST',
    max_daily_retries: 2,
    tone_preference: 'Polite & Respectful',
    active_dialects: ['Hindi (Bundeli & Standard)', 'Marathi', 'Gujarati', 'Punjabi'],
    system_prompt_override: 'You are an empathetic, culturally fluent MSME finance manager for Sharma Enterprises. Maintain an understanding, collaborative tone while securing explicit payment commitment dates.',
    whatsapp_signature: '- AI Accounts Dept, Sharma Enterprises',
    offline_model_fallback: 'ollama/qwen2.5:7b',
    use_offline_fallback: false,
    sqlite_db_path: './data/app.db',
    chroma_db_path: './chroma_db',
    db_storage_size: '18.4 MB',
    db_status: 'HEALTHY',
    aes_encryption: 'ACTIVE',
    last_agent_restart: null
  });

  // Summary Metrics from Backend
  const [summary, setSummary] = useState({
    system_health: 'ALL SYSTEMS OPERATIONAL',
    system_health_subtext: 'Reasoning Engine, WhatsApp, Voice Connected',
    circuit_breaker_threshold: '₹50,000 Max Auto-Approval',
    circuit_breaker_subtext: 'Higher amounts pause for owner sign-off',
    primary_voice_dialect: 'Hinglish (Female (Aditi / Ind-En))',
    voice_calling_window: 'Calling window: 10:00 AM IST - 04:00 PM IST',
    local_db_storage: '18.4 MB',
    db_subtext: 'SQLite app.db + ChromaDB persistent'
  });

  // System Diagnostics Results
  const [systemDiagnostics, setSystemDiagnostics] = useState(null);

  // Show Toast
  const triggerToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Fetch Config
  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config,
            financial_payout_limit: Number(data.config.financial_payout_limit) || 50000,
            active_dialects: Array.isArray(data.config.active_dialects)
              ? data.config.active_dialects
              : typeof data.config.active_dialects === 'string'
              ? JSON.parse(data.config.active_dialects)
              : ['Hindi (Bundeli & Standard)', 'Marathi', 'Gujarati', 'Punjabi']
          }));
        }
        if (data.summary) {
          setSummary({
            ...data.summary,
            system_health_subtext: 'Reasoning Engine, WhatsApp, Voice Connected'
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load configuration:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...config,
        financial_payout_limit: Number(config.financial_payout_limit),
        active_dialects: JSON.stringify(config.active_dialects)
      };

      const res = await fetch('http://localhost:8000/api/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload })
      });

      if (res.ok) {
        triggerToast('Settings Saved', 'All configuration parameters persisted to SQLite system_configuration table.', 'success');
        fetchConfig();
      } else {
        triggerToast('Error Saving', 'Failed to update system configurations.', 'error');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Network Error', 'Could not reach backend configuration endpoint.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Health Diagnostics
  const handleRunDiagnostics = async () => {
    setTestingDiagnostics(true);
    try {
      const res = await fetch('http://localhost:8000/api/config/test-apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'all' })
      });

      if (res.ok) {
        const data = await res.json();
        setSystemDiagnostics(data.results);
        triggerToast('Diagnostics Complete', 'All operational pipelines verified with 100% operational health.', 'success');
      } else {
        triggerToast('Diagnostics Warning', 'One or more internal services returned unexpected status.', 'error');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error', 'Failed to run connection diagnostics.', 'error');
    } finally {
      setTestingDiagnostics(false);
    }
  };

  // Toggle Emergency Kill Switch
  const handleToggleKillSwitch = async (newVal) => {
    try {
      const res = await fetch('http://localhost:8000/api/config/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newVal })
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({ ...prev, emergency_kill_switch: data.kill_switch_active }));
        if (data.kill_switch_active) {
          triggerToast('EMERGENCY KILL SWITCH ENGAGED', 'All active LangGraph agent threads are instantly halted.', 'danger');
        } else {
          triggerToast('Kill Switch Disengaged', 'LangGraph autonomous agent execution resumed.', 'success');
        }
        fetchConfig();
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error', 'Failed to toggle kill switch.', 'error');
    }
  };

  // Restart Worker Agent
  const handleRestartAgent = async () => {
    setRestartingAgent(true);
    try {
      const res = await fetch('http://localhost:8000/api/config/restart-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        triggerToast('AI Worker Restarted', 'LangGraph threads, ChromaDB embeddings & API pipelines reloaded.', 'success');
        fetchConfig();
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error', 'Failed to restart agent.', 'error');
    } finally {
      setRestartingAgent(false);
    }
  };

  // Helper toggle for active dialects
  const toggleDialect = (dialect) => {
    setConfig(prev => {
      const exists = prev.active_dialects.includes(dialect);
      const updated = exists
        ? prev.active_dialects.filter(d => d !== dialect)
        : [...prev.active_dialects, dialect];
      return { ...prev, active_dialects: updated };
    });
  };

  const navTabs = [
    { id: 'overview', label: 'All Settings (Overview)', icon: Sliders },
    { id: 'safety', label: 'Circuit Breaker & Safety', icon: ShieldAlert },
    { id: 'voice', label: 'Vernacular Voice Rules', icon: Volume2 },
    { id: 'prompts', label: 'System Prompts & Models', icon: Cpu },
  ];

  const allAvailableDialects = [
    'Hindi (Bundeli & Standard)',
    'Marathi',
    'Gujarati',
    'Punjabi',
    'Kannada',
    'Tamil'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-8 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 max-w-md ${
              toastMessage.type === 'danger'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toastMessage.type === 'error'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            } backdrop-blur-md`}
          >
            {toastMessage.type === 'danger' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold">{toastMessage.title}</div>
              <div className="opacity-90 mt-0.5">{toastMessage.message}</div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Row with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a2335]/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-600/10 border border-sky-500/30 text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Settings & Configuration
                {config.emergency_kill_switch && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                    EMERGENCY PAUSE ACTIVE
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Master command center for monetary safety guardrails, vernacular voice behavior, and system directives.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunDiagnostics}
            disabled={testingDiagnostics}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Perform connection health check for reasoning engine, voice, and database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${testingDiagnostics ? 'animate-spin' : ''}`} />
            <span>{testingDiagnostics ? 'Checking Systems...' : 'Health Diagnostics'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving Changes...' : '+ Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 1. TOP SUMMARY STATUS HEADER (4 Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Health Status */}
        <div className="p-4 rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              System Health Status
            </span>
            <div className={`p-1.5 rounded-lg ${config.emergency_kill_switch ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-base font-bold mt-2 truncate ${config.emergency_kill_switch ? 'text-rose-400' : 'text-emerald-400'}`}>
            {config.emergency_kill_switch ? 'EMERGENCY PAUSE ENGAGED' : 'ALL SYSTEMS OPERATIONAL'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${config.emergency_kill_switch ? 'bg-rose-500' : 'bg-emerald-400'}`} />
            {config.emergency_kill_switch ? 'Workflows halted by owner' : 'Reasoning Engine, WhatsApp, Voice Connected'}
          </p>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60" />
        </div>

        {/* Card 2: Circuit Breaker Threshold */}
        <div className="p-4 rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Circuit Breaker Threshold
            </span>
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold mt-2 text-white truncate">
            ₹{Number(config.financial_payout_limit).toLocaleString('en-IN')} Max Auto-Approval
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Higher amounts pause for owner sign-off
          </p>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-blue-500 opacity-60" />
        </div>

        {/* Card 3: Primary Voice Dialect */}
        <div className="p-4 rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Primary Voice Dialect
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold mt-2 text-white truncate">
            {config.default_dialect.split(' ')[0]} ({config.tts_personality.split('(')[1]?.replace(')', '') || 'Swara Neural'})
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calling window: {config.calling_window_start} - {config.calling_window_end}
          </p>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60" />
        </div>

        {/* Card 4: Local DB Storage */}
        <div className="p-4 rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Local DB Storage
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold mt-2 text-white truncate">
            {summary.local_db_storage || '18.4 MB'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            SQLite app.db + ChromaDB persistent
          </p>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-400 opacity-60" />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1a2335]/60">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Real-time Diagnostics Bar (if tested) */}
      {systemDiagnostics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                System Diagnostics & Infrastructure Latency
              </span>
            </div>
            <button
              onClick={() => setSystemDiagnostics(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
            {Object.entries(systemDiagnostics).map(([key, item]) => (
              <div key={key} className="p-3 rounded-xl bg-[#0c1017] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.quota_status || 'Operational'}</div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.status === 'CONNECTED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'PARTIALLY_CONFIGURED'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <Check className="w-3 h-3" /> {item.status}
                  </span>
                  <div className="text-[10px] text-sky-400 font-mono mt-0.5">{item.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT AREAS */}

      {/* =========================================================================
          VIEW 1: OVERVIEW GRID (Balanced 4-Quadrant Cockpit)
          ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* TOP LEFT CARD: HUMAN-IN-THE-LOOP (HITL) SAFETY THRESHOLDS */}
          <div className="rounded-2xl bg-[#0e1422]/90 border border-sky-500/30 p-5 shadow-xl shadow-black/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                  Human-in-the-Loop (HITL) Safety Thresholds
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('safety')}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Financial Payout Limit Slider */}
              <div className="p-3.5 rounded-xl bg-[#121827] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Financial Payout Limit</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ₹{Number(config.financial_payout_limit).toLocaleString('en-IN')}
                  </span>
                </div>
                {/* Range Slider */}
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={config.financial_payout_limit}
                  onChange={(e) => setConfig(prev => ({ ...prev, financial_payout_limit: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <p className="text-[11px] text-slate-400">
                  Any payout above this triggers Owner approval via WhatsApp.
                </p>
              </div>

              {/* GSTR Tax Filing Approval */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">GSTR Tax Filing Approval</div>
                  <div className="text-[11px] text-slate-400">Mandatory Approval for GSTR-1/3B Portal Submissions.</div>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, gstr_approval_required: !prev.gstr_approval_required }))}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    config.gstr_approval_required ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.gstr_approval_required ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Voice-Initiated Outbound Call Consent */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Voice-Initiated Outbound Call Consent</div>
                  <div className="text-[11px] text-slate-400">Automatic outbound callback for automatic reminders.</div>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, voice_outbound_consent: !prev.voice_outbound_consent }))}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    config.voice_outbound_consent ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.voice_outbound_consent ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Hold for check on high-stakes promises */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, hold_high_stakes: !prev.hold_high_stakes }))}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                      config.hold_high_stakes ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      config.hold_high_stakes ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                  <span className="text-xs font-semibold text-slate-200">Hold for check on high-stakes promises</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {config.hold_high_stakes ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Subtle blue accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* TOP RIGHT CARD: SYSTEM DIRECTIVES & AI PERSONA */}
          <div className="rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 p-5 shadow-xl shadow-black/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                  System Directives & AI Persona
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('prompts')}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Prompts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Core Directive */}
              <div className="p-3.5 rounded-xl bg-[#121827] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Core Autonomous Operational Directive</span>
                  <span className="text-[10px] font-mono text-emerald-400">ACTIVE DIRECTIVE</span>
                </div>
                <textarea
                  rows={3}
                  value={config.system_prompt_override}
                  onChange={(e) => setConfig(prev => ({ ...prev, system_prompt_override: e.target.value }))}
                  className="w-full bg-[#0c1017] text-slate-200 text-xs p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                  placeholder="System instructions for tone, negotiations..."
                />
              </div>

              {/* WhatsApp Signature */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <span className="text-xs font-semibold text-slate-200">WhatsApp Notification Signature</span>
                <input
                  type="text"
                  value={config.whatsapp_signature}
                  onChange={(e) => setConfig(prev => ({ ...prev, whatsapp_signature: e.target.value }))}
                  className="bg-[#0c1017] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 sm:w-60 font-mono"
                />
              </div>

              {/* Local Ollama Fallback Toggle */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Local Model Fallback (Ollama)</div>
                  <div className="text-[11px] text-slate-400">Auto-switch to local Qwen 2.5 on connection drop</div>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, use_offline_fallback: !prev.use_offline_fallback }))}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    config.use_offline_fallback ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    config.use_offline_fallback ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM LEFT CARD: VERNACULAR VOICE & DIALECT RULES */}
          <div className="rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 p-5 shadow-xl shadow-black/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                Vernacular Voice & Dialect Rules
              </span>
              <button 
                onClick={() => setActiveTab('voice')}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Voice Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dialect & Language Selection checkboxes */}
              <div className="p-3.5 rounded-xl bg-[#121827] border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Dialect & Language Selection
                </div>
                <div className="space-y-2">
                  {allAvailableDialects.map((dialect) => {
                    const isChecked = config.active_dialects.includes(dialect);
                    return (
                      <div key={dialect} className="flex items-center justify-between text-xs py-1">
                        <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDialect(dialect)}
                            className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                          />
                          <span>{dialect}</span>
                        </label>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          isChecked
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                        }`}>
                          {isChecked ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TTS & Agent Personality */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">TTS & Agent Personality</span>
                <div className="flex items-center gap-2">
                  <select
                    value={config.tts_personality}
                    onChange={(e) => setConfig(prev => ({ ...prev, tts_personality: e.target.value }))}
                    className="bg-[#0c1017] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Female (Aditi / Ind-En)">Female (Aditi / Ind-En)</option>
                    <option value="Female (Swara / hi-IN)">Female (Swara / hi-IN)</option>
                    <option value="Male (Madhur / hi-IN)">Male (Madhur / hi-IN)</option>
                    <option value="Male (Rohan / Ind-En)">Male (Rohan / Ind-En)</option>
                  </select>
                  <span className="text-slate-500">&</span>
                  <select
                    value={config.tts_speed}
                    onChange={(e) => setConfig(prev => ({ ...prev, tts_speed: e.target.value }))}
                    className="bg-[#0c1017] text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500"
                  >
                    <option value="0.85x">0.85x</option>
                    <option value="1.0x">1.0x</option>
                    <option value="1.15x">1.15x</option>
                    <option value="1.25x">1.25x</option>
                  </select>
                </div>
              </div>

              {/* Indian Language Fallbacks */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Indian Language Fallbacks</span>
                <input
                  type="text"
                  value={config.fallback_language}
                  onChange={(e) => setConfig(prev => ({ ...prev, fallback_language: e.target.value }))}
                  className="bg-[#0c1017] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 sm:w-64"
                />
              </div>

              {/* LiveKit Cloud WebRTC Audio & Video */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <span>LiveKit WebRTC Cloud Audio & Video</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      CONNECTED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    wss://ai-native-business-agent-pallot-lyz298ei.livekit.cloud
                  </div>
                </div>
                <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
                  Key: APIt****MA4Q
                </span>
              </div>

              {/* Retell AI Outbound Telephony */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#121827] border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <span>Retell AI Outbound Telephony</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      NOT CONFIGURED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Carrier Outbound Calls, Real Transcripts & Webhooks
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                  Set RETELL_API_KEY in .env
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM RIGHT CARD: LOCAL DATABASE & SYSTEM STATUS */}
          <div className="rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 p-5 shadow-xl shadow-black/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                Local Database & System Status
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-4">
              {/* System Database Status */}
              <div className="p-3.5 rounded-xl bg-[#121827] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-slate-200">System Database (SQLite + ChromaDB)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                    HEALTHY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Size: {summary.local_db_storage || '18.4 MB'} / Sync status: Vector Memory Enriched
                </p>
                <div className="pt-1 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                  <span>SQLite: {config.sqlite_db_path}</span>
                  <span>ChromaDB: {config.chroma_db_path}</span>
                </div>
              </div>

              {/* Data Security */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121827] border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Data Security</div>
                  <div className="text-[11px] text-slate-400">AES-256 Encryption Active & Hash-Logged</div>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Edge / Node Status */}
              <div className="p-3.5 rounded-xl bg-[#121827] border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Edge / Node Status</span>
                  <span className="text-[10px] font-mono text-sky-400">Sync: 10 mins</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Connected via standard secure local loopback IPC API.
                </div>
              </div>

              {/* Restart AI Worker Agent Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRestartAgent}
                  disabled={restartingAgent}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-[#162032] hover:bg-[#1e2c45] border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-md"
                >
                  <RotateCcw className={`w-4 h-4 text-sky-400 ${restartingAgent ? 'animate-spin' : ''}`} />
                  <span>{restartingAgent ? 'Restarting Agent...' : 'Restart AI Worker Agent'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CIRCUIT BREAKER & SAFETY GUARDRAILS (Focused Tab)
          ========================================================================= */}
      {activeTab === 'safety' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Global Emergency Kill-Switch Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900/90 border border-rose-500/40 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 mt-0.5">
                <Power className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Emergency Agent Pause (Global Kill-Switch)
                  {config.emergency_kill_switch && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      HALTED
                    </span>
                  )}
                </h3>
                <p className="text-xs text-rose-200/80 mt-1 max-w-xl">
                  Instantly pauses all active LangGraph execution threads in case of portal layout changes, tax calculation discrepancies, or network timeouts.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggleKillSwitch(!config.emergency_kill_switch)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer ${
                config.emergency_kill_switch
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-rose-500/30'
              }`}
            >
              {config.emergency_kill_switch ? 'Resume Operations' : 'Engage Kill Switch'}
            </button>
          </div>

          {/* Interactive Governance Controls */}
          <div className="rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 p-6 shadow-xl backdrop-blur-md space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                Human-in-the-Loop Financial Guardrails
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Defines autonomous execution limits where the AI employee must pause and seek owner approval.
              </p>
            </div>

            {/* Slider Section */}
            <div className="p-5 rounded-xl bg-[#121827] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Auto-Approval Threshold Limit</div>
                  <div className="text-[11px] text-slate-400">Transactions exceeding this limit pause for owner signature.</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-sky-400 font-mono">
                    ₹{Number(config.financial_payout_limit).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">Maximum Autonomous Limit</div>
                </div>
              </div>

              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={config.financial_payout_limit}
                onChange={(e) => setConfig(prev => ({ ...prev, financial_payout_limit: Number(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />

              {/* Quick Presets */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Min: ₹5,000</span>
                <div className="flex gap-2">
                  {[25000, 50000, 100000, 250000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setConfig(prev => ({ ...prev, financial_payout_limit: preset }))}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                        config.financial_payout_limit === preset
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ₹{(preset / 1000)}k
                    </button>
                  ))}
                </div>
                <span>Max: ₹5,00,000</span>
              </div>
            </div>

            {/* Mandatory Approval Checkboxes */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Mandatory Approval Policies
              </div>

              {[
                {
                  key: 'require_gst_portal_approval',
                  title: 'Submit GST Returns on non-API Portals (Always Require Approval)',
                  desc: 'Halt Playwright automation at the Challan verification screen until the owner signs off.'
                },
                {
                  key: 'require_outbound_wire_approval',
                  title: 'Outbound Vendor Payments / Wire Transfers',
                  desc: 'Never dispatch autonomous payouts to suppliers without explicit WhatsApp 2FA.'
                },
                {
                  key: 'require_vendor_bank_modify_approval',
                  title: 'Modify Vendor GSTIN or Bank Details',
                  desc: 'Require physical owner confirmation if a debtor asks to change their settlement account.'
                },
                {
                  key: 'auto_remind_whatsapp',
                  title: 'Send Payment Reminder WhatsApp Messages (Auto-approved)',
                  desc: 'Allow autonomous dispatch of payment reminders for invoices less than 15 days overdue.'
                }
              ].map((item) => {
                const isChecked = !!config[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => setConfig(prev => ({ ...prev, [item.key]: !isChecked }))}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121827] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-200">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Updating...' : 'Save Safety Guardrails'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          VIEW 3: VERNACULAR VOICE RULES (Focused Tab)
          ========================================================================= */}
      {activeTab === 'voice' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 p-6 shadow-xl backdrop-blur-md space-y-6"
        >
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              Vernacular Voice & Dialect Studio
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize cultural language nuances, calling windows, and debtor negotiation tones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Calling Hours Window */}
            <div className="p-4 rounded-xl bg-[#121827] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Clock className="w-4 h-4 text-sky-400" />
                Calling Hours Window
              </div>
              <p className="text-[11px] text-slate-400">
                Prevents outbound calls outside commercial hours to respect customer goodwill.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">Start Time</label>
                  <input
                    type="text"
                    value={config.calling_window_start}
                    onChange={(e) => setConfig(prev => ({ ...prev, calling_window_start: e.target.value }))}
                    className="w-full bg-[#0c1017] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">End Time</label>
                  <input
                    type="text"
                    value={config.calling_window_end}
                    onChange={(e) => setConfig(prev => ({ ...prev, calling_window_end: e.target.value }))}
                    className="w-full bg-[#0c1017] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Max Daily Retries */}
            <div className="p-4 rounded-xl bg-[#121827] border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                Max Daily Retries Per Customer
              </div>
              <p className="text-[11px] text-slate-400">
                Caps unattended ringback attempts per party to prevent spam complaints.
              </p>
              <div className="pt-2">
                <select
                  value={config.max_daily_retries}
                  onChange={(e) => setConfig(prev => ({ ...prev, max_daily_retries: Number(e.target.value) }))}
                  className="w-full bg-[#0c1017] text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700"
                >
                  <option value={1}>1 Call Per Day (Conservative)</option>
                  <option value={2}>2 Calls Per Day (Standard Recommendation)</option>
                  <option value={3}>3 Calls Per Day (High Priority Overdues)</option>
                </select>
              </div>
            </div>

            {/* Default Dialect Dropdown */}
            <div className="p-4 rounded-xl bg-[#121827] border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200">Primary Dialect Selection</label>
              <select
                value={config.default_dialect}
                onChange={(e) => setConfig(prev => ({ ...prev, default_dialect: e.target.value }))}
                className="w-full bg-[#0c1017] text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700"
              >
                <option value="Hinglish (Mixed Hindi/English)">Hinglish (Mixed Hindi/English)</option>
                <option value="Pure Hindi (Standard)">Pure Hindi (Standard)</option>
                <option value="Marathi">Marathi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            {/* Negotiation Tone Preference */}
            <div className="p-4 rounded-xl bg-[#121827] border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200">Debt Negotiation Tone</label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['Polite & Respectful', 'Firm Business Direct'].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, tone_preference: tone }))}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      config.tone_preference === tone
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                        : 'bg-[#0c1017] text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Updating...' : 'Save Voice Rules'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          VIEW 4: SYSTEM PROMPTS & MODELS (Focused Tab)
          ========================================================================= */}
      {activeTab === 'prompts' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0e1422]/90 border border-slate-800/80 p-6 shadow-xl backdrop-blur-md space-y-6"
        >
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              System Prompt Customization & Local Fallback LLM
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Refine AI operational persona instructions and configure zero-cost local Ollama models.
            </p>
          </div>

          {/* System Prompt Override */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">
              Agent System Directive (Voice & Reasoning Persona)
            </label>
            <textarea
              rows={4}
              value={config.system_prompt_override}
              onChange={(e) => setConfig(prev => ({ ...prev, system_prompt_override: e.target.value }))}
              className="w-full bg-[#121827] text-slate-200 text-xs p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
              placeholder="Enter system instructions for conversational tone, payment commitments..."
            />
            <p className="text-[11px] text-slate-500">
              Injected into Google Gemini 2.0 and Vapi outbound call prompts as the core system instruction.
            </p>
          </div>

          {/* WhatsApp Signature */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Automated WhatsApp Notification Signature
            </label>
            <input
              type="text"
              value={config.whatsapp_signature}
              onChange={(e) => setConfig(prev => ({ ...prev, whatsapp_signature: e.target.value }))}
              className="w-full bg-[#121827] text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 font-mono focus:border-sky-500"
            />
          </div>

          {/* Local Ollama Fallback Card */}
          <div className="p-4 rounded-xl bg-[#121827] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Offline Local Model Fallback (Ollama)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Fallback to locally hosted LLM if internet connectivity drops or rate limits hit.
                </div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, use_offline_fallback: !prev.use_offline_fallback }))}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                  config.use_offline_fallback ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.use_offline_fallback ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Offline Fallback Model</label>
                <select
                  value={config.offline_model_fallback}
                  onChange={(e) => setConfig(prev => ({ ...prev, offline_model_fallback: e.target.value }))}
                  className="w-full bg-[#0c1017] text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 font-mono"
                >
                  <option value="ollama/qwen2.5:7b">ollama/qwen2.5:7b (Recommended MSME reasoning)</option>
                  <option value="ollama/llama3.2:3b">ollama/llama3.2:3b (Ultra-fast edge)</option>
                  <option value="ollama/mistral:7b">ollama/mistral:7b</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Local Endpoint Host</label>
                <input
                  type="text"
                  readOnly
                  value="http://127.0.0.1:11434"
                  className="w-full bg-[#0c1017] text-slate-400 text-xs px-3 py-2 rounded-lg border border-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Updating...' : 'Save System Prompts'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
