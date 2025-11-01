import React, { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import * as UserApi from '../services/usersApi';
import * as ReviewApi from '../services/reviewsApi';
import type * as U from '../types/users';
import type * as R from '../types/reviews';
import ReviewCard from '../components/ReviewCard';
import * as S from '../styles/Mypage.styles'; // 동일한 스타일 사용 가능


const OtherUserPage: React.FC = () => {
  const [userData, setUserData] = useState<U.Users | null>(null);
  const [userReviews, setUserReviews] = useState<R.Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = Number(userId); // 숫자로 변환

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
      // const reviewsRes = await ReviewApi.getReviewById(numericUserId);

      setUserData(userRes);
      // setUserReviews(reviewsRes.reviews || []);
    } catch (error) {
      console.error("다른 사용자 페이지 데이터 로딩 실패:", error);
      // 오류 처리 로직 가능
    } finally {
      setIsLoading(false);
    }
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
        <S.ProfileAvatar src={userData.profile_image || '/default-profile.png'} alt="프로필 사진" />
        <S.ProfileInfo>
          <S.ProfileName>{userData.nickname}</S.ProfileName>
          <S.ProfileUserId>{userData.user_id}</S.ProfileUserId>
        </S.ProfileInfo>
      </S.ProfileSection>

      {/* 작성한 리뷰 섹션 */}
      <section>
        <S.ListHeader>
          <S.SectionTitle>작성한 리뷰</S.SectionTitle>
        </S.ListHeader>
        <S.ReviewGrid>
          {userReviews.length === 0 ? (
            <p>작성된 리뷰가 없습니다.</p>
          ) : (
            userReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                // 수정 삭제 버튼은 없거나 읽기 모드일 경우 props 전달 생략
              />
            ))
          )}
        </S.ReviewGrid>
      </section>

      {/* 추가 섹션 필요 시 삽입 가능 */}

    </S.PageContainer>
  );
};

export default OtherUserPage;