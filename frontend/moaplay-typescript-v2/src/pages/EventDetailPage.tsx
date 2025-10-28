/**
 * 행사 상세 페이지 컴포넌트
 * 
 * 행사의 상세 정보, 네이버 지도, 리뷰 목록을 표시합니다.
 * 조회수 자동 증가, 찜하기, 일정 추가 등의 기능을 제공합니다.
 */

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { ImageModal } from '../components/common';
import { NaverMap } from '../components/map/NaverMap';
import { ReviewCard } from '../components/review/ReviewCard';
import { ReviewModal } from '../components/review/ReviewModal';
import { EventTitle } from '../components/event/EventTitle';
import { useEventDetail, useEventReviews } from '../hooks';
import { useAuth } from '../hooks';
import { ReviewListItem } from '../types/reviews';
import { EventNormalizer } from '../normalizers/eventNormalizer';
import { getImageUrl, handleImageError } from '../utils/image';

/**
 * 행사 상세 페이지 컴포넌트
 */
export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth(); // user 객체에서 role 접근 가능
  
  const eventId = id ? parseInt(id, 10) : 0;
  const {
    event,
    loading,
    error,
    toggleFavorite,
    toggleSchedule,
    isTogglingFavorite,
    isTogglingSchedule
  } = useEventDetail(eventId);

  // useEventReviews 훅 사용으로 리뷰 즉시 렌더링
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    totalReviews,
    averageRating,
    refreshReviews,
    removeReview
  } = useEventReviews(eventId, {
    page: 1,
    per_page: 20
  });

  // 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(null);

  // 이미지 갤러리 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);

  /**
   * 리뷰 작성 모달 열기
   * 로그인한 사용자만 리뷰 작성 가능
   */
  const handleWriteReview = () => {
    if (!isAuthenticated || !user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    
    // user.role로 역할 확인 가능
    // 예: if (user.role === 'admin') { ... }
    
    setReviewModalMode('create');
    setSelectedReview(null);
    setShowReviewModal(true);
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
   * 리뷰 모달 모드 변경 이벤트 리스너
   */
  React.useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.mode === 'edit') {
        setReviewModalMode('edit');
      }
    };

    window.addEventListener('reviewModalModeChange', handleModeChange);
    return () => {
      window.removeEventListener('reviewModalModeChange', handleModeChange);
    };
  }, []);

  /**
   * 리뷰 저장 완료 처리
   * 새로고침하여 최신 리뷰 목록과 통계 정보를 가져옵니다
   */
  const handleReviewSaved = useCallback(async () => {
    // 리뷰 목록을 새로고침하여 서버에서 최신 데이터를 가져옵니다
    // 이렇게 하면 새 리뷰가 목록에 즉시 반영되고, 평균 평점 등 통계도 갱신됩니다
    await refreshReviews();
  }, [refreshReviews]);

  /**
   * 리뷰 삭제 완료 처리 (모달에서 호출)
   */
  const handleReviewDeleted = useCallback((reviewId: number) => {
    removeReview(reviewId);
  }, [removeReview]);

  /**
   * 사용자 프로필 페이지로 이동
   */
  const handleUserClick = (userId: number) => {
    navigate(`/users/${userId}/profile`);
  };

  /**
   * 찜하기 버튼 클릭 처리
   * 로그인한 사용자만 찜하기 가능
   */
  const handleFavoriteClick = async () => {
    if (!isAuthenticated || !user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    
    // user.role로 역할 확인 가능
    // 예: if (user.role === 'guest') { alert('게스트는 찜하기를 할 수 없습니다.'); return; }
    
    try {
      await toggleFavorite();
    } catch (error) {
      // 에러는 이미 toggleFavorite 내부에서 처리됨
      console.error('Favorite toggle error:', error);
    }
  };

  /**
   * 일정 추가 버튼 클릭 처리
   * 로그인한 사용자만 일정 추가 가능
   */
  const handleScheduleClick = async () => {
    if (!isAuthenticated || !user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    
    // user.role로 역할 확인 가능
    // 예: if (user.role === 'organizer') { ... }
    
    try {
      await toggleSchedule();
    } catch (error) {
      // 에러는 이미 toggleSchedule 내부에서 처리됨
      console.error('Schedule toggle error:', error);
    }
  };

  /**
   * 이미지 클릭 처리 (이미지 갤러리 모달 열기)
   */
  const handleImageClick = (index: number = 0) => {
    setSelectedImageIndex(index);
    setShowImageGallery(true);
  };

  /**
   * 평점 별 렌더링
   */
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} filled={i <= rating}>
          ★
        </Star>
      );
    }
    return stars;
  };

  // 로딩 상태
  if (loading) {
    return (
      <PageContainer>
        <Header />
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
        <Footer />
      </PageContainer>
    );
  }

  // 에러 상태
  if (error || !event) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorMessage>
            {error || '행사를 찾을 수 없습니다.'}
          </ErrorMessage>
          <BackButton onClick={() => navigate('/')}>
            홈으로 돌아가기
          </BackButton>
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />

      <MainContent>
        {/* 행사 기본 정보 */}
        <EventInfoSection>
          {/* 행사 이미지들 */}
          {event.imageUrls.length > 0 && (
            <ImageGallery>
              <MainImage
                src={getImageUrl(event.imageUrls[0])}
                alt={event.title}
                onClick={() => handleImageClick(0)}
                onError={(e) => handleImageError(e, '/placeholder-event.jpg')}
              />
              {event.imageUrls.length > 1 && (
                <ThumbnailGrid>
                  {event.imageUrls.slice(1, 5).map((imageUrl, index) => (
                    <ThumbnailImage
                      key={index}
                      src={getImageUrl(imageUrl)}
                      alt={`${event.title} 이미지 ${index + 2}`}
                      onClick={() => handleImageClick(index + 1)}
                      onError={(e) => handleImageError(e, '/placeholder-event.jpg')}
                    />
                  ))}
                  {event.imageUrls.length > 5 && (
                    <MoreImagesOverlay onClick={() => handleImageClick(5)}>
                      +{event.imageUrls.length - 5}
                    </MoreImagesOverlay>
                  )}
                </ThumbnailGrid>
              )}
            </ImageGallery>
          )}

          <EventDetails>
            <EventHeader>
              <EventTitle
                title={event.title}
                host={event.host}
                size="xlarge"
                variant="detail"
                showVerifiedBadge={true}
              />

              <ActionButtons>
                <FavoriteButton
                  onClick={handleFavoriteClick}
                  isFavorite={event.isFavorite}
                  disabled={isTogglingFavorite}
                >
                  {event.isFavorite ? '💖' : '🤍'} 찜하기
                </FavoriteButton>

                <ScheduleButton
                  onClick={handleScheduleClick}
                  isInSchedule={event.isInSchedule}
                  disabled={isTogglingSchedule}
                >
                  {event.isInSchedule ? '📅' : '📋'} 내 일정
                </ScheduleButton>

                {/* 관리자 또는 행사 작성자만 수정 버튼 표시 */}
                {user && (user.role === 'admin' || user.id === event.host.id) && (
                  <EditButton onClick={() => navigate(`/events/${eventId}/edit`)}>
                    ✏️ 수정
                  </EditButton>
                )}
              </ActionButtons>
            </EventHeader>

            <EventMeta>
              <MetaItem>
                <MetaLabel>📅 일정</MetaLabel>
                <MetaValue>{event.displayDate}</MetaValue>
              </MetaItem>

              {event.startDate && (
                <MetaItem>
                  <MetaLabel>🕐 시작</MetaLabel>
                  <MetaValue>{new Date(event.startDate).toLocaleString()}</MetaValue>
                </MetaItem>
              )}
              {event.endDate && (
                <MetaItem>
                  <MetaLabel>🏁 종료</MetaLabel>
                  <MetaValue>{new Date(event.endDate).toLocaleString()}</MetaValue>
                </MetaItem>
              )}
              
              {event.location && (
                <MetaItem>
                  <MetaLabel>📍 장소</MetaLabel>
                  <MetaValue>{event.location}</MetaValue>
                </MetaItem>
              )}
              
              <MetaItem>
                <MetaLabel>👁️ 조회수</MetaLabel>
                <MetaValue>{EventNormalizer.formatViewCount(event.viewCount)}</MetaValue>
              </MetaItem>
            </EventMeta>

            {event.summary && (
              <EventSummary>{event.summary}</EventSummary>
            )}

            {event.description && (
              <EventDescription>
                {event.description.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < event.description!.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </EventDescription>
            )}

            {event.tags.length > 0 && (
              <TagContainer>
                {event.tags.map((tag, index) => (
                  <Tag key={index}>#{tag}</Tag>
                ))}
              </TagContainer>
            )}

          </EventDetails>
        </EventInfoSection>

        {/* 네이버 지도 */}
        {event.location && (
          <MapSection>
            <SectionTitle>📍 위치</SectionTitle>
            <NaverMap
              location={event.location}
              eventTitle={event.title}
              height="400px"
            />
          </MapSection>
        )}

        {/* 리뷰 섹션 */}
        <ReviewSection>
          <ReviewHeader>
            <SectionTitle>💬 리뷰</SectionTitle>
            <WriteReviewButton onClick={handleWriteReview}>
              리뷰 작성
            </WriteReviewButton>
          </ReviewHeader>

          {/* 리뷰 통계 */}
          {totalReviews > 0 && (
            <ReviewStats>
              <AverageRating>
                <RatingStars>{renderStars(Math.round(averageRating ?? 0))}</RatingStars>
                <RatingText>
                  {(averageRating ?? 0).toFixed(1)}/5 ({totalReviews}개 리뷰)
                </RatingText>
              </AverageRating>
            </ReviewStats>
          )}

          {/* 리뷰 목록 */}
          <ReviewList>
            {reviewsLoading ? (
              <Loading />
            ) : reviewsError ? (
              <ErrorMessage>{reviewsError}</ErrorMessage>
            ) : reviews.length === 0 ? (
              <NoReviews>
                <NoReviewsIcon>💭</NoReviewsIcon>
                <NoReviewsText>아직 작성된 리뷰가 없습니다.</NoReviewsText>
                <NoReviewsSubText>첫 번째 리뷰를 작성해보세요!</NoReviewsSubText>
              </NoReviews>
            ) : (
              reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onReviewClick={handleViewReview}
                  onUserClick={handleUserClick}
                />
              ))
            )}
          </ReviewList>
        </ReviewSection>
      </MainContent>

      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewModalMode('create');
        }}
        mode={reviewModalMode}
        eventId={eventId}
        review={selectedReview || undefined}
        onSave={handleReviewSaved}
        onDelete={handleReviewDeleted}
      />

      {/* 이미지 갤러리 모달 */}
      {showImageGallery && (
        <ImageModal
          isOpen={showImageGallery}
          onClose={() => setShowImageGallery(false)}
          images={event.imageUrls}
          currentIndex={selectedImageIndex}
          onIndexChange={setSelectedImageIndex}
          alt={event.title}
        />
      )}

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  font-size: 18px;
  color: #dc3545;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  padding: 12px 24px;
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

