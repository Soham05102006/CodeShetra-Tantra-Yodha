import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag,
  FileText, 
  PhoneCall, 
  Clock, 
  Terminal, 
  Users, 
  Settings, 
  Activity,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeNav = 'Operational Hub', onNavSelect, pendingApprovalCount = 1 }) {
  const navItems = [
    { id: 'Operational Hub', label: 'Operational Hub', icon: LayoutDashboard },
    { id: 'E-Commerce', label: 'E-Commerce', icon: ShoppingBag, badge: 'STORE' },
    { id: 'Ledger & Invoices', label: 'Ledger & Invoices', icon: FileText },
    { id: 'Vernacular Calls', label: 'Vernacular Calls', icon: PhoneCall },
    { id: 'Approval Queue', label: 'Approval Queue', icon: Clock, badge: pendingApprovalCount > 0 ? pendingApprovalCount : null },
    { id: 'Audit Logs', label: 'Audit Logs', icon: Terminal },
    { id: 'Party Directory', label: 'Party Directory', icon: Users },
    { id: 'Configuration', label: 'Configuration', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0e131d] border-r border-[#1a2335] flex flex-col justify-between select-none shrink-0 min-h-screen">
      {/* Top Branding */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#1a2335]/60">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/20">
            S
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wider text-slate-100 uppercase">
              Sharma Enterprises
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                AI-EMPLOYEE
              </span>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          OPERATIONAL HUB
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavSelect && onNavSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#15233c] text-sky-400 border border-sky-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131926]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    item.badge === 'STORE'
                      ? 'bg-sky-950/70 text-sky-300 border-sky-700/60 font-semibold'
                      : 'bg-[#1c2436] text-slate-300 border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Profile */}
      <div className="p-4 border-t border-[#1a2335] space-y-4">
        {/* Agent Online Heartbeat */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 text-xs font-medium">Agent Online</span>
          </div>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#131926] border border-[#1e273c]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-semibold text-white">
              S
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#131926]">
              <MessageCircle className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200">Owner</div>
            <div className="text-[10px] text-slate-400 truncate">
              WhatsApp connected (+91 98765 43210)
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
