import React from 'react';
import { Check, Play, Pause, CircleDot, Circle } from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext';

export default function LiveWorkflowBar({ 
  workflowStatus = 'RUNNING WEB AUTOMATION',
  activeStep = 3, // 0: Ingest, 1: Reconcile, 2: Voice, 3: GST Portal Filing, 4: Verify
  isRunning = true,
  onPlay,
  onPause,
  onStepClick
}) {
  const { t } = useAppLanguage();

  const steps = [
    { id: 'ingest', label: t('invoiceIngest', 'Invoice Ingest') },
    { id: 'reconcile', label: t('reconcile', 'Reconcile') },
    { id: 'voice', label: t('voiceFollowUp', 'Voice Follow-Up') },
    { id: 'gst', label: t('gstPortalFiling', 'GST Portal Filing') },
    { id: 'verify', label: t('verify', 'Verify') },
  ];

  const getStatusColor = () => {
    if (workflowStatus.includes('AWAITING') || workflowStatus.includes('APPROVAL')) {
      return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25';
    }
    if (workflowStatus.includes('RUNNING')) {
      return 'bg-[#0284c7] hover:bg-sky-600 shadow-sky-500/25';
    }
    if (workflowStatus.includes('COMPLETED') || workflowStatus.includes('COMPLETE')) {
      return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25';
    }
    return 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25';
  };

  return (
    <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-black/20">
      {/* Left Pipeline Flow */}
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-100 mb-2.5">
          {t('liveWorkflowMonthEnd', 'Live Workflow: Month-End Close')}
        </h2>

        {/* Stepper Steps */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            const isPending = idx > activeStep;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && <span className="text-slate-600 font-bold">→</span>}

                {isCompleted && (
                  <button
                    onClick={() => onStepClick && onStepClick(idx)}
                    className="flex items-center gap-1.5 text-slate-300 font-medium hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{step.label}</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </button>
                )}

                {isCurrent && (
                  <button
                    onClick={() => onStepClick && onStepClick(idx)}
                    className="flex items-center gap-1.5 text-sky-400 font-semibold px-2.5 py-1 rounded-full bg-[#15233c] border border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)] cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                    <span>{step.label}</span>
                  </button>
                )}

                {isPending && (
                  <button
                    onClick={() => onStepClick && onStepClick(idx)}
                    className="flex items-center gap-1.5 text-slate-500 font-normal hover:text-slate-400 transition-colors cursor-pointer"
                  >
                    <span>{step.label}</span>
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 bg-slate-800"></span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
        {/* Status Pill Button */}
        <div className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white tracking-wider uppercase shadow-md flex items-center gap-2 transition-all cursor-pointer ${getStatusColor()}`}>
          <span>{t('status', 'STATUS')}: {t(workflowStatus, workflowStatus)}</span>
        </div>

        {/* Play Action */}
        <button
          onClick={onPlay}
          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 active:scale-95"
          title={t('runAutonomousCycle', 'Run Autonomous Cycle')}
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        {/* Pause Action */}
        <button
          onClick={onPause}
          className="w-9 h-9 rounded-xl bg-[#172030] hover:bg-[#1f2b40] text-slate-400 hover:text-white border border-[#232e44] flex items-center justify-center transition-all active:scale-95"
          title={t('pauseExecution', 'Pause Execution')}
        >
          <Pause className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
}
