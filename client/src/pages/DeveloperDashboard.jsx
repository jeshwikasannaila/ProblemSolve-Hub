import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Coins, 
  Send, 
  Clock, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  ArrowRight, 
  Code2, 
  FileText, 
  Building2, 
  Sparkles,
  Download,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DeveloperDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCode, setDownloadingCode] = useState(null);

  const handleDownloadPDF = async (code) => {
    if (!code) return;
    try {
      setDownloadingCode(code);
      const response = await api.get(`/certificates/${code}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ProblemSolveHub-Certificate-${code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download certificate PDF. Please ensure you are logged in.');
    } finally {
      setDownloadingCode(null);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/submissions/developer/mine');
      setSubmissions(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Code2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Developer Sign In Required</h2>
          <p className="text-sm text-slate-400">
            Sign in with your developer account to access your solution submissions, track reviews, and view earned bounties.
          </p>
          <Link
            to="/login?redirect=/dashboard/developer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-sm hover:bg-emerald-300 transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalSubmissions = submissions.length;
  const wonSubmissions = submissions.filter(s => s.is_winner === 1 || s.status === 'WINNER');
  const totalWins = wonSubmissions.length;
  const totalEarned = wonSubmissions.reduce((acc, curr) => acc + (Number(curr.reward_amount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            Developer Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Track your challenge submissions, view client reviews, and manage your verified engineering certificates.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/problems"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            Explore New Challenges
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Available Balance</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${Number(user?.wallet_balance || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block">Virtual wallet balance</span>
        </div>

        {/* Won Bounties Earned */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Total Bounties Won</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            ${totalEarned.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block">From awarded solutions</span>
        </div>

        {/* Total Solutions Submitted */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Solutions Submitted</span>
            <Send className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {totalSubmissions}
          </div>
          <span className="text-[11px] text-slate-500 block">Across all challenges</span>
        </div>

        {/* Challenge Victories */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">1st Place Victories</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalWins}
          </div>
          <span className="text-[11px] text-slate-500 block">Verified certificates issued</span>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            My Solution Submissions & Bounties
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {submissions.length} total entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading your submissions...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No submissions yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You haven't submitted any solutions yet. Browse available customer challenges, solve real problems, and earn bounties and verified certificates.
            </p>
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Explore Open Challenges
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const isWinner = sub.is_winner === 1 || sub.status === 'WINNER';

              return (
                <div
                  key={sub.id}
                  className={`gradient-card rounded-2xl p-6 transition-all border ${
                    isWinner
                      ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/10 bg-slate-900/90'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Challenge Title & Solution Details */}
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {sub.category}
                        </span>

                        {isWinner ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <Trophy className="w-3.5 h-3.5 text-amber-300" />
                            1st Place Winner
                          </span>
                        ) : sub.status === 'REJECTED' ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Not Selected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5" />
                            Under Review
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-mono">
                          Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Problem Link */}
                      <div>
                        <Link
                          to={`/problems/${sub.problem_id}`}
                          className="text-lg font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                        >
                          {sub.problem_title}
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Posted by <strong className="text-slate-300">{sub.company_name || sub.customer_name}</strong></span>
                        </div>
                      </div>

                      {/* Solution Title & Snippet */}
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <span className="text-xs font-semibold text-emerald-300 block">
                          Solution: {sub.title}
                        </span>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      {/* Repository and Demo links */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {sub.repo_url && (
                          <a
                            href={sub.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                          >
                            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                            Source Code
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                        )}

                        {sub.demo_url && (
                          <a
                            href={sub.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5 text-indigo-400" />
                            Live Demo
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                        )}
                      </div>

                      {/* Customer Review if won */}
                      {isWinner && sub.customer_feedback && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(sub.customer_rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-[11px] text-slate-300 font-semibold ml-1">Customer Review:</span>
                          </div>
                          <p className="text-slate-200 italic">"{sub.customer_feedback}"</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Bounty & Certificate Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] font-mono text-slate-400 uppercase block">Bounty Value</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          ${Number(sub.reward_amount || 0).toLocaleString()}
                        </span>
                      </div>

                      {isWinner && sub.certificate_code && (
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <Link
                            to={`/verify/${sub.certificate_code}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                          >
                            <Award className="w-3.5 h-3.5" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDownloadPDF(sub.certificate_code)}
                            disabled={downloadingCode === sub.certificate_code}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all disabled:opacity-50"
                            title="Download Certificate PDF"
                          >
                            {downloadingCode === sub.certificate_code ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            PDF
                          </button>
                        </div>
                      )}

                      <Link
                        to={`/problems/${sub.problem_id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        View Challenge Details
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
