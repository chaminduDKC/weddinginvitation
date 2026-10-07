import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './axios';
import { User, ApiResponse } from '../types';

interface RegisterInput {
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresOtp?: boolean; email?: string }>;
  register: (data: RegisterInput) => Promise<{ success: boolean; email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean }>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('wedding_client_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount via /api/auth/me
  // Cookies are sent automatically. If access token is expired, the Axios 401 interceptor
  // seamlessly attempts a refresh using the httpOnly refresh_token cookie.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          try {
            localStorage.setItem('wedding_client_user', JSON.stringify(data.data.user));
          } catch {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem('wedding_client_user');
          } catch {}
        }
      } catch {
        setUser(null);
        try {
          localStorage.removeItem('wedding_client_user');
          localStorage.removeItem('wedding_client_access_token');
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for session expiry from Axios interceptor when refresh fails
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      try {
        localStorage.removeItem('wedding_client_user');
        localStorage.removeItem('wedding_client_access_token');
      } catch {}
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Log from f");
    
    try {
      
      const { data } = await api.post<ApiResponse<{ user: User; accessToken?: string }>>('/api/auth/login', {
        email,
        password,
      });

      if (data.success && data.data?.user) {
        setUser(data.data.user);
        try {
          localStorage.setItem('wedding_client_user', JSON.stringify(data.data.user));
          if (data.data.accessToken) {
            localStorage.setItem('wedding_client_access_token', data.data.accessToken);
          }
        } catch {}
        return { success: true };
      }
      return { success: false };
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        return { success: false, requiresOtp: true, email };
      }
      throw new Error(err.response?.data?.error || 'Invalid email or password');
    }
  };

  const register = async (input: RegisterInput) => {
    const { data } = await api.post<ApiResponse<{ email: string }>>('/api/auth/register', input);
    if (!data.success) {
      throw new Error(data.error || 'Registration failed');
    }
    return { success: true, email: input.email };
  };

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; accessToken?: string }>>('/api/auth/verify-otp', {
      email,
      otp,
    });

    if (data.success && data.data?.user) {
      setUser(data.data.user);
      try {
        localStorage.setItem('wedding_client_user', JSON.stringify(data.data.user));
        if (data.data.accessToken) {
          localStorage.setItem('wedding_client_access_token', data.data.accessToken);
        }
      } catch {}
      return { success: true };
    }
    throw new Error(data.error || 'Verification failed');
  };

  const resendOtp = async (email: string) => {
    const { data } = await api.post<ApiResponse>('/api/auth/resend-otp', { email });
    if (!data.success) {
      throw new Error(data.error || 'Failed to resend code');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { data } = await api.post<ApiResponse<{ message: string; email: string }>>('/api/auth/forgot-password', {
        email,
      });
      if (data.success) {
        return { success: true, message: data.data?.message };
      }
      throw new Error(data.error || 'Failed to send reset code');
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to send reset code');
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const { data } = await api.post<ApiResponse<{ user: User; message?: string; accessToken?: string }>>('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      if (data.success && data.data?.user) {
        setUser(data.data.user);
        try {
          localStorage.setItem('wedding_client_user', JSON.stringify(data.data.user));
          if (data.data.accessToken) {
            localStorage.setItem('wedding_client_access_token', data.data.accessToken);
          }
        } catch {}
        return { success: true, message: data.data?.message };
      }
      throw new Error(data.error || 'Password reset failed');
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Password reset failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    try {
      localStorage.removeItem('wedding_client_user');
      localStorage.removeItem('wedding_client_access_token');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
