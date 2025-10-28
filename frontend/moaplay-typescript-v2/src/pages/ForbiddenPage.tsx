/**
 * 403 Forbidden 페이지 컴포넌트
 * 
 * 사용자가 접근 권한이 없는 페이지에 접근했을 때 표시되는 페이지입니다.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Button } from '../components/common';

/**
 * 403 Forbidden 페이지
 * 
 * 권한이 없는 사용자가 보호된 리소스에 접근하려고 할 때 표시됩니다.
 */
export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <ErrorCard>
          <ErrorIcon>🚫</ErrorIcon>
          <ErrorCode>403</ErrorCode>
          <ErrorTitle>접근 권한이 없습니다</ErrorTitle>
          <ErrorMessage>
            이 페이지에 접근할 수 있는 권한이 없습니다.
            <br />
            필요한 권한을 확인하거나 관리자에게 문의하세요.
          </ErrorMessage>
          <ButtonGroup>
            <Button onClick={() => navigate(-1)} variant="secondary">
              이전 페이지로
            </Button>
            <Button onClick={() => navigate('/')}>
              홈으로 이동
            </Button>
          </ButtonGroup>
        </ErrorCard>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

// 스타일 컴포넌트들
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #f8f9fa;
`;

const ErrorCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const ErrorCode = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #dc3545;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const ErrorMessage = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

export default ForbiddenPage;
