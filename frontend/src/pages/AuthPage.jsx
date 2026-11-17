import React, { useState } from 'react';
import {
  Bot,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Product Manager');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(fullName, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left column: SaaS Product Value Pitch */}
        <div className="p-8 md:p-10 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  TaskFlow AI
                </h1>
                <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">
                  Next-Gen Productivity SaaS
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-3 leading-snug">
              Work smarter with autonomous AI task orchestration.
            </h2>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed">
              Experience modern Kanban workflow, instant AI task specification generator, smart priority scoring, and daily standup synthesis powered by Supabase.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>AI Task Description & Checklist Generator</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Automated Smart Prioritization Scoring (1-100)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-violet-500/15 text-violet-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Supabase PostgreSQL + JWT Secure Isolation</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Internship Assignment Project</span>
            <span className="font-mono text-indigo-400">v1.0.0</span>
          </div>
        </div>

        {/* Right column: Auth Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          {/* 1-Click Demo Evaluation Button */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/25 text-center">
            <span className="block text-[11px] font-bold text-indigo-300 mb-1.5 uppercase tracking-wider">
              ⚡ Evaluator Instant Access
            </span>
            <p className="text-xs text-slate-400 mb-3">
              One-click instant sign in with pre-seeded demo tasks, projects, and AI metrics.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {demoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Instant Demo Sign In</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-400 font-semibold uppercase">
              Or {isRegister ? 'Register Account' : 'Sign In'}
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Product Manager">Product Manager</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="DevOps Lead">DevOps Lead</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>

          {/* Toggle register / login */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setError('');
                setIsRegister(!isRegister);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
