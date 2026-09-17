import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  UserCheck,
  AlertCircle,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'student',
    title: 'Student Scholar',
    name: 'Aarav Patel',
    email: 'student@pragati.edu',
    dept: 'Computer Science & Engineering',
    color: 'from-blue-600/30 to-blue-900/30 border-blue-500/40 hover:border-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: GraduationCap,
    desc: 'Submit achievements, view personal submissions & tracking'
  },
  {
    role: 'faculty',
    title: 'Faculty Member',
    name: 'Dr. Sunita Rao',
    email: 'faculty@pragati.edu',
    dept: 'Computer Science & Engineering',
    color: 'from-indigo-600/30 to-indigo-900/30 border-indigo-500/40 hover:border-indigo-400',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: Briefcase,
    desc: 'Submit faculty research, papers & institutional honors'
  },
  {
    role: 'verifier',
    title: 'Faculty Verifier',
    name: 'Prof. Vikram Mehta',
    email: 'verifier@pragati.edu',
    dept: 'Electrical Engineering (HOD)',
    color: 'from-emerald-600/30 to-emerald-900/30 border-emerald-500/40 hover:border-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: ShieldCheck,
    desc: 'Review evidence documents, approve & reject submissions with remarks'
  },
  {
    role: 'admin',
    title: 'Institutional Admin',
    name: 'Dr. Anita Desai',
    email: 'admin@pragati.edu',
    dept: 'Dean of Academic Affairs',
    color: 'from-purple-600/30 to-purple-900/30 border-purple-500/40 hover:border-purple-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Building2,
    desc: 'Institutional analytics, NAAC/NIRF reports, verifications & CSV export'
  }
];

export default function LoginPage({ onLoginSuccess, onExploreShowcase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your institutional email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate. Please check your credentials.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword('Pragati@2026');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: demoAccount.role })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to switch demo account.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-tr from-emerald-600/10 to-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Simple Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              Pragati <span className="text-blue-400">University</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Digital Achievement & Excellence Portal
            </p>
          </div>
        </div>

        <button
          onClick={onExploreShowcase}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Explore Public Showcase</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-2xl shadow-black/50">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Single Sign-On (SSO) Portal</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Institutional Login</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your university credentials or choose a quick demo profile to sign in.
              </p>

              {error && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleManualLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@pragati.edu"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <span className="text-[10px] text-blue-400 font-medium">Demo: Pragati@2026</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400">
                Are you a guest evaluator?{' '}
                <button
                  type="button"
                  onClick={onExploreShowcase}
                  className="text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  View Public Showcase
                </button>
              </p>
            </div>
          </div>

          {/* Right Column: Judge Demo Role Switcher */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Judge Demo Access Mode</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Hackathon Review
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Click any profile card below to sign in instantly with full role authorization. Evaluates Problem Statement 07 without manual typing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DEMO_ACCOUNTS.map((account) => {
                  const IconComponent = account.icon;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleQuickDemoLogin(account)}
                      disabled={loading}
                      className={`text-left p-4 rounded-2xl bg-gradient-to-br ${account.color} border transition-all duration-200 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${account.badgeColor}`}>
                            {account.title}
                          </span>
                          <IconComponent className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {account.name}
                        </h4>
                        <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                          {account.email}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {account.dept}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-300 font-medium">
                          1-Click Instant Login
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-normal">
                <strong className="text-slate-200 font-semibold">Security Note:</strong> All passwords are salted & hashed in SQLite using PBKDF2. Backend RBAC ensures strict route authorization per role.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-800/50">
        © 2026 MeritHub • Student & Faculty Achievement Platform
      </footer>
    </div>
  );
}
