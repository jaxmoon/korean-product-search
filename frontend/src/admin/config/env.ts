export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
} as const;
