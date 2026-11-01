import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Lock, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppLanguage } from '../context/ThemeLanguageContext';

export default function LiveComputerUseCard({ 
  screenshotUrl,
  browserSteps = [],
  currentAction = 'Filling out Form ITC ₹42,500...',
  subAction = 'Action Logs...',
  currentReasoning = '',
  isRunning = false,
  onSubmitFiling,
  onActionMenu
}) {
  const { t } = useAppLanguage();
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [activeTab, setActiveTab] = useState(screenshotUrl || browserSteps.length > 0 ? 'capture' : 'form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If new screenshot arrives, automatically switch to live capture tab
  React.useEffect(() => {
    if (screenshotUrl || browserSteps.length > 0) {
      setActiveTab('capture');
    }
  }, [screenshotUrl, browserSteps.length]);

  const displayedStep = selectedStepIndex !== null && browserSteps[selectedStepIndex]
    ? browserSteps[selectedStepIndex]
    : browserSteps[browserSteps.length - 1] || null;

  const activeImage = displayedStep?.screenshot 
    ? (displayedStep.screenshot.startsWith('http') ? displayedStep.screenshot : `http://localhost:8000${displayedStep.screenshot}`)
    : screenshotUrl || '/static/screenshots/test-cli-run_step5_challan_generated.png';

  const stepLabels = [
    '1. Portal',
    '2. Invoice',
    '3. Turnover',
    '4. Declaration',
    '5. Challan'
  ];

  const handleClickSubmit = () => {
    setIsSubmitting(true);
    if (onSubmitFiling) onSubmitFiling();
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            {t('liveAgentComputerUse', 'LIVE AGENT COMPUTER-USE')}
          </h3>
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              {t('automatingPortal', 'AUTOMATING PORTAL')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-[#0c1017] p-0.5 rounded-lg border border-[#1e273a] text-[11px]">
            <button
              onClick={() => setActiveTab('capture')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeTab === 'capture'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('liveCapture', 'Live Capture')}
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('formDetails', 'Form UI')}
            </button>
          </div>

          <a
            href="http://localhost:8000/static/mock_gst_portal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-[#161d2b] px-2 py-1 rounded border border-[#232e44] transition-all"
            title="Open Live Mock GST Portal in New Tab"
          >
            <span>{t('portalAutomation', 'Open Portal')}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button 
            onClick={onActionMenu}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Red Glowing Browser Container */}
      <div className="relative rounded-xl border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)] overflow-hidden bg-[#0c1017] min-h-[340px] flex flex-col">
        {/* Browser Top Chrome */}
        <div className="bg-[#161d2b] border-b border-[#222c40] px-3 py-2 flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90"></span>
          </div>

          <span className="text-slate-400 text-xs font-mono font-medium">GST Return Oct 2026</span>
          <span className="text-slate-600 text-xs">+</span>

          {/* URL Address Bar */}
          <div className="flex-1 max-w-[160px] sm:max-w-md mx-auto bg-[#0d121c] rounded-md px-2 py-1 text-[10px] sm:text-[11px] font-mono text-slate-400 flex items-center gap-1.5 border border-[#1e273a] truncate">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="truncate">virtual.browser.com/screenshot/GST_Return_Oct_2026</span>
          </div>

          {/* Step Stepper Badges (if in capture mode and steps exist) */}
          {activeTab === 'capture' && (
            <div className="hidden sm:flex items-center gap-1 text-[10px]">
              {stepLabels.map((lbl, idx) => {
                const isSelected = selectedStepIndex === idx;
                const isAvailable = !!browserSteps[idx];
                return (
                  <button
                    key={lbl}
                    onClick={() => isAvailable && setSelectedStepIndex(idx)}
                    disabled={!isAvailable}
                    className={`px-1.5 py-0.5 rounded transition-all font-mono ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : isAvailable
                        ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Browser Content Area */}
        <div className="relative flex-1 bg-[#243352] p-4 flex flex-col justify-center items-center overflow-hidden">
          {activeTab === 'capture' ? (
            /* Live Playwright Screenshot Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={activeImage}
                alt="Live Playwright Browser View"
                className="max-h-[300px] w-auto max-w-full object-contain rounded shadow-2xl border border-slate-700/60"
                onError={(e) => {
                  e.target.src = '/static/screenshots/test_sample.png';
                }}
              />
            </div>
          ) : (
            /* Mock GST Form Display (Pixel-match to user screenshot) */
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-xl mx-auto w-full text-slate-800">
              {/* Blue Banner */}
              <div className="bg-[#1d4ed8] text-white text-center py-2.5 font-bold text-sm tracking-wide">
                GST Return Oct 2026
              </div>

              {/* Sub-bar */}
              <div className="bg-[#f8fafc] px-4 py-1.5 border-b border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                <span>GST Return &gt; GST Filing</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <input type="checkbox" checked readOnly className="accent-blue-600 rounded" />
                  Return and Oct 2026
                </span>
              </div>

              {/* Form Fields */}
              <div className="p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700">
                  Please sure you contect the GST Return
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Your name <span className="text-rose-500">*</span>
                    </label>
                    <select className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700">
                      <option>GST Return Oct 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Filing name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value="₹42,500"
                      readOnly
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={handleClickSubmit}
                    className="bg-[#1d4ed8] hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded shadow-md transition-all active:scale-95 cursor-pointer relative"
                  >
                    {isSubmitting ? 'Filing GSTR-3B...' : t('executeGstChallanFiling', 'Submit Filing')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Log Bubble */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#111724]/95 border border-slate-700/80 rounded-xl p-2 sm:p-3 shadow-2xl backdrop-blur-md text-[10px] sm:text-xs max-w-[190px] sm:max-w-xs pointer-events-none z-10">
            <div className="font-semibold text-slate-200">
              {t(displayedStep?.reasoning || currentReasoning || currentAction, displayedStep?.reasoning || currentReasoning || currentAction)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {t(subAction, subAction)}
            </div>
          </div>

          {/* Yellow Pointer Cursor on Submit Button */}
          {activeTab === 'form' && (
            <div className="absolute bottom-10 right-[25%] pointer-events-none flex items-center justify-center">
              <div className="relative">
                {/* Soft yellow glow */}
                <div className="w-10 h-10 rounded-full bg-yellow-400/40 blur-md absolute -top-2 -left-2 animate-pulse"></div>
                {/* Yellow Pointer Arrow */}
                <svg 
                  className="w-7 h-7 text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.8)] fill-yellow-400 stroke-black stroke-2" 
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
