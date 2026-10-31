import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  PhoneCall, 
  Globe, 
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Languages,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAppTheme, useAppLanguage } from '../context/ThemeLanguageContext.jsx';

export default function TopBar({ 
  activeNav = 'Operational Hub', 
  onOpenNotifications,
  onOpenSettings,
  onTriggerVoice,
  onTriggerBrowserDemo,
  onResetDemo,
  isRunning = false
}) {
  const { theme, toggleTheme, isDark } = useAppTheme();
  const { language, setLanguage, t } = useAppLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions = [
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', short: 'HI', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', short: 'MR', flag: '🚩' }
  ];

  const currentLang = languageOptions.find((l) => l.code === language) || languageOptions[0];

  return (
    <header className="h-14 border-b border-[#1a2335] bg-[#0c1017] px-6 flex items-center justify-between select-none shrink-0 z-30 transition-colors">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">{t('dashboard', 'Dashboard')}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-200 font-semibold">{t(activeNav.replace(/[^a-zA-Z]/g, ''), activeNav)}</span>
      </div>

      {/* Action Buttons & Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Action: Voice Call */}
        <button
          onClick={onTriggerVoice}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer"
          title="Trigger Vernacular Hindi/Hinglish Debt Recovery Call"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{t('voiceDispatch', 'Voice Dispatch')}</span>
        </button>

        {/* Quick Action: Portal Automation */}
        <button
          onClick={onTriggerBrowserDemo}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer"
          title="Directly Launch Playwright Visual Portal Automation"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">{t('portalAutomation', 'Portal Automation')}</span>
        </button>

        {/* Quick Action: Reset Demo */}
        <button
          onClick={onResetDemo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-[#131926] hover:bg-[#1c2436] border border-[#1e273a] transition-all cursor-pointer"
          title={t('resetDemo', 'Reset Demo')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#1e273a] mx-1"></div>

        {/* ========================================================
            1. LANGUAGE SELECTOR (English, Hindi, Marathi)
            ======================================================== */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#131926] hover:bg-[#1c2436] text-slate-300 border border-[#1e273a] transition-all cursor-pointer"
            title="Change Interface Language (English / हिन्दी / मराठी)"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-[11px]">{currentLang.short}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#111726] border border-[#1e273c] shadow-2xl py-1 z-50 text-xs overflow-hidden animate-in fade-in">
              <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider border-b border-[#1e273c]/60">
                {t('language', 'Language')}
              </div>
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#182136] transition-colors ${
                    language === opt.code
                      ? 'text-sky-400 font-bold bg-sky-500/10'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </div>
                  {language === opt.code && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            2. THEME TOGGLE (Dark Mode / Light Mode)
            ======================================================== */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-[#131926] hover:bg-[#1c2436] border border-[#1e273a] transition-all cursor-pointer"
          title={isDark ? t('lightMode', 'Switch to Light Mode') : t('darkMode', 'Switch to Dark Mode')}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400 hover:-rotate-12 transition-transform" />
          )}
        </button>

        <div className="h-4 w-[1px] bg-[#1e273a] mx-1"></div>

        {/* Notification Icon */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131926] transition-all cursor-pointer"
          title={t('notifications', 'View Pending Circuit Breaker Approvals')}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0c1017]"></span>
        </button>

        {/* Settings Icon */}
        <button 
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131926] transition-all cursor-pointer"
          title={t('settings', 'Settings & Integrations')}
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
