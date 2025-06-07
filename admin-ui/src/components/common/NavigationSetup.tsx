import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationService } from '../../utils/navigationService';

export const NavigationSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate]);

  return <>{children}</>;
};