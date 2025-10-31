// src/components/ReviewCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type * as R from '../types/reviews';
import { useAuthContext } from '../context/AuthContext';
import * as S from '../styles/ReviewCard.styles';
import { FaImage } from 'react-icons/fa';

interface ReviewCardProps {
  review: R.Review;
  onClick?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick, onEdit, onDelete }) => {
  const { user: currentUser } = useAuthContext();
  const navigate = useNavigate();

  const renderStars = (rating: number): string => {
    const r = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(review.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(review.id);
  };

  const imagesToShow = (review.image_urls || []).slice(0, 2);

  return (
    <S.Card onClick={onClick}>
      {review.title && <S.Title>{review.title}</S.Title>}
      <S.Content>{review.content}</S.Content>
      <S.ImageGrid>
        {imagesToShow.map((url, index) =>
          url ? (
            <S.Thumbnail key={index} src={url} alt={`리뷰 이미지 ${index + 1}`} />
          ) : (
            <S.ImagePlaceholder key={index}><FaImage /></S.ImagePlaceholder>
          )
        )}
        {imagesToShow.length === 1 && <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>}
        {imagesToShow.length === 0 && (
          <>
            <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>
            <S.ImagePlaceholder><FaImage /></S.ImagePlaceholder>
          </>
        )}
      </S.ImageGrid>
      <S.Footer>
        <S.UserInfoWrapper style={{ cursor: 'pointer' }}>
          <S.UserProfileImage src={review.user?.profile_image || '/default-profile.png'} alt={review.user?.nickname} />
          <S.UserDetails>
            <S.UserName>{review.user?.nickname ?? '알 수 없음'}</S.UserName>
            <S.Date>{formatDate(review.created_at)}</S.Date>
          </S.UserDetails>
        </S.UserInfoWrapper>
        <S.Rating>{renderStars(review.rating)}</S.Rating>
      </S.Footer>

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
