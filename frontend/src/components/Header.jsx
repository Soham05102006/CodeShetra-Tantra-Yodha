import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Play, 
  PhoneCall, 
  Globe, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

export default function Header({ 
  agentStatus, 
  onRunWorkflow, 
  onSimulateVoice, 
  onRunBrowserDemo, 
  onResetDemo,
  isRunning 
}) {
  const getStatusBadge = () => {
    switch (agentStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            AGENT ACTIVE
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            WHATSAPP APPROVAL REQUIRED
          </span>
        );
      case 'IDLE':
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            STANDBY / IDLE
          </span>
        );
    }
  };

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Title and Identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Sharma Enterprises
                <span className="text-slate-500 font-normal">|</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                  AI-01 Operational Agent
                </span>
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Company of One
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>GSTIN: 27AABCS1429B1Z</span>
              <span>•</span>
              <span className="text-slate-300">Autonomous Vernacular Voice & Non-API Portal Automation</span>
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {getStatusBadge()}

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Simulate Vernacular Voice */}
          <button
            onClick={onSimulateVoice}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:text-white transition-all disabled:opacity-50"
            title="Trigger Hindi/Hinglish Voice Recovery Call"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            Voice Dispatch
          </button>

          {/* Test Visual Browser Automation */}
          <button
            onClick={onRunBrowserDemo}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:text-white transition-all disabled:opacity-50"
            title="Directly Run Visual Playwright Portal Automation"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            Portal Automation
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-lg text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title="Reset Database to Fresh Demo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRunWorkflow}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 border border-blue-400/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            Run Full MSME Workflow
          </motion.button>
        </div>
      </div>
    </header>
  );
}
