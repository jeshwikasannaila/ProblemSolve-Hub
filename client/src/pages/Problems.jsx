import React, { useState, useEffect } from 'react';
import { Search, Filter, Tag, Compass, ArrowUpDown, Loader2 } from 'lucide-react';
import api from '../services/api';
import ProblemCard from '../components/problems/ProblemCard';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [difficulty, setDifficulty] = useState('ALL');
  const [sort, setSort] = useState('newest');

  const categories = [
    'ALL',
    'AI & Data',
    'Backend & Cloud',
    'Frontend & UI',
    'Mobile & PWA',
    'Security & DevOps',
    'Full-Stack & Systems'
  ];

  const loadProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'ALL') params.append('category', category);
      if (difficulty !== 'ALL') params.append('difficulty', difficulty);
      if (sort) params.append('sort', sort);

      const res = await api.get(`/problems?${params.toString()}`);
      setProblems(res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when category, difficulty, or sort changes
  useEffect(() => {
    loadProblems();
  }, [category, difficulty, sort]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadProblems();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
          Challenge Explorer
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Explore All Real-World Engineering Problems
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Filter by domain, search by keywords, and solve active bounties to earn cash rewards and verified certificates.
        </p>
      </div>

      {/* Search, Filters, and Sorting Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems, tech stack, keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Sort & Difficulty Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="reward_desc">Highest Bounty ($$$)</option>
              <option value="reward_asc">Lowest Bounty ($)</option>
              <option value="deadline_asc">Ending Soon</option>
              <option value="most_submissions">Most Submissions</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="text-xs text-slate-400 font-mono flex items-center justify-between border-b border-slate-800/80 pb-3">
        <span>Showing {problems.length} challenge statements</span>
        {loading && <span className="flex items-center gap-1.5 text-emerald-400"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating results...</span>}
      </div>

      {/* Problems Grid */}
      {loading && problems.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="gradient-card rounded-2xl p-6 h-64 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-slate-800 rounded w-2/3" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-4/5" />
              </div>
              <div className="h-8 bg-slate-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 gradient-card rounded-2xl p-8">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No challenge statements found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search terms, difficulty, or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob) => (
            <ProblemCard key={prob.id} problem={prob} />
          ))}
        </div>
      )}

    </div>
  );
}
