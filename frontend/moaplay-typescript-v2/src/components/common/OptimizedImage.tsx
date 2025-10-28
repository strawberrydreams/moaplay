/**
 * 최적화된 이미지 컴포넌트
 * 
 * 지연 로딩, 플레이스홀더, 에러 처리, 반응형 이미지를 지원하는
 * 성능 최적화된 이미지 컴포넌트입니다.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
  sizes?: string;
  srcSet?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageContainer = styled.div<{ width?: number | string; height?: number | string }>`
  position: relative;
  display: inline-block;
  width: ${({ width }) => typeof width === 'number' ? `${width}px` : width || 'auto'};
  height: ${({ height }) => typeof height === 'number' ? `${height}px` : height || 'auto'};
  overflow: hidden;
`;

const Image = styled.img<{ isLoaded: boolean; isError: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
  opacity: ${({ isLoaded, isError }) => (isLoaded && !isError) ? 1 : 0};
`;

const Placeholder = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${({ isVisible }) => isVisible ? 'shimmer 1.5s infinite' : 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.875rem;
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const ErrorFallback = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.875rem;
  border: 1px solid #e0e0e0;
`;

/**
 * Intersection Observer를 사용한 지연 로딩 훅
 */
const useIntersectionObserver = <T extends Element>(
  elementRef: React.RefObject<T | null>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};

/**
 * 최적화된 이미지 컴포넌트
 *
 * 다음 최적화 기능을 제공합니다:
 * - 지연 로딩 (Intersection Observer 사용)
 * - 로딩 플레이스홀더 (스켈레톤 UI)
 * - 에러 처리 및 폴백 이미지
 * - 반응형 이미지 지원 (srcSet, sizes)
 * - 부드러운 페이드인 애니메이션
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  width,
  height,
  className,
  placeholder = '이미지 로딩 중...',
  fallback = '이미지를 불러올 수 없습니다',
  lazy = true,
  quality = 80,
  sizes,
  srcSet,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const imageRef = useRef<HTMLDivElement | null>(null);
  
  // 지연 로딩을 위한 Intersection Observer
  const isIntersecting = useIntersectionObserver(imageRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // 이미지가 뷰포트에 들어오면 로딩 시작
  useEffect(() => {
    if (lazy && isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [lazy, isIntersecting, shouldLoad]);

  // 이미지 로드 완료 처리
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  }, [onLoad]);

  // 이미지 로드 에러 처리
  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  // 최적화된 이미지 URL 생성 (실제 CDN 사용 시 구현)
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // 실제 환경에서는 이미지 CDN을 사용하여 최적화
    // 예: Cloudinary, ImageKit 등
    if (quality && quality < 100) {
      // 쿼리 파라미터로 품질 조정 (CDN 지원 시)
      const separator = originalSrc.includes('?') ? '&' : '?';
      return `${originalSrc}${separator}q=${quality}`;
    }
    return originalSrc;
  }, [quality]);

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <ImageContainer 
      ref={imageRef} 
      width={width} 
      height={height} 
      className={className}
    >
      {shouldLoad && (
        <Image
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          isLoaded={isLoaded}
          isError={isError}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
      
      {/* 로딩 플레이스홀더 */}
      {!isLoaded && !isError && (
        <Placeholder isVisible={!isLoaded}>
          {placeholder}
        </Placeholder>
      )}
      
      {/* 에러 폴백 */}
      {isError && (
        <ErrorFallback>
          {fallback}
        </ErrorFallback>
      )}
    </ImageContainer>
  );
});

OptimizedImage.displayName = 'OptimizedImage';