import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  QrCode,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Bell,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Smartphone,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  CheckCircle,
  XCircle,
  Layers
} from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext.jsx';

export default function WhatsAppDashboard() {
  const { t } = useAppLanguage();

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'disconnected'
  const [connectedUser, setConnectedUser] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Dispatcher State
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Message History State
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterDirection, setFilterDirection] = useState('ALL'); // 'ALL' | 'OUTBOUND' | 'INBOUND'
  const [copiedId, setCopiedId] = useState(null);

  // AI Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    notify_invoice_ingestion: true,
    notify_overdue_reminders: true,
    notify_circuit_breaker: true,
    notify_approval_resolution: true,
    notify_workflow_completion: true,
    notify_workflow_failure: true
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);

  // Quick message templates
  const messageTemplates = [
    {
      title: 'Payment Reminder',
      content: 'Namaste from Sharma Enterprises. This is a gentle reminder that Invoice #INV-025 (₹45,000.00) is pending settlement. Kindly clear at your earliest convenience via UPI/NEFT.'
    },
    {
      title: 'GST Challan Notice',
      content: 'Notice: GSTR-3B tax challan has been queued for statutory filing. Verification CPIN will be shared once authorized.'
    },
    {
      title: 'Ledger Confirmation',
      content: 'Thank you! Your payment for Invoice #INV-024 has been verified and reconciled against our bank statement. Status: PAID.'
    }
  ];

  // 1. Fetch Connection Status & QR Code
  const fetchStatusAndQr = async () => {
    setIsRefreshingStatus(true);
    try {
      const statusRes = await fetch('http://localhost:8000/api/whatsapp/status');
      if (statusRes.ok) {
        const data = await statusRes.json();
        setConnectionStatus(data.connected ? 'connected' : data.status || 'disconnected');
        setConnectedUser(data.user || null);

        if (!data.connected) {
          // Fetch QR
          const qrRes = await fetch('http://localhost:8000/api/whatsapp/qr');
          if (qrRes.ok) {
            const qrJson = await qrRes.json();
            setQrCodeData(qrJson.qr || null);
          }
        } else {
          setQrCodeData(null);
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp status:', err);
      setConnectionStatus('disconnected');
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // 2. Fetch Communications History
  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/whatsapp/messages?limit=50');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 3. Fetch Notification Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/whatsapp/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setNotificationSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notification settings:', err);
    }
  };

  useEffect(() => {
    fetchStatusAndQr();
    fetchMessages();
    fetchSettings();

    // Auto-poll status every 5 seconds if not connected
    const interval = setInterval(() => {
      fetchStatusAndQr();
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle Manual Message Dispatch
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!recipientPhone.trim() || !messageText.trim()) return;

    setIsSending(true);
    setDispatchFeedback(null);

    try {
      const res = await fetch('http://localhost:8000/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: recipientPhone.trim(),
          message: messageText.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDispatchFeedback({
          type: 'success',
          text: `Message successfully sent to ${data.to || recipientPhone}! (ID: ${data.messageId || 'SENT'})`
        });
        setMessageText('');
        fetchMessages();
      } else {
        setDispatchFeedback({
          type: 'error',
          text: data.detail || data.error || 'Failed to dispatch message. Verify recipient and connection.'
        });
      }
    } catch (err) {
      setDispatchFeedback({
        type: 'error',
        text: `Network error: ${err.message}. Ensure backend & WhatsApp microservice are running.`
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async (clearAuth = false) => {
    if (!window.confirm(clearAuth ? 'Disconnect and clear saved WhatsApp login session?' : 'Disconnect active WhatsApp session?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const res = await fetch('http://localhost:8000/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear_auth: clearAuth })
      });

      if (res.ok) {
        setConnectionStatus('disconnected');
        setConnectedUser(null);
        setTimeout(fetchStatusAndQr, 1500);
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const res = await fetch('http://localhost:8000/api/whatsapp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationSettings)
      });
      if (res.ok) {
        setSettingsFeedback({ type: 'success', text: 'AI Notification preferences saved successfully!' });
      } else {
        setSettingsFeedback({ type: 'error', text: 'Failed to update settings.' });
      }
    } catch (err) {
      setSettingsFeedback({ type: 'error', text: `Error saving settings: ${err.message}` });
    } finally {
      setSavingSettings(false);
      setTimeout(() => setSettingsFeedback(null), 4000);
    }
  };

  // Copy Message ID helper
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMessages = messages.filter((m) => {
    if (filterDirection === 'ALL') return true;
    return m.direction === filterDirection;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0e1626] via-[#121c33] to-[#0e1626] border border-sky-900/40 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                Free WhatsApp Dispatcher & Circuit Breaker
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/50 uppercase tracking-wider">
                Baileys $0 Zero-Cost
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Autonomous conversational operations engine powered by Baileys. Handles instant payment reminders,
              owner authorization gates via WhatsApp commands (<code className="text-sky-300">APPROVE</code> / <code className="text-rose-300">REJECT</code>),
              and statutory filing completion telemetry.
            </p>
          </div>

          {/* Quick Connection Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md ${
              connectionStatus === 'connected'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : connectionStatus === 'connecting'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-rose-400'
              }`} />
              <span className="capitalize">{connectionStatus}</span>
            </div>

            <button
              onClick={fetchStatusAndQr}
              disabled={isRefreshingStatus}
              className="p-2 rounded-xl bg-[#15233c] hover:bg-[#1c3052] border border-slate-700/60 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingStatus ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Connection Card & Dispatcher, Right: Settings & History) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Connection Card + Manual Dispatcher (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. WhatsApp Connection Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1422] border border-[#1a2538] shadow-lg relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">Device Pairing & Authentication</h3>
              </div>
              {connectionStatus === 'connected' && (
                <button
                  onClick={() => handleDisconnect(false)}
                  disabled={isDisconnecting}
                  className="px-3 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
                </button>
              )}
            </div>

            <div className="pt-5">
              {connectionStatus === 'connected' ? (
                <div className="p-6 rounded-xl bg-[#121c2e] border border-emerald-500/20 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">WhatsApp Device Authenticated</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connected as: <span className="font-mono text-emerald-300 font-semibold">{connectedUser?.id ? `+${connectedUser.id}` : 'AI Operator'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-[#0a0f1a] px-3 py-1.5 rounded-lg border border-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Multi-File Auth credentials active in <code className="text-sky-300">whatsapp-service/auth_info/</code></span>
                  </div>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => handleDisconnect(true)}
                      className="text-xs text-slate-400 hover:text-rose-400 underline underline-offset-4"
                    >
                      Clear Saved Credentials & Switch Number
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-[#111726] border border-slate-800">
                  {/* QR Display */}
                  <div className="w-48 h-48 bg-white p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    {qrCodeData ? (
                      <img
                        src={qrCodeData}
                        alt="WhatsApp Authentication QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-700 text-center p-2">
                        <RefreshCw className="w-6 h-6 animate-spin mb-2 text-sky-600" />
                        <span className="text-[11px] font-semibold">Generating QR Code...</span>
                      </div>
                    )}
                  </div>

                  {/* QR Instructions */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-slate-200">How to Connect WhatsApp:</h4>
                    </div>
                    <ol className="space-y-2 text-slate-400 list-decimal list-inside leading-relaxed">
                      <li>Open <strong className="text-slate-200">WhatsApp</strong> on your mobile phone</li>
                      <li>Tap <strong className="text-slate-200">Menu (⋮)</strong> on Android or <strong className="text-slate-200">Settings</strong> on iOS</li>
                      <li>Select <strong className="text-slate-200">Linked Devices</strong> and tap <strong className="text-slate-200">Link a Device</strong></li>
                      <li>Point your camera at this QR code to scan and authorize</li>
                    </ol>
                    <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
                      <span>
                        $0 Zero-Cost: Runs entirely local using Baileys. Sessions are stored securely on this computer and survive restarts.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Message Dispatcher Form */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1422] border border-[#1a2538] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">Direct Message Dispatcher</h3>
              </div>
              <span className="text-[11px] text-slate-400">Targeted MSME Dispatch</span>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Quick Preset Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {messageTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageText(tmpl.content)}
                    className="px-2.5 py-1 rounded-lg bg-[#141e30] hover:bg-[#1a273f] text-slate-300 border border-slate-700/60 text-[11px] font-medium transition-all"
                  >
                    + {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4 pt-1">
              {/* Recipient Phone */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Recipient Phone Number (with Country Code)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#111726] border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                    E.164 Format
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Message Content (Markdown Supported)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {messageText.length} / 4096 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your WhatsApp notification or reminder..."
                  className="w-full bg-[#111726] border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Feedback Alert */}
              <AnimatePresence>
                {dispatchFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      dispatchFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {dispatchFeedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{dispatchFeedback.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending || connectionStatus !== 'connected' || !messageText.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching via Baileys...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send WhatsApp Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Notification Settings + Message History (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* 3. AI Notification Triggers (Toggles) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1422] border border-[#1a2538] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">AI Notification Triggers</h3>
              </div>
              <span className="text-[10px] bg-[#141e30] text-sky-400 px-2 py-0.5 rounded-full border border-sky-800/40 font-mono">
                LangGraph Automated
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Control which operational events automatically trigger outbound WhatsApp notifications to the business owner or debtors.
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  key: 'notify_invoice_ingestion',
                  title: 'Invoice Ingestion Alerts',
                  desc: 'Notify owner when an invoice is ingested into MSME ledger'
                },
                {
                  key: 'notify_overdue_reminders',
                  title: 'Debtor Overdue Reminders',
                  desc: 'Dispatch automated payment reminders to debtors'
                },
                {
                  key: 'notify_circuit_breaker',
                  title: 'Circuit Breaker Requests',
                  desc: 'Send APPROVE/REJECT authorization requests to owner'
                },
                {
                  key: 'notify_approval_resolution',
                  title: 'Approval Decision Confirmations',
                  desc: 'Notify owner when approval command is recorded'
                },
                {
                  key: 'notify_workflow_completion',
                  title: 'Filing Completion Reports',
                  desc: 'Send CPIN & ARN summary on successful GST filing'
                },
                {
                  key: 'notify_workflow_failure',
                  title: 'Error & Circuit Abort Alerts',
                  desc: 'Send immediate error notice if workflow halts'
                }
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#111726] border border-slate-800/80 hover:border-slate-700/60 transition-all"
                >
                  <div className="space-y-0.5 pr-2">
                    <h5 className="text-xs font-medium text-slate-200">{item.title}</h5>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key]
                      }))
                    }
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                      notificationSettings[item.key] ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notificationSettings[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Save Settings Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-2 rounded-xl bg-[#15233c] hover:bg-[#1c3052] border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Save Notification Settings</span>
              </button>

              {settingsFeedback && (
                <p className={`text-[11px] mt-2 text-center ${
                  settingsFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {settingsFeedback.text}
                </p>
              )}
            </div>
          </div>

          {/* 4. Message History Stream */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1422] border border-[#1a2538] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">Communications History</h3>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#111726] p-1 rounded-lg border border-slate-800 text-[10px]">
                {['ALL', 'OUTBOUND', 'INBOUND'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterDirection(tab)}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${
                      filterDirection === tab
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Stream */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-500" />
                  Loading message history...
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No WhatsApp communications found.
                </div>
              ) : (
                filteredMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#111726] border border-slate-800/80 space-y-2 hover:border-slate-700/80 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {msg.direction === 'OUTBOUND' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3 h-3" /> OUTBOUND
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                            <ArrowDownLeft className="w-3 h-3" /> INBOUND
                          </span>
                        )}
                        <span className="font-mono text-slate-300 font-semibold text-[11px]">
                          {msg.phone}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>

                    <p className="text-slate-200 text-xs leading-relaxed bg-[#0c121e] p-2.5 rounded-lg border border-slate-800/60 whitespace-pre-wrap font-sans">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <div className="flex items-center gap-1">
                        <span>Status:</span>
                        <span className={`font-semibold ${
                          msg.status === 'SENT' || msg.status === 'RECEIVED' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {msg.status}
                        </span>
                      </div>

                      {msg.message_id && (
                        <button
                          type="button"
                          onClick={() => handleCopyId(msg.message_id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-sky-300 font-mono"
                          title="Copy Message ID"
                        >
                          {copiedId === msg.message_id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{msg.message_id.slice(0, 10)}...</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

