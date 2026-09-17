import React, { useEffect } from 'react';
import { ExternalLink, FileCheck, FileText, X } from 'lucide-react';

export default function CertificateViewerModal({ certificateUrl, title, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!certificateUrl) return null;

  const isPdf = certificateUrl.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      {/* Click-away backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Certificate Evidence Preview
              </h3>
              <p className="text-xs text-slate-400 truncate">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Open In New Tab
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-grow p-4 sm:p-6 overflow-auto bg-slate-950/40 flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <iframe
              src={`${certificateUrl}#toolbar=0`}
              title="Certificate PDF Viewer"
              className="w-full h-[65vh] rounded-2xl border border-slate-800 bg-white shadow-inner"
            />
          ) : (
            <div className="max-h-[65vh] overflow-auto flex items-center justify-center">
              <img
                src={certificateUrl}
                alt="Certificate Document"
                className="max-h-[65vh] max-w-full rounded-2xl object-contain border border-slate-800 shadow-xl"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Institutional Verification Archive • Pragati University</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
