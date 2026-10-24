import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Coins, 
  Award, 
  Clock, 
  Users, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  X, 
  Loader2, 
  FileText,
  Compass,
  Trophy,
  Star,
  GitBranch,
  Globe,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/problems/CountdownTimer';

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [editingProblem, setEditingProblem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDifficulty, setEditDifficulty] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRequirements, setEditRequirements] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Review Submissions Modal State
  const [reviewProblem, setReviewProblem] = useState(null);
  const [reviewSubmissions, setReviewSubmissions] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Award Winner Modal State (inside Review Submissions)
  const [awardTargetSub, setAwardTargetSub] = useState(null);
  const [awardRating, setAwardRating] = useState(5);
  const [awardFeedback, setAwardFeedback] = useState('');
  const [awardLoading, setAwardLoading] = useState(false);
  const [awardError, setAwardError] = useState('');
  const [awardSuccessMsg, setAwardSuccessMsg] = useState('');

  const loadCustomerProblems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/problems/customer/mine');
      setProblems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your posted challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomerProblems();
    }
  }, [isAuthenticated]);

  // Open Edit Modal
  const openEditModal = (prob) => {
    setEditingProblem(prob);
    setEditTitle(prob.title);
    setEditCategory(prob.category);
    setEditDifficulty(prob.difficulty);
    setEditDescription(prob.description);
    setEditRequirements(prob.requirements || '');
    setEditTags(prob.tags || []);
    setEditTagInput('');
    setEditDeadline(new Date(prob.deadline).toISOString().slice(0, 16));
    setEditError('');
    setEditSuccess('');
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditingProblem(null);
    setEditError('');
    setEditSuccess('');
  };

  // Handle Edit Tag additions
  const handleAddEditTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = editTagInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !editTags.includes(trimmed)) {
        setEditTags([...editTags, trimmed]);
        setEditTagInput('');
      }
    }
  };

  const handleRemoveEditTag = (tagToRemove) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProblem) return;

    setEditError('');
    setEditSuccess('');
    setEditLoading(true);

    try {
      const payload = {
        title: editTitle.trim(),
        category: editCategory,
        difficulty: editDifficulty,
        description: editDescription.trim(),
        requirements: editRequirements.trim(),
        tags: editTags,
        deadline: new Date(editDeadline).toISOString()
      };

      await api.put(`/problems/${editingProblem.id}`, payload);
      setEditSuccess('Challenge updated successfully!');
      
      // Refresh list
      loadCustomerProblems();

      setTimeout(() => {
        closeEditModal();
      }, 900);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update challenge.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open Review Submissions Modal
  const openReviewModal = async (prob) => {
    setReviewProblem(prob);
    setReviewError('');
    setAwardTargetSub(null);
    setAwardSuccessMsg('');
    try {
      setReviewLoading(true);
      const res = await api.get(`/submissions/problem/${prob.id}`);
      setReviewSubmissions(res.data.submissions || []);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to load submissions for this problem.');
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReviewModal = () => {
    setReviewProblem(null);
    setReviewSubmissions([]);
    setAwardTargetSub(null);
    setAwardSuccessMsg('');
  };

  // Start Award process for a specific submission
  const startAwardProcess = (sub) => {
    setAwardTargetSub(sub);
    setAwardRating(5);
    setAwardFeedback('Outstanding engineering solution that met all specifications with clean code and great documentation!');
    setAwardError('');
  };

  // Execute Winner Award & Payout Transaction
  const handleConfirmWinnerPayout = async (e) => {
    e.preventDefault();
    if (!awardTargetSub || !reviewProblem) return;

    try {
      setAwardLoading(true);
      setAwardError('');

      const res = await api.post(`/submissions/${awardTargetSub.id}/select-winner`, {
        rating: awardRating,
        feedback: awardFeedback.trim()
      });

      setAwardSuccessMsg(`Winner successfully awarded! $${reviewProblem.reward_amount.toLocaleString()} released to ${res.data.winner_name}. Certificate Code: ${res.data.certificate_code}`);

      // Fire victory confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Refetch submissions and problem list
      const updatedSubs = await api.get(`/submissions/problem/${reviewProblem.id}`);
      setReviewSubmissions(updatedSubs.data.submissions || []);
      setAwardTargetSub(null);
      loadCustomerProblems();
    } catch (err) {
      setAwardError(err.response?.data?.error || 'Failed to select winner.');
    } finally {
      setAwardLoading(false);
    }
  };

  // KPI Calculations
  const totalPosted = problems.length;
  const activeCount = problems.filter(p => p.status === 'ACTIVE').length;
  const totalBountyInvested = problems.reduce((sum, p) => sum + (p.reward_amount || 0), 0);
  const totalSubmissions = problems.reduce((sum, p) => sum + (p.submission_count || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-sm text-slate-400">Please sign in to access your Company Dashboard.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Company Control Center
            </span>
            {user?.company_name && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                {user.company_name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your challenge statements, review developer submissions, and award escrow bounties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/post-problem"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Challenge
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Challenges Posted */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Total Challenges</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalPosted}
          </div>
          <span className="text-[11px] text-slate-500 block">Posted from your account</span>
        </div>

        {/* Active Bounties in Escrow */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Total Bounties Allocated</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            ${totalBountyInvested.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block">Locked in platform escrow</span>
        </div>

        {/* Active Problems Count */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Active Competitions</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {activeCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Open for developer submissions</span>
        </div>

        {/* Submissions Received */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Submissions Received</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalSubmissions}
          </div>
          <span className="text-[11px] text-slate-500 block">Candidate solutions submitted</span>
        </div>
      </div>

      {/* Posted Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Your Problem Statements
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {problems.length} total entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading your challenges...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No challenges posted yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Ready to tap into elite developer talent? Publish your first engineering problem statement with a reward bounty.
            </p>
            <Link
              to="/post-problem"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Post Your First Challenge
            </Link>
          </div>
        ) : (
          <div className="gradient-card rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase font-mono text-slate-400 bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Challenge Title</th>
                    <th className="px-6 py-4">Domain & Level</th>
                    <th className="px-6 py-4 text-center">Bounty</th>
                    <th className="px-6 py-4 text-center">Submissions</th>
                    <th className="px-6 py-4">Deadline Status</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {problems.map((prob) => {
                    const statusColors = {
                      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      UNDER_REVIEW: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
                      COMPLETED: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
                      CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }[prob.status] || 'bg-slate-800 text-slate-300 border-slate-700';

                    return (
                      <tr key={prob.id} className="hover:bg-slate-900/40 transition-colors">
                        {/* Title */}
                        <td className="px-6 py-4 font-semibold text-white max-w-xs">
                          <Link to={`/problems/${prob.id}`} className="hover:text-emerald-300 transition-colors line-clamp-2">
                            {prob.title}
                          </Link>
                          <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                            ID #{prob.id} • Posted {new Date(prob.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Category & Difficulty */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-200 block">{prob.category}</span>
                          <span className="text-[11px] text-slate-400">{prob.difficulty}</span>
                        </td>

                        {/* Bounty */}
                        <td className="px-6 py-4 text-center font-mono font-bold text-emerald-400">
                          ${prob.reward_amount.toLocaleString()}
                        </td>

                        {/* Submissions (Clickable to review) */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openReviewModal(prob)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors group"
                            title="Click to view candidate submissions"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            {prob.submission_count || 0}
                          </button>
                        </td>

                        {/* Deadline */}
                        <td className="px-6 py-4">
                          <CountdownTimer deadline={prob.deadline} compact={true} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors}`}>
                            {prob.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Review Submissions Action Button */}
                            <button
                              onClick={() => openReviewModal(prob)}
                              title="Review Submissions"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-400 border border-slate-700/60 hover:border-indigo-500/40 transition-colors relative"
                            >
                              <Users className="w-4 h-4" />
                              {prob.submission_count > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
                              )}
                            </button>

                            {/* View Statement Link */}
                            <Link
                              to={`/problems/${prob.id}`}
                              title="View Problem Statement"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Edit Problem Button */}
                            <button
                              onClick={() => openEditModal(prob)}
                              title={prob.status === 'COMPLETED' ? 'Completed challenges cannot be edited' : 'Edit Challenge'}
                              disabled={prob.status === 'COMPLETED'}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REVIEW SUBMISSIONS MODAL */}
      {/* ========================================================================= */}
      {reviewProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Candidate Submissions
                </h3>
                <span className="text-xs text-slate-400">
                  Challenge: <strong className="text-slate-300">{reviewProblem.title}</strong> (${reviewProblem.reward_amount.toLocaleString()} Bounty)
                </span>
              </div>
              <button
                onClick={closeReviewModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success message banner if winner awarded */}
            {awardSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{awardSuccessMsg}</span>
              </div>
            )}

            {/* Submissions List */}
            {reviewLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                Loading candidate solutions...
              </div>
            ) : reviewError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {reviewError}
              </div>
            ) : reviewSubmissions.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-3">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Submissions Received Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Developers are working on your challenge statement. Once submissions are received, they will be listed here for your evaluation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewSubmissions.map((sub) => {
                  const isWinner = sub.is_winner === 1 || sub.status === 'WINNER';

                  return (
                    <div
                      key={sub.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isWinner
                          ? 'bg-slate-950 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        {/* Developer info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={sub.developer_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.developer_name}`}
                            alt={sub.developer_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="text-sm font-bold text-white block">{sub.developer_name}</span>
                            <span className="text-xs text-slate-400">{sub.developer_email}</span>
                          </div>
                        </div>

                        {/* Status / Select Winner Action */}
                        <div>
                          {isWinner ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                                1st Place Winner
                              </span>
                              {sub.certificate_code && (
                                <Link
                                  to={`/verify/${sub.certificate_code}`}
                                  target="_blank"
                                  className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  Certificate
                                </Link>
                              )}
                            </div>
                          ) : reviewProblem.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => startAwardProcess(sub)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                              Select as Winner
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-semibold px-2.5 py-1 rounded-full bg-slate-800">
                              Not Selected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submission details */}
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
                              Source Code Repository
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
                              Live Demo
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

            {/* Award Winner Confirmation Sub-form inside Modal */}
            {awardTargetSub && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Confirm Award for {awardTargetSub.developer_name}
                  </h4>
                  <button
                    onClick={() => setAwardTargetSub(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {awardError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {awardError}
                  </div>
                )}

                <form onSubmit={handleConfirmWinnerPayout} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-mono text-slate-400 mb-2">
                      Star Rating (1 to 5 Stars)
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
                            className={`w-6 h-6 ${
                              star <= awardRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono text-amber-300 ml-2">
                        {awardRating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono text-slate-400 mb-1">
                      Feedback / Testimonial for Verified Certificate
                    </label>
                    <textarea
                      value={awardFeedback}
                      onChange={(e) => setAwardFeedback(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                    Releasing this ${reviewProblem.reward_amount.toLocaleString()} reward will finalize the challenge, transfer the funds to the winning developer, and mint a permanent certificate.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAwardTargetSub(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={awardLoading}
                      className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {awardLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
                      Release Escrow Bounty & Award
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={closeReviewModal}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Close Room
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PROBLEM MODAL */}
      {/* ========================================================================= */}
      {editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 space-y-6 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                  Edit Challenge Statement
                </h3>
                <span className="text-xs text-slate-400">ID #{editingProblem.id} • {editingProblem.category}</span>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Error / Success Alerts */}
            {editError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            {editSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AI & Data">AI & Data</option>
                    <option value="Backend & Cloud">Backend & Cloud</option>
                    <option value="Frontend & UI">Frontend & UI</option>
                    <option value="Mobile & PWA">Mobile & PWA</option>
                    <option value="Security & DevOps">Security & DevOps</option>
                    <option value="Full-Stack & Systems">Full-Stack & Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Requirements & Deliverables</label>
                <textarea
                  rows={3}
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skills Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveEditTag(tag)}
                        className="hover:text-rose-400 ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={handleAddEditTag}
                  placeholder="Type tag and press Enter"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline Date & Time</label>
                <input
                  type="datetime-local"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
