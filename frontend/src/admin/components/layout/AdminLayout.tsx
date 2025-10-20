import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { Header } from './Header';

/**
 * 관리자 페이지 레이아웃
 *
 * 구조:
 * - 좌측: Sidebar (240px 고정)
 * - 상단: Header (Sidebar 우측에 배치)
 * - 중앙: 페이지 컨텐츠 (Outlet)
 */
export const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar - 좌측 네비게이션 */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        {/* Header - 상단 헤더 */}
        <Header />

        {/* Page Content */}
        <Toolbar /> {/* Spacer for fixed header */}
        <Box
          sx={{
            p: 3,
            minHeight: 'calc(100vh - 64px)', // 100vh - toolbar height
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
