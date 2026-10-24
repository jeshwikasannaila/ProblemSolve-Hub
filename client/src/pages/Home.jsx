import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Code2,
  Building2,
  Search,
  Star,
  Users,
  FileCheck2,
  Coins,
  ChevronRight,
  Zap,
  Globe2,
  Lock
} from 'lucide-react';
import api from '../services/api';
import ProblemCard from '../components/problems/ProblemCard';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRewardsDistributed: 0,
    activeProblemsCount: 0,
    completedProblemsCount: 0,
    totalSolversCount: 0,
    totalCertificatesIssued: 0,
  });

  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [topSolvers, setTopSolvers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SOLVER'); // 'SOLVER' or 'CUSTOMER'
  const [verifyInput, setVerifyInput] = useState('');

  useEffect(() => {
    async function loadLandingData() {
      try {
        setLoading(true);
        const [statsRes, featuredRes, solversRes] = await Promise.all([
          api.get('/stats'),
          api.get('/problems/featured'),
          api.get('/leaderboard/preview')
        ]);
        setStats(statsRes.data);
        setFeaturedProblems(featuredRes.data);
        setTopSolvers(solversRes.data);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLandingData();
  }, []);

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (verifyInput.trim()) {
      navigate(`/verify/${verifyInput.trim()}`);
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20">
        {/* Glow ambient background accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">ProblemSolve Hub Live:</span>
            <span>Over ${stats.totalRewardsDistributed.toLocaleString()} in bounties recorded</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Where Real Challenges Meet <br className="hidden sm:inline" />
            <span className="gradient-text">Elite Problem Solvers</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            Companies post real engineering bottlenecks with guaranteed bounties. Developers and students solve them to earn cash rewards, verifiable digital certificates, and client ratings.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/problems"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Search className="w-5 h-5" />
              Explore Open Challenges
            </Link>

            <Link
              to="/register?role=CUSTOMER"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Building2 className="w-5 h-5 text-emerald-400" />
              Post a Challenge Statement
            </Link>
          </div>

          {/* Live Metrics Ribbon */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase mb-1">
                <Coins className="w-4 h-4" />
                Total Bounty Pool
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                ${stats.totalRewardsDistributed.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400">Guaranteed in escrow</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase mb-1">
                <Zap className="w-4 h-4" />
                Active Challenges
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.activeProblemsCount}
              </div>
              <span className="text-xs text-slate-400">Open for submissions</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-mono uppercase mb-1">
                <Users className="w-4 h-4" />
                Talented Solvers
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.totalSolversCount}
              </div>
              <span className="text-xs text-slate-400">Developers & students</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase mb-1">
                <FileCheck2 className="w-4 h-4" />
                Certificates Issued
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.totalCertificatesIssued}
              </div>
              <span className="text-xs text-slate-400">Cryptographically verified</span>
            </div>
          </div>

        </div>
      </section>


      {/* 2. HOW IT WORKS (DUAL TRACK) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Seamless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How ProblemSolve Hub Works
          </h2>
          <p className="text-slate-400">
            A transparent, fair platform engineered for both technical problem-owners and ambitious solution-builders.
          </p>

          {/* Role Journey Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab('SOLVER')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'SOLVER'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              For Developers & Students
            </button>
            <button
              onClick={() => setActiveTab('CUSTOMER')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'CUSTOMER'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              For Companies & Customers
            </button>
          </div>
        </div>

        {/* Step-by-Step Cards */}
        {activeTab === 'SOLVER' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="gradient-card rounded-2xl p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Find a Challenge</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Browse open challenges filtered by category, tech stack, difficulty, and reward bounty. Check requirements and deadline countdowns.
              </p>
            </div>

            <div className="gradient-card rounded-2xl p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Build & Submit Code</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Develop your solution. Submit your GitHub repository URL, live deployed demo link, and a detailed architecture summary before the deadline.
              </p>
            </div>

            <div className="gradient-card rounded-2xl p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Win, Earn & Get Certified</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                When your solution is picked as the winner, the reward is automatically credited to your wallet balance. Download your verified PDF certificate and collect client ratings.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="gradient-card rounded-2xl p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Post Problem & Set Bounty</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Specify your technical requirements, deliverables, and deadline. Deposit the bounty into virtual escrow so solvers know your challenge is guaranteed.
              </p>
            </div>

            <div className="gradient-card rounded-2xl p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Review Submissions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Access your private "Submissions Review Room". Inspect code repositories, test live preview links, and shortlist the most promising implementations.
              </p>
            </div>

            <div className="gradient-card rounded-2xl p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Award Winner & Rate</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Select the single best solution. The escrow funds transfer instantly to the winner, an authentic certificate is generated, and you leave a client rating.
              </p>
            </div>
          </div>
        )}
      </section>


      {/* 3. FEATURED CHALLENGES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Live Challenges
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Featured Problems with Active Bounties
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Real-world engineering statements posted by verified organizations.
            </p>
          </div>

          <Link
            to="/problems"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 self-start sm:self-auto"
          >
            View all challenges ({stats.activeProblemsCount})
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProblems.map((prob) => (
              <ProblemCard key={prob.id} problem={prob} />
            ))}
          </div>
        )}
      </section>


      {/* 4. PLATFORM TRUST & GUARANTEES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gradient-card rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                Built on Integrity
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Designed to Protect Both Customers & Solvers
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                We believe in total transparency. Every reward commitment is backed by an escrow lock, every winning submission produces an immutable credential, and feedback is earned through performance.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Guaranteed Reward Escrow</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      When a problem is published, the prize reward is securely locked in escrow. Solvers know their effort will be rewarded.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Verifiable Digital Certificates</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Each winner receives a unique certificate code (e.g., PSH-2026-KT8891) backed by public verification for recruiters and employers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Authentic Client Reviews</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Only verified problem-owners who award solutions can submit reviews, protecting the integrity of developer profiles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Verification Quick Tool */}
            <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Instant Certificate Lookup</h3>
                  <span className="text-xs text-slate-400">Verify validity of any issued award</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Have a Certificate ID from a developer resume or portfolio? Enter it below to check authentic database records:
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="e.g. PSH-2026-KT8891"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify Certificate Authenticity
                </button>
              </form>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                <span>Try demo certificate:</span>
                <button
                  onClick={() => setVerifyInput('PSH-2026-KT8891')}
                  className="font-mono text-emerald-400 hover:underline"
                >
                  PSH-2026-KT8891
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 5. TOP SOLVERS OF THE MONTH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Talent Spotlight
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Top Solvers & Problem Busters
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Developers with the highest challenge win rates and client feedback ratings.
            </p>
          </div>

          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 self-start sm:self-auto"
          >
            Full Leaderboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topSolvers.map((solver, idx) => (
            <div key={solver.id} className="gradient-card rounded-2xl p-6 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <img
                      src={solver.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={solver.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-emerald-400 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {Number(solver.average_rating).toFixed(1)}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {solver.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">
                  {solver.bio || 'Passionate software engineer & competitive problem solver.'}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {solver.skills.slice(0, 3).map((skill, sIdx) => (
                    <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Bounties Won</span>
                  <span className="font-bold text-emerald-400">${solver.wallet_balance.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Wins</span>
                  <span className="font-bold text-white">{solver.wins_count} Challenges</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Solve or Post a Problem?
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300">
            Join hundreds of forward-thinking companies and elite developers building solutions for real-world impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register?role=DEVELOPER"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20"
            >
              Sign Up as a Solver
            </Link>
            <Link
              to="/register?role=CUSTOMER"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all"
            >
              Sign Up as a Company
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
