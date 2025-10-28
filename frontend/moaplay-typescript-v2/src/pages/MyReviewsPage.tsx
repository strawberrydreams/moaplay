/**
 * 내 리뷰 목록 페이지 컴포넌트
 * 
 * 사용자가 작성한 모든 리뷰를 목록으로 표시합니다.
 * 리뷰 수정, 삭제, 상세 보기 등의 기능을 제공합니다.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { ReviewCard } from '../components/review/ReviewCard';
import { ReviewModal } from '../components/review/ReviewModal';
import { ReviewListItem } from '../types/reviews';
import { useAuth } from '../hooks';
import { useMyReviews } from '../hooks';
import { useReviewContext } from '../contexts/ReviewContext';

/**
 * 내 리뷰 목록 페이지 컴포넌트
 */
export const MyReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  useAuth();
  useReviewContext();

  // 정렬 상태 (UI 단어 → API 매핑 필요)
  type UiSort = 'latest' | 'rating_high' | 'rating_low';
  const [sortBy, setSortBy] = useState<UiSort>('latest');

  // 리뷰 목록 훅 사용 (정확한 타입으로 전달)
  const {
    reviews,
    loading,
    error,
    hasMore,
    totalReviews,
    refreshReviews,
    loadMoreReviews,
    updateReview,
    removeReview
  } = useMyReviews({});

  // 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<'edit' | 'view'>('view');
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(null);

  // 인증은 PrivateRoute에서 이미 확인되므로 여기서는 불필요

  /**
   * 정렬 방식 변경 처리
   */
  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
  };

  /**
   * 리뷰 상세 보기 모달 열기 (수정/삭제는 모달 내에서 처리)
   */
  const handleViewReview = (review: ReviewListItem) => {
    setReviewModalMode('view');
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  /**
   * 행사 상세 페이지로 이동
   */
  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  /**
   * 사용자 프로필 페이지로 이동
   */
  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}/profile`);
  };

  /**
   * 리뷰 저장 완료 처리
   */
  const handleReviewSaved = (savedReview: ReviewListItem) => {
    updateReview(savedReview);
  };

  /**
   * 리뷰 삭제 완료 처리 (모달에서 호출)
   */
  const handleReviewDeleted = (reviewId: number) => {
    removeReview(reviewId);
  };

  /**
   * 정렬 옵션 텍스트 반환
   */
  const getSortText = (sort: typeof sortBy): string => {
    switch (sort) {
      case 'latest': return '최신순';
      case 'rating_high': return '평점 높은순';
      case 'rating_low': return '평점 낮은순';
      default: return '최신순';
    }
  };

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <PageHeader>
          <PageTitle>내 리뷰</PageTitle>
          <ReviewCount>총 {totalReviews}개의 리뷰</ReviewCount>
        </PageHeader>

        {loading && reviews.length === 0 ? (
          <LoadingContainer>
            <Loading />
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={refreshReviews}>
              다시 시도
            </RetryButton>
          </ErrorContainer>
        ) : reviews.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📝</EmptyIcon>
            <EmptyTitle>작성한 리뷰가 없습니다</EmptyTitle>
            <EmptyDescription>
              행사에 참여한 후 리뷰를 작성해보세요!
            </EmptyDescription>
            <BrowseEventsButton onClick={() => navigate('/search')}>
              행사 둘러보기
            </BrowseEventsButton>
          </EmptyState>
        ) : (
          <>
            {/* 정렬 옵션 */}
            <FilterSection>
              <SortOptions>
                <SortLabel>정렬:</SortLabel>
                {(['latest', 'rating_high', 'rating_low'] as const).map(sort => (
                  <SortButton
                    key={sort}
                    active={sortBy === sort}
                    onClick={() => handleSortChange(sort)}
                  >
                    {getSortText(sort)}
                  </SortButton>
                ))}
              </SortOptions>
            </FilterSection>

            {/* 리뷰 목록 */}
            <ReviewList>
              {reviews.map(review => (
                <ReviewCardWrapper key={review.id}>
                  <ReviewCard
                    review={review}
                    onReviewClick={handleViewReview}
                    onUserClick={handleUserClick}
                  />
                  <EventLinkButton
                    onClick={() => handleEventClick(review.event.id)}
                  >
                    행사 보기 →
                  </EventLinkButton>
                </ReviewCardWrapper>
              ))}
            </ReviewList>

            {/* 더 보기 버튼 */}
            {hasMore && (
              <LoadMoreContainer>
                <LoadMoreButton onClick={loadMoreReviews} disabled={loading}>
                  {loading ? '로딩 중...' : '더 보기'}
                </LoadMoreButton>
              </LoadMoreContainer>
            )}
          </>
        )}
      </MainContent>

      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        mode={reviewModalMode}
        review={selectedReview ?? undefined}
        onSave={handleReviewSaved}
        onDelete={handleReviewDeleted}
      />

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

const ReviewCount = styled.span`
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: #dc3545;
  margin-bottom: 20px;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const EmptyDescription = styled.p`
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #6c757d;
  line-height: 1.5;
`;

const BrowseEventsButton = styled.button`
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

const FilterSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SortOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SortLabel = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const SortButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  border: 1px solid ${props => props.active ? '#007bff' : '#dee2e6'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e9ecef'};
    border-color: ${props => props.active ? '#0056b3' : '#adb5bd'};
  }
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ReviewCardWrapper = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const EventLinkButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 123, 255, 0.2);
    border-color: rgba(0, 123, 255, 0.3);
  }
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const LoadMoreButton = styled.button`
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background: #5a6268;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default MyReviewsPage;