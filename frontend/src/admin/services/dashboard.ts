import { api } from './api';

/**
 * 대시보드 통계 데이터 인터페이스
 */
export interface DashboardStats {
  products: {
    total: number;
    active: number;
    inactive: number;
  };
  synonyms: {
    total: number;
    active: number;
    inactive: number;
  };
  elasticsearch: {
    status: 'healthy' | 'unhealthy';
    indices: number;
    documents: number;
  };
  recentActivity: {
    date: string;
    action: string;
    count: number;
  }[];
}

/**
 * 대시보드 통계 API 서비스
 */
export const dashboardService = {
  /**
   * 대시보드 통계 데이터 조회
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/stats/dashboard');
    return response.data;
  },
};
