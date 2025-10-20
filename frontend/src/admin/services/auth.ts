import { api } from './api';
import { AuthResponse, LoginCredentials } from '../types';

/**
 * 인증 서비스
 *
 * sessionStorage를 사용하여 토큰 관리 (탭 닫으면 자동 삭제)
 */
export const authService = {
  /**
   * 로그인
   * @param credentials 사용자 인증 정보
   * @returns 인증 토큰 및 사용자 정보
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/admin/auth/login', credentials);
    const { accessToken } = response.data;

    // sessionStorage에 토큰 저장 (XSS 공격 시에도 탭 닫으면 삭제됨)
    sessionStorage.setItem('accessToken', accessToken);

    return response.data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    sessionStorage.removeItem('accessToken');
  },

  /**
   * 인증 상태 확인
   * @returns 인증 여부
   */
  isAuthenticated: (): boolean => {
    return !!sessionStorage.getItem('accessToken');
  },
};
