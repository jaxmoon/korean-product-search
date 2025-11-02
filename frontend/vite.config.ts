import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@admin': path.resolve(__dirname, './src/admin'),
      '@components': path.resolve(__dirname, './src/admin/components'),
      '@pages': path.resolve(__dirname, './src/admin/pages'),
      '@services': path.resolve(__dirname, './src/admin/services'),
      '@hooks': path.resolve(__dirname, './src/admin/hooks'),
      '@types': path.resolve(__dirname, './src/admin/types'),
      '@utils': path.resolve(__dirname, './src/admin/utils'),
      '@theme': path.resolve(__dirname, './src/admin/theme'),
      '@config': path.resolve(__dirname, './src/admin/config'),
    },
  },
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
