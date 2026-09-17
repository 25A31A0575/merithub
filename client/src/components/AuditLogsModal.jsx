import React, { useState, useEffect } from 'react';
import { Clock, History, Shield, User, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AuditLogsModal({ achievement, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!achievement) return;
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/achievements/${achievement.id}/logs`);
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [achievement]);

  if (!achievement) return null;

  const getActionBadge = (action) => {
    switch (action) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'resubmitted':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'submitted':
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verification Audit Trail</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{achievement.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs list */}
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 bg-slate-950/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`uppercase font-bold px-2 py-0.5 rounded-md text-[10px] border ${getActionBadge(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {log.timestamp}
                  </span>
                </div>

                <div className="text-slate-300 font-medium">{log.remarks}</div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-900">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Action by: {log.actor_name || 'System / Faculty Verifier'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
