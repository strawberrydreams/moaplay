import React from 'react';
import Modal from './common/Modal'; // 기존 Modal 컴포넌트 임포트
import * as R from '../types/reviews'; // Review 타입 임포트
import * as S from '../styles/ReviewDetail.styles'; // 스타일 임포트
import { FaImage } from 'react-icons/fa'; // 이미지 플레이스홀더 아이콘

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: R.Review | null; // 선택된 리뷰 데이터 (없으면 null)
}

const ReviewDetail: React.FC<ReviewDetailModalProps> = ({ isOpen, onClose, review }) => {
  if (!isOpen || !review) return null; // 모달이 닫혀있거나 리뷰 데이터 없으면 렌더링 안 함

  // 별점 렌더링 함수
  const renderStars = (rating: number): string => {
    const r = Math.max(0, Math.min(5, Math.floor(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  // 이미지 URL 배열 가져오기 (타입 확인 필요!)
  const images = review.image_urls || []; 

  return (
    <Modal isOpen={isOpen} onClose={onClose} title=""> {/* 제목은 비우거나 review.title 사용 */}
      <S.DetailContainer>
        {/* 리뷰 제목 (Review 타입에 title이 있다면) */}
        {/* <S.ReviewTitle>{review.title || '리뷰 상세'}</S.ReviewTitle> */}
        {/* 여기서는 이미지처럼 제목 필드가 없으므로 생략 */}

        {/* 리뷰 내용 */}
        <S.ReviewContent>{review.content}</S.ReviewContent>

        {/* 리뷰 이미지 */}
        {images.length > 0 && (
          <S.ImageGrid>
            {images.map((url, index) => (
              url ? <S.ReviewImage key={index} src={url} alt={`리뷰 이미지 ${index + 1}`} /> 
                  : <S.ImagePlaceholder key={index}><FaImage /></S.ImagePlaceholder>
            ))}
            {/* 이미지 개수가 2개 미만일 때 빈 플레이스홀더 추가 (선택 사항) */}
            {images.length < 2 && <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>}
          </S.ImageGrid>
        )}

        {/* 하단 정보 (사용자, 날짜, 별점) */}
        <S.Footer>
          <S.UserInfo>
            <S.UserImage src={review.user.profile_image || '/default-profile.png'} alt={review.user.nickname} />
            <S.UserDetails>
              <S.UserName>{review.user.nickname}</S.UserName>
              {/* 날짜 포맷팅 필요 시 date-fns 라이브러리 사용 */}
              <S.ReviewDate>{new Date(review.created_at).toLocaleDateString()}</S.ReviewDate>
            </S.UserDetails>
          </S.UserInfo>
          <S.RatingDisplay>{renderStars(review.rating)}</S.RatingDisplay>
        </S.Footer>

      </S.DetailContainer>
    </Modal>
  );
};

export default ReviewDetail;