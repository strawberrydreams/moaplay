/*
 * Moaplay 메인 애플리케이션 컴포넌트
 * React Router를 사용하여 전체 페이지 라우팅 관리
 * 전역 상태와 전역 스타일 제공
 */

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AppRoutes } from './routes';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/globals';
import { ErrorBoundary } from './components/common';
import { AuthProvider } from './contexts';
import { AuthModalProvider } from './contexts';
import { AuthModal } from './components/auth';
import { FavoriteProvider } from './contexts';
import { ReviewProvider } from './contexts/ReviewContext';
import { getPerformanceMonitor, sendPerformanceMetrics } from './utils/performance';

const App: React.FC = () => {
  useEffect(() => {
    // 성능 모니터링 초기화
    const performanceMonitor = getPerformanceMonitor();
    
    // 성능 지표 업데이트 시 처리
    const unsubscribe = performanceMonitor.onMetricsUpdate((metrics) => {
      // 개발 환경에서는 콘솔에 출력, 프로덕션에서는 분석 서비스로 전송
      sendPerformanceMetrics(metrics);
    });

    // 페이지 언로드 시 최종 성능 지표 전송
    const handleBeforeUnload = () => {
      const finalMetrics = performanceMonitor.getMetrics();
      if (Object.keys(finalMetrics).length > 0) {
        // Navigator.sendBeacon을 사용하여 페이지 언로드 시에도 안전하게 전송
        if ('sendBeacon' in navigator) {
          navigator.sendBeacon(
            // 없는 API지만 추후 추가 가능
            '/api/analytics/performance',
            JSON.stringify(finalMetrics)
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 컴포넌트 언마운트 시 정리
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <BrowserRouter>
          <AuthProvider>
            <FavoriteProvider>
              <ReviewProvider>
                <AuthModalProvider>
                  <AppRoutes />
                  <AuthModal />
                </AuthModalProvider>
              </ReviewProvider>
            </FavoriteProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;