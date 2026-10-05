import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/axios';
import { toast } from 'react-toastify';
import { Heart, Lock, Mail } from 'lucide-react';
import { ApiResponse, User } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<ApiResponse<{ user: User; accessToken?: string; refreshToken?: string }>>('/api/auth/login', { email, password });
      
      if (data.success && data.data?.user.role === 'ADMIN') {
        login(data.data.user, data.data.accessToken, data.data.refreshToken);
        toast.success('Login successful');
        navigate('/admin/orders', { replace: true });
      } else {
        toast.error('Unauthorized: Admin access required');
        await api.post('/api/auth/logout'); // clear cookies
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-3 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-2xl bg-indigo-50 p-3 sm:p-3.5 mb-3 sm:mb-4">
            <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Admin Login</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">Enter your credentials to access the admin panel</p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 py-2.5 sm:py-2 pl-10 pr-3 text-slate-900 text-base sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  placeholder="admin@weddingplatform.lk"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 py-2.5 sm:py-2 pl-10 pr-3 text-slate-900 text-base sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center rounded-xl bg-indigo-600 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-colors min-h-[44px]"
            >
              {loading ? 'Signing in...' : 'Sign in to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

