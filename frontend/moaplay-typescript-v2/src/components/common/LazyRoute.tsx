/**
 * 지연 로딩 라우트 컴포넌트
 * 
 * React.lazy와 Suspense를 사용하여 페이지 컴포넌트를 지연 로딩하고,
 * 로딩 중에는 스피너를 표시합니다.
 * 
 * Fast Refresh 호환성을 위해 유틸리티 함수는 lazyRouteUtils.ts로 분리되었습니다.
 */

import React, { Suspense } from 'react';
import { Loading } from './Loading';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

/**
 * 지연 로딩 라우트 래퍼 컴포넌트
 * 
 * @param children - 지연 로딩할 컴포넌트
 * @param fallback - 로딩 중 표시할 컴포넌트 (기본값: Loading)
 */
export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  fallback: FallbackComponent = Loading 
}) => {
  return (
    <Suspense fallback={<FallbackComponent />}>
      {children}
    </Suspense>
  );
};