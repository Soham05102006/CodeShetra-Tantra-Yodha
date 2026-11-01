import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext.jsx';

export default function MetricsRow({ 
  totalInvoiced = '₹3,42,500', 
  unresolvedOverdue = '₹45,000', 
  completedCalls = '3 Today', 
  pendingApprovals = 1,
  onOpenApprovalQueue
}) {
  const { t } = useAppLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Invoiced */}
      <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-3.5 sm:p-4 shadow-sm transition-colors">
        <div className="text-[11px] font-medium text-slate-400 mb-1 sm:mb-1.5">
          {t('totalInvoiced', 'Total Invoiced')}
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 truncate">
          {totalInvoiced}
        </div>
      </div>

      {/* 2. Unresolved Overdue */}
      <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-3.5 sm:p-4 shadow-sm transition-colors">
        <div className="text-[11px] font-medium text-slate-400 mb-1 sm:mb-1.5">
          {t('unresolvedOverdue', 'Unresolved Overdue')}
        </div>
        <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 truncate">
          {unresolvedOverdue}
        </div>
      </div>

      {/* 3. Completed Call */}
      <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between transition-colors">
        <div className="min-w-0 pr-2">
          <div className="text-[11px] font-medium text-slate-400 mb-1 sm:mb-1.5">
            {t('completedCalls', 'Completed Calls')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 truncate">
            {completedCalls}
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Pending Approval */}
      <div 
        onClick={onOpenApprovalQueue}
        className={`bg-[#111622] border rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
          pendingApprovals > 0 
            ? 'border-amber-500/40 hover:border-amber-500/70 shadow-amber-500/5' 
            : 'border-[#1d2538]'
        }`}
      >
        <div className="min-w-0 pr-2">
          <div className="text-[11px] font-medium text-slate-400 mb-1 sm:mb-1.5">
            {t('pendingApprovals', 'Pending Approvals')}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-center gap-1.5 truncate">
            <span>{pendingApprovals} {t('pendingActions', 'Requests')}</span>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
