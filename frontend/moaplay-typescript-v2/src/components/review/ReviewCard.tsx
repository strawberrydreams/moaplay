/**
 * 리뷰 카드 컴포넌트
 * 
 * 개별 리뷰 정보를 카드 형태로 표시합니다.
 * 사용자 정보, 평점, 리뷰 내용, 이미지 등을 포함합니다.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { ReviewListItem } from '../../types/reviews';
import { ProfilePopup } from '../common/ProfilePopup';
import { getImageUrl, handleImageError as handleImgError } from '../../utils/image';

/**
 * 리뷰 카드 컴포넌트 Props
 */
interface ReviewCardProps {
  /** 리뷰 데이터 */
  review: ReviewListItem;
  /** 리뷰 클릭 핸들러 */
  onReviewClick?: (review: ReviewListItem) => void;
  /** 사용자 프로필 클릭 핸들러 */
  onUserClick?: (userId: number) => void;
  /** 컴팩트 모드 (작은 크기로 표시) */
  compact?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * 리뷰 카드 컴포넌트
 * 
 * 리뷰 정보를 카드 형태로 표시하고, 사용자 상호작용을 처리합니다.
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onReviewClick,
  onUserClick,
  compact = false,
  className
}) => {
  const [imageError, setImageError] = useState<Set<string>>(new Set());
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | undefined>();

  /**
   * 평점을 별 아이콘으로 렌더링
   * @param rating 평점 (1-5)
   * @returns 별 아이콘 JSX
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

  /**
   * 날짜를 상대적 시간으로 포맷팅
   * @param dateString 날짜 문자열
   * @returns 포맷팅된 날짜
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  /**
   * 이미지 로드 에러 처리
   * @param imageUrl 에러가 발생한 이미지 URL
   */
  const handleImageError = (imageUrl: string) => {
    setImageError(prev => new Set([...prev, imageUrl]));
  };

  /**
   * 사용자 프로필 클릭 처리 (프로필 팝업 표시)
   */
  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 클릭 위치 저장
    setPopupPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    // 프로필 팝업 표시
    setShowProfilePopup(true);
    
    // 기존 onUserClick 콜백도 호출 (하위 호환성)
    if (onUserClick) {
      onUserClick(review.user.id);
    }
  };

  /**
   * 프로필 팝업 닫기 처리
   */
  const handleCloseProfilePopup = () => {
    setShowProfilePopup(false);
    setPopupPosition(undefined);
  };

  /**
   * 리뷰 카드 클릭 처리
   */
  const handleCardClick = () => {
    if (onReviewClick) {
      onReviewClick(review);
    }
  };

  return (
    <ReviewCardContainer
      className={className}
      compact={compact}
      onClick={handleCardClick}
      clickable={!!onReviewClick}
    >
      {/* 리뷰 헤더 */}
      <ReviewHeader>
        <UserInfo onClick={handleUserClick}>
          <UserAvatar
            src={review.user.profile_image || '/default-avatar.png'}
            alt={review.user.nickname}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          <UserDetails>
            <UserName>
              {review.user.nickname}
            </UserName>
            <ReviewDate>{formatDate(review.created_at)}</ReviewDate>
          </UserDetails>
        </UserInfo>
      </ReviewHeader>

      {/* 평점 */}
      <RatingContainer>
        <Stars>{renderStars(review.rating)}</Stars>
        <RatingText>({review.rating}/5)</RatingText>
      </RatingContainer>

      {/* 리뷰 제목 */}
      {review.title && (
        <ReviewTitle compact={compact}>{review.title}</ReviewTitle>
      )}

      {/* 리뷰 내용 */}
      <ReviewContent compact={compact}>
        {compact && review.content.length > 100
          ? `${review.content.substring(0, 100)}...`
          : review.content
        }
      </ReviewContent>

      {/* 리뷰 이미지들 */}
      {review.image_urls && review.image_urls.length > 0 && (
        <ReviewImages compact={compact}>
          {review.image_urls
            .filter(url => !imageError.has(url))
            .slice(0, compact ? 2 : 4)
            .map((imageUrl: string, index: number) => (
              <ReviewImage
                key={index}
                src={getImageUrl(imageUrl)}
                alt={`리뷰 이미지 ${index + 1}`}
                onError={(e) => {
                  handleImgError(e, '/placeholder-image.jpg');
                  handleImageError(imageUrl);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: 이미지 확대 모달 구현
                }}
              />
            ))}
          {review.image_urls.length > (compact ? 2 : 4) && (
            <MoreImagesIndicator>
              +{review.image_urls.length - (compact ? 2 : 4)}
            </MoreImagesIndicator>
          )}
        </ReviewImages>
      )}

      {/* 프로필 팝업 */}
      {showProfilePopup && (
        <ProfilePopup
          user={{ 
            ...review.user, 
            role: 'user',
            profile_image: review.user.profile_image || undefined
          }}
          onClose={handleCloseProfilePopup}
          position={popupPosition}
        />
      )}
    </ReviewCardContainer>
  );
};

// 스타일 컴포넌트들
const ReviewCardContainer = styled.div<{ compact: boolean; clickable: boolean }>`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: ${props => props.compact ? '12px' : '20px'};
  margin-bottom: 16px;
  transition: all 0.2s ease;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:hover {
    ${props => props.clickable && `
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
      transform: translateY(-2px);
    `}
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;

  &:hover {
    opacity: 0.8;
  }
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
`;



const ReviewDate = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#ffc107' : '#e9ecef'};
  font-size: 16px;
`;

const RatingText = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const ReviewTitle = styled.h4<{ compact: boolean }>`
  margin: 0 0 8px 0;
  font-size: ${props => props.compact ? '14px' : '16px'};
  font-weight: 600;
  color: #333;
  line-height: 1.4;
`;

const ReviewContent = styled.p<{ compact: boolean }>`
  margin: 0 0 12px 0;
  font-size: ${props => props.compact ? '13px' : '14px'};
  line-height: 1.5;
  color: #555;
  white-space: pre-wrap;
`;

const ReviewImages = styled.div<{ compact: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${props => props.compact ? '60px' : '80px'}, 1fr));
  gap: 8px;
  max-width: ${props => props.compact ? '140px' : '200px'};
`;

const ReviewImage = styled.img`
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

const MoreImagesIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  aspect-ratio: 1;
`;

export default ReviewCard;