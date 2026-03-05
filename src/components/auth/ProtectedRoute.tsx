import React from 'react';
import { Member, Tab } from '../../types';
import { AccessDenied } from './AccessDenied';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  user: Member;
  permission: Tab;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, permission, children }) => {
  const navigate = useNavigate();
  
  const hasPermission = user.permissions?.includes(permission);

  if (!hasPermission) {
    return <AccessDenied onReturnHome={() => navigate('/')} />;
  }

  return <>{children}</>;
};
