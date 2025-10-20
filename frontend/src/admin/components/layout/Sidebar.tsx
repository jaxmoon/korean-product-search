import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  BookmarkBorder as SynonymsIcon,
  Storage as IndexesIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 240;

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    title: '대시보드',
    path: '/admin/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: '상품 관리',
    path: '/admin/products',
    icon: <ProductsIcon />,
  },
  {
    title: '유의어 관리',
    path: '/admin/synonyms',
    icon: <SynonymsIcon />,
  },
  {
    title: '인덱스 관리',
    path: '/admin/indexes',
    icon: <IndexesIcon />,
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 중첩 라우트를 고려하여 메뉴 활성화 여부 확인
  const isMenuSelected = (menuPath: string) => {
    if (menuPath === '/admin/dashboard') {
      return location.pathname === menuPath;
    }
    return location.pathname.startsWith(menuPath);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Search Admin
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const selected = isMenuSelected(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                      borderRight: '3px solid',
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: selected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: selected ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export { DRAWER_WIDTH };
