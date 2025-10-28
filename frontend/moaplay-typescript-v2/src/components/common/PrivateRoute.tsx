/**
 * 인증이 필요한 라우트 컴포넌트
 *
 * 로그인하지 않은 사용자의 접근을 제한하고
 * 로그인 페이지로 리다이렉트합니다.
 *
 * 인증 상태 하이드레이션 중에는 로딩 스피너를 표시하여
 * 로그인 루프를 방지합니다.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Loading } from './Loading';
import type { UserRole } from '../../types';

/**
 * PrivateRoute Props 타입
 */
interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * 인증이 필요한 라우트 컴포넌트
 *
 * 사용자가 로그인하지 않은 경우 로그인 페이지로 리다이렉트하고,
 * 필요한 권한이 없는 경우 403 페이지로 리다이렉트합니다.
 *
 * 인증 상태 로딩 중에는 스피너를 표시하여 로그인 모달이
 * 불필요하게 표시되는 것을 방지합니다.
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 디버깅: 인증 상태 추적
  console.log('[PrivateRoute] Auth state:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    requiredRole,
    userRole: user?.role,
    pathname: location.pathname
  });

  // 인증 상태 하이드레이션 중: 로딩 스피너 표시
  // 이렇게 하면 토큰 검증이 완료될 때까지 기다리므로
  // 로그인된 사용자가 로그인 모달을 보는 일이 없습니다
  if (isLoading) {
    console.log('[PrivateRoute] Still loading auth state, showing spinner');
    return <Loading fullScreen message="인증 정보를 확인하는 중..." />;
  }

  // 로그인하지 않은 경우: 홈페이지로 리다이렉트하고 로그인 모달 표시
  if (!isAuthenticated) {
    // 원래 경로 저장 (로그인 후 복귀용)
    const currentPath = location.pathname + location.search;
    console.log('[PrivateRoute] Not authenticated, redirecting to home with login modal');
    console.log('[PrivateRoute] Saving redirect path:', currentPath);
    try {
      localStorage.setItem('redirectAfterLogin', currentPath);
    } catch (error) {
      console.warn('Failed to save redirect path:', error);
    }

    // 홈페이지로 리다이렉트 (location.state로 로그인 모달 자동 열림)
    return (
      <Navigate
        to="/"
        state={{ from: location, showLoginModal: true }}
        replace
      />
    );
  }

  // 필요한 권한이 있는지 확인
  if (requiredRole && user?.role !== requiredRole) {
    // 관리자는 모든 권한을 가지므로 허용
    if (user?.role !== 'admin') {
      // 권한이 없는 경우: 403 페이지로 리다이렉트
      // 로그인 모달을 띄우지 않고 명확한 에러 페이지를 표시합니다
      return <Navigate to="/forbidden" replace />;
    }
  }

  // 인증 완료 및 권한 확인 완료: 자식 컴포넌트 렌더링
  return <>{children}</>;
};
