import React from 'react';
import Modal from '../common/Modal'; // 기존 Modal 컴포넌트 임포트
import * as R from '../../types/reviews'; // Review 타입 임포트
import * as S from '../../styles/components/ReviewDetail.styles'; // 스타일 임포트
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';


interface ReviewDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: R.Review | null; // 선택된 리뷰 데이터 (없으면 null)
    onEdit?: (review: R.Review) => void;     // 추가
    onDelete?: (reviewId: number) => void;   // 추가
}

const ReviewDetail: React.FC<ReviewDetailModalProps> = ({ isOpen, onClose, review, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthContext();

    if (!isOpen || !review) return null; // 모달이 닫혀있거나 리뷰 데이터 없으면 렌더링 안 함
    // 별점 렌더링 함수
    const renderStars = (rating: number): string => {
        const r = Math.max(0, Math.min(5, Math.floor(rating)));
        return '★'.repeat(r) + '☆'.repeat(5 - r);
    };

    // 이미지 URL 배열 가져오기 (타입 확인 필요!)
    const images = review.image_urls || [];

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const reviewerId = review.user?.id;
        if (!reviewerId) return;

        if (currentUser && currentUser.id === reviewerId) {
            // 현재 로그인 사용자와 리뷰 작성자가 같으면 MyProfilePage
            navigate('/mypage');
        } else {
            // 타인의 프로필이면 OtherUserPage로 넘어가기 (userId를 URL param으로)
            navigate(`/users/${reviewerId}`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title=""> {/* 제목은 비우거나 review.title 사용 */}
            <S.DetailContainer>
                <S.ReviewTitle>{review.title || '리뷰 상세'}</S.ReviewTitle>
                {/* 리뷰 내용 */}
                <S.ReviewContent>{review.content}</S.ReviewContent>

                {/* 리뷰 이미지 */}
                {images.length > 0 && (
                    <S.ImageGrid>
                        {images.map((url, index) => (
                            <S.ReviewImage key={index} src={url} alt={`리뷰 이미지 ${index + 1}`} />
                        ))}
                    </S.ImageGrid>
                )}

                {/* 하단 정보 (사용자, 날짜, 별점) */}
                <S.Footer>
                    <S.UserInfo>
                        <S.UserImage
                            src={review.user.profile_image || '/default-profile.png'}
                            alt={review.user.nickname}
                            onClick={handleProfileClick}
                        />
                        <S.UserDetails>
                            <S.UserName>{review.user.nickname}</S.UserName>
                            {/* 날짜 포맷팅 필요 시 date-fns 라이브러리 사용 */}
                            <S.ReviewDate>{new Date(review.created_at).toLocaleDateString()}</S.ReviewDate>
                        </S.UserDetails>
                    </S.UserInfo>
                    <S.RatingDisplay>{renderStars(review.rating)}</S.RatingDisplay>
                </S.Footer>

                {currentUser && (review.user?.id === currentUser.id || currentUser.role === 'admin') && (
                    <S.Actions>
                        {review.user?.id === currentUser.id && (<S.ActionButton onClick={() => onEdit?.(review)}>수정</S.ActionButton>)}
                        <S.ActionButton danger onClick={() => onDelete?.(review.id)}>삭제</S.ActionButton>
                    </S.Actions>
                )}

            </S.DetailContainer>
        </Modal>
    );
};

export default ReviewDetail;