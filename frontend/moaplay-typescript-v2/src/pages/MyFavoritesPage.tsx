/**
 * 내 찜한 행사 목록 페이지
 * 
 * 사용자가 찜한 행사들을 목록으로 표시하고 관리할 수 있는 페이지입니다.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth, useUserFavorites } from '../hooks';
import { EventGrid } from '../components/event/EventGrid';
import { ErrorBoundary, Loading, Pagination, Header, Footer } from '../components/common';
import { useFavoriteContext } from '../contexts';

/**
 * 내 찜한 행사 목록 페이지 컴포넌트
 */
export const MyFavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { favorites, pagination, loading, error, removeFavorite, changePage, refresh, updateFavoriteStatus } = useUserFavorites();
  const [removingEventId, setRemovingEventId] = useState<number | null>(null);
  
  // 찜하기 전역 컨텍스트 - React Hooks 규칙 준수를 위해 항상 호출
  const favoriteContext = useFavoriteContext();

  /**
   * 찜하기 상태 변경 감지 및 목록 동기화
   * 
   * 다른 컴포넌트(EventCard 등)에서 찜하기 상태가 변경되면
   * 이 페이지의 목록도 자동으로 업데이트됩니다.
   */
  useEffect(() => {
    if (!favoriteContext) return;

    return favoriteContext.subscribeFavoriteChange((eventId, isFavorite) => {
      // 찜하기 상태 변경 시 목록 업데이트
      updateFavoriteStatus(eventId, isFavorite);
    });
  }, [favoriteContext, updateFavoriteStatus]);

  /**
   * 찜하기 해제 처리 (낙관적 업데이트)
   */
  const handleRemoveFavorite = async (favoriteId: number, eventId: number) => {
    if (removingEventId) return;

    try {
      setRemovingEventId(eventId);
      await removeFavorite(favoriteId);
      
      // 전역 컨텍스트에 알림
      if (favoriteContext) {
        favoriteContext.notifyFavoriteChange(eventId, false);
      }
    } catch (error) {
      console.error('찜하기 해제 실패:', error);
    } finally {
      setRemovingEventId(null);
    }
  };

  /**
   * 찜하기 토글 처리 (EventCard에서 호출)
   */
  const handleFavoriteToggle = async (eventId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      // 찜하기 해제 - favoriteId 찾기
      const favorite = favorites.find(fav => fav.event.id === eventId);
      if (favorite) {
        await handleRemoveFavorite(favorite.id, eventId);
      }
    }
    // 찜하기 추가는 이 페이지에서 발생하지 않음
  };



  /**
   * 로그인하지 않은 경우
   */
  if (!isAuthenticated) {
    return (
      <PageContainer>
        <Header />
        
        <MainContent>
          <PageHeader>
            <PageTitle>찜한 행사</PageTitle>
          </PageHeader>
          <EmptyState>
            <EmptyIcon>🔒</EmptyIcon>
            <EmptyTitle>로그인이 필요합니다</EmptyTitle>
            <EmptyDescription>
              찜한 행사를 확인하려면 로그인해주세요.
            </EmptyDescription>
            <LoginButton onClick={() => navigate('/login')}>
              로그인하기
            </LoginButton>
          </EmptyState>
        </MainContent>

        <Footer />
      </PageContainer>
    );
  }

  /**
   * 로딩 상태
   */
  if (loading && favorites.length === 0) {
    return (
      <PageContainer>
        <Header />
        
        <MainContent>
          <PageHeader>
            <PageTitle>찜한 행사</PageTitle>
          </PageHeader>
          <LoadingContainer>
            <Loading />
          </LoadingContainer>
        </MainContent>

        <Footer />
      </PageContainer>
    );
  }

  /**
   * 에러 상태
   */
  if (error && favorites.length === 0) {
    return (
      <PageContainer>
        <Header />
        
        <MainContent>
          <PageHeader>
            <PageTitle>찜한 행사</PageTitle>
          </PageHeader>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>오류가 발생했습니다</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={refresh}>
              다시 시도
            </RetryButton>
          </ErrorContainer>
        </MainContent>

        <Footer />
      </PageContainer>
    );
  }

  /**
   * 찜한 행사가 없는 경우
   */
  if (favorites.length === 0) {
    return (
      <PageContainer>
        <Header />
        
        <MainContent>
          <PageHeader>
            <PageTitle>찜한 행사</PageTitle>
            <EventCount>총 0개의 행사</EventCount>
          </PageHeader>
          <EmptyState>
            <EmptyIcon>❤️</EmptyIcon>
            <EmptyTitle>찜한 행사가 없습니다</EmptyTitle>
            <EmptyDescription>
              관심 있는 행사를 찜해보세요!<br />
              찜한 행사는 여기에서 확인할 수 있습니다.
            </EmptyDescription>
            <ExploreButton onClick={() => navigate('/search')}>
              행사 둘러보기
            </ExploreButton>
          </EmptyState>
        </MainContent>

        <Footer />
      </PageContainer>
    );
  }

  return (
    <ErrorBoundary>
      <PageContainer>
        <Header />
        
        <MainContent>
          <PageHeader>
            <PageTitle>찜한 행사</PageTitle>
            <EventCount>총 {pagination.total}개의 행사</EventCount>
          </PageHeader>

          <EventGridWrapper>
            <EventGrid
              events={favorites.map(f => ({
                  ...f.event,
                  organizer: null,
                  host: { id: 0, nickname: '' },
                  tags: [],
                  stats: {
                    average_rating: f.event.average_rating,
                    total_reviews: 0,
                    view_count: 0,
                    favorites_count: 0,
                    schedules_count: 0
                  }
                }))}
                isLoading={false}
                showViewCount={true}
                showFavoriteButton={true}
                showScheduleButton={true}
                isAuthenticated={true}
                onFavoriteToggle={handleFavoriteToggle}
                onShowLogin={() => {}} // 이미 로그인된 상태
              />
          </EventGridWrapper>

          {/* 페이지네이션 */}
          {pagination.pages > 1 && (
            <PaginationWrapper>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={changePage}
              />
            </PaginationWrapper>
          )}
        </MainContent>

        <Footer />
      </PageContainer>
    </ErrorBoundary>
  );
};

// 스타일 컴포넌트 - MyReviewsPage 디자인 완전 통일
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const EventCount = styled.span`
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
`;

const EventGridWrapper = styled.div`
  margin-bottom: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 40px 20px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #dc3545;
`;

const EmptyDescription = styled.p`
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #6c757d;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #dc3545;
  margin-bottom: 20px;
`;

const ExploreButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const LoginButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;