import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// In development, use relative URL '' so requests route through Vite's same-origin proxy (works for localhost and mobile)
// In production, use VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://192.168.8.100:5000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
console.log(API_BASE_URL);
console.log(API_BASE_URL);

// Attach bearer token if present (works alongside httpOnly cookies as resilient fallback)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wedding_client_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Mutex and Queue state for handling concurrent 401s during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(api(prom.config));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Only process 401 Unauthorized errors on valid requests
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do NOT retry authentication lifecycle endpoints to prevent infinite loops
    // and ensure user credential validation errors are returned immediately
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/register') ||
      originalRequest.url?.includes('/api/auth/verify-otp') ||
      originalRequest.url?.includes('/api/auth/resend-otp') ||
      originalRequest.url?.includes('/api/auth/forgot-password') ||
      originalRequest.url?.includes('/api/auth/reset-password') ||
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/logout');

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request until refresh completes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // Mark request as retried and acquire mutex lock
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Trigger token refresh. Since tokens are stored in secure httpOnly cookies,
      // the browser automatically includes the 'refresh_token' cookie via withCredentials: true.
      // The backend sets new 'access_token' and 'refresh_token' cookies in the response.
      const refreshRes = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      if (refreshRes.data?.data?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('wedding_client_access_token', refreshRes.data.data.accessToken);
      }

      // Successfully refreshed cookies. Resolve all queued requests (they retry with new cookies).
      processQueue(null);

      // Retry the original request (browser automatically attaches new access_token cookie)
      return api(originalRequest);
    } catch (refreshError: any) {
      // Refresh failed (e.g. refresh token expired or revoked). Reject all queued requests.
      processQueue(refreshError);

      // Notify the application to reset auth context to unauthenticated
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('wedding_client_user');
          localStorage.removeItem('wedding_client_access_token');
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        } catch {}
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
