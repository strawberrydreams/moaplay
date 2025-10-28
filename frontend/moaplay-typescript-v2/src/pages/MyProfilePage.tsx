/**
 * 마이페이지 컴포넌트
 * 
 * 사용자의 개인정보, FullCalendar, 찜한 행사, 작성한 리뷰를 표시합니다.
 * 4개 섹션으로 구성되며, 각 섹션별로 더보기 기능을 제공합니다.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { ImageModal } from '../components/common';
import { ReviewCard } from '../components/review/ReviewCard';
import { ReviewModal } from '../components/review/ReviewModal';
import { EventCard } from '../components/event';
import { useMyProfile } from '../hooks/useMyProfile';
import { ReviewListItem } from '../types/reviews';
import { getImageUrl } from '../utils/image';

/**
 * 마이페이지 컴포넌트
 */
export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 마이페이지 데이터 관리
  const {
    user,
    userLoading,
    userError,
    favorites,
    favoritesLoading,
    favoritesError,
    totalFavorites,
    reviews,
    reviewsLoading,
    reviewsError,
    totalReviews,
    refreshReviews,
    removeFavorite
  } = useMyProfile();

  // 디버깅 로그 제거 (무한 렌더링 방지)

  // 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewModalMode, setReviewModalMode] = useState<'edit' | 'view'>('view');
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(null);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);

  // PrivateRoute가 이미 인증을 처리하므로 이 useEffect는 불필요합니다.
  // 제거하여 무한 루프 방지

  /**
   * 리뷰 상세 보기 모달 열기
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
  const handleReviewSaved = () => {
    refreshReviews();
  };

  /**
   * 리뷰 삭제 완료 처리
   */
  const handleReviewDeleted = () => {
    refreshReviews();
  };

  /**
   * 찜하기 토글 처리
   */
  const handleFavoriteToggle = async (eventId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      try {
        await removeFavorite(eventId);
      } catch (error) {
        console.error('찜하기 해제 실패:', error);
      }
    }
  };

  // PrivateRoute가 이미 인증을 확인했으므로 user가 null인 경우는 없어야 함
  // 하지만 안전을 위해 로딩 상태 체크
  if (!user) {
    console.warn('[MyProfilePage] User is null despite PrivateRoute check');
    console.log('[MyProfilePage] Debug info:', {
      userLoading,
      favoritesLoading,
      reviewsLoading,
      userError,
      favoritesError,
      reviewsError
    });
    
    // 에러가 있으면 에러 메시지 표시
    if (userError) {
      return (
        <PageContainer>
          <Header />
          <MainContent>
            <ErrorMessage>
              사용자 정보를 불러오는 중 오류가 발생했습니다: {userError}
            </ErrorMessage>
          </MainContent>
          <Footer />
        </PageContainer>
      );
    }
    
    // 로딩 중이면 로딩 스피너 표시
    return (
      <PageContainer>
        <Header />
        <LoadingContainer>
          <Loading message="사용자 정보를 불러오는 중..." />
        </LoadingContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        <PageTitle>마이페이지</PageTitle>

        {/* 개인정보 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle>👤 개인정보</SectionTitle>
            <EditButton onClick={() => navigate('/profile/edit')}>
              프로필 편집
            </EditButton>
          </SectionHeader>
          <PersonalInfoCard>
            <ProfileImageContainer onClick={() => user.profile_image && setShowProfileImageModal(true)}>
              {user.profile_image ? (
                <ProfileImage 
                  src={getImageUrl(user.profile_image)} 
                  alt={user.nickname}
                  clickable={true}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'profile-fallback';
                      fallback.textContent = user.nickname.charAt(0).toUpperCase();
                      fallback.style.cssText = `
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 48px;
                        font-weight: bold;
                        border: 4px solid #e9ecef;
                      `;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <ProfileFallback>
                  {user.nickname.charAt(0).toUpperCase()}
                </ProfileFallback>
              )}
            </ProfileImageContainer>
            <PersonalInfoDetails>
              <InfoRow>
                <InfoLabel>닉네임</InfoLabel>
                <InfoValue>{user.nickname}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>아이디</InfoLabel>
                <InfoValue>{user.user_id || '소셜 로그인'}</InfoValue>
                <ReadOnlyLabel>수정 불가</ReadOnlyLabel>
              </InfoRow>
              <InfoRow>
                <InfoLabel>비밀번호</InfoLabel>
                <InfoValue>********</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>이메일</InfoLabel>
                <InfoValue>{user.email || '미설정'}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>전화번호</InfoLabel>
                <InfoValue>{user.phone || '미설정'}</InfoValue>
              </InfoRow>
              {user.role == 'user' && (
                <HostAuthSection>
                  <HostAuthButton onClick={() => navigate('/host-auth')}>
                    주최자 인증 신청
                  </HostAuthButton>
                </HostAuthSection>
              )}
            </PersonalInfoDetails>
          </PersonalInfoCard>
          {userError && <ErrorMessage>{userError}</ErrorMessage>}
        </Section>

        {/* 찜한 행사 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle>💖 찜한 행사</SectionTitle>
            <MoreButton onClick={() => navigate('/activities/favorites')}>
              더보기 ({totalFavorites})
            </MoreButton>
          </SectionHeader>
          
          <FavoritesSection>
            {favoritesLoading ? (
              <Loading />
            ) : favoritesError ? (
              <ErrorMessage>{favoritesError}</ErrorMessage>
            ) : favorites.length === 0 ? (
              <EmptyFavorites>
                <EmptyIcon>💖</EmptyIcon>
                <EmptyText>찜한 행사가 없습니다</EmptyText>
                <EmptySubText>관심 있는 행사를 찜해보세요!</EmptySubText>
              </EmptyFavorites>
            ) : (
              <FavoritesGrid>
                {favorites.slice(0, 6).map(favorite => (
                  <EventCard
                    key={favorite.id}
                    event={{
                      ...favorite.event,
                      organizer: null,
                      host: { id: 0, nickname: '' },
                      tags: [],
                      stats: {
                        average_rating: favorite.event.average_rating,
                        total_reviews: 0,
                        view_count: 0,
                        favorites_count: 0,
                        schedules_count: 0
                      }
                    }}
                    showViewCount={true}
                    showFavoriteButton={true}
                    showScheduleButton={false}
                    isAuthenticated={true}
                    onFavoriteToggle={handleFavoriteToggle}
                    onShowLogin={() => {}} // 이미 로그인된 상태
                  />
                ))}
              </FavoritesGrid>
            )}
          </FavoritesSection>
        </Section>

        {/* 작성한 리뷰 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle>📝 작성한 리뷰</SectionTitle>
            <MoreButton onClick={() => navigate('/activities/reviews')}>
              더보기 ({totalReviews})
            </MoreButton>
          </SectionHeader>
          
          <ReviewsSection>
            {reviewsLoading ? (
              <Loading />
            ) : reviewsError ? (
              <ErrorMessage>{reviewsError}</ErrorMessage>
            ) : reviews.length === 0 ? (
              <EmptyReviews>
                <EmptyIcon>📝</EmptyIcon>
                <EmptyText>작성한 리뷰가 없습니다</EmptyText>
                <EmptySubText>행사에 참여한 후 리뷰를 작성해보세요!</EmptySubText>
              </EmptyReviews>
            ) : (
              <ReviewList>
                {reviews.map(review => (
                  <ReviewCardWrapper key={review.id}>
                    <ReviewCard
                      review={review}
                      onReviewClick={handleViewReview}
                      onUserClick={handleUserClick}
                      compact={true}
                    />
                    <EventLinkButton
                      onClick={() => handleEventClick(review.event.id)}
                    >
                      행사 보기
                    </EventLinkButton>
                  </ReviewCardWrapper>
                ))}
              </ReviewList>
            )}
          </ReviewsSection>
        </Section>
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

      {/* 프로필 이미지 모달 */}
      {user.profile_image && (
        <ImageModal
          isOpen={showProfileImageModal}
          onClose={() => setShowProfileImageModal(false)}
          images={[user.profile_image]}
          currentIndex={0}
          alt={`${user.nickname}의 프로필 사진`}
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
  max-width: 1000px;
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

const PageTitle = styled.h1`
  margin: 0 0 30px 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const MoreButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const PersonalInfoCard = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const ProfileImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const ProfileImage = styled.img<{ clickable?: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease;

  ${({ clickable }) =>
    clickable &&
    `
    &:hover {
      transform: scale(1.05);
      border-color: #007bff;
    }
  `}
`;

const ProfileFallback = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  border: 4px solid #e9ecef;
`;

const PersonalInfoDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #6c757d;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #333;
  font-size: 14px;
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const ReadOnlyLabel = styled.span`
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
`;

const HostAuthSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
`;

const HostAuthButton = styled.button`
  padding: 12px 24px;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #e0a800;
  }
`;

const FavoritesSection = styled.div`
  min-height: 100px;
`;

const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyFavorites = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const ReviewsSection = styled.div`
  min-height: 100px;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReviewCardWrapper = styled.div`
  position: relative;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const EventLinkButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 123, 255, 0.2);
    border-color: rgba(0, 123, 255, 0.3);
  }
`;

const EmptyReviews = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const EmptySubText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  padding: 20px;
  font-size: 14px;
`;

export default MyProfilePage;