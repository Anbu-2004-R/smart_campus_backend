import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, School, Shield } from 'lucide-react';
import { authApi } from '../../services/api';

const readToken = () => {
  const hash = window.location.hash || '';
  const match = hash.match(/[?&]token=([^&]+)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

export const ActivationPage: React.FC = () => {
  const token = useMemo(readToken, []);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const goToLogin = () => {
    window.location.hash = '#/login';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('The two passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.activate(token, password);
      setIsComplete(true);
    } catch (activationError) {
      setError(
        activationError instanceof Error
          ? activationError.message
          : 'Unable to activate this account. Request a new invitation.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070D18] text-slate-100 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <main className="w-full max-w-[430px] relative z-10">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1222]/95 border border-[#1B2B47] shadow-2xl shadow-[#03060C]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center border border-indigo-400/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white">Smart Campus ERP</div>
              <div className="text-[11px] text-indigo-300">Apex Institute of Technology</div>
            </div>
          </div>

          {!token ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-950/70 border border-rose-500/30 text-[11px] font-medium text-rose-300">
                <AlertCircle className="w-3 h-3" />
                <span>Invalid activation link</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Activation link missing</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                This page needs a single-use activation token. Open the complete link sent by the
                Office of the Registrar, or sign in if your account is already active.
              </p>
              <button
                onClick={goToLogin}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : isComplete ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-medium text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>Account activated</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">You are ready to sign in</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your password has been set and the account is active. Use your login ID and the new
                password on the sign-in screen.
              </p>
              <button
                onClick={goToLogin}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue to sign in
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 mb-5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/30 text-[11px] font-medium text-indigo-300">
                  <Shield className="w-3 h-3" />
                  <span>Secure account setup</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight pt-1">Create your password</h1>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose a password with at least 8 characters. This activation link can only be
                  used once.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoFocus
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Repeat your password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Activating account...' : 'Activate account'}
                {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivationPage;
