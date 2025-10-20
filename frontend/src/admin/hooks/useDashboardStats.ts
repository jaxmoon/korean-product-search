import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats } from '../services/dashboard';

/**
 * 대시보드 통계 데이터를 가져오는 커스텀 훅
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
};
