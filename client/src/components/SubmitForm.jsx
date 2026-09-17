import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  FileUp,
  GraduationCap,
  Sparkles,
  Upload,
  User
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const CATEGORIES = [
  'Hackathon',
  'Coding',
  'Research',
  'Certification',
  'Innovation',
  'Sports',
  'Technical',
  'Non-Technical',
  'Cultural',
  'Entrepreneurship',
  'Leadership'
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Civil Engineering',
  'Biotechnology',
  'Management Studies'
];

export default function SubmitForm({
  onBackToShowcase,
  onViewSubmissions,
  currentUser = null,
  authToken = ''
}) {
  // Form State bound to authenticated user
  const [formData, setFormData] = useState({
    achiever_name: currentUser?.name || '',
    achiever_type: currentUser?.role === 'faculty' ? 'faculty' : 'student',
    department: currentUser?.department || 'Computer Science & Engineering',
    title: '',
    category: 'Hackathon',
    event_name: '',
    event_date: new Date().toISOString().split('T')[0],
    position_rank: '',
    description: ''
  });

  const [certificateFile, setCertificateFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Handle Text Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle File Selection with Client-Side Validation
  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;

    // Validate type: PDF, PNG, JPG, JPEG
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop().toLowerCase();
    const validMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/pjpeg'];

    if (!validExtensions.includes(extension) || !validMimes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PDF, PNG, or JPG/JPEG certificate document.');
      setCertificateFile(null);
      return;
    }

    // Validate size: 5 MB maximum
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setFileError('File exceeds 5 MB limit. Please compress or select a smaller document.');
      setCertificateFile(null);
      return;
    }

    setCertificateFile(file);
  };

  // Client-Side Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.achiever_name.trim()) errors.achiever_name = 'Achiever name is required.';
    if (!formData.department.trim()) errors.department = 'Department is required.';
    if (!formData.title.trim()) errors.title = 'Achievement title is required.';
    if (!formData.category.trim()) errors.category = 'Please select a category.';
    if (!formData.event_name.trim()) errors.event_name = 'Event/Organization name is required.';
    if (!formData.event_date.trim()) errors.event_date = 'Achievement date is required.';
    if (!formData.description.trim()) errors.description = 'Please provide a short description.';
    if (!certificateFile) errors.certificate = 'Please attach an official certificate or evidence document.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData for multipart upload
      const data = new FormData();
      data.append('achiever_name', formData.achiever_name.trim());
      data.append('achiever_type', formData.achiever_type);
      data.append('department', formData.department);
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('event_name', formData.event_name.trim());
      data.append('event_date', formData.event_date);
      data.append('position_rank', formData.position_rank.trim());
      data.append('description', formData.description.trim());
      data.append('certificate', certificateFile);

      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/achievements`, {
        method: 'POST',
        headers,
        body: data
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to submit achievement.');
      }

      // Success
      setSubmissionSuccess(resData);
    } catch (err) {
      console.error('Submission error:', err);
      setServerError(err.message || 'Server error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Success Screen
  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Achievement Submitted Successfully!
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
            Your achievement record has been safely registered in the institutional repository.
          </p>

          {/* Details Card */}
          <div className="bg-slate-950/70 rounded-2xl border border-slate-800/80 p-5 text-left mb-8 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Submission ID:</span>
              <span className="font-mono font-semibold text-blue-400">
                #{submissionSuccess.achievementId}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Current Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                Pending Verification
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Achievement Title:</span>
              <span className="font-medium text-white truncate max-w-[260px]">
                {formData.title}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Certificate Stored:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                Archived in Institutional Repository
              </span>
            </div>
          </div>

          {/* Institutional Note */}
          <div className="bg-blue-950/20 border border-blue-500/30 rounded-2xl p-4 text-left mb-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Why isn't this in the showcase yet?</strong>
                To maintain high institutional standards for accreditation (NAAC/NIRF), an authorized
                department faculty verifier must scrutinize your certificate before it receives a
                green Verified badge and goes live on the public showcase.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onViewSubmissions}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              Track in "My Submissions"
            </button>
            <button
              onClick={() => {
                setSubmissionSuccess(null);
                setFormData({
                  achiever_name: '',
                  achiever_type: 'student',
                  department: 'Computer Science & Engineering',
                  title: '',
                  category: 'Hackathon',
                  event_name: '',
                  event_date: new Date().toISOString().split('T')[0],
                  position_rank: '',
                  description: ''
                });
                setCertificateFile(null);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Submit Another Achievement
            </button>
            <button
              onClick={onBackToShowcase}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Showcase
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBackToShowcase}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Public Showcase
      </button>

      {/* Form Container */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Institutional Verification Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Submit New Achievement
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Record your research publications, hackathon wins, certifications, sports awards, and
            innovations for faculty verification and institutional showcase.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200">
              <strong className="block font-semibold mb-0.5">Submission Error</strong>
              {serverError}
            </div>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Achiever Profile Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-400" />
              Achiever Information
            </h3>

            {/* Achiever Type: Student / Faculty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                I am submitting as: <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, achiever_type: 'student' }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    formData.achiever_type === 'student'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student Achiever
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, achiever_type: 'faculty' }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    formData.achiever_type === 'faculty'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Faculty / Researcher
                </button>
              </div>
            </div>

            {/* Name & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="achiever_name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.achiever_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.achiever_name ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.achiever_name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.achiever_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.department}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Achievement Details Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              Achievement Details
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Achievement Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. 1st Place Winner - Smart India National Hackathon"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  formErrors.title ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {formErrors.title && (
                <p className="text-[11px] text-rose-400 mt-1">{formErrors.title}</p>
              )}
            </div>

            {/* Category & Rank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Position / Rank / Role
                </label>
                <input
                  type="text"
                  name="position_rank"
                  placeholder="e.g. 1st Place / Winner / Best Paper"
                  value={formData.position_rank}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Event Name & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Organizing Body / Event / Journal <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="event_name"
                  placeholder="e.g. IEEE Conference, SIH, University Sports Board"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.event_name ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.event_name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.event_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Achievement Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
                    formErrors.event_date ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.event_date && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.event_date}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description & Impact <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="Describe your achievement, methodology, competition scale, or key findings..."
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  formErrors.description ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {formErrors.description && (
                <p className="text-[11px] text-rose-400 mt-1">{formErrors.description}</p>
              )}
            </div>
          </div>

          {/* 3. Certificate Upload Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileUp className="w-4 h-4 text-blue-400" />
              Certificate & Supporting Proof <span className="text-rose-400">*</span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload your official certificate, medal document, or published paper. Formats accepted:
              <strong> PDF, PNG, JPG, JPEG</strong> (Max 5 MB).
            </p>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                fileError || formErrors.certificate
                  ? 'border-rose-500/80 bg-rose-950/10'
                  : certificateFile
                  ? 'border-emerald-500/60 bg-emerald-950/10'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                id="certificate-input"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {certificateFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{certificateFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(certificateFile.size / 1024 / 1024).toFixed(2)} MB • Ready for institutional upload
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse or drag & drop certificate here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, PNG, JPG, or JPEG up to 5 MB
                  </p>
                </div>
              )}
            </div>

            {/* Error message */}
            {(fileError || formErrors.certificate) && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {fileError || formErrors.certificate}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToShowcase}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading & Submitting...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Submit for Faculty Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
