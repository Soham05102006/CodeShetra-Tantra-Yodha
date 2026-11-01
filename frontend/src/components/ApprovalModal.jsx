import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  MessageSquare, 
  Check, 
  X, 
  Send, 
  Smartphone, 
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext';

export default function ApprovalModal({ 
  pendingApproval, 
  onResolveApproval, 
  onClose,
  isResolving 
}) {
  const { t } = useAppLanguage();
  const [customReply, setCustomReply] = useState('');

  if (!pendingApproval) return null;

  const payload = (() => {
    try {
      if (typeof pendingApproval.payload === 'object' && pendingApproval.payload !== null) {
        return pendingApproval.payload;
      }
      return JSON.parse(pendingApproval.payload || '{}');
    } catch {
      return {};
    }
  })();

  const handleSimulateReply = (decision) => {
    onResolveApproval(pendingApproval.approval_id, pendingApproval.thread_id, decision);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customReply.trim()) return;
    const isApprove = customReply.toUpperCase().includes('APPROVE');
    onResolveApproval(
      pendingApproval.approval_id, 
      pendingApproval.thread_id, 
      isApprove ? 'APPROVED' : 'REJECTED'
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="max-w-xl w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 relative overflow-hidden"
      >
        {/* Top-Right Dismiss Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Amber glowing bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {t('langGraphInterrupt', 'LangGraph Human-In-The-Loop Interrupt')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {t('whatsappCircuitBreakerTriggered', 'WhatsApp Circuit Breaker Triggered')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('gstSubmissionPaused', 'Statutory GST portal submission paused pending business owner authorization.')}
            </p>
          </div>
        </div>

        {/* Action Description Box */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-4 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">{t('actionType', 'Action Type:')}</span>
            <span className="font-mono font-semibold text-sky-400">{pendingApproval.action_type}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">{t('targetMsme', 'Target MSME:')}</span>
            <span className="font-semibold text-white">{payload.entity_name || 'Sharma Metal Works'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">{t('taxLiabilityAmount', 'Tax Liability Amount:')}</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              ₹{payload.tax_amount ? Number(payload.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '8,100.00'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-900 text-slate-400 italic">
            "{pendingApproval.description}"
          </div>
        </div>

        {/* Twilio WhatsApp Chat Simulation Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-3.5 mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
            <Smartphone className="w-4 h-4" />
            <span>{t('twilioGate', 'Twilio WhatsApp Sandbox Gate')}</span>
            <span className="text-[10px] text-slate-400 ml-auto font-mono">Sandbox: +1 415 523 8886</span>
          </div>

          <div className="bg-slate-950/90 rounded-lg p-3 text-xs text-slate-300 border border-slate-800 space-y-2 font-mono">
            <div className="text-emerald-400 font-semibold text-[11px]">
              AI-01 Bot:
            </div>
            <div className="text-[11px] leading-relaxed">
              ⚠️ Attention Sharma Enterprises: GSTR-3B Challan of ₹{payload.tax_amount || '8,100'} is prepared for filing on GST portal. Reply <strong>APPROVE {pendingApproval.thread_id?.slice(-8)}</strong> to submit or <strong>REJECT {pendingApproval.thread_id?.slice(-8)}</strong> to cancel.
            </div>
          </div>
        </div>

        {/* Quick Action Simulation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSimulateReply('REJECTED')}
            disabled={isResolving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
            {t('rejectAbort', 'Reject & Abort')}
          </button>

          <button
            onClick={() => handleSimulateReply('APPROVED')}
            disabled={isResolving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {t('authorizeWhatsappGate', 'Authorize via WhatsApp Gate')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