const EventInfoSection = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ImageGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  position: relative;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const MoreImagesOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
`;

const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
`;



const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  border: 2px solid;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FavoriteButton = styled(ActionButton)<{ isFavorite: boolean }>`
  background: ${props => props.isFavorite ? '#fff3cd' : 'white'};
  border-color: ${props => props.isFavorite ? '#ffc107' : '#dee2e6'};
  color: ${props => props.isFavorite ? '#856404' : '#6c757d'};

  &:hover:not(:disabled) {
    background: #fff3cd;
    border-color: #ffc107;
    color: #856404;
  }
`;

const ScheduleButton = styled(ActionButton)<{ isInSchedule: boolean }>`
  background: ${props => props.isInSchedule ? '#d1ecf1' : 'white'};
  border-color: ${props => props.isInSchedule ? '#17a2b8' : '#dee2e6'};
  color: ${props => props.isInSchedule ? '#0c5460' : '#6c757d'};

  &:hover:not(:disabled) {
    background: #d1ecf1;
    border-color: #17a2b8;
    color: #0c5460;
  }
`;

const EditButton = styled(ActionButton)`
  background: white;
  border-color: #28a745;
  color: #28a745;

  &:hover:not(:disabled) {
    background: #28a745;
    color: white;
  }
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const MetaLabel = styled.span`
  font-weight: 600;
  color: #6c757d;
  min-width: 80px;
  font-size: 14px;
`;

const MetaValue = styled.span`
  color: #333;
  font-size: 14px;
  line-height: 1.4;
`;

const EventSummary = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #555;
  line-height: 1.5;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

const EventDescription = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
`;
const MapSection = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const ReviewSection = styled.section`
  margin-bottom: 40px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const WriteReviewButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const ReviewStats = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const AverageRating = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#ffc107' : '#e9ecef'};
  font-size: 20px;
`;

const RatingText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoReviews = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const NoReviewsIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const NoReviewsText = styled.p`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
`;

const NoReviewsSubText = styled.p`
  margin: 0;
  font-size: 14px;
`;

export default EventDetailPage;