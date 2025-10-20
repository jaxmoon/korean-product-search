import { lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './admin/theme';
import { QUERY_CONFIG } from './admin/config/queryConfig';
import { config } from './admin/config/env';
import { AdminLayout } from './admin/components/layout/AdminLayout';
import { LoginPage } from './admin/pages/auth/LoginPage';
import { LoadingSpinner } from './admin/components/common/LoadingSpinner';
import { PrivateRoute } from './admin/components/auth/PrivateRoute';
import { ErrorBoundary } from './admin/components/common/ErrorBoundary';

// Code Splitting으로 페이지 lazy loading
const DashboardPage = lazy(() =>
  import('./admin/pages/dashboard').then((m) => ({ default: m.DashboardPage }))
);

const ProductsListPage = lazy(() =>
  import('./admin/pages/products').then((m) => ({ default: m.ProductsListPage }))
);

const ProductFormPage = lazy(() =>
  import('./admin/pages/products').then((m) => ({ default: m.ProductFormPage }))
);

const ProductDetailPage = lazy(() =>
  import('./admin/pages/products').then((m) => ({ default: m.ProductDetailPage }))
);

const SynonymsListPage = lazy(() =>
  import('./admin/pages/synonyms').then((m) => ({ default: m.SynonymsListPage }))
);

const SynonymFormPage = lazy(() =>
  import('./admin/pages/synonyms').then((m) => ({ default: m.SynonymFormPage }))
);

const SynonymDetailPage = lazy(() =>
  import('./admin/pages/synonyms').then((m) => ({ default: m.SynonymDetailPage }))
);

const IndexesPage = lazy(() =>
  import('./admin/pages/indexes').then((m) => ({ default: m.IndexesPage }))
);

// QueryClient 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      retry: QUERY_CONFIG.RETRY_COUNT,
      staleTime: QUERY_CONFIG.STALE_TIME,
      gcTime: QUERY_CONFIG.CACHE_TIME,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
            {/* 로그인 페이지 */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* 관리자 페이지 (인증 필요) */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              {/* 기본 경로는 대시보드로 리다이렉트 */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />

              {/* 대시보드 (Lazy Loading) */}
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<LoadingSpinner message="대시보드 로딩 중..." />}>
                    <DashboardPage />
                  </Suspense>
                }
              />

              {/* 상품 관리 (Lazy Loading) */}
              <Route path="products">
                <Route
                  index
                  element={
                    <Suspense fallback={<LoadingSpinner message="상품 목록 로딩 중..." />}>
                      <ProductsListPage />
                    </Suspense>
                  }
                />
                <Route
                  path="new"
                  element={
                    <Suspense fallback={<LoadingSpinner message="상품 폼 로딩 중..." />}>
                      <ProductFormPage />
                    </Suspense>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <Suspense fallback={<LoadingSpinner message="상품 상세 로딩 중..." />}>
                      <ProductDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path=":id/edit"
                  element={
                    <Suspense fallback={<LoadingSpinner message="상품 수정 로딩 중..." />}>
                      <ProductFormPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* 유의어 관리 (Lazy Loading) */}
              <Route path="synonyms">
                <Route
                  index
                  element={
                    <Suspense fallback={<LoadingSpinner message="유의어 목록 로딩 중..." />}>
                      <SynonymsListPage />
                    </Suspense>
                  }
                />
                <Route
                  path="new"
                  element={
                    <Suspense fallback={<LoadingSpinner message="유의어 폼 로딩 중..." />}>
                      <SynonymFormPage />
                    </Suspense>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <Suspense fallback={<LoadingSpinner message="유의어 상세 로딩 중..." />}>
                      <SynonymDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path=":id/edit"
                  element={
                    <Suspense fallback={<LoadingSpinner message="유의어 수정 로딩 중..." />}>
                      <SynonymFormPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* 인덱스 관리 (Lazy Loading) */}
              <Route
                path="indexes"
                element={
                  <Suspense fallback={<LoadingSpinner message="인덱스 관리 로딩 중..." />}>
                    <IndexesPage />
                  </Suspense>
                }
              />
            </Route>

            {/* 루트 경로는 관리자로 리다이렉트 */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* 404 처리 */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
      {config.enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
