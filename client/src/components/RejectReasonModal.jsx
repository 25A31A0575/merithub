import React, { useState, useEffect } from 'react';
import { AlertCircle, FileWarning, Sparkles, X, XCircle } from 'lucide-react';

export default function RejectReasonModal({ achievement, onConfirm, onCancel, submitting }) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, submitting]);

  if (!achievement) return null;

  const quickReasons = [
    'Uploaded certificate is blurry or illegible. Please re-upload a clear scanned PDF.',
    'Event details and dates do not match the submitted proof document.',
    'Official institutional seal, signature, or verifiable credential ID is missing.',
    'Incomplete documentation. Please attach full conference publication/certificate.'
  ];

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Rejection remarks are mandatory. You must provide clear feedback.');
      return;
    }
    onConfirm(achievement.id, remarks.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={!submitting ? onCancel : undefined} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <FileWarning className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reject Submission</h3>
              <p className="text-xs text-slate-400">
                Provide constructive feedback for ID #{achievement.id}
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            disabled={submitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement info brief */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 mb-5 text-xs">
          <span className="text-slate-400 block mb-0.5">Target Achievement:</span>
          <p className="font-semibold text-white truncate">{achievement.title}</p>
          <span className="text-slate-400 mt-1 block">
            Achiever: <strong className="text-slate-300">{achievement.submitter_name}</strong> (
            {achievement.submitter_department})
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleRejectSubmit}>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Verifier Remarks / Reason for Rejection <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows="3"
            placeholder="Explain specifically what is missing or illegible so the student/faculty can rectify and re-submit..."
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />

          {/* Quick Reasons Chips */}
          <div className="mt-3 mb-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick standard remark templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setRemarks(r);
                    if (error) setError('');
                  }}
                  className="text-[10px] text-left px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50 cursor-pointer"
                >
                  {r.substring(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 flex items-center gap-1 mb-4">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !remarks.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span>Recording Rejection...</span>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
