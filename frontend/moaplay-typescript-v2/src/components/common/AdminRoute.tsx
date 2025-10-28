/**
 * 관리자 전용 라우트 컴포넌트
 * 
 * 관리자 권한이 필요한 페이지에 대한 접근을 제어합니다.
 * 관리자가 아닌 사용자는 홈페이지로 리다이렉트됩니다.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Loading } from './Loading';

/**
 * AdminRoute Props 타입
 */
interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * 관리자 전용 라우트 컴포넌트
 * 
 * 사용자가 관리자가 아닌 경우 홈페이지로 리다이렉트합니다.
 * 로그인하지 않은 경우 로그인 페이지로 리다이렉트합니다.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중인 경우
  if (isLoading) {
    return <Loading fullScreen message="권한을 확인하는 중..." />;
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 관리자가 아닌 경우
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};