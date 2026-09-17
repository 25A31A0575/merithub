import React from 'react';
import {
  Award,
  CheckSquare,
  FileText,
  PlusCircle,
  ShieldCheck,
  Trophy,
  LogOut,
  User,
  LogIn,
  GraduationCap,
  Briefcase,
  Building2
} from 'lucide-react';

export default function Navbar({
  currentView,
  onViewChange,
  pendingCount = 0,
  currentUser = null,
  onLogout
}) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          label: 'Student',
          icon: GraduationCap
        };
      case 'faculty':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          label: 'Faculty',
          icon: Briefcase
        };
      case 'verifier':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
          label: 'Faculty Verifier',
          icon: ShieldCheck
        };
      case 'admin':
        return {
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/40',
          label: 'Institutional Admin',
          icon: Building2
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          label: 'Guest',
          icon: User
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);
  const RoleIcon = roleInfo.icon;

  const isVerifier = currentUser?.role === 'verifier' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'verifier';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div
          onClick={() => onViewChange('showcase')}
          className="flex items-center gap-3 cursor-pointer shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-white">
                Merit<span className="text-blue-400">Hub</span>
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Portal
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide hidden sm:block">
              Student & Faculty Achievement Platform
            </p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Public Showcase */}
          <button
            onClick={() => onViewChange('showcase')}
            className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-xl transition-all cursor-pointer ${
              currentView === 'showcase'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Showcase
          </button>

          {/* My Submissions */}
          <button
            onClick={() => onViewChange('my-submissions')}
            className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'my-submissions'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">My Submissions</span>
            <span className="sm:hidden">Mine</span>
          </button>

          {/* Verifier Review Desk Tab */}
          <button
            onClick={() => onViewChange('verifier')}
            className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'verifier'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Verifier Desk</span>
            <span className="md:hidden">Verifier</span>
            {pendingCount > 0 && isVerifier && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Analytics & Reports Tab */}
          <button
            onClick={() => onViewChange('analytics')}
            className={`text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              currentView === 'analytics'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Analytics</span>
          </button>

          {/* Submit Achievement Action */}
          <button
            onClick={() => onViewChange('submit')}
            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md ${
              currentView === 'submit'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Submit</span>
          </button>
        </nav>

        {/* Right: Authenticated User & Logout */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-white max-w-[140px] truncate">
                    {currentUser.name}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${roleInfo.bg}`}>
                    <RoleIcon className="w-2.5 h-2.5" />
                    {roleInfo.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                  {currentUser.department}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Logout from session"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-950/40 hover:border-rose-500/40 border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onViewChange('login')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-md shadow-blue-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
