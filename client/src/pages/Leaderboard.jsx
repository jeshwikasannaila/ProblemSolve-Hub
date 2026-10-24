import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, ShieldCheck, Medal } from 'lucide-react';
import api from '../services/api';

export default function Leaderboard() {
  const [solvers, setSolvers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const res = await api.get('/leaderboard/preview');
        setSolvers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
          Hall of Fame
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Global Solver Leaderboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Celebrating the top engineers and students solving high-impact problems.
        </p>
      </div>

      <div className="gradient-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase font-mono text-slate-400 bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Solver</th>
                <th className="px-6 py-4">Skills</th>
                <th className="px-6 py-4 text-center">Wins</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-right">Total Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {solvers.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <Medal className="w-5 h-5" /> #1
                      </span>
                    ) : idx === 1 ? (
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Medal className="w-5 h-5" /> #2
                      </span>
                    ) : idx === 2 ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Medal className="w-5 h-5" /> #3
                      </span>
                    ) : (
                      `#${idx + 1}`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={s.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-white block">{s.name}</span>
                        <span className="text-xs text-slate-400 line-clamp-1">{s.bio}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {s.skills.slice(0, 3).map((skill, sIdx) => (
                        <span key={sIdx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-white">
                    {s.wins_count}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {Number(s.average_rating).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                    ${s.wallet_balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
