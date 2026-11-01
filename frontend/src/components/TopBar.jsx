import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';
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
  Check,
  Menu
} from 'lucide-react';
import { useAppTheme, useAppLanguage } from '../context/ThemeLanguageContext.jsx';

export default function TopBar({ 
  activeNav = 'Operational Hub', 
  onOpenNotifications,
  onOpenSettings,
  onTriggerVoice,
  onTriggerBrowserDemo,
  onResetDemo,
  onToggleMobileMenu,
  isRunning = false
}) {
  const { theme, toggleTheme, isDark } = useAppTheme();
  const { language, setLanguage, t } = useAppLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
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
    <header className="h-14 border-b border-[#1a2335] bg-[#0c1017] px-3 sm:px-6 flex items-center justify-between select-none shrink-0 z-30 transition-colors">
      {/* Left: Mobile Menu Toggle + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#131926] border border-transparent hover:border-[#1e273a] transition-all shrink-0 cursor-pointer"
          title="Open Navigation"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="text-slate-500 hidden sm:inline">{t('dashboard', 'Dashboard')}</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[130px] sm:max-w-none">
            {t(activeNav, activeNav)}
          </span>
        </div>
      </div>

      {/* Right: Action Buttons & Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Quick Action: Voice Call */}
        <button
          onClick={onTriggerVoice}
          disabled={isRunning}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer"
          title="Trigger Vernacular Hindi/Hinglish Debt Recovery Call"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden md:inline">{t('voiceDispatch', 'Voice Dispatch')}</span>
        </button>

        {/* Quick Action: Portal Automation */}
        <button
          onClick={onTriggerBrowserDemo}
          disabled={isRunning}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#131926] hover:bg-[#1c2436] hover:text-white border border-[#1e273a] transition-all disabled:opacity-50 cursor-pointer"
          title="Directly Launch Playwright Visual Portal Automation"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="hidden md:inline">{t('portalAutomation', 'Portal Automation')}</span>
        </button>

        {/* Quick Action: Reset Demo */}
        <button
          onClick={onResetDemo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-[#131926] hover:bg-[#1c2436] border border-[#1e273a] transition-all cursor-pointer"
          title={t('resetDemo', 'Reset Demo')}
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#1e273a] mx-0.5 sm:mx-1 hidden xs:block"></div>

        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#131926] hover:bg-[#1c2436] text-slate-300 border border-[#1e273a] transition-all cursor-pointer"
            title="Change Interface Language"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400 shrink-0" />
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

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-[#131926] hover:bg-[#1c2436] border border-[#1e273a] transition-all cursor-pointer"
          title={isDark ? t('lightMode', 'Switch to Light Mode') : t('darkMode', 'Switch to Dark Mode')}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notification Icon */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131926] transition-all cursor-pointer"
          title={t('notifications', 'View Pending Circuit Breaker Approvals')}
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0c1017]"></span>
        </button>

        {/* Settings Icon */}
        <button 
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#131926] transition-all cursor-pointer"
          title={t('settings', 'Settings & Integrations')}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Profile / Auth Avatar */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-90 transition"
          title={isAuthenticated ? `Logged in as ${user?.full_name}` : "Click to Sign In"}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-cyan-500/20">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[11px] font-bold text-slate-200 leading-tight">
              {user ? (user.full_name?.split(' ')[0] || user.username) : 'Sign In'}
            </span>
            <span className="text-[9px] font-mono text-cyan-400 leading-tight">
              {user ? user.role : 'OPERATOR'}
            </span>
          </div>
        </button>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
