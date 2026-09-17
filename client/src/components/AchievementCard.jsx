import React from 'react';
import { Calendar, CheckCircle2, ChevronRight, ExternalLink, MapPin, Medal, Trophy, User } from 'lucide-react';

export default function AchievementCard({ achievement, onClick }) {
  // Category color mapping
  const categoryStyles = {
    Hackathon: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    Research: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    Sports: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    Certification: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    Innovation: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    Coding: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
  };

  const badgeStyle = categoryStyles[achievement.category] || 'bg-slate-700/30 text-slate-300 border-slate-600/40';

  // Format date nicely
  const formattedDate = achievement.event_date
    ? new Date(achievement.event_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Date not specified';

  return (
    <div
      onClick={() => onClick(achievement)}
      className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-sm hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top row: Category tag & Verified Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyle}`}>
            {achievement.category}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified
          </span>
        </div>

        {/* Achievement Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug mb-2 line-clamp-2">
          {achievement.title}
        </h3>

        {/* Position / Rank Pill if present */}
        {achievement.position_rank && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>{achievement.position_rank}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-5">
          {achievement.description}
        </p>
      </div>

      {/* Bottom section: Event details & Achiever Info */}
      <div className="pt-4 border-t border-slate-800/80">
        {/* Event & Date */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="font-medium text-slate-300 truncate max-w-[200px]" title={achievement.event_name}>
            {achievement.event_name}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formattedDate}
          </span>
        </div>

        {/* Submitter Info Card */}
        <div className="flex items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 group-hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs">
              {achievement.submitter_name ? achievement.submitter_name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {achievement.submitter_name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {achievement.submitter_department}
              </div>
            </div>
          </div>

          <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
