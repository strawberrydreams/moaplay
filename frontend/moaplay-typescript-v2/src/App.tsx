/*
 * Moaplay 메인 애플리케이션 컴포넌트
 * React Router를 사용하여 전체 페이지 라우팅 관리
 * 전역 상태와 전역 스타일 제공
 */

import React from 'react';
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

const App: React.FC = () => {
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