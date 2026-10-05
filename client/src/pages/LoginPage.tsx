import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Heart, KeyRound, CheckCircle2, RotateCw, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface LoginPageProps {
  initialForgotMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialForgotMode = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Reset Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'success'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Check if forgot password mode was directly requested
  useEffect(() => {
    if (initialForgotMode || searchParams.get('forgot') === 'true') {
      openForgotModal();
    }
  }, [initialForgotMode, searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto redirect on password reset success
  useEffect(() => {
    if (forgotStep === 'success') {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [forgotStep, navigate]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForgotModal && !forgotLoading) {
        setShowForgotModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForgotModal, forgotLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.requiresOtp && res.email) {
        navigate(`/verify-otp?email=${encodeURIComponent(res.email)}`);
        return;
      }
      if (res.success) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotStep('request');
    setForgotOtp(['', '', '', '', '', '']);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccessMsg('');
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    if (forgotLoading) return;
    setShowForgotModal(false);
  };

  // Step 1: Request OTP for password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim();
    if (!targetEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccessMsg('');

    try {
      await forgotPassword(targetEmail);
      setForgotStep('verify');
      setResendCooldown(60);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setForgotError(err.message || 'Could not send verification code. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Handle OTP digit inputs
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...forgotOtp];
      updated[index] = '';
      setForgotOtp(updated);
      return;
    }

    const lastDigit = cleaned.slice(-1);
    const updated = [...forgotOtp];
    updated[index] = lastDigit;
    setForgotOtp(updated);
    setForgotError('');

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const updated = [...forgotOtp];
    digits.forEach((d, i) => {
      if (i < 6) updated[i] = d;
    });
    setForgotOtp(updated);
    if (digits.length >= 6) {
      otpRefs.current[5]?.focus();
    } else {
      otpRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending || !forgotEmail) return;
    setIsResending(true);
    setForgotError('');
    try {
      await forgotPassword(forgotEmail.trim());
      setResendCooldown(60);
      setForgotSuccessMsg('A new 6-digit code has been dispatched to your email.');
      setTimeout(() => setForgotSuccessMsg(''), 4000);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Submit OTP & Set New Password
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = forgotOtp.join('');

    if (code.length !== 6) {
      setForgotError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      await resetPassword(forgotEmail.trim(), code, forgotNewPassword);
      setForgotStep('success');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen-dvh flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 bg-sand-50">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="h-6 w-6 fill-rose-500" />
          </div>
          <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to manage your wedding invitation and guests
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="couple@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-base sm:text-sm text-obsidian focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-medium text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-11 text-base sm:text-sm text-obsidian focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors min-h-[44px]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-gold-600 hover:text-gold-700">
              Create an invitation
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForgotModal();
          }}
          aria-modal="true"
          role="dialog"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 overflow-hidden">
            {/* Modal Close Button */}
            <button
              onClick={closeForgotModal}
              disabled={forgotLoading}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Step 1: Request Code by Email */}
            {forgotStep === 'request' && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-gold-600 flex items-center justify-center">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-obsidian tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Enter your account email address and we'll send you a 6-digit verification code.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="reset-email"
                        type="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        required
                        placeholder="couple@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-base sm:text-sm text-obsidian focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors min-h-[44px]"
                  >
                    {forgotLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Remember your password? <span className="font-semibold text-gold-600">Back to Sign In</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verify Code & Enter New Password */}
            {forgotStep === 'verify' && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 text-gold-600 flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-obsidian tracking-tight">
                    Verify & Reset
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    We sent a 6-digit code to <strong className="text-obsidian">{forgotEmail}</strong>
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {forgotError}
                  </div>
                )}

                {forgotSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCompleteReset} className="space-y-4">
                  {/* 6 Digit Inputs */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      6-Digit Verification Code
                    </label>
                    <div className="flex justify-between gap-1.5 sm:gap-2">
                      {forgotOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          disabled={forgotLoading}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-obsidian bg-sand-50/50 border border-slate-300 rounded-xl focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="reset-new-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="reset-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 8 characters"
                        minLength={8}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-11 text-base sm:text-sm text-obsidian focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        id="reset-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        minLength={8}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-11 text-base sm:text-sm text-obsidian focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.join('').length !== 6 || forgotNewPassword.length < 8}
                    className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors min-h-[44px]"
                  >
                    {forgotLoading ? 'Updating Password...' : 'Reset Password & Sign In'}
                  </button>
                </form>

                {/* Resend & Back Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setForgotError('');
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                    className="inline-flex items-center gap-1.5 font-semibold text-gold-600 hover:text-gold-700 disabled:opacity-50 transition-colors"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {forgotStep === 'success' && (
              <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-bold text-obsidian tracking-tight">
                    Password Reset!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Your password has been successfully changed and you are now signed in.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard', { replace: true })}
                    className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs transition-colors min-h-[44px]"
                  >
                    Continue to Dashboard
                  </button>
                </div>
                <p className="text-2xs text-slate-400">
                  Redirecting automatically...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
