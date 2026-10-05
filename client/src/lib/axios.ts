import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

// Purge any legacy tokens from localStorage to prevent insecure storage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('wedding_client_access_token');
    localStorage.removeItem('wedding_client_refresh_token');
  } catch {}
}

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
      await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true }
      );

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
