import React from 'react';
import { Award, CheckCircle2, GraduationCap, Users } from 'lucide-react';

export default function Stats({ stats, loading }) {
  const statItems = [
    {
      label: 'Total Achievements',
      value: stats?.totalAchievements ?? 0,
      subtext: 'Documented records in repository',
      icon: Award,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/20'
    },
    {
      label: 'Faculty Verified',
      value: stats?.verifiedAchievements ?? 0,
      subtext: 'Passed strict scrutiny & authenticated',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      label: 'Student Achievers',
      value: stats?.studentCount ?? 0,
      subtext: 'Active undergraduate & postgraduate profiles',
      icon: GraduationCap,
      color: 'from-purple-500/20 to-violet-500/10 text-purple-400 border-purple-500/20'
    },
    {
      label: 'Faculty & Verifiers',
      value: stats?.facultyCount ?? 0,
      subtext: 'Professors, researchers & verifiers',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20'
    }
  ];

  return (
    <section className="relative -mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.label}
                </span>
                <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
                ) : (
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {item.value}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400 line-clamp-1">{item.subtext}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
