import React, { useState, useEffect } from 'react';
import CertificateViewerModal from './CertificateViewerModal';
import RejectReasonModal from './RejectReasonModal';
import AuditLogsModal from './AuditLogsModal';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  History,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  XCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function VerifierDesk({
  onBackToShowcase,
  currentUser = null,
  authToken = ''
}) {
  const [pendingList, setPendingList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [inspectingCert, setInspectingCert] = useState(null); // { url, title }
  const [rejectingItem, setRejectingItem] = useState(null); // achievement object
  const [viewingLogsItem, setViewingLogsItem] = useState(null); // achievement object
  const [processingId, setProcessingId] = useState(null);

  // Fetch pending items and overall stats
  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const [pendingRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/achievements/pending`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/stats`)
      ]);

      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();

      if (pendingData.success) {
        setPendingList(pendingData.achievements);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load verification queue from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [authToken]);

  // Handle Approve
  const handleApprove = async (achievement) => {
    setProcessingId(achievement.id);
    setActionSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/achievements/${achievement.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          remarks: `Certificate and institutional credentials authenticated by ${currentUser?.name || 'Faculty Verifier'}. Approved for public showcase.`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve achievement.');
      }

      setActionSuccess(
        `✅ Approved ID #${achievement.id} ("${achievement.title}")! It is now live on the Public Showcase.`
      );
      // Refresh queue
      await fetchQueue();
    } catch (err) {
      alert('Approval Error: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject Confirmation
  const handleConfirmReject = async (achievementId, remarks) => {
    setProcessingId(achievementId);
    try {
      const res = await fetch(`${API_BASE_URL}/achievements/${achievementId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ remarks })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject achievement.');
      }

      setActionSuccess(
        `❌ Rejected ID #${achievementId}. Feedback saved. Achiever can now fix and re-submit.`
      );
      setRejectingItem(null);
      await fetchQueue();
    } catch (err) {
      alert('Rejection Error: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Top back navigation and refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToShowcase}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Showcase
        </button>

        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* Verifier Profile & Demo Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 ring-1 ring-white/20 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Faculty Verification Desk
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Active Verifier
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <strong className="text-slate-200">{currentUser?.name || 'Prof. Vikram Mehta'}</strong> ({currentUser?.batch_or_designation || 'HOD & Chief Faculty Verifier'} • {currentUser?.department || 'Electrical Engineering'})
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Role-based authenticated desk • Tamper-proof SQLite audit logs
              </p>
            </div>
          </div>

          {/* Verification Status Counter Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center min-w-[90px]">
              <span className="block text-xl font-extrabold text-amber-300">
                {stats?.pendingAchievements ?? pendingList.length}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Pending
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center min-w-[90px]">
              <span className="block text-xl font-extrabold text-emerald-400">
                {stats?.verifiedAchievements ?? 0}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Approved
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center min-w-[90px]">
              <span className="block text-xl font-extrabold text-rose-400">
                {stats?.rejectedAchievements ?? 0}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                Rejected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200 animate-fade-in">
          <span>{actionSuccess}</span>
          <button
            onClick={() => setActionSuccess('')}
            className="text-emerald-400 hover:text-white font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-200 text-center">
          {error}
        </div>
      )}

      {/* Section Subhead */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Pending Submissions Awaiting Scrutiny ({pendingList.length})
        </h2>
        <span className="text-xs text-slate-400">
          Only authorized verifiers can authenticate credentials
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse h-40"
            />
          ))}
        </div>
      )}

      {/* Empty State when zero items are pending */}
      {!loading && !error && pendingList.length === 0 && (
        <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-12 text-center max-w-lg mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">All caught up!</h3>
          <p className="text-xs text-slate-400 mb-6">
            There are currently no achievements waiting for verification in the queue.
          </p>
          <button
            onClick={onBackToShowcase}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            Go to Public Showcase
          </button>
        </div>
      )}

      {/* The Pending Queue Cards */}
      {!loading && !error && pendingList.length > 0 && (
        <div className="space-y-5">
          {pendingList.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-xl hover:border-slate-700/90 transition-all flex flex-col justify-between"
            >
              {/* Card Top: ID, Category & Pending badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    ID #{item.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Submitted on: {item.created_at?.split(' ')[0]}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  Awaiting Verification
                </span>
              </div>

              {/* Title & Position */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                {item.title}
              </h3>

              {item.position_rank && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3 self-start">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{item.position_rank}</span>
                </div>
              )}

              {/* Event & Achiever Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 mb-4">
                <div>
                  <span className="text-slate-500 block mb-0.5">Achiever:</span>
                  <span className="font-semibold text-white">
                    {item.submitter_name}{' '}
                    <span className="text-slate-400 capitalize">({item.submitter_role})</span>
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    {item.submitter_designation}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Department:</span>
                  <span className="font-medium text-slate-200">{item.submitter_department}</span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Event / Date:</span>
                  <span className="font-medium text-slate-200 truncate block">
                    {item.event_name}
                  </span>
                  <span className="text-slate-400 text-[11px]">{item.event_date}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-5 bg-slate-950/30 p-3.5 rounded-xl border border-slate-800/50">
                {item.description}
              </p>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: View certificate & View logs */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {item.certificate_url ? (
                    <button
                      onClick={() =>
                        setInspectingCert({ url: item.certificate_url, title: item.title })
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Certificate Evidence
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">No certificate attached</span>
                  )}

                  <button
                    onClick={() => setViewingLogsItem(item)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    Audit Logs
                  </button>
                </div>

                {/* Right: Approve and Reject Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setRejectingItem(item)}
                    disabled={processingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    Reject with Remarks
                  </button>

                  <button
                    onClick={() => handleApprove(item)}
                    disabled={processingId === item.id}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {processingId === item.id ? (
                      <span>Approving...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Achievement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {inspectingCert && (
        <CertificateViewerModal
          certificateUrl={inspectingCert.url}
          title={inspectingCert.title}
          onClose={() => setInspectingCert(null)}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <RejectReasonModal
          achievement={rejectingItem}
          onConfirm={handleConfirmReject}
          onCancel={() => setRejectingItem(null)}
          submitting={processingId === rejectingItem.id}
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
