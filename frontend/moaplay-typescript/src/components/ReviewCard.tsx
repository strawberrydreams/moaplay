import React from 'react';
import type * as R from '../types/reviews'; // Review 타입 경로 확인
import * as S from '../styles/ReviewCard.styles'; // 스타일 임포트
import { FaImage } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // 로그인 사용자 정보

interface ReviewCardProps {
  review: R.Review;
  onClick?: () => void; // 카드 클릭 시 동작 (상세 모달 열기 등)
  onEdit?: (id: number) => void; // 수정 버튼 클릭 시 동작
  onDelete?: (id: number) => void; // 삭제 버튼 클릭 시 동작
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick, onEdit, onDelete }) => {
  const { currentUser } = useAuth();

  // 별점 렌더링 함수
  const renderStars = (rating: number): string => {
    const r = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  // 날짜 포맷 함수 (간단 예시)
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString; // 파싱 실패 시 원본 반환
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    onEdit?.(review.id);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    onDelete?.(review.id);
  };

  // 이미지 URL 배열 (최대 2개)
  const imagesToShow = (review.image_urls || []).slice(0, 2);

  return (
    <S.Card onClick={onClick}>
      {/* 리뷰 제목 (Review 타입에 title이 있다면) */}
      {review.title && <S.Title>{review.title}</S.Title>} 
      
      <S.Content>{review.content}</S.Content>
      
      <S.ImageGrid>
        {imagesToShow.map((url, index) => (
          url ? <S.Thumbnail key={index} src={url} alt={`리뷰 이미지 ${index + 1}`} />
              : <S.ImagePlaceholder key={index}><FaImage /></S.ImagePlaceholder>
        ))}
        {/* 이미지가 1개일 때 플레이스홀더 추가 */}
        {imagesToShow.length === 1 && <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>}
        {/* 이미지가 없을 때 플레이스홀더 2개 추가 */}
        {imagesToShow.length === 0 && (
          <>
            <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>
            <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>
          </>
        )}
      </S.ImageGrid>

      <S.Footer>
        <S.UserInfoWrapper>
          <S.UserProfileImage src={review.user?.profile_image || '/default-profile.png'} alt={review.user?.nickname} />
          <S.UserDetails>
            {/* user.name 또는 user.nickname 사용 */}
            <S.UserName>{review.user?.nickname ?? '알 수 없음'}</S.UserName>
            <S.Date>{formatDate(review.created_at)}</S.Date>
          </S.UserDetails>
        </S.UserInfoWrapper>
        <S.Rating>{renderStars(review.rating)}</S.Rating>
      </S.Footer>

      {/* 수정/삭제 버튼 (로그인 사용자 && 작성자 일치 시) */}
      {currentUser && review.user && currentUser.id === review.user.id && (
        <S.Actions>
          <S.ActionButton onClick={handleEditClick}>수정</S.ActionButton>
          <S.ActionButton danger onClick={handleDeleteClick}>삭제</S.ActionButton>
        </S.Actions>
      )}
    </S.Card>
  );
};

export default ReviewCard;