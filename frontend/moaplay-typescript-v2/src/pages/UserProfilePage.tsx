/**
 * 다른 사용자 프로필 페이지 컴포넌트
 *
 * 다른 사용자의 공개 프로필 정보를 표시합니다.
 * 개인정보 섹션은 제외하고 공개 정보만 표시합니다.
 * - 프로필 사진, 닉네임, 인증 마크
 * - 찜한 행사 목록
 * - 작성한 리뷰 목록
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { ImageModal } from '../components/common';
import { ReviewCard } from '../components/review/ReviewCard';
import { ReviewModal } from '../components/review/ReviewModal';
import { useUserProfile } from '../hooks';
import { useAuth } from '../hooks';
import { ReviewListItem } from '../types/reviews';

/**
 * 다른 사용자 프로필 페이지 컴포넌트
 */
export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // 관리자 권한 확인
  const isAdmin = currentUser?.role === 'admin';

  // 사용자 프로필 데이터 관리
  const {
    user,
    userLoading,
    userError,
    reviews,
    reviewsLoading,
    reviewsError,
    totalReviews,
  } = useUserProfile(userId ? parseInt(userId, 10) : 0);

  // 모달 상태
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(
    null
  );
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);

  /**
   * 리뷰 상세 보기 모달 열기
   */
  const handleViewReview = (review: ReviewListItem) => {
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
   * 사용자 프로필 페이지로 이동 (다른 사용자 클릭 시)
   */
  const handleUserClick = (clickedUserId: number) => {
    if (clickedUserId.toString() !== userId) {
      navigate(`/users/${clickedUserId}/profile`);
    }
  };

  /**
   * 관리자 기능: 사용자 역할 변경
   */
  const handleChangeRole = async () => {
    if (!isAdmin || !user) return;

    const newRole = prompt(
      `현재 역할: ${user.role}\n새로운 역할을 입력하세요 (user/host/admin):`,
      user.role
    );

    if (!newRole || !['user', 'host', 'admin'].includes(newRole)) {
      alert('유효하지 않은 역할입니다.');
      return;
    }

    if (newRole === user.role) {
      return;
    }

    if (!confirm(`${user.nickname}님의 역할을 ${newRole}(으)로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const { AdminService } = await import('../services/adminService');
      await AdminService.updateUserRole(parseInt(userId!, 10), newRole as 'user' | 'host' | 'admin');
      alert('역할이 변경되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('역할 변경 실패:', error);
      alert('역할 변경에 실패했습니다.');
    }
  };

  /**
   * 관리자 기능: 사용자 삭제
   */
  const handleDeleteUser = async () => {
    if (!isAdmin || !user) return;

    if (!confirm(`${user.nickname}님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    const confirmText = prompt('삭제하려면 "삭제"를 입력하세요:');
    if (confirmText !== '삭제') {
      return;
    }

    try {
      const { AdminService } = await import('../services/adminService');
      await AdminService.deleteUser(parseInt(userId!, 10));
      alert('사용자가 삭제되었습니다.');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      alert('사용자 삭제에 실패했습니다.');
    }
  };

  // 사용자 ID가 유효하지 않은 경우
  if (!userId || isNaN(parseInt(userId, 10))) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorMessage>잘못된 사용자 ID입니다.</ErrorMessage>
          <BackButton onClick={() => navigate('/')}>홈으로 돌아가기</BackButton>
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  // 로딩 중
  if (userLoading && !user) {
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

  // 사용자 정보 로드 실패
  if (userError && !user) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorMessage>{userError}</ErrorMessage>
          <BackButton onClick={() => navigate('/')}>홈으로 돌아가기</BackButton>
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  // 사용자 정보가 없는 경우
  if (!user) {
    return (
      <PageContainer>
        <Header />
        <ErrorContainer>
          <ErrorMessage>사용자를 찾을 수 없습니다.</ErrorMessage>
          <BackButton onClick={() => navigate('/')}>홈으로 돌아가기</BackButton>
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />

      <MainContent>
        <PageTitle>{user.nickname}님의 프로필</PageTitle>

        {/* 공개 정보 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle>👤 공개 정보</SectionTitle>
            {isAdmin && (
              <AdminActions>
                <AdminButton
                  variant="warning"
                  onClick={() => handleChangeRole()}
                >
                  역할 변경
                </AdminButton>
                <AdminButton
                  variant="danger"
                  onClick={() => handleDeleteUser()}
                >
                  사용자 삭제
                </AdminButton>
              </AdminActions>
            )}
          </SectionHeader>
          <PersonalInfoCard>
            <ProfileImageContainer onClick={() => user.profile_image && setShowProfileImageModal(true)}>
              <ProfileImage
                src={user.profile_image || '/default-avatar.png'}
                alt={user.nickname}
                clickable={!!user.profile_image}
              />
            </ProfileImageContainer>
            <PersonalInfoDetails>
              <InfoRow>
                <InfoLabel>닉네임</InfoLabel>
                <InfoValue>{user.nickname}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>역할</InfoLabel>
                <InfoValue>
                  {user.role === 'admin' && '관리자'}
                  {user.role === 'host' && '주최자 ✓'}
                  {user.role === 'user' && '일반 사용자'}
                </InfoValue>
              </InfoRow>
            </PersonalInfoDetails>
          </PersonalInfoCard>
        </Section>

        {/* 작성한 리뷰 섹션 */}
        <Section>
          <SectionHeader>
            <SectionTitle>📝 작성한 리뷰</SectionTitle>
            <MoreButton onClick={() => navigate(`/users/${userId}/activities/reviews`)}>
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

      {/* 리뷰 상세 보기 모달 */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        mode="view"
        review={selectedReview ?? undefined}
        onSave={() => {}} // 읽기 전용
        onDelete={() => {}} // 읽기 전용
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

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
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

const AdminActions = styled.div`
  display: flex;
  gap: 8px;
`;

const AdminButton = styled.button<{ variant: 'warning' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant }) => {
    switch (variant) {
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          
          &:hover {
            background: #e0a800;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          
          &:hover {
            background: #c82333;
          }
        `;
    }
  }}
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



const PageTitle = styled.h1`
  margin: 0 0 30px 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  text-align: center;
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
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;



const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  padding: 20px;
  font-size: 14px;
`;

export default UserProfilePage;
