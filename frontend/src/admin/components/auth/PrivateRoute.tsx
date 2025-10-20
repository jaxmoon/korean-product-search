import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */
export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
