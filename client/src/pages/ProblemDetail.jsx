import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  Award, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Tag, 
  Building2, 
  Code2, 
  ShieldAlert, 
  Send, 
  FileText,
  Sparkles,
  Users,
  ExternalLink,
  GitBranch,
  Globe,
  Star,
  Trophy,
  AlertCircle,
  X,
  Loader2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import CountdownTimer from '../components/problems/CountdownTimer';
import { useAuth } from '../context/AuthContext';

export default function ProblemDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerMsg, setBannerMsg] = useState(location.state?.message || '');

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Submit Solution Modal State (for Developers)
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subRepoUrl, setSubRepoUrl] = useState('');
  const [subDemoUrl, setSubDemoUrl] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');

  // Award Winner Modal State (for Problem Customer Owner)
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [targetSub, setTargetSub] = useState(null);
  const [awardRating, setAwardRating] = useState(5);
  const [awardFeedback, setAwardFeedback] = useState('');
  const [awardLoading, setAwardLoading] = useState(false);
  const [awardError, setAwardError] = useState('');

  // Fetch Problem details
  const loadProblem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/problems/${id}`);
      setProblem(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load challenge statement.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Submissions (Owner sees all, Developer sees their own)
  const loadSubmissions = async () => {
    if (!isAuthenticated) return;
    try {
      setSubmissionsLoading(true);
      const res = await api.get(`/submissions/problem/${id}`);
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    loadProblem();
  }, [id]);

  useEffect(() => {
    if (problem && isAuthenticated) {
      loadSubmissions();
    }
  }, [problem?.id, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading challenge statement...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error || 'Challenge not found.'}
        </div>
        <Link to="/problems" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to open problems
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user && (user.id === problem.customer_id || user.role === 'ADMIN');
  const isDeveloper = isAuthenticated && user && user.role === 'DEVELOPER';
  const isPastDeadline = new Date(problem.deadline) <= new Date();
  const isCompleted = problem.status === 'COMPLETED';

  // Check if current developer already submitted
  const mySubmission = !isOwner && submissions.length > 0 ? submissions[0] : null;

  // Handle Developer Solution Submission
  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    setSubError('');

    if (!subTitle.trim() || subTitle.trim().length < 5) {
      setSubError('Please enter a descriptive solution title (at least 5 characters).');
      return;
    }

    if (!subDescription.trim() || subDescription.trim().length < 20) {
      setSubError('Please provide a detailed description of your technical approach (at least 20 characters).');
      return;
    }

    if (!subRepoUrl.trim() || !/^https?:\/\/.+/i.test(subRepoUrl.trim())) {
      setSubError('Please enter a valid GitHub or source code repository URL (starting with http:// or https://).');
      return;
    }

    if (subDemoUrl.trim() && !/^https?:\/\/.+/i.test(subDemoUrl.trim())) {
      setSubError('Live demo URL must start with http:// or https://');
      return;
    }

    try {
      setSubLoading(true);
      const res = await api.post('/submissions', {
        problem_id: problem.id,
        title: subTitle.trim(),
        description: subDescription.trim(),
        repo_url: subRepoUrl.trim(),
        demo_url: subDemoUrl.trim()
      });

      // Close modal and refresh submissions
      setSubmitModalOpen(false);
      setSubTitle('');
      setSubDescription('');
      setSubRepoUrl('');
      setSubDemoUrl('');
      setBannerMsg('Your solution has been submitted successfully! The customer will review your approach.');
      
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      loadSubmissions();
      loadProblem();
    } catch (err) {
      setSubError(err.response?.data?.error || 'Failed to submit solution. Please check your inputs.');
    } finally {
      setSubLoading(false);
    }
  };

  // Open Award Modal for Customer
  const openAwardModal = (sub) => {
    setTargetSub(sub);
    setAwardRating(5);
    setAwardFeedback('Outstanding engineering solution that met all specifications with clean code and great documentation!');
    setAwardError('');
    setAwardModalOpen(true);
  };

  // Confirm Winner Selection & Escrow Payout
  const handleConfirmWinner = async (e) => {
    e.preventDefault();
    if (!targetSub) return;

    try {
      setAwardLoading(true);
      setAwardError('');

      const res = await api.post(`/submissions/${targetSub.id}/select-winner`, {
        rating: awardRating,
        feedback: awardFeedback.trim()
      });

      setAwardModalOpen(false);
      setBannerMsg(`Winner awarded! $${problem.reward_amount.toLocaleString()} bounty transferred to ${res.data.winner_name}. Certificate ${res.data.certificate_code} minted.`);

      // Fire festive victory confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });

      loadProblem();
      loadSubmissions();
    } catch (err) {
      setAwardError(err.response?.data?.error || 'Failed to award winner. Please try again.');
    } finally {
      setAwardLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/problems" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore Problems
        </Link>

        {isOwner && (
          <Link
            to="/dashboard/customer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <Building2 className="w-4 h-4" />
            Manage in Company Dashboard
          </Link>
        )}

        {isDeveloper && (
          <Link
            to="/dashboard/developer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <Code2 className="w-4 h-4" />
            My Submissions & Certificates
          </Link>
        )}
      </div>

      {/* Success Notification Banner */}
      {bannerMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
          <button onClick={() => setBannerMsg('')} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Challenge Completed Banner if Completed */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-indigo-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Challenge Completed & Winner Awarded!
              </h3>
              <p className="text-xs text-slate-300">
                The ${problem.reward_amount.toLocaleString()} bounty was safely released from escrow to the winning solver.
              </p>
            </div>
          </div>
          <Link
            to="/verify"
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            Verify Certificate
          </Link>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="gradient-card rounded-3xl p-6 sm:p-10 border-slate-800 space-y-6">
        
        {/* Category & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {problem.category}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              problem.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              problem.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
              'bg-purple-500/10 text-purple-300 border-purple-500/20'
            }`}>
              {problem.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isCompleted ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
              isPastDeadline ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {isCompleted ? '✓ Completed' : isPastDeadline ? 'Submissions Closed' : 'Active Challenge'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Posted {new Date(problem.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {problem.title}
        </h1>

        {/* Company / Customer Profile Row */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
          <img
            src={problem.customer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${problem.customer_name}`}
            alt={problem.customer_name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">
                {problem.company_name || problem.customer_name}
              </span>
              {problem.is_verified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Verified Enterprise Client" />
              ) : null}
            </div>
            <span className="text-xs text-slate-400">
              Verified Problem Creator • Posted by {problem.customer_name}
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Details (2/3) vs Bounty Action Card (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Problem Specifications & Submissions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description Section */}
          <div className="gradient-card rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Problem Overview & Context
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {problem.description}
            </p>
          </div>

          {/* Requirements & Deliverables */}
          {problem.requirements && (
            <div className="gradient-card rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                Technical Requirements & Deliverables
              </h2>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/70 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                {problem.requirements}
              </div>
            </div>
          )}

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="gradient-card rounded-2xl p-6 space-y-3">
              <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400">Relevant Technologies & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DEVELOPER SECTION: Show their own submitted solution if already submitted */}
          {isDeveloper && mySubmission && (
            <div className="gradient-card rounded-2xl p-6 sm:p-8 space-y-4 border-emerald-500/30 bg-slate-900/90">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Your Submitted Solution
                </h3>
                {mySubmission.is_winner === 1 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    Awarded Winner
                  </span>
                ) : mySubmission.status === 'REJECTED' ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Not Selected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    Under Review by Client
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-300 block">
                  Title: {mySubmission.title}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {mySubmission.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {mySubmission.repo_url && (
                    <a
                      href={mySubmission.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                      View Repository
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}
                  {mySubmission.demo_url && (
                    <a
                      href={mySubmission.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      Live Demo Preview
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}
                </div>
              </div>

              {mySubmission.is_winner === 1 && mySubmission.certificate_code && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Congratulations! Your solution was awarded 1st Place!</span>
                    <span className="text-[11px] text-slate-300">Certificate Code: <strong className="font-mono text-emerald-300">{mySubmission.certificate_code}</strong></span>
                  </div>
                  <Link
                    to={`/verify/${mySubmission.certificate_code}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    View Certificate
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER OWNER SECTION: Submissions Review Room */}
          {isOwner && (
            <div className="gradient-card rounded-2xl p-6 sm:p-8 space-y-6 border-indigo-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Submissions Received ({submissions.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review candidate solutions from developers and award the guaranteed escrow bounty to the best implementation.
                  </p>
                </div>
              </div>

              {submissionsLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading candidate submissions...
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                  <span className="text-sm font-semibold text-slate-300 block">No developer submissions yet</span>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Developers are currently working on your problem. Once submitted, candidate repositories and demo links will appear here for your review.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => {
                    const isWinner = sub.is_winner === 1 || sub.status === 'WINNER';

                    return (
                      <div
                        key={sub.id}
                        className={`p-5 rounded-xl border transition-all ${
                          isWinner
                            ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          {/* Developer Capsule */}
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.developer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.developer_name}`}
                              alt={sub.developer_name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <span className="text-sm font-bold text-white block">{sub.developer_name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Status / Award Button */}
                          <div>
                            {isWinner ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                                  Awarded Winner
                                </span>
                                {sub.certificate_code && (
                                  <Link
                                    to={`/verify/${sub.certificate_code}`}
                                    className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    Certificate
                                  </Link>
                                )}
                              </div>
                            ) : !isCompleted ? (
                              <button
                                onClick={() => openAwardModal(sub)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                              >
                                <Trophy className="w-3.5 h-3.5 text-slate-950" />
                                Select Winner & Award Bounty
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 font-semibold px-2.5 py-1 rounded-full bg-slate-800">
                                Not Selected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Submission Description */}
                        <div className="pt-3 space-y-2">
                          <h4 className="text-sm font-bold text-white">{sub.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                            {sub.description}
                          </p>

                          {/* Links */}
                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            {sub.repo_url && (
                              <a
                                href={sub.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                              >
                                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                                View Code Repository
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                            )}
                            {sub.demo_url && (
                              <a
                                href={sub.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                              >
                                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                                Test Live Demo Preview
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Sticky Column (1/3): Bounty & Actions */}
        <div className="space-y-6 lg:sticky lg:top-28">
          
          <div className="gradient-card rounded-2xl p-6 space-y-6 border-emerald-500/30">
            {/* Reward Card */}
            <div>
              <span className="block text-xs uppercase font-mono text-slate-400 mb-1">Guaranteed Winner Bounty</span>
              <div className="flex items-center gap-2 text-3xl font-extrabold text-emerald-400 font-mono">
                <Award className="w-8 h-8" />
                ${problem.reward_amount.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                🔒 100% held securely in platform escrow
              </span>
            </div>

            {/* Countdown Clock */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="block text-xs uppercase font-mono text-slate-400">
                {isCompleted ? 'Challenge Status' : 'Submission Closes In'}
              </span>
              {isCompleted ? (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center font-bold text-indigo-300 text-sm">
                  ✓ Winner Awarded & Closed
                </div>
              ) : (
                <CountdownTimer deadline={problem.deadline} />
              )}
            </div>

            {/* Submission Call to Action */}
            <div className="pt-2">
              {isOwner ? (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-300">
                  <span>You are the organizer of this challenge. Submissions are reviewed in your review room below.</span>
                </div>
              ) : isCompleted ? (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-400">
                  This challenge has concluded and the winner has been awarded.
                </div>
              ) : isPastDeadline ? (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-400 font-semibold">
                  <span>Submissions are now closed for this challenge statement.</span>
                </div>
              ) : mySubmission ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300 space-y-1">
                  <span className="font-bold block">✓ Solution Submitted</span>
                  <span className="text-[11px] text-slate-400">You have already submitted an entry for this challenge.</span>
                </div>
              ) : isDeveloper ? (
                <button
                  onClick={() => setSubmitModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  Submit Solution
                </button>
              ) : isAuthenticated && user?.role === 'CUSTOMER' ? (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                  You are logged in as a Company Customer. Switch to a Developer account to submit solutions.
                </div>
              ) : (
                <Link
                  to={`/login?redirect=/problems/${problem.id}`}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
                >
                  <Send className="w-4 h-4" />
                  Sign In to Submit Solution
                </Link>
              )}
            </div>
          </div>

          {/* Submission Guidelines Note */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Submission Rules & Deliverables
            </span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 leading-relaxed">
              <li>Provide public GitHub repository URL with full source code.</li>
              <li>Include comprehensive setup instructions in the README.</li>
              <li>Live preview demo URL strongly recommended.</li>
              <li>Winning solution receives the full ${problem.reward_amount.toLocaleString()} reward & verified certificate.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* DEVELOPER SUBMISSION MODAL */}
      {/* ========================================================================= */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  Submit Your Solution
                </h3>
                <span className="text-xs text-slate-400">
                  Target Challenge: <strong className="text-slate-300">{problem.title}</strong>
                </span>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{subError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              {/* Solution Title */}
              <div>
                <label className="block text-xs uppercase font-mono text-slate-400 mb-1">
                  Solution Headline / Name *
                </label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="e.g. Distributed OCR Engine with High Precision Parser"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* GitHub Repo URL */}
              <div>
                <label className="block text-xs uppercase font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                  GitHub / Git Repository URL *
                </label>
                <input
                  type="url"
                  value={subRepoUrl}
                  onChange={(e) => setSubRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/your-repository"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  required
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Must be a public repository containing your source code and documentation.
                </span>
              </div>

              {/* Live Demo URL */}
              <div>
                <label className="block text-xs uppercase font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Live Preview / Demo URL (Optional)
                </label>
                <input
                  type="url"
                  value={subDemoUrl}
                  onChange={(e) => setSubDemoUrl(e.target.value)}
                  placeholder="https://your-demo-url.vercel.app"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              {/* Solution Description */}
              <div>
                <label className="block text-xs uppercase font-mono text-slate-400 mb-1">
                  Technical Architecture & Implementation Details *
                </label>
                <textarea
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  rows={5}
                  placeholder="Explain how you solved this challenge, your technology stack, architectural trade-offs, and test instructions..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {subLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Solution...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Final Solution
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AWARD WINNER MODAL (FOR CUSTOMER) */}
      {/* ========================================================================= */}
      {awardModalOpen && targetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Award Challenge Winner</h3>
                  <span className="text-xs text-slate-400">Release escrow bounty and issue certificate</span>
                </div>
              </div>
              <button
                onClick={() => setAwardModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {awardError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{awardError}</span>
              </div>
            )}

            {/* Recipient Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Winning Developer</span>
                <span className="text-sm font-bold text-white">{targetSub.developer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Winning Solution</span>
                <span className="text-xs font-semibold text-emerald-300 max-w-xs truncate">{targetSub.title}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs uppercase font-mono text-slate-400">Escrow Bounty to Release</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  ${problem.reward_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmWinner} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-xs uppercase font-mono text-slate-400 mb-2">
                  Client Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAwardRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= awardRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-amber-300 ml-2">
                    {awardRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Testimonial / Feedback */}
              <div>
                <label className="block text-xs uppercase font-mono text-slate-400 mb-1">
                  Customer Review & Feedback for Certificate
                </label>
                <textarea
                  value={awardFeedback}
                  onChange={(e) => setAwardFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <span className="font-bold block">⚠️ Important Confirmation</span>
                <p className="text-[11px] leading-relaxed text-amber-300/80">
                  This action is final and executes an atomic database transaction. The ${problem.reward_amount.toLocaleString()} escrow bounty will be directly transferred to {targetSub.developer_name}'s wallet, this challenge will be marked as Completed, and a verifiable digital certificate will be generated.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={awardLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {awardLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Payout...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      Confirm & Release Bounty
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
