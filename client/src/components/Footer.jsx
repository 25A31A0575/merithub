import React from 'react';
import { Award, FileText, Globe, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="about" className="mt-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Col 1: About Platform */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">MeritHub Repository</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for Problem Statement 07: Transforming scattered certificates and awards into a
              centralized, authenticated, and verifiable showcase for students and faculty.
            </p>
          </div>

          {/* Col 2: The Verification Process */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Institutional Trust Model
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>1. Students & Faculty submit achievements + proof</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>2. Department Faculty Verifier scrutinizes certificate</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>3. Official green Verified Badge & Remarks issued</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>4. Public showcase publication & NAAC report generation</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Accreditation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Accreditation & Analytics Ready
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All approved records are indexed for NIRF, NAAC Criteria 3 & 5 reporting, providing instant
              departmental analytics and verified proof archives.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Tamper-proof audit logs enabled</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 MeritHub • Student & Faculty Achievement Platform</p>
          <p>Built for College Hackathon — Problem Statement 07</p>
        </div>
      </div>
    </footer>
  );
}
