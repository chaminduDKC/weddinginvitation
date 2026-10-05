import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RotateCw } from 'lucide-react';
import { useAuth } from '../lib/auth';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email] = useState(emailParam);

  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for Resend code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submitOtp = async (code: string) => {
    if (!email) {
      setError('Email address is missing. Please sign up or log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtp(email, code);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please try again.');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    const lastDigit = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = lastDigit;
    setOtpDigits(updated);
    setError('');

    // Advance focus to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if 6th digit entered
    const fullCode = updated.join('');
    if (fullCode.length === 6 && !updated.includes('')) {
      submitOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste support: Handles copying 6-digit SMS / Email code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const updated = [...otpDigits];
    digits.forEach((d, i) => {
      if (i < 6) updated[i] = d;
    });
    setOtpDigits(updated);

    if (digits.length >= 6) {
      submitOtp(digits.slice(0, 6).join(''));
    } else {
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      await resendOtp(email);
      setResendCooldown(60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen-dvh flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 bg-sand-50">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gold-400/20 text-gold-600 flex items-center justify-center">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
            Check Your Email
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            We sent a 6-digit confirmation code to{' '}
            <strong className="text-obsidian">{email || 'your email'}</strong>
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>A new verification code has been dispatched.</span>
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div className="flex justify-between gap-1.5 sm:gap-2.5">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono text-obsidian bg-sand-50/50 border border-slate-300 rounded-xl focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all shadow-2xs"
              />
            ))}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => submitOtp(otpDigits.join(''))}
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              {loading ? 'Verifying Code...' : 'Verify Code'}
            </button>

            {/* Resend Countdown */}
            <div className="text-center pt-2">
              {resendCooldown > 0 ? (
                <p className="text-xs text-slate-400">
                  Resend available in{' '}
                  <span className="font-semibold text-slate-700 font-mono">
                    0:{resendCooldown < 10 ? `0${resendCooldown}` : resendCooldown}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 hover:text-gold-700 transition-colors min-h-[44px] px-3"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  Resend Verification Code
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Wrong email address?{' '}
            <Link to="/register" className="font-semibold text-gold-600 hover:text-gold-700">
              Sign up again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
