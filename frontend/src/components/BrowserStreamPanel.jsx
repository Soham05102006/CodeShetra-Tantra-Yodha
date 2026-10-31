import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  ExternalLink, 
  Maximize2, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Camera, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function BrowserStreamPanel({ 
  currentScreenshot, 
  browserSteps, 
  currentReasoning,
  isRunning,
  onTriggerDemo 
}) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user selected a specific step to inspect, use that, otherwise show current
  const displayedStep = selectedStepIndex !== null && browserSteps[selectedStepIndex]
    ? browserSteps[selectedStepIndex]
    : browserSteps[browserSteps.length - 1] || null;

  const activeImage = displayedStep?.screenshot || currentScreenshot || "/static/screenshots/test-cli-run_step5_challan_generated.png";

  const stepLabels = [
    "1. Navigated Portal",
    "2. Populated Invoice",
    "3. Computed Tax",
    "4. Authorized Declarations",
    "5. Challan Generated"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Visual Browser-Use Feed</h2>
              {isRunning && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                  LIVE STREAM
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Autonomous Playwright Chromium on Mock GST Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:8000/static/mock_gst_portal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950/80 border border-slate-800 transition-all flex items-center gap-1 text-xs"
            title="Open Local Mock GST Portal in New Tab"
          >
            <span className="hidden md:inline">Open Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-950/80 border border-slate-800 transition-all"
            title="Enlarge Feed"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Stepper Progress Bar */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {stepLabels.map((lbl, idx) => {
          const isDone = browserSteps.length > idx;
          const isCurrent = browserSteps.length === idx + 1;
          const isInspecting = selectedStepIndex === idx;

          return (
            <button
              key={lbl}
              onClick={() => setSelectedStepIndex(browserSteps[idx] ? idx : null)}
              className={`p-1.5 rounded-lg text-center transition-all text-[10px] font-medium border truncate ${
                isInspecting
                  ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                  : isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 animate-pulse'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="truncate">{lbl}</div>
            </button>
          );
        })}
      </div>

      {/* Visual Viewport / Screen Feed */}
      <div className="relative flex-1 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center min-h-[360px] group">
        {/* Top Browser URL Bar Simulation */}
        <div className="w-full bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="flex-1 bg-slate-950/80 px-3 py-0.5 rounded text-[11px] font-mono text-slate-400 border border-slate-800/60 truncate flex items-center justify-between">
            <span>https://services.gst.gov.in/services/returns/gstr3b</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> SECURE
            </span>
          </div>
        </div>

        {/* Screenshot Image Frame */}
        <div className="relative w-full flex-1 flex items-center justify-center p-2 bg-slate-950 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0.4, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.3 }}
              src={activeImage}
              alt="Playwright Visual Automation Feed"
              className="max-h-full max-w-full object-contain rounded shadow-2xl border border-slate-800/60"
              onError={(e) => {
                e.target.src = "/static/screenshots/test_sample.png";
              }}
            />
          </AnimatePresence>

          {/* Computer-use visual pointer badge */}
          {isRunning && (
            <motion.div
              animate={{
                x: [0, 40, -30, 20, 0],
                y: [0, -25, 30, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute pointer-events-none flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-lg shadow-blue-500/40 border border-blue-400/40"
            >
              <Cpu className="w-3 h-3 text-sky-200" />
              <span>AI Cursor In Action</span>
            </motion.div>
          )}
        </div>

        {/* Overlay Agent Reasoning Box */}
        <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 p-3 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-0.5">
              <span>Agent Vision Reasoning:</span>
              <span className="text-slate-500 font-mono text-[10px]">
                {displayedStep?.timestamp || "READY"}
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              {displayedStep?.reasoning || currentReasoning || "Awaiting execution command. Ready to file GSTR-3B Challan on local mock portal."}
            </p>
          </div>
        </div>
      </div>

      {/* Enlarged Modal View */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Full Resolution Browser Feed
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-3 py-1 bg-slate-800 rounded-lg"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <img src={activeImage} alt="Enlarged feed" className="max-h-[75vh] object-contain rounded" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
