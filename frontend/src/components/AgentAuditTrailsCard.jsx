import React from 'react';
import { Check, CheckCircle2, AlertTriangle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext';

export default function AgentAuditTrailsCard({ logs = [] }) {
  const { t } = useAppLanguage();

  // Format real logs if available
  const formattedLogs = logs.length > 0 ? logs.slice(0, 5).map(log => {
    const timeStr = log.timestamp ? log.timestamp.split('T')[1]?.substring(0, 5) || log.timestamp.substring(11, 16) || '16:48' : '16:48';
    
    let tag = 'BROWSER';
    let tagColor = 'bg-slate-700/30 text-slate-400 border border-slate-600/30';
    let rightBadge = 'Check';
    let rightColor = 'text-slate-400';
    let rightIcon = null;

    if (log.step_name.includes('ingest')) {
      tag = 'INGEST';
      tagColor = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      rightBadge = 'Green';
      rightColor = 'text-emerald-400';
    } else if (log.step_name.includes('call') || log.step_name.includes('voice')) {
      tag = 'CALL';
      tagColor = 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      rightBadge = 'Check';
      rightColor = 'text-blue-400';
    } else if (log.step_name.includes('circuit_breaker') || log.step_name.includes('approval_wait')) {
      tag = 'CIRCUIT BREAKER';
      tagColor = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      rightIcon = <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />;
    } else if (log.step_name.includes('approval') || log.execution_status === 'APPROVED') {
      tag = 'APPROVAL';
      tagColor = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      rightIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    } else if (log.execution_status === 'IN_PROGRESS') {
      rightIcon = <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />;
    }

    return {
      time: timeStr,
      tag,
      tagColor,
      rightBadge,
      rightColor,
      rightIcon,
      text: log.agent_reasoning
    };
  }) : null;

  // Fallback items matching screenshot exactly if no live logs yet
  const defaultTrails = [
    {
      time: '16:44',
      tag: 'INGEST',
      tagColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      rightBadge: 'Green',
      rightColor: 'text-emerald-400',
      text: 'Invoice INV-025 extracted via Gemini 2.0.'
    },
    {
      time: '16:45',
      tag: 'CALL',
      tagColor: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      rightBadge: 'Check',
      rightColor: 'text-blue-400',
      text: 'Placed Hindi outbound voice call to Suresh. Agreed for ₹15,000 UPI.'
    },
    {
      time: '16:46',
      tag: 'CIRCUIT BREAKER',
      tagColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      rightBadge: 'Check',
      rightIcon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />,
      rightColor: 'text-amber-400',
      text: 'Sent WhatsApp approval ping to Owner'
    },
    {
      time: '16:47',
      tag: 'APPROVAL',
      tagColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      rightIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      rightColor: 'text-emerald-400',
      text: 'Received WhatsApp OK (Approved) from Owner. Resuming browser automation.'
    },
    {
      time: '16:48',
      tag: 'BROWSER',
      tagColor: 'bg-slate-700/30 text-slate-400 border border-slate-600/30',
      rightIcon: <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />,
      rightColor: 'text-slate-400',
      text: 'Input GST IN data on Mock Portal.'
    }
  ];

  const displayTrails = formattedLogs || defaultTrails;

  return (
    <div className="bg-[#111622] border border-[#1d2538] rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4">
          {t('autonomousAgentAuditTrails', 'AGENT AUDIT TRAILS (LIVE)')}
        </h3>

        {/* Timeline Items */}
        <div className="space-y-4">
          {displayTrails.map((trail, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              {/* Timestamp */}
              <span className="text-[11px] font-mono text-slate-500 pt-0.5 shrink-0">
                {trail.time}
              </span>

              {/* Dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${trail.tagColor}`}>
                    {t(trail.tag, trail.tag)}
                  </span>

                  {trail.rightIcon ? (
                    <span>{trail.rightIcon}</span>
                  ) : (
                    <span className={`text-[10px] font-medium ${trail.rightColor}`}>
                      {trail.rightBadge}
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {t(trail.text, trail.text)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Interrupt Resolved Card */}
      <div className="mt-5 p-3 rounded-xl bg-[#171d2b] border border-[#243046] relative overflow-hidden">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-md bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-200 tracking-wide">
              {t('actionDetails', 'ACTION INTERRUPT - RESOLVED')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              Approval for GST submittted via WhatsApp (Thread: th-12041)
            </div>
            <div className="text-[10px] font-semibold text-emerald-400 mt-1">
              {t('status', 'Status')}: {t('MONTH-END CLOSE COMPLETE', 'RESUMED')}
            </div>
          </div>

          <Sparkles className="w-4 h-4 text-slate-500/60 shrink-0 self-end" />
        </div>
      </div>
    </div>
  );
}
