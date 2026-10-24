import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, CheckCircle2, ChevronRight, Tag } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function ProblemCard({ problem }) {
  const difficultyColor = {
    Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }[problem.difficulty] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  return (
    <div className="group gradient-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-emerald-950/30 transition-all duration-300">
      <div>
        {/* Top Header: Company Info + Bounty Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={problem.customer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={problem.company_name || problem.customer_name}
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-200">
                  {problem.company_name || problem.customer_name}
                </span>
                {problem.is_verified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Verified Company" />
                ) : null}
              </div>
              <span className="text-xs text-slate-400">{problem.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            ${problem.reward_amount.toLocaleString()}
          </div>
        </div>

        {/* Title */}
        <Link to={`/problems/${problem.id}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 mb-2">
            {problem.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {problem.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${difficultyColor}`}>
            {problem.difficulty}
          </span>
          {problem.tags && problem.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {tag}
            </span>
          ))}
          {problem.tags && problem.tags.length > 3 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              +{problem.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Countdown & Action */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Time Remaining</span>
          <CountdownTimer deadline={problem.deadline} compact={true} />
        </div>

        <Link
          to={`/problems/${problem.id}`}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all duration-200"
        >
          View & Solve
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
