import React, { useState } from 'react';
import { MoreHorizontal, PhoneCall, Play, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext';

export default function LedgerTableCard({ 
  transactions = [], 
  onCallDebtor,
  onRunAgent,
  onActionMenu 
}) {
  const { t } = useAppLanguage();
  const [filter, setFilter] = useState('ALL');

  // Filter transactions
  const filtered = transactions.filter(t => {
    if (filter === 'OVERDUE') return t.payment_status === 'OVERDUE';
    if (filter === 'PROMISED') return !!t.promised_payment_date;
    if (filter === 'PAID') return t.payment_status === 'PAID';
    return true;
  });

  const displayRows = filtered.length > 0 ? filtered : [
    {
      entity_name: 'Sharma Metal Works',
      amount_due: 45000,
      dialect: 'Hindi',
      invoice_number: 'INV-2026-001',
      payment_status: 'OVERDUE',
      note: 'Call complete (promised tomorrow via UPI)'
    },
    {
      entity_name: 'Patel Precision Lathes',
      amount_due: 78500,
      dialect: 'Gujarati / Hindi',
      invoice_number: 'INV-2026-004',
      payment_status: 'OVERDUE',
      note: 'Promised Friday via NEFT'
    },
    {
      entity_name: 'Gupta Textile Mill Supplies',
      amount_due: 32000,
      dialect: 'Hindi',
      invoice_number: 'INV-2026-009',
      payment_status: 'PENDING',
      note: 'Committed over vernacular follow-up Nov 5th'
    }
  ];

  return (
    <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            {t('ledgerOutgoingComm', 'LEDGER & OUTGOING COMM')}
          </h3>
          <span className="text-[11px] font-mono text-slate-500 bg-[#0c1017] px-2 py-0.5 rounded border border-[#1e273a]">
            {displayRows.length} {t('records', 'Records')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <div className="flex bg-[#0c1017] p-0.5 rounded-lg border border-[#1e273a] text-[10px]">
            {['ALL', 'OVERDUE', 'PROMISED', 'PAID'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  filter === tab 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(tab, tab)}
              </button>
            ))}
          </div>

          <button 
            onClick={onActionMenu}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1c2436] text-[11px] text-slate-400 font-medium">
              <th className="py-2.5 font-normal">{t('partyCustomer', 'Party / Customer')}</th>
              <th className="py-2.5 font-normal">{t('amountDue', 'Amount Due')}</th>
              <th className="py-2.5 font-normal">{t('dialectLanguage', 'Dialect / Language')}</th>
              <th className="py-2.5 font-normal">{t('promisedDate', 'Dynamic Note / Promise')}</th>
              <th className="py-2.5 font-normal text-right">{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#182030]">
            {displayRows.map((row, idx) => {
              const amountStr = typeof row.amount_due === 'number' 
                ? `₹${row.amount_due.toLocaleString('en-IN')}` 
                : (row.amount_due || '₹45,000');

              const isPaid = row.payment_status === 'PAID';
              const isOverdue = row.payment_status === 'OVERDUE';

              return (
                <tr key={idx} className="hover:bg-[#141b2a] transition-colors group">
                  <td className="py-3 text-slate-200 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{row.entity_name || 'Sharma Metal Works'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({row.invoice_number})
                      </span>
                    </div>
                  </td>

                  <td className="py-3 font-mono text-slate-300 font-semibold">
                    {amountStr}
                  </td>

                  <td className="py-3 text-slate-400">
                    <span className="bg-[#141b29] px-2 py-0.5 rounded text-[10px] text-slate-300 border border-[#202b40]">
                      {t(row.dialect || 'Hindi', row.dialect || 'Hindi')}
                    </span>
                  </td>

                  <td className="py-3 text-slate-300 max-w-xs">
                    {row.promised_payment_date ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{t('promised', 'Promised')}: {row.promised_payment_date}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 truncate block">
                        {t(row.note || row.notes || 'Call complete (promised tomorrow via UPI)', row.note || row.notes || 'Call complete (promised tomorrow via UPI)')}
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isPaid && (
                        <button
                          onClick={() => onCallDebtor && onCallDebtor(row)}
                          className="px-2 py-1 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-1 transition-all cursor-pointer"
                          title="Trigger Outbound Hindi/Hinglish Recovery Call"
                        >
                          <PhoneCall className="w-2.5 h-2.5" />
                          <span>{t('callDebtor', 'Call')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => onRunAgent && onRunAgent(row.invoice_number)}
                        className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer border ${
                          isPaid 
                            ? 'bg-slate-800 text-slate-400 border-slate-700' 
                            : 'bg-blue-600/15 text-blue-400 hover:bg-blue-600/30 border-blue-500/30'
                        }`}
                        title="Run Autonomous MSME Agent Workflow"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{isPaid ? t('paid', 'Filed') : t('automate', 'Run Agent')}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
