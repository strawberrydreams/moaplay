/**
 * 이미지 모달 컴포넌트
 * 
 * 원본 이미지를 전체 화면으로 표시하는 모달입니다.
 * 여러 이미지가 있는 경우 좌우 네비게이션을 제공합니다.
 */

import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getImageUrl, handleImageError } from '../../utils/image';

/**
 * 이미지 모달 Props
 */
interface ImageModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 이미지 URL 배열 */
  images: string[];
  /** 현재 선택된 이미지 인덱스 */
  currentIndex: number;
  /** 이미지 인덱스 변경 핸들러 */
  onIndexChange?: (index: number) => void;
  /** 이미지 설명 (선택사항) */
  alt?: string;
}

/**
 * 이미지 모달 컴포넌트
 */
export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  alt = '이미지',
}) => {
  /**
   * 이전 이미지로 이동
   */
  const handlePrevious = useCallback(() => {
    if (images.length <= 1) return;
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onIndexChange?.(newIndex);
  }, [currentIndex, images.length, onIndexChange]);

  /**
   * 다음 이미지로 이동
   */
  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onIndexChange?.(newIndex);
  }, [currentIndex, images.length, onIndexChange]);

  /**
   * 키보드 이벤트 처리
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    },
    [isOpen, onClose, handlePrevious, handleNext]
  );

  /**
   * 키보드 이벤트 리스너 등록
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  /**
   * 모달 외부 클릭 시 닫기
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <ModalOverlay onClick={handleBackdropClick}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <CloseButton onClick={onClose} aria-label="닫기">
          ×
        </CloseButton>

        {/* 이미지 카운터 */}
        {hasMultipleImages && (
          <ImageCounter>
            {currentIndex + 1} / {images.length}
          </ImageCounter>
        )}

        {/* 이전 버튼 */}
        {hasMultipleImages && (
          <NavigationButton
            direction="left"
            onClick={handlePrevious}
            aria-label="이전 이미지"
          >
            ‹
          </NavigationButton>
        )}

        {/* 이미지 */}
        <ImageContainer>
          <FullImage
            src={getImageUrl(currentImage)}
            alt={`${alt} ${currentIndex + 1}`}
            onError={(e) => handleImageError(e, '/placeholder-image.jpg')}
          />
        </ImageContainer>

        {/* 다음 버튼 */}
        {hasMultipleImages && (
          <NavigationButton
            direction="right"
            onClick={handleNext}
            aria-label="다음 이미지"
          >
            ›
          </NavigationButton>
        )}

        {/* 썸네일 네비게이션 */}
        {hasMultipleImages && (
          <ThumbnailContainer>
            {images.map((image, index) => (
              <Thumbnail
                key={index}
                src={getImageUrl(image)}
                alt={`${alt} 썸네일 ${index + 1}`}
                isActive={index === currentIndex}
                onClick={() => onIndexChange?.(index)}
                onError={(e) => handleImageError(e, '/placeholder-image.jpg')}
              />
            ))}
          </ThumbnailContainer>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

// 스타일 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  z-index: 10;
`;

const NavigationButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ direction }) => (direction === 'left' ? 'left: 20px;' : 'right: 20px;')}
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 36px;
    ${({ direction }) => (direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: calc(100vh - 180px);
  margin-bottom: 20px;
`;

const FullImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  max-width: 100%;
  overflow-x: auto;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
`;

const Thumbnail = styled.img<{ isActive: boolean }>`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid ${({ isActive }) => (isActive ? '#007bff' : 'transparent')};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.6)};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;