import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { AsworaLogo } from '../components/AsworaLogo.js';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@aswora.ai');
    setPassword('DemoPassword2026!');
    if (!isLogin) {
      setName('Aswora Explorer');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#070a12] via-[#0c101c] to-[#111728] text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="rounded-3xl border border-slate-800 bg-brand-surface/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-col items-center text-center mb-6">
            <AsworaLogo size={44} />
            <h1 className="mt-3 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Welcome back to Aswora AI' : 'Create your Aswora AI Account'}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {isLogin
                ? 'Sign in to access your models, chats, and custom knowledge'
                : 'Experience open-weight intelligence directly on your device'}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 animate-slide-up">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aswin Kumar"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/70 border border-brand-border text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aswin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/70 border border-brand-border text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-brand-dark/70 border border-brand-border text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Aswora' : 'Create Free Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 1-click Demo Fill shortcut */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Quick fill test credentials
            </button>
          </div>

          {/* Toggle Login / Register */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {isLogin ? (
                <>Don't have an account yet? <span className="text-cyan-400 font-semibold ml-1">Register</span></>
              ) : (
                <>Already have an account? <span className="text-cyan-400 font-semibold ml-1">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
