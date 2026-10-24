import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Award, Globe, MessageSquare, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-lg font-extrabold text-white">
                ProblemSolve<span className="text-emerald-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bridging engineering talent with innovative companies. Solve complex challenges, earn bounties, and collect verifiable digital credentials.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Network Online
              </span>
            </div>
          </div>

          {/* Col 2: For Solvers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              For Solvers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/problems" className="hover:text-emerald-400 transition-colors">Explore Open Problems</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-emerald-400 transition-colors">Global Leaderboard</Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-emerald-400 transition-colors">Certificate Verification</Link>
              </li>
              <li>
                <Link to="/register?role=DEVELOPER" className="hover:text-emerald-400 transition-colors">Become a Solver</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Customers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              For Companies
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/register?role=CUSTOMER" className="hover:text-emerald-400 transition-colors">Post a Challenge</Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-emerald-400 transition-colors">How Escrow Works</Link>
              </li>
              <li>
                <Link to="/#trust" className="hover:text-emerald-400 transition-colors">Company Verification</Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-emerald-400 transition-colors">Pricing & Bounties</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Trust & Security
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Verified Credential Engine
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All certificates issued on ProblemSolve Hub carry unique cryptographic verification IDs backed by our SQLite tamper-proof ledger.
              </p>
              <Link
                to="/verify"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Lookup a Certificate &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ProblemSolve Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
