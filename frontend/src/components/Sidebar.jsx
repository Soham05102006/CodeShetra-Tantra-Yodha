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
  ShieldCheck,
  X
} from 'lucide-react';
import { useAppLanguage } from '../context/ThemeLanguageContext.jsx';

export default function Sidebar({ 
  activeNav = 'Operational Hub', 
  onNavSelect, 
  pendingApprovalCount = 1,
  isMobileOpen = false,
  onCloseMobile
}) {
  const { t } = useAppLanguage();

  const navItems = [
    { id: 'Operational Hub', label: t('operationalHub', 'Operational Hub'), icon: LayoutDashboard },
    { id: 'E-Commerce', label: t('ecommerce', 'E-Commerce'), icon: ShoppingBag, badge: 'STORE' },
    { id: 'Ledger & Invoices', label: t('ledgerInvoices', 'Ledger & Invoices'), icon: FileText },
    { id: 'Vernacular Calls', label: t('vernacularCalls', 'Vernacular Calls'), icon: PhoneCall },
    { id: 'WhatsApp Dispatcher', label: t('whatsappDispatcher', 'WhatsApp Dispatcher'), icon: MessageCircle, badge: 'FREE' },
    { id: 'Approval Queue', label: t('approvalQueue', 'Approval Queue'), icon: Clock, badge: pendingApprovalCount > 0 ? pendingApprovalCount : null },
    { id: 'Audit Logs', label: t('auditLogs', 'Audit Logs'), icon: Terminal },
    { id: 'Party Directory', label: t('partyDirectory', 'Party Directory'), icon: Users },
    { id: 'Configuration', label: t('configuration', 'Configuration'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0e131d] border-r border-[#1a2335] flex flex-col justify-between select-none shrink-0 h-full overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        {/* Top Branding */}
        <div>
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1a2335]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/20 shrink-0">
                S
              </div>
              <div className="min-w-0">
                <h1 className="text-xs font-bold tracking-wider text-slate-100 uppercase truncate">
                  {t('companyName', 'Sharma Enterprises')}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                    {t('aiEmployee', 'AI-EMPLOYEE')}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c2e] transition-colors"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Label */}
          <div className="px-5 pt-4 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            {t('operationalHubSection', 'OPERATIONAL HUB')}
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onNavSelect) onNavSelect(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
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
        <div className="p-4 border-t border-[#1a2335] space-y-3">
          {/* Agent Online Heartbeat */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 text-xs font-medium">{t('agentOnline', 'Agent Online')}</span>
            </div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>

          {/* User Card */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#131926] border border-[#1e273c]">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-semibold text-white">
                S
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#131926]">
                <MessageCircle className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">{t('owner', 'Owner')}</div>
              <div className="text-[10px] text-slate-400 truncate">
                {t('whatsappConnected', 'WhatsApp connected')} (+91 98765 43210)
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
