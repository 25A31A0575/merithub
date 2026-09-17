import React, { useEffect, useState } from 'react';
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  GraduationCap,
  Quote,
  ShieldCheck,
  Trophy,
  User,
  X
} from 'lucide-react';

export default function AchievementModal({ achievement, onClose }) {
  const [imageError, setImageError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!achievement) return null;

  const formattedDate = achievement.event_date
    ? new Date(achievement.event_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date not specified';

  const formattedVerifiedDate = achievement.verified_at
    ? new Date(achievement.verified_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal dialog box */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header with Title and Close Button */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {achievement.category}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Institutional Verified Record
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                {achievement.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Rank & Event metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium block mb-1">Event / Organization</span>
              <span className="text-sm font-semibold text-white block">{achievement.event_name}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium block mb-1">Position / Honor</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{achievement.position_rank || 'Recognized Milestone'}</span>
              </div>
            </div>
          </div>

          {/* Achiever Profile Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Achiever Information
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                {achievement.submitter_name ? achievement.submitter_name[0] : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">{achievement.submitter_name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize font-medium">
                    {achievement.submitter_role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {achievement.submitter_department} • {achievement.submitter_designation}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Achievement Details
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              {achievement.description}
            </p>
          </div>

          {/* Faculty Verification Details & Remarks */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Faculty Verification Endorsement
                </span>
              </div>
              {formattedVerifiedDate && (
                <span className="text-xs text-slate-400">
                  Verified on {formattedVerifiedDate}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-300 mb-2">
              <span className="text-slate-400">Verified by: </span>
              <span className="font-semibold text-white">
                {achievement.verifier_name || 'Chief Faculty Verifier'}
              </span>
            </div>

            {achievement.verifier_remarks && (
              <div className="mt-3 flex gap-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-emerald-500/20">
                <Quote className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{achievement.verifier_remarks}"
                </p>
              </div>
            )}
          </div>

          {/* Certificate / Supporting Evidence Section */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span>Certificate & Supporting Proof</span>
              </div>
              {achievement.certificate_url && (
                <a
                  href={achievement.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Open in Full Size
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {achievement.certificate_url && !imageError ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-56 bg-slate-950">
                <img
                  src={achievement.certificate_url}
                  alt="Certificate Preview"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover max-h-56 hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl text-center bg-slate-950/40">
                <FileCheck className="w-8 h-8 text-slate-500 mb-2" />
                <p className="text-xs text-slate-300 font-medium">
                  Official Certificate Document Authenticated & Archived
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Institutional digital credentials stored securely in physical/cloud repository.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
