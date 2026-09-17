import React, { useState, useEffect } from 'react';
import ResubmitModal from './ResubmitModal';
import AuditLogsModal from './AuditLogsModal';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileUp,
  History,
  PlusCircle,
  Quote,
  RefreshCw,
  Wrench,
  XCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function MySubmissions({
  onBackToShowcase,
  onNewSubmission,
  currentUser = null,
  authToken = ''
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resubmittingItem, setResubmittingItem] = useState(null);
  const [viewingLogsItem, setViewingLogsItem] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const endpoint = authToken ? `${API_BASE_URL}/submissions/my` : `${API_BASE_URL}/submissions/recent`;
      const res = await fetch(endpoint, { headers });
      if (!res.ok) throw new Error('Failed to load your personal submissions.');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to fetch submissions from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [authToken]);

  const handleResubmitSuccess = (result) => {
    setResubmittingItem(null);
    setSuccessNotice(
      `✅ Submission ID #${result.achievementId} was successfully re-submitted and has returned to the Faculty Verification Desk for review!`
    );
    fetchSubmissions();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified & Live
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Awaiting Faculty Verification
          </span>
        );
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToShowcase}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Showcase
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubmissions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={onNewSubmission}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Submit New Achievement
          </button>
        </div>
      </div>

      {/* Success alert banner */}
      {successNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200 animate-fade-in">
          <span>{successNotice}</span>
          <button
            onClick={() => setSuccessNotice('')}
            className="text-emerald-400 hover:text-white font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Demo Notice Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-300 leading-relaxed">
        <strong className="text-blue-300 block mb-1">Institutional Submissions Tracker</strong>
        This view displays your submissions and their verification status. When an achievement is
        rejected, you can inspect faculty remarks and click{' '}
        <span className="text-blue-400 font-semibold">"Fix & Re-submit Evidence"</span> to rectify
        the documentation and send it back to the faculty review queue.
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-white">My Submissions & Statuses</h2>
        <p className="text-xs text-slate-400 mt-1">
          Track institutional approval milestones, inspect attached evidence, and rectify rejected records.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-xs text-rose-200">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-32"
            />
          ))}
        </div>
      )}

      {/* Submissions List */}
      {!loading && !error && (
        <div className="space-y-5">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl hover:border-slate-700 transition-all"
            >
              {/* Card top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    ID #{sub.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {sub.category}
                  </span>
                  <span className="text-xs text-slate-400">{sub.event_date}</span>
                </div>
                <div>{getStatusBadge(sub.status)}</div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{sub.title}</h3>

              {/* Event details box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 mb-4 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Achiever:</span>
                  <span className="font-semibold text-slate-200">
                    {sub.submitter_name} ({sub.submitter_role})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department:</span>
                  <span className="text-slate-200">{sub.submitter_department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Event:</span>
                  <span className="text-slate-200 truncate block">{sub.event_name}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 mb-4 leading-relaxed line-clamp-2">
                {sub.description}
              </p>

              {/* Verifier Remarks Callout Box */}
              {sub.verifier_remarks && (
                <div
                  className={`p-4 rounded-2xl mb-4 text-xs ${
                    sub.status === 'rejected'
                      ? 'bg-rose-950/25 border border-rose-500/30'
                      : 'bg-emerald-950/25 border border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-semibold flex items-center gap-1.5 ${
                        sub.status === 'rejected' ? 'text-rose-300' : 'text-emerald-300'
                      }`}
                    >
                      {sub.status === 'rejected' ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      Faculty Verifier Remarks ({sub.verifier_name || 'Prof. Vikram Mehta'}):
                    </span>
                    {sub.verified_at && (
                      <span className="text-[11px] text-slate-400">{sub.verified_at}</span>
                    )}
                  </div>

                  <p className="italic text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                    "{sub.verifier_remarks}"
                  </p>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {sub.certificate_url ? (
                    <a
                      href={sub.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      View Uploaded Document
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-500">No document attached</span>
                  )}

                  <button
                    onClick={() => setViewingLogsItem(sub)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    Audit Logs
                  </button>
                </div>

                {/* If REJECTED, show "Fix & Re-submit" button */}
                {sub.status === 'rejected' && (
                  <button
                    onClick={() => setResubmittingItem(sub)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Fix & Re-submit Evidence</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resubmit Modal */}
      {resubmittingItem && (
        <ResubmitModal
          achievement={resubmittingItem}
          authToken={authToken}
          onSuccess={handleResubmitSuccess}
          onClose={() => setResubmittingItem(null)}
        />
      )}

      {/* Audit Logs Modal */}
      {viewingLogsItem && (
        <AuditLogsModal
          achievement={viewingLogsItem}
          onClose={() => setViewingLogsItem(null)}
        />
      )}
    </section>
  );
}
