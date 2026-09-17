import React from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';

export default function AccessDenied({
  currentUser,
  requiredRoleLabel = 'Faculty Verifier',
  targetViewName = 'Protected Portal Section',
  onBackToShowcase,
  onSwitchRole
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Access Restricted • Role Authorization Guard</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1 mb-2">
          {requiredRoleLabel} Permission Required
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          You are currently signed in as{' '}
          <strong className="text-white font-semibold">{currentUser?.name || 'Guest'}</strong> (
          <span className="text-blue-400 font-bold uppercase">{currentUser?.role || 'User'}</span>
          ). This institutional section (<span className="text-amber-300 font-medium">{targetViewName}</span>) is restricted to <strong className="text-white font-semibold">{requiredRoleLabel}</strong> accounts only.
        </p>

        {/* Institutional RBAC Explainer */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left mb-6 text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Institutional Trust & Verification Policy:</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            To prevent fraud and maintain accreditation compliance, students and unauthorized users cannot approve, reject, or scrutinize submissions.
          </p>
        </div>

        {/* Judge Demo Quick Resolution */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-[11px] text-amber-300 font-semibold mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Demo Shortcut — Switch role instantly to evaluate this view:</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {requiredRoleLabel.toLowerCase().includes('verifier') && (
              <button
                type="button"
                onClick={() => onSwitchRole('verifier')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Switch to Verifier (Prof. Vikram)</span>
              </button>
            )}

            {requiredRoleLabel.toLowerCase().includes('admin') && (
              <button
                type="button"
                onClick={() => onSwitchRole('admin')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Switch to Admin (Dr. Anita)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToShowcase}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Showcase</span>
          </button>
        </div>
      </div>
    </div>
  );
}
