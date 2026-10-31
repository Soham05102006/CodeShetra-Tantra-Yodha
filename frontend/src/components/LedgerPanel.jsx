import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  PhoneCall, 
  Calendar, 
  IndianRupee, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Building2,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function LedgerPanel({ 
  transactions, 
  onTriggerVoiceForInvoice,
  onRunWorkflowForInvoice,
  activeInvoice 
}) {
  const [filter, setFilter] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'OVERDUE') return t.payment_status === 'OVERDUE';
    if (filter === 'PROMISED') return !!t.promised_payment_date;
    if (filter === 'PAID') return t.payment_status === 'PAID';
    return true;
  });

  const totalOverdue = transactions
    .filter(t => t.payment_status === 'OVERDUE')
    .reduce((acc, curr) => acc + curr.amount_due, 0);

  const totalCommitted = transactions
    .filter(t => !!t.promised_payment_date && t.payment_status !== 'PAID')
    .reduce((acc, curr) => acc + curr.amount_due, 0);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Ledger & Commitments</h2>
            <p className="text-xs text-slate-400">MSME Accounts Receivable & Voice Promises</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          {['ALL', 'OVERDUE', 'PROMISED', 'PAID'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Total Overdue
          </div>
          <div className="text-lg font-bold font-mono text-rose-400">
            ₹{totalOverdue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Voice Commitments
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            ₹{totalCommitted.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.map(item => {
            const isOverdue = item.payment_status === 'OVERDUE';
            const isPaid = item.payment_status === 'PAID';
            const isSelected = activeInvoice === item.invoice_number;

            return (
              <motion.div
                key={item.invoice_number}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSelected 
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-slate-950/50 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {item.entity_name}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.invoice_number} • {item.phone_number}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    isPaid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isOverdue
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {item.payment_status}
                  </span>
                </div>

                {/* Amount and Tax */}
                <div className="flex items-center justify-between text-xs py-2 border-y border-slate-800/60 my-2">
                  <span className="text-slate-400">Outstanding:</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-100 font-mono">
                      ₹{item.amount_due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5">
                      (GST ₹{item.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                    </span>
                  </div>
                </div>

                {/* Promised Date from Voice Call */}
                {item.promised_payment_date ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] font-medium">Vernacular Promise:</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {item.promised_payment_date}
                    </span>
                  </div>
                ) : (
                  isOverdue && (
                    <div className="text-[11px] text-rose-400/80 italic mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-400" />
                      No commitment recorded yet. Call pending.
                    </div>
                  )
                )}

                {/* Notes if available */}
                {item.notes && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 rounded p-1.5 mb-2 line-clamp-2">
                    {item.notes}
                  </div>
                )}

                {/* Action Shortcuts */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {!isPaid && (
                    <button
                      onClick={() => onTriggerVoiceForInvoice(item)}
                      className="px-2.5 py-1 rounded text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1 transition-all"
                    >
                      <PhoneCall className="w-3 h-3" />
                      Call Debtor
                    </button>
                  )}
                  <button
                    onClick={() => onRunWorkflowForInvoice(item.invoice_number)}
                    className="px-2.5 py-1 rounded text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 flex items-center gap-1 transition-all"
                  >
                    <span>Run AI Agent</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
