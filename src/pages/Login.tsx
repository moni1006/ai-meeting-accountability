import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from '@/lib/router';

export function Login() {
  const { login, demoLogin } = useStore();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('demo@meeting.ai');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Try the demo login.');
    }
  };

  const handleDemo = () => {
    demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-indigo-300 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">ActionAI</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Turn meetings into<br />accountable action.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-10 max-w-md">
            AI-powered meeting analysis that extracts tasks, owners, and deadlines — then tracks them until completion.
          </p>
          <div className="space-y-4 max-w-md">
            {[
              'AI extracts action items from any transcript',
              'Automatic deadline & priority detection',
              'Real-time accountability dashboard',
              'Track tasks from assignment to completion',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-blue-50 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">ActionAI</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to your accountability dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 transition-all"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Demo Login
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            Demo credentials: demo@meeting.ai / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
