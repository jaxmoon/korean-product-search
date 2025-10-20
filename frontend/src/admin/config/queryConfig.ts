export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5분
  CACHE_TIME: 10 * 60 * 1000, // 10분
  RETRY_COUNT: 1,
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;
