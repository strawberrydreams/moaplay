import React, { useEffect, useRef, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as UserApi from '../../services/usersApi';
import * as ReviewApi from '../../services/reviewsApi';
import type * as U from '../../types/users';
import type * as R from '../../types/reviews';
import ReviewCard from '../../components/ReviewCard';
import defaultImage from '../../assets/default-profile.png';
import * as S from '../../styles/Mypage.styles'; // 동일한 스타일 사용 가능
import ReviewDetail from '../../components/ReviewDetail';
import { useModal } from '../../hooks/useModal';
import { useReview } from '../../hooks/useReview';
import { FaPencilAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';


const OtherUserPage: React.FC = () => {
  const [userData, setUserData] = useState<U.Users | null>(null);
  const [userReviews, setUserReviews] = useState<R.Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = Number(userId); // 숫자로 변환
  const [selectedReview, setSelectedReview] = useState<R.Review | null>(null);

  const reviewListRef = useRef<HTMLDivElement>(null);
  const [isAtStartReviews, setIsAtStartReviews] = useState(true);
  const [isAtEndReviews, setIsAtEndReviews] = useState(false);
  const navigate = useNavigate();

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, setStart: any, setEnd: any) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setStart(scrollLeft <= 0);
    setEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  };

  const scrollReviews = (direction: 'left' | 'right') => {
    if (!reviewListRef.current) return;
    const scrollAmount = reviewListRef.current.offsetWidth * 0.8;
    reviewListRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const {
      isReviewDetailModalOpen,
      setReviewDetailModalOpen,
      openReviewModal,
      closeReviewDetailModal,
    } = useModal();

    const {
        handleEditReview,
        handleDeleteReview,
      } = useReview(openReviewModal);

  useEffect(() => {
    if (!isNaN(numericUserId)) {
      // 여기서 numericUserId로 해당 유저 정보 fetch
    }
  }, [numericUserId]);

  const loadOtherUserData = async () => {
    setIsLoading(true);
    try {
      // 사용자 정보 & 리뷰 가져오기
      const userRes = await UserApi.getUser(numericUserId);
      const reviewsRes = await ReviewApi.getReviewByUser({user_Id:numericUserId});

      setUserData(userRes);
      setUserReviews(reviewsRes.reviews || []);
    } catch (error) {
      console.error("다른 사용자 페이지 데이터 로딩 실패:", error);
      // 오류 처리 로직 가능
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailModal = (review: R.Review) => {
    setSelectedReview(review);
    setReviewDetailModalOpen(true);
  };

  useEffect(() => {
    loadOtherUserData();
  }, [userId]);

  if (isLoading) {
    return <S.PageContainer>로딩 중…</S.PageContainer>;
  }
  if (!userData) {
    return <S.PageContainer>사용자를 찾을 수 없습니다.</S.PageContainer>;
  }

  return (
    <S.PageContainer>
      {/* 프로필 섹션 */}
      <S.ProfileSection>
        <S.ProfileAvatar src={userData.profile_image || defaultImage} alt="프로필 사진" />
        <S.ProfileInfo>
          <S.ProfileName>{userData.nickname}</S.ProfileName>
          <S.ProfileUserId>{userData.user_id}</S.ProfileUserId>
        </S.ProfileInfo>
      </S.ProfileSection>

      {/* 작성한 리뷰 섹션 */}
      <section>
        <S.ListHeader>
          <S.SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>리뷰</S.SectionTitle>
          <S.ViewMoreButton onClick={() => navigate(`/users/reviews/${numericUserId}`)}>더보기</S.ViewMoreButton>
        </S.ListHeader>
        <S.FavoriteListContainer>
          {userReviews.length > 0 && !isAtStartReviews && (
            <S.ArrowButton direction="left" onClick={() => scrollReviews('left')}>
              <FaChevronLeft />
            </S.ArrowButton>
          )}

          <S.ReviewScrollContainer ref={reviewListRef}>
            {userReviews.length === 0 ? (
              <S.NoResultsMessage>작성한 리뷰가 없습니다.</S.NoResultsMessage>
            ) : (
              userReviews.slice(0, 5).map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onClick={() => openDetailModal(review)}
                  onEdit={() => handleEditReview(review)}
                  onDelete={() => handleDeleteReview(review.id)}
                />
              ))
            )}
          </S.ReviewScrollContainer>

          {userReviews.length > 0 && !isAtEndReviews && (
            <S.ArrowButton direction="right" onClick={() => scrollReviews('right')}>
              <FaChevronRight />
            </S.ArrowButton>
          )}
        </S.FavoriteListContainer>
      </section>

      <ReviewDetail
          isOpen={isReviewDetailModalOpen}
          onClose={closeReviewDetailModal}
          review={selectedReview}
          onEdit={(review) => {
            handleEditReview(review);
            closeReviewDetailModal();
          }}
          onDelete={(reviewId) => {
            handleDeleteReview(reviewId);
            closeReviewDetailModal();
          }}
        />

    </S.PageContainer>
  );
};

export default OtherUserPage;