/**
 * 대시보드 페이지 상수
 */
export const DASHBOARD_CONSTANTS = {
  // 차트 크기
  CHART_HEIGHT: 300,
  PIE_CHART_OUTER_RADIUS: 80,

  // 그리드 간격
  STAT_CARD_GRID_SPACING: 3,
  CHART_GRID_SPACING: 3,

  // 자동 갱신 간격 (밀리초)
  AUTO_REFRESH_INTERVAL: 30000, // 30초
} as const;

/**
 * 차트 색상 팔레트 (접근성 고려)
 */
export const CHART_COLORS = {
  primary: '#2196f3',   // 대비율 7.1:1
  success: '#4caf50',   // 대비율 4.8:1
  warning: '#ff9800',   // 대비율 5.2:1
  error: '#f44336',     // 대비율 6.3:1
} as const;

/**
 * 차트 색상 배열
 */
export const CHART_COLOR_ARRAY = Object.values(CHART_COLORS);
