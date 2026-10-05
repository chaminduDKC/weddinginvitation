import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

// Restore saved admin access token if available
if (typeof window !== 'undefined') {
  const initialToken = localStorage.getItem('admin_access_token');
  if (initialToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
  }
}

// Mutex / Queue state for handling concurrent 401s and refresh token rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (error: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any = null, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Only process 401 errors with an existing request configuration
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do NOT retry auth lifecycle endpoints to prevent infinite loops and preserve login error feedback
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/register') ||
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/logout');

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If another request is currently refreshing the token, queue this request
    if (isRefreshing) {
      return new Promise<string | undefined>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      })
        .then((newToken) => {
          if (newToken && originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark request as retried and lock refresh mutex
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storedRefreshToken = localStorage.getItem('admin_refresh_token');
      // Send refresh token in body (falling back to httpOnly cookie) to obtain fresh access token
      const refreshResponse = await axios.post(
        '/api/auth/refresh',
        { refreshToken: storedRefreshToken || undefined },
        { withCredentials: true }
      );

      const newAccessToken: string | undefined = refreshResponse.data?.data?.accessToken;
      const newRefreshToken: string | undefined = refreshResponse.data?.data?.refreshToken;

      if (newRefreshToken) {
        localStorage.setItem('admin_refresh_token', newRefreshToken);
      }

      if (newAccessToken) {
        localStorage.setItem('admin_access_token', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
      }

      // Resolve all queued requests with the new access token
      processQueue(null, newAccessToken);

      // Retry original request
      return api(originalRequest);
    } catch (refreshError: any) {
      // Invalidate queued requests and clear admin session
      processQueue(refreshError, undefined);
      delete api.defaults.headers.common['Authorization'];
      try {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
      } catch {}

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
