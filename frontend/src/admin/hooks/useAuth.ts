import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

/**
 * 인증 관련 커스텀 훅
 */
export const useAuth = () => {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate('/admin/login');
    }
  };

  return {
    isAuthenticated,
    logout,
  };
};
