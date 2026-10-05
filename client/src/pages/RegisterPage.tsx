import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { StepIndicator } from '../components/StepIndicator';

// Exact matching backend Zod schema
const registerSchema = z.object({
  brideName: z
    .string()
    .trim()
    .min(1, "Bride's name is required")
    .max(100, "Bride's name cannot exceed 100 characters"),
  groomName: z
    .string()
    .trim()
    .min(1, "Groom's name is required")
    .max(100, "Groom's name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  phone: z
    .string()
    .trim()
    .min(8, 'Phone number must be at least 8 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(/^[+0-9\s-]+$/, 'Phone must contain only numbers and optional leading +'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
});

type FormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    brideName: '',
    groomName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (field: keyof FormData, value: string) => {
    try {
      const fieldSchema = registerSchema.shape[field];
      fieldSchema.parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: err.errors[0]?.message }));
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
    setGeneralError('');
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const step1Result = z.object({
      brideName: registerSchema.shape.brideName,
      groomName: registerSchema.shape.groomName,
      phone: registerSchema.shape.phone,
    }).safeParse({
      brideName: formData.brideName,
      groomName: formData.groomName,
      phone: formData.phone,
    });

    if (!step1Result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      step1Result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof FormData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setCurrentStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullResult = registerSchema.safeParse(formData);
    if (!fullResult.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      fullResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof FormData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      await register(formData);
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'The Couple' },
    { id: 2, label: 'Security' },
  ];

  return (
    <div className="min-h-screen-dvh flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 bg-sand-50">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 text-gold-600 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Couple Registration
          </div>
          <h1 className="text-fluid-h1 font-serif font-bold text-obsidian tracking-tight">
            Start Your Invitation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create your account to design and share your wedding story
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-2xs">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card">
          {generalError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {generalError}
            </div>
          )}

          {currentStep === 1 ? (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div>
                <label htmlFor="brideName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Bride's Name
                </label>
                <input
                  id="brideName"
                  type="text"
                  required
                  placeholder="E.g., Anuki"
                  value={formData.brideName}
                  onChange={(e) => handleChange('brideName', e.target.value)}
                  className={`block w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
                    errors.brideName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-gold-500 focus:ring-gold-500'
                  }`}
                />
                {errors.brideName && <p className="mt-1 text-xs text-rose-600">{errors.brideName}</p>}
              </div>

              <div>
                <label htmlFor="groomName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Groom's Name
                </label>
                <input
                  id="groomName"
                  type="text"
                  required
                  placeholder="E.g., Dilan"
                  value={formData.groomName}
                  onChange={(e) => handleChange('groomName', e.target.value)}
                  className={`block w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
                    errors.groomName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-gold-500 focus:ring-gold-500'
                  }`}
                />
                {errors.groomName && <p className="mt-1 text-xs text-rose-600">{errors.groomName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Contact Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="0771234567 or +94771234567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`block w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
                    errors.phone ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-gold-500 focus:ring-gold-500'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs transition-colors min-h-[44px]"
                >
                  Continue to Security
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="couple@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`block w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
                    errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-gold-500 focus:ring-gold-500'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Choose Password (min 8 characters)
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`block w-full rounded-xl border px-3.5 py-2.5 pr-11 text-base sm:text-sm focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
                      errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-gold-500 focus:ring-gold-500'
                    }`}
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
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-black text-white py-3 px-4 text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors min-h-[44px]"
                >
                  {loading ? 'Creating Account...' : 'Complete & Verify Email'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-700">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
