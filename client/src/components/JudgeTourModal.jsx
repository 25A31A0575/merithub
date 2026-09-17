import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  Lock,
  FileCheck,
  Building2,
  GraduationCap,
  Download
} from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    badge: 'Step 1: Student Flow',
    title: 'Achievement Submission & Evidence Upload',
    icon: GraduationCap,
    color: 'from-blue-600 to-indigo-600',
    description:
      'Students and faculty submit their achievements along with PDF/PNG certificate evidence. Submissions are saved with status PENDING and do not appear on the public showcase until faculty authentication.',
    actionGuide:
      'Use the Submit button in the navbar to test file upload and instant registration into the SQLite repository.'
  },
  {
    step: 2,
    badge: 'Step 2: Security & RBAC',
    title: 'Strict Route Guards & Role Authorization',
    icon: Lock,
    color: 'from-rose-600 to-amber-600',
    description:
      'The portal enforces role permissions on both frontend views and backend Express endpoints. Students cannot approve achievements or view internal verifier desks.',
    actionGuide:
      'While logged in as Student, try clicking Verifier Desk to see the Access Restricted screen and test backend HTTP 403 blocks.'
  },
  {
    step: 3,
    badge: 'Step 3: Faculty Verifier Desk',
    title: 'Evidence Scrutiny & Mandatory Remarks',
    icon: ShieldCheck,
    color: 'from-emerald-600 to-teal-600',
    description:
      'Departmental verifiers review submitted proof in the queue. Verifiers can approve achievements for showcase publication or reject with mandatory remarks.',
    actionGuide:
      'Click "Verifier" in the top Judge Switcher to inspect certificate previews, test approval, or test rejection feedback.'
  },
  {
    step: 4,
    badge: 'Step 4: Fix & Re-submit Flow',
    title: 'Constructive Feedback & Audit Trail',
    icon: FileCheck,
    color: 'from-amber-600 to-orange-600',
    description:
      'When an achievement is rejected, the submitter sees the verifier remarks in "My Submissions" and can fix information or upload new proof to re-queue it.',
    actionGuide:
      'Open My Submissions to inspect rejected items, view full verification audit logs, and test the re-submission flow.'
  },
  {
    step: 5,
    badge: 'Step 5: Analytics & Accreditation',
    title: 'Institutional Analytics & NAAC / NIRF Reports',
    icon: Building2,
    color: 'from-purple-600 to-indigo-600',
    description:
      'Institutional Admins can view live Chart.js breakdowns (Category, Department, Status, Year) queried directly from SQLite, export filtered CSVs, and generate print-friendly PDF reports.',
    actionGuide:
      'Click "Admin" in the Judge Switcher, open Analytics, test dynamic filters, and click Export to CSV.'
  }
];

export default function JudgeTourModal({ isOpen, onClose, onSelectRole }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col justify-between">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Hackathon Evaluation Guide • 3-Minute Quick Tour
            </span>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 mb-6">
            {TOUR_STEPS.map((s, idx) => (
              <div
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'bg-blue-500'
                    : idx < currentStepIndex
                    ? 'bg-emerald-500/60'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Step Content Card */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentStep.color} flex items-center justify-center text-white shadow-md`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {currentStep.badge}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {currentStep.description}
            </p>

            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">How to test:</strong> {currentStep.actionGuide}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Step {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
