import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import {
  Inventory as ProductsIcon,
  BookmarkBorder as SynonymsIcon,
  Storage as ElasticsearchIcon,
  TrendingUp as ActivityIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DASHBOARD_CONSTANTS, CHART_COLOR_ARRAY } from '../../constants/dashboard';
import { formatPieChartLabel } from '../../utils/chartHelpers';

/**
 * 대시보드 메인 페이지
 * 통계 카드, 차트, 최근 활동 표시
 */
export const DashboardPage = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <LoadingSpinner message="대시보드 데이터를 불러오는 중..." />;
  }

  if (error) {
    console.error('Dashboard error:', error);

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          대시보드 데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  // 데이터 유효성 검증
  if (!stats.products || !stats.synonyms || !stats.elasticsearch || !stats.recentActivity) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          대시보드 데이터 형식이 올바르지 않습니다. 백엔드 API를 확인해주세요.
        </Alert>
      </Box>
    );
  }

  // 상품 상태 차트 데이터 (단순 계산이므로 메모이제이션 불필요)
  const productStatusData = [
    { name: '활성', value: stats.products?.active || 0 },
    { name: '비활성', value: stats.products?.inactive || 0 },
  ];

  // 유의어 상태 차트 데이터 (단순 계산이므로 메모이제이션 불필요)
  const synonymStatusData = [
    { name: '활성', value: stats.synonyms?.active || 0 },
    { name: '비활성', value: stats.synonyms?.inactive || 0 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        대시보드
      </Typography>

      {/* 통계 카드 */}
      <Grid container spacing={DASHBOARD_CONSTANTS.STAT_CARD_GRID_SPACING} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 상품"
            value={stats.products.total.toLocaleString()}
            icon={ProductsIcon}
            color="primary.main"
            subtitle={`활성: ${stats.products.active} / 비활성: ${stats.products.inactive}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="전체 유의어"
            value={stats.synonyms.total.toLocaleString()}
            icon={SynonymsIcon}
            color="success.main"
            subtitle={`활성: ${stats.synonyms.active} / 비활성: ${stats.synonyms.inactive}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Elasticsearch"
            value={stats.elasticsearch.status === 'healthy' ? '정상' : '오류'}
            icon={ElasticsearchIcon}
            color={stats.elasticsearch.status === 'healthy' ? 'success.main' : 'error.main'}
            subtitle={`인덱스: ${stats.elasticsearch.indices} / 문서: ${stats.elasticsearch.documents.toLocaleString()}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="최근 활동"
            value={stats.recentActivity.length}
            icon={ActivityIcon}
            color="info.main"
            subtitle="지난 7일"
          />
        </Grid>
      </Grid>

      {/* 차트 영역 */}
      <Grid container spacing={DASHBOARD_CONSTANTS.CHART_GRID_SPACING}>
        {/* 상품 상태 차트 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              상품 상태 분포
            </Typography>
            <ResponsiveContainer width="100%" height={DASHBOARD_CONSTANTS.CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={productStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={formatPieChartLabel}
                  outerRadius={DASHBOARD_CONSTANTS.PIE_CHART_OUTER_RADIUS}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 유의어 상태 차트 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              유의어 상태 분포
            </Typography>
            <ResponsiveContainer width="100%" height={DASHBOARD_CONSTANTS.CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={synonymStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={formatPieChartLabel}
                  outerRadius={DASHBOARD_CONSTANTS.PIE_CHART_OUTER_RADIUS}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {synonymStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 최근 활동 차트 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              최근 활동 (지난 7일)
            </Typography>
            {Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={DASHBOARD_CONSTANTS.CHART_HEIGHT}>
                <BarChart data={stats.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={CHART_COLOR_ARRAY[0]} name="활동 횟수" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                최근 활동 데이터가 없습니다.
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
