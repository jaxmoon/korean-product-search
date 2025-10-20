import axios, { AxiosError } from 'axios';
import { config } from '../config/env';

/**
 * Axios 인스턴스 with JWT 인터셉터
 *
 * 기능:
 * - 자동 JWT 토큰 첨부 (sessionStorage 사용)
 * - 401 에러 시 로그인 페이지 리다이렉트
 * - 중앙화된 에러 처리
 *
 * @example
 * ```ts
 * const response = await api.get('/products');
 * ```
 */
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error('[API Response Error]', error);

    if (error.response?.status === 401) {
      // Unauthorized, redirect to login
      sessionStorage.removeItem('accessToken');
      window.location.href = '/admin/login';
      return Promise.reject(new Error('Unauthorized - redirecting to login'));
    }

    // Return the original error instead of transforming it
    return Promise.reject(error);
  }
);
