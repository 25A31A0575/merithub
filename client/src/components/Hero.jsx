import React from 'react';
import { ArrowDown, CheckCircle, Search, Trophy } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section id="home" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Celebrating Excellence.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Verified by Faculty.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          A unified institutional platform documenting and showcasing verified achievements across
          National Hackathons, IEEE Research, Patents, Innovations, and Athletic Championships
          for students and faculty members.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            Explore Verified Showcase
            <ArrowDown className="w-4 h-4" />
          </button>

          <a
            href="#about"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all duration-200"
          >
            How Verification Works
          </a>
        </div>

        {/* Feature badges */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Document & Proof Authenticated</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Faculty Verifier Remarks Attached</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>NAAC & NIRF Accreditation Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
