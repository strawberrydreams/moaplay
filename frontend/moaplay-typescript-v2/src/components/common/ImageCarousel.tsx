import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

/**
 * 이미지 캐러셀 컴포넌트
 * 지역별/추천/인기 페이지에서 주요 행사 이미지를 슬라이드로 표시
 */
interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
  height?: string;
}

interface CarouselImage {
  id: number;
  url: string;
  title: string;
  eventId?: number;
  description?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  autoPlay = true,
  interval = 5000,
  height = '300px'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * 자동 슬라이드 기능
   * autoPlay가 true일 때 지정된 간격으로 다음 이미지로 이동
   */
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  /**
   * 이전 이미지로 이동
   */
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  /**
   * 다음 이미지로 이동
   */
  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  /**
   * 특정 인덱스로 이동
   */
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <EmptyCarousel height={height}>
        <EmptyMessage>표시할 이미지가 없습니다</EmptyMessage>
      </EmptyCarousel>
    );
  }

  return (
    <CarouselContainer height={height}>
      <CarouselWrapper>
        <CarouselTrack currentIndex={currentIndex}>
          {images.map((image, index) => (
            <CarouselSlide key={image.id}>
              <SlideImage 
                src={image.url} 
                alt={image.title}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <SlideOverlay>
                <SlideContent>
                  <SlideTitle>{image.title}</SlideTitle>
                  {image.description && (
                    <SlideDescription>{image.description}</SlideDescription>
                  )}
                </SlideContent>
              </SlideOverlay>
            </CarouselSlide>
          ))}
        </CarouselTrack>

        {/* 네비게이션 버튼 */}
        {images.length > 1 && (
          <>
            <NavButton 
              position="left" 
              onClick={goToPrevious}
              aria-label="이전 이미지"
            >
              &#8249;
            </NavButton>
            <NavButton 
              position="right" 
              onClick={goToNext}
              aria-label="다음 이미지"
            >
              &#8250;
            </NavButton>
          </>
        )}
      </CarouselWrapper>

      {/* 인디케이터 */}
      {images.length > 1 && (
        <Indicators>
          {images.map((_, index) => (
            <Indicator
              key={index}
              active={index === currentIndex}
              onClick={() => goToSlide(index)}
              aria-label={`${index + 1}번째 이미지로 이동`}
            />
          ))}
        </Indicators>
      )}
    </CarouselContainer>
  );
};

// Styled Components
const CarouselContainer = styled.div<{ height: string }>`
  position: relative;
  width: 100%;
  height: ${({ height }) => height};
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const CarouselTrack = styled.div<{ currentIndex: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(-${({ currentIndex }) => currentIndex * 100}%);
  transition: transform 0.5s ease-in-out;
`;

const CarouselSlide = styled.div`
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SlideOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: ${({ theme: _theme }) => _theme.spacing.xl};
  color: white;
`;

const SlideContent = styled.div`
  max-width: 600px;
`;

const SlideTitle = styled.h3`
  font-size: ${({ theme: _theme }) => _theme.fonts.size.large};
  font-weight: 600;
  margin: 0 0 ${({ theme: _theme }) => _theme.spacing.sm} 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const SlideDescription = styled.p`
  font-size: ${({ theme: _theme }) => _theme.fonts.size.medium};
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const NavButton = styled.button<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ position }) => position}: ${({ theme: _theme }) => _theme.spacing.md};
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme: _theme }) => _theme.colors.dark};
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }

  &:focus {
    outline: 2px solid ${({ theme: _theme }) => _theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Indicators = styled.div`
  position: absolute;
  bottom: ${({ theme: _theme }) => _theme.spacing.md};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${({ theme: _theme }) => _theme.spacing.sm};
  z-index: 2;
`;

const Indicator = styled.button<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${({ active }) => 
    active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    transform: scale(1.2);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;

const EmptyCarousel = styled.div<{ height: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ height }) => height};
  background: ${({ theme: _theme }) => _theme.colors.light};
  border-radius: 12px;
`;

const EmptyMessage = styled.p`
  color: ${({ theme: _theme }) => _theme.colors.secondary};
  font-size: ${({ theme: _theme }) => _theme.fonts.size.medium};
  margin: 0;
`;

export { ImageCarousel };
export type { CarouselImage };