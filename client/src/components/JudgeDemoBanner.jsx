import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Building2,
  Check,
  HelpCircle
} from 'lucide-react';

const DEMO_ROLES = [
  {
    role: 'student',
    label: 'Student',
    name: 'Aarav Patel',
    icon: GraduationCap,
    badgeBg: 'bg-blue-600/30 text-blue-300 border-blue-500/40 hover:bg-blue-600/50'
  },
  {
    role: 'faculty',
    label: 'Faculty',
    name: 'Dr. Sunita Rao',
    icon: Briefcase,
    badgeBg: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/50'
  },
  {
    role: 'verifier',
    label: 'Verifier',
    name: 'Prof. Vikram Mehta',
    icon: ShieldCheck,
    badgeBg: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/50'
  },
  {
    role: 'admin',
    label: 'Admin',
    name: 'Dr. Anita Desai',
    icon: Building2,
    badgeBg: 'bg-purple-600/30 text-purple-300 border-purple-500/40 hover:bg-purple-600/50'
  }
];

export default function JudgeDemoBanner({
  currentUser,
  onSwitchRole,
  switching = false,
  onOpenTour
}) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-b border-indigo-500/30 text-slate-200 text-xs py-2 px-4 shadow-md sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div className="flex items-center gap-1.5 font-bold tracking-wide text-amber-300 text-[11px] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge Demo Switcher:</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            1-Click role switching for hackathon evaluation
          </span>
        </div>

        {/* Quick Role Switcher Buttons & Quick Tour Guide */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
          {DEMO_ROLES.map((item) => {
            const Icon = item.icon;
            const isActive = currentUser?.role === item.role;
            return (
              <button
                key={item.role}
                type="button"
                disabled={switching}
                onClick={() => onSwitchRole(item.role)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20 ring-2 ring-amber-400/30 font-bold'
                    : `${item.badgeBg}`
                }`}
                title={`Switch active demo session to ${item.name}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : ''}`} />
                <span>{item.label}</span>
                {isActive && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
              </button>
            );
          })}

          {onOpenTour && (
            <button
              type="button"
              onClick={onOpenTour}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer shrink-0"
              title="Open 3-minute hackathon evaluation guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tour Guide</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
