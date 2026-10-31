import React from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  PhoneCall, 
  Globe, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';

export default function TopBar({ 
  activeNav = 'Operational Hub', 
  onOpenNotifications,
  onOpenSettings,
  onTriggerVoice,
  onTriggerBrowserDemo,
  onResetDemo,
  isRunning = false
}) {
  return (
    <header className="h-14 border-b border-[#1a2335] bg-[#0c1017] px-6 flex items-center justify-between select-none shrink-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Dashboard</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-semibold">{activeNav}</span>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Action: Voice Call */}
        <button
          onClick={onTriggerVoice}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer"
          title="Trigger Vernacular Hindi/Hinglish Debt Recovery Call"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Voice Dispatch</span>
        </button>

        {/* Quick Action: Portal Automation */}
        <button
          onClick={onTriggerBrowserDemo}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer"
          title="Directly Launch Playwright Visual Portal Automation"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Portal Automation</span>
        </button>

        {/* Quick Action: Reset Demo */}
        <button
          onClick={onResetDemo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-[#131926] hover:bg-[#1c2436] border border-[#1e273a] transition-all cursor-pointer"
          title="Reset Database to Clean Demo State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#1e273a] mx-1"></div>

        {/* Notification Icon */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131926] transition-all cursor-pointer"
          title="View Pending Circuit Breaker Approvals"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0c1017]"></span>
        </button>

        {/* Settings Icon */}
        <button 
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131926] transition-all cursor-pointer"
          title="Settings & Integrations"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-indigo-600 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white ml-1">
          S
        </div>
      </div>
    </header>
  );
}
