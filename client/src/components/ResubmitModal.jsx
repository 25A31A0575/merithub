import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  FileCheck,
  FileUp,
  Quote,
  RefreshCw,
  Upload,
  X
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ResubmitModal({ achievement, onSuccess, onClose, authToken = '' }) {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    category: achievement?.category || 'Hackathon',
    event_name: achievement?.event_name || '',
    event_date: achievement?.event_date || '',
    position_rank: achievement?.position_rank || '',
    description: achievement?.description || '',
    resubmit_notes: ''
  });

  const [newCertificateFile, setNewCertificateFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  if (!achievement) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError('Only PDF, PNG, JPG, or JPEG documents are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5 MB limit.');
      return;
    }

    setError('');
    setNewCertificateFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('event_name', formData.event_name.trim());
      data.append('event_date', formData.event_date);
      data.append('position_rank', formData.position_rank.trim());
      data.append('description', formData.description.trim());
      data.append('resubmit_notes', formData.resubmit_notes.trim());

      if (newCertificateFile) {
        data.append('certificate', newCertificateFile);
      }

      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${API_BASE_URL}/achievements/${achievement.id}/resubmit`, {
        method: 'POST',
        headers,
        body: data
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to re-submit achievement.');
      }

      onSuccess(result);
    } catch (err) {
      console.error('Resubmission error:', err);
      setError(err.message || 'Server error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="fixed inset-0" onClick={!submitting ? onClose : undefined} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Rectify Rejection
              </span>
              <span className="text-xs text-slate-400">ID #{achievement.id}</span>
            </div>
            <h3 className="text-xl font-bold text-white">Fix & Re-submit Achievement</h3>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Faculty Rejection Reason Box */}
        {achievement.verifier_remarks && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs">
            <span className="font-semibold text-rose-300 block mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Previous Faculty Feedback:
            </span>
            <div className="flex gap-2 italic text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-rose-500/20">
              <Quote className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>"{achievement.verifier_remarks}"</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Achievement Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Event/Organization</label>
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description & Details</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Replacement Certificate Upload */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Upload Replacement Certificate / Proof (Optional if keeping previous)
            </label>
            <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center bg-slate-950/40 hover:border-slate-700 relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              {newCertificateFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <FileCheck className="w-5 h-5" />
                  <span className="font-semibold">{newCertificateFile.name}</span>
                </div>
              ) : (
                <div className="text-slate-400 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Click to select replacement PDF or Image file</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes to the verifier */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Explanation / Note to Faculty Verifier
            </label>
            <input
              type="text"
              name="resubmit_notes"
              placeholder="e.g. Replaced with clear scanned PDF and added official certificate ID..."
              value={formData.resubmit_notes}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-rose-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Re-submitting...</span>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-submit for Faculty Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
