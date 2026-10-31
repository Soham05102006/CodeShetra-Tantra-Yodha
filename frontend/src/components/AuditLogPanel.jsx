import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  Cpu, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function AuditLogPanel({ auditLogs }) {
  const getToolBadge = (tool) => {
    if (!tool) return null;
    if (tool.includes('Playwright')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
          Playwright
        </span>
      );
    }
    if (tool.includes('Vapi') || tool.includes('Voice')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Vapi.ai
        </span>
      );
    }
    if (tool.includes('WhatsApp')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
          WhatsApp-Gate
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        {tool}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AWAITING_APPROVAL':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      case 'REJECTED':
      case 'ABORTED':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'IN_PROGRESS':
      case 'DISPATCHED':
      default:
        return <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Agent Audit Log</h2>
            <p className="text-xs text-slate-400">Deterministic Reasoning & Telemetry</p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500 bg-slate-950/80 px-2 py-1 rounded-md border border-slate-800">
          {auditLogs.length} Events
        </span>
      </div>

      {/* Log Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        <AnimatePresence initial={false}>
          {auditLogs.map((log, index) => (
            <motion.div
              key={log.log_id || `${log.timestamp}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 hover:border-slate-700/80 transition-all text-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold truncate">
                  {getStatusIcon(log.execution_status)}
                  <span className="capitalize">{log.step_name.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {log.timestamp ? log.timestamp.split('T')[1]?.substring(0, 8) || log.timestamp : 'now'}
                </span>
              </div>

              {/* Agent Reasoning */}
              <p className="text-slate-300 leading-relaxed font-sans mb-2 text-[11.5px]">
                {log.agent_reasoning}
              </p>

              {/* Footer info: tool used and thread ID */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                <span>{getToolBadge(log.tool_used)}</span>
                <span>th: {log.thread_id?.slice(-8) || 'sys'}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {auditLogs.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Terminal className="w-8 h-8 mb-2 opacity-40" />
            <span>Audit telemetry waiting for agent trigger...</span>
          </div>
        )}
      </div>
    </div>
  );
}
