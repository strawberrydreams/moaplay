/**
 * 관리자 대시보드 페이지
 * 
 * 관리자가 사이트 전체 현황을 한눈에 파악하고 효율적으로 관리할 수 있는 대시보드입니다.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useAdminDashboard } from '../hooks';
import { PendingEventsModal } from '../components/admin';
import { ApprovedEventsModal } from '../components/admin';
import { UsersManagementModal } from '../components/admin';
import { PendingUsersModal } from '../components/admin';
import { Loading } from '../components/common';
import { Header } from '../components/common';
import { Footer } from '../components/common';

/**
 * 관리자 대시보드 페이지 컴포넌트
 */
export const AdminDashboardPage: React.FC = () => {
  const {
    stats,
    statsLoading,
    statsError,
    refreshStats,
    approveEvent,
    rejectEvent
  } = useAdminDashboard();

  // 모달 상태 관리
  const [activeModal, setActiveModal] = useState<string | null>(null);

  /**
   * 통계 카드 클릭 핸들러
   */
  const handleStatCardClick = (modalType: string) => {
    setActiveModal(modalType);
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleCloseModal = () => {
    setActiveModal(null);
  };

  /**
   * 행사 승인 핸들러
   */
  const handleApproveEvent = async (eventId: number) => {
    await approveEvent(eventId);
    // 통계 새로고침
    await refreshStats();
  };

  /**
   * 행사 거절 핸들러
   */
  const handleRejectEvent = async (eventId: number, reason: string) => {
    await rejectEvent(eventId, reason);
    // 통계 새로고침
    await refreshStats();
  };

  if (statsLoading) {
    return <Loading fullScreen message="대시보드를 불러오는 중..." />;
  }

  if (statsError) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <ErrorMessage>
            <h2>오류가 발생했습니다</h2>
            <p>{statsError}</p>
            <RetryButton onClick={refreshStats}>다시 시도</RetryButton>
          </ErrorMessage>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <DashboardHeader>
          <DashboardTitle>관리자 대시보드</DashboardTitle>
          <RefreshButton onClick={refreshStats}>새로고침</RefreshButton>
        </DashboardHeader>

        {stats && (
          <StatsGrid>
            <StatCard 
              onClick={() => handleStatCardClick('approved-events')}
              highlight={false}
            >
              <StatIcon>✓</StatIcon>
              <StatNumber>{stats.approvedEvents.toLocaleString()}</StatNumber>
              <StatLabel>승인된 행사</StatLabel>
            </StatCard>

            <StatCard 
              onClick={() => handleStatCardClick('pending-events')}
              highlight={stats.pendingEvents > 0}
            >
              <StatIcon>⏳</StatIcon>
              <StatNumber>{stats.pendingEvents.toLocaleString()}</StatNumber>
              <StatLabel>승인 대기 행사</StatLabel>
              {stats.pendingEvents > 0 && <HighlightBadge />}
            </StatCard>

            <StatCard 
              onClick={() => handleStatCardClick('users')}
              highlight={false}
            >
              <StatIcon>👥</StatIcon>
              <StatNumber>{stats.totalUsers.toLocaleString()}</StatNumber>
              <StatLabel>사이트 회원 수</StatLabel>
            </StatCard>

            <StatCard 
              onClick={() => handleStatCardClick('pending-organizers')}
              highlight={stats.pendingOrganizers > 0}
            >
              <StatIcon>📋</StatIcon>
              <StatNumber>{stats.pendingOrganizers.toLocaleString()}</StatNumber>
              <StatLabel>인증 대기 사용자</StatLabel>
              {stats.pendingOrganizers > 0 && <HighlightBadge />}
            </StatCard>
          </StatsGrid>
        )}

        {/* 모달들 */}
        <ApprovedEventsModal
          isOpen={activeModal === 'approved-events'}
          onClose={handleCloseModal}
          onEventUpdated={refreshStats}
        />

        <PendingEventsModal
          isOpen={activeModal === 'pending-events'}
          onClose={handleCloseModal}
          onApprove={handleApproveEvent}
          onReject={handleRejectEvent}
        />

        {/* 사용자 관리 모달 */}
        {activeModal === 'users' && (
          <UsersManagementModal
            isOpen={true}
            onClose={handleCloseModal}
          />
        )}

        {/* 주최자 인증 관리 모달 */}
        {activeModal === 'pending-organizers' && (
          <PendingUsersModal
            isOpen={true}
            onClose={handleCloseModal}
          />
        )}
      </MainContent>

      <Footer />
    </PageContainer>
  );
};

// 스타일 컴포넌트들
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const DashboardTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size['3xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size['2xl']};
  }
`;

const RefreshButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const StatCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'highlight',
})<{ highlight: boolean }>`
  background: white;
  padding: ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 2px solid transparent;
  
  ${({ highlight, theme }) => highlight && `
    border-color: ${theme.colors.danger};
    box-shadow: 0 4px 16px rgba(220, 53, 69, 0.2);
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  font-size: ${({ theme }) => theme.fonts.size['4xl']};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  opacity: 0.8;
`;

const StatNumber = styled.div`
  font-size: ${({ theme }) => theme.fonts.size['4xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  letter-spacing: 1px;
`;

const HighlightBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  width: 12px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.danger};
  border-radius: 50%;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  h2 {
    color: ${({ theme }) => theme.colors.danger};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.fonts.size['2xl']};
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.fonts.size.md};
  }
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;