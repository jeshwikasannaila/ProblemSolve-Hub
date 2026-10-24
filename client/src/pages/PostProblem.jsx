import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Award, 
  Calendar, 
  Tag, 
  Code2, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  PlusCircle, 
  ArrowLeft,
  Coins,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostProblem() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & Data');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [rewardAmount, setRewardAmount] = useState('250');
  
  // Default deadline: 7 days from now
  const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [deadline, setDeadline] = useState(defaultDeadline);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'AI & Data',
    'Backend & Cloud',
    'Frontend & UI',
    'Mobile & PWA',
    'Security & DevOps',
    'Full-Stack & Systems'
  ];

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const currentBalance = Number(user?.wallet_balance || 0);
  const bountyNum = parseFloat(rewardAmount) || 0;
  const isBalanceSufficient = currentBalance >= bountyNum;
  const remainingBalance = currentBalance - bountyNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('You must be signed in to post a challenge statement.');
      return;
    }

    if (user?.role !== 'CUSTOMER' && user?.role !== 'ADMIN') {
      setError('Only Company or Customer accounts can post challenges.');
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    if (bountyNum <= 0) {
      setError('Reward bounty amount must be greater than $0.');
      return;
    }

    if (!isBalanceSufficient) {
      setError(`Insufficient virtual balance. You have $${currentBalance.toLocaleString()} available, but this bounty requires $${bountyNum.toLocaleString()}.`);
      return;
    }

    if (!deadline || new Date(deadline) <= new Date()) {
      setError('Deadline must be set to a future date and time.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        requirements: requirements.trim(),
        tags,
        rewardAmount: bountyNum,
        deadline: new Date(deadline).toISOString()
      };

      const res = await api.post('/problems', payload);
      
      // Navigate to customer dashboard or new problem
      navigate(`/problems/${res.data.problem.id}`, { 
        state: { message: 'Challenge published successfully! Bounty locked in escrow.' } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
          <Info className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-sm text-slate-400">You must be logged in as a Company or Customer to post problems.</p>
        <Link
          to="/login?redirect=/post-problem"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (user?.role === 'DEVELOPER') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Company Account Required</h2>
        <p className="text-sm text-slate-400">
          You are currently signed in as a <span className="text-emerald-400 font-bold">Developer</span>. Only Customer and Company accounts can publish challenge statements with bounties.
        </p>
        <Link
          to="/problems"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:bg-slate-800"
        >
          Browse Open Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link to="/dashboard/customer" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Challenge Creator
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Publish a Real-World Engineering Problem
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Specify technical deliverables, set a guaranteed reward bounty, and invite top developers to submit solutions.
          </p>
        </div>

        {/* Current Wallet Balance Capsule */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-right self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Available Virtual Balance</span>
          <span className="text-lg font-mono font-extrabold text-emerald-400 flex items-center gap-1.5 justify-end">
            <Coins className="w-4 h-4 text-emerald-400" />
            ${currentBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="gradient-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800/80 pb-3">
            <FileText className="w-5 h-5 text-emerald-400" />
            1. Problem Overview
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Challenge Statement Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Video Processing Pipeline with Low Latency RTSP"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Clear, descriptive summary of the engineering statement.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technical Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty Level <span className="text-rose-400">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Beginner">Beginner (Starter bounties, quick fixes)</option>
                <option value="Intermediate">Intermediate (Core feature development)</option>
                <option value="Advanced">Advanced (Complex architectures, algorithms)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Problem Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete business context, the existing problem/bottleneck, and why this solution is needed..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Technical Requirements & Expected Deliverables
            </label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="1. Must include clean Dockerfile and compose setup&#10;2. Latency under 50ms on benchmark dataset&#10;3. Full unit tests covering edge cases"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Specify unit test requirements, performance benchmarks, and deliverable format.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Skills & Technology Tags (Press Enter or Comma to add)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. Python, Docker, PyTorch, React (Press Enter to add)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Bounty & Escrow Allocation */}
        <div className="gradient-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800/80 pb-3">
            <Award className="w-5 h-5 text-emerald-400" />
            2. Bounty Reward & Deadline
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reward Bounty Amount (USD) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                100% of this bounty will be held in virtual escrow and disbursed to the winner.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Submission Deadline <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Submissions automatically close once this countdown expires.
              </span>
            </div>
          </div>

          {/* Virtual Escrow Calculation Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block font-bold">
              Virtual Escrow Breakdown
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Current Account Balance:</span>
                <span className="font-mono font-bold text-white">${currentBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Reward Locked in Escrow:</span>
                <span className="font-mono font-bold">-${bountyNum.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                <span className={remainingBalance >= 0 ? 'text-slate-300' : 'text-rose-400'}>
                  Remaining Balance:
                </span>
                <span className={`font-mono ${remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {!isBalanceSufficient && (
              <div className="pt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Insufficient funds. Please reduce bounty to ${currentBalance.toLocaleString()} or less.
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <Link
            to="/dashboard/customer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !isBalanceSufficient}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Locking Escrow & Publishing...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Publish Challenge Statement (${bountyNum.toLocaleString()})
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
