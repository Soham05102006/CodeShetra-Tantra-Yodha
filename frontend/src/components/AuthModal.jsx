import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, User, X, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, logout, isLoading, authError } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    const res = await login(usernameOrEmail, password);
    if (res.success) {
      setSuccessMsg(`Welcome, ${res.user.full_name || res.user.username}!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'OWNER') {
      setUsernameOrEmail('sharma_owner');
      setPassword('Sharma@2026');
    } else {
      setUsernameOrEmail('ai_operator');
      setPassword('Operator@2026');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                AI-01 Security & Access
              </h3>
              <p className="text-xs text-slate-400">
                Sign in to authorize high-stakes GST filing and LiveKit operations.
              </p>
            </div>
          </div>

          {user ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#131b2e] border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Active User:</span>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    {user.role}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-100">{user.full_name}</div>
                <div className="text-xs text-slate-400 font-mono">@{user.username}</div>
              </div>

              <button
                onClick={() => {
                  logout();
                  if (onClose) onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Username or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="sharma_owner"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Quick Demo Credentials */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block mb-1.5 uppercase font-bold tracking-wider">
                  Quick Seeded MSME Accounts:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('OWNER')}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-left text-slate-300 transition cursor-pointer"
                  >
                    <div className="font-bold text-cyan-400">Owner (Admin)</div>
                    <div className="text-[10px] text-slate-500">Sharma@2026</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('OPERATOR')}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-left text-slate-300 transition cursor-pointer"
                  >
                    <div className="font-bold text-indigo-400">AI Operator</div>
                    <div className="text-[10px] text-slate-500">Operator@2026</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Authenticate Session'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

