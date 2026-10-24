import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, PlusCircle, Compass, ShieldCheck, Trophy, LogIn, LogOut, User, Coins, Building2, Code2, ShieldAlert, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Explore Problems', path: '/problems', icon: Compass },
    { name: 'How It Works', path: '/#how-it-works', icon: Sparkles },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Verify Certificate', path: '/verify', icon: ShieldCheck },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'CUSTOMER':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
            <Building2 className="w-3 h-3" />
            Company
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <ShieldAlert className="w-3 h-3" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Code2 className="w-3 h-3" />
            Developer
          </span>
        );
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                ProblemSolve<span className="text-emerald-400">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Solve • Earn • Verify
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {/* Virtual Wallet Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  ${Number(user.wallet_balance || 0).toLocaleString()}
                </div>

                {/* User Info Capsule */}
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user.name}
                    </span>
                    <div className="mt-0.5">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>

                {/* Role specific quick action */}
                {(user.role === 'CUSTOMER' || user.role === 'ADMIN') && (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/dashboard/customer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/post-problem"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Post Problem
                    </Link>
                  </div>
                )}

                {user.role === 'DEVELOPER' && (
                  <Link
                    to="/dashboard/developer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02]"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    My Submissions
                  </Link>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-slate-400" />
                  Sign In
                </Link>

                <Link
                  to="/register?role=CUSTOMER"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Problem
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {isAuthenticated && user && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <span className="text-sm font-bold text-white block">{user.name}</span>
                  <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Balance</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  ${Number(user.wallet_balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  <Icon className="w-5 h-5 text-emerald-400" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {(user?.role === 'CUSTOMER' || user?.role === 'ADMIN') && (
                  <>
                    <Link
                      to="/dashboard/customer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      Customer Dashboard
                    </Link>
                    <Link
                      to="/post-problem"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Post a Problem
                    </Link>
                  </>
                )}
                {user?.role === 'DEVELOPER' && (
                  <Link
                    to="/dashboard/developer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800"
                  >
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    My Submissions & Workspace
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register?role=CUSTOMER"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Problem
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
