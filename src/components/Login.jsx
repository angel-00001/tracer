import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';

export function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const data = await signUp(email, password);
        // If email confirmation is required, the session will be null
        if (data.session) {
          onLoginSuccess(data.session.user);
        } else {
          setSuccessMsg('Account created! Check your email for a confirmation link, then sign in.');
          setMode('signin');
        }
      } else {
        const data = await signIn(email, password);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tracer</h1>
          <p className="text-gray-500 text-sm mt-1">Attendance tracker for students</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Toggle */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => mode !== 'signin' && toggleMode()}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${mode === 'signin'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => mode !== 'signup' && toggleMode()}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${mode === 'signup'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Success message */}
            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-green-700">{successMsg}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
                  placeholder="you@example.com"
                  required
                  autoComplete={mode === 'signup' ? 'email' : 'username'}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
                </div>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              {mode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-indigo-600 font-medium hover:underline focus:outline-none"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Tracer · Attendance tracking made simple
        </p>
      </div>
    </div>
  );
}