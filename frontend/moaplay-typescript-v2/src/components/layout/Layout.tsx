/**
 * 공통 레이아웃 컴포넌트
 * 
 * Header와 Footer를 포함하는 기본 페이지 레이아웃을 제공합니다.
 * 모든 페이지에서 일관된 레이아웃을 유지하기 위해 사용됩니다.
 */

import React from 'react';
import styled from 'styled-components';
import { Header } from '../common';
import { Footer } from '../common';

/**
 * 레이아웃 컴포넌트 Props
 */
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * 기본 페이지 레이아웃 컴포넌트
 * 
 * Header, main content, Footer로 구성된 기본 레이아웃을 제공합니다.
 * 필요에 따라 Header나 Footer를 숨길 수 있습니다.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showHeader = true,
  showFooter = true,
}) => {
  return (
    <LayoutContainer className={className}>
      {showHeader && <Header />}
      
      <MainContent>
        {children}
      </MainContent>
      
      {showFooter && <Footer />}
    </LayoutContainer>
  );
};

// 스타일 컴포넌트들
const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;