/**
 * 검색 성능 인디케이터 컴포넌트
 * 
 * 검색 응답 시간과 결과 수를 표시하여 사용자에게 성능 정보를 제공합니다.
 * 2초 이상 걸리는 검색에 대해서는 성능 경고를 표시합니다.
 */

import React from 'react';
import styled from 'styled-components';

/**
 * SearchPerformanceIndicator Props
 */
interface SearchPerformanceIndicatorProps {
  searchTime: number;
  totalResults: number;
  isLoading: boolean;
  fromCache?: boolean;
  className?: string;
}

/**
 * 검색 성능 인디케이터 컴포넌트
 * 
 * 검색 시간과 결과 수를 표시하며, 성능 상태에 따라 다른 색상으로 표시합니다.
 */
export const SearchPerformanceIndicator: React.FC<SearchPerformanceIndicatorProps> = ({
  searchTime,
  totalResults,
  isLoading,
  fromCache = false,
  className
}) => {
  // 성능 상태 결정
  const getPerformanceStatus = () => {
    if (isLoading) return 'loading';
    if (searchTime < 0.5) return 'excellent';
    if (searchTime < 1.0) return 'good';
    if (searchTime < 2.0) return 'fair';
    return 'slow';
  };

  const performanceStatus = getPerformanceStatus();

  // 성능 메시지 생성
  const getPerformanceMessage = () => {
    if (isLoading) return '검색 중...';
    
    const baseMessage = `총 ${totalResults.toLocaleString()}개 결과 (${searchTime.toFixed(2)}초)`;
    
    if (fromCache) {
      return `${baseMessage} • 캐시됨`;
    }
    
    return baseMessage;
  };

  // 성능 아이콘 선택
  const getPerformanceIcon = () => {
    switch (performanceStatus) {
      case 'loading':
        return '⏳';
      case 'excellent':
        return '⚡';
      case 'good':
        return '✅';
      case 'fair':
        return '⚠️';
      case 'slow':
        return '🐌';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <Container className={className} $status={performanceStatus}>
        <LoadingContainer>
          <LoadingSpinner />
          <Message>검색 중...</Message>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container className={className} $status={performanceStatus}>
      <PerformanceInfo>
        <Icon>{getPerformanceIcon()}</Icon>
        <Message>{getPerformanceMessage()}</Message>
        {performanceStatus === 'slow' && (
          <WarningText>
            검색이 느립니다. 검색어를 더 구체적으로 입력해보세요.
          </WarningText>
        )}
      </PerformanceInfo>
      
      {/* 성능 상태 바 */}
      <PerformanceBar>
        <PerformanceBarFill $status={performanceStatus} $searchTime={searchTime} />
      </PerformanceBar>
    </Container>
  );
};

const Container = styled.div<{ $status: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme, $status }) => {
    switch ($status) {
      case 'loading':
        return theme.colors.backgroundLight;
      case 'excellent':
        return 'rgba(34, 197, 94, 0.1)';
      case 'good':
        return 'rgba(59, 130, 246, 0.1)';
      case 'fair':
        return 'rgba(245, 158, 11, 0.1)';
      case 'slow':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return theme.colors.backgroundLight;
    }
  }};
  border: 1px solid ${({ theme, $status }) => {
    switch ($status) {
      case 'excellent':
        return 'rgba(34, 197, 94, 0.3)';
      case 'good':
        return 'rgba(59, 130, 246, 0.3)';
      case 'fair':
        return 'rgba(245, 158, 11, 0.3)';
      case 'slow':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return theme.colors.border;
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PerformanceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const Icon = styled.span`
  font-size: 1.2em;
  line-height: 1;
`;

const Message = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const WarningText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.danger};
  font-style: italic;
  margin-left: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const PerformanceBar = styled.div`
  width: 100%;
  height: 3px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const PerformanceBarFill = styled.div<{ $status: string; $searchTime: number }>`
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.3s ease;
  
  width: ${({ $searchTime }) => {
    // 2초를 100%로 하여 진행률 계산
    const percentage = Math.min(($searchTime / 2.0) * 100, 100);
    return `${percentage}%`;
  }};
  
  background: ${({ $status }) => {
    switch ($status) {
      case 'excellent':
        return 'linear-gradient(90deg, #22c55e, #16a34a)';
      case 'good':
        return 'linear-gradient(90deg, #3b82f6, #2563eb)';
      case 'fair':
        return 'linear-gradient(90deg, #f59e0b, #d97706)';
      case 'slow':
        return 'linear-gradient(90deg, #ef4444, #dc2626)';
      default:
        return '#6b7280';
    }
  }};
`;

/**
 * 검색 성능 통계를 표시하는 간단한 컴포넌트
 */
export const SearchStats: React.FC<{
  searchTime: number;
  totalResults: number;
  fromCache?: boolean;
}> = ({ searchTime, totalResults, fromCache }) => {
  return (
    <StatsContainer>
      총 <strong>{totalResults.toLocaleString()}</strong>개 결과
      <SearchTime $fast={searchTime < 1.0}>
        ({searchTime.toFixed(2)}초{fromCache ? ' • 캐시됨' : ''})
      </SearchTime>
    </StatsContainer>
  );
};

const StatsContainer = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;

  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    text-align: left;
  }
`;

const SearchTime = styled.span<{ $fast: boolean }>`
  color: ${({ theme, $fast }) => 
    $fast ? theme.colors.success : theme.colors.textMuted
  };
  margin-left: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ $fast }) => $fast ? '500' : 'normal'};
`;