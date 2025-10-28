/**
 * 로딩 컴포넌트
 * 
 * 데이터 로딩 중에 표시되는 로딩 인디케이터 컴포넌트입니다.
 * 다양한 크기와 스타일을 지원하며, 전체 화면 또는 인라인 로딩을 제공합니다.
 */

import React from 'react';
import {
  FullScreenContainer,
  LoadingContent,
  Spinner,
  LoadingMessage,
  SkeletonBox,

} from '../../styles/components/Loading.styles';

/**
 * 로딩 컴포넌트 Props 타입
 */
interface LoadingProps {
  /** 로딩 인디케이터 크기 */
  size?: 'small' | 'sm' | 'md' | 'lg';
  /** 전체 화면 로딩 여부 */
  fullScreen?: boolean;
  /** 로딩 메시지 */
  message?: string;
  /** 배경 오버레이 표시 여부 */
  overlay?: boolean;
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * 로딩 컴포넌트
 * 
 * 스피너 애니메이션과 함께 로딩 상태를 시각적으로 표현합니다.
 * 전체 화면 로딩과 인라인 로딩을 모두 지원합니다.
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  fullScreen = false,
  message = '로딩 중...',
  overlay = false,
  className,
}) => {
  const LoadingComponent = (
    <LoadingContent $size={size} className={className}>
      <Spinner $size={size} />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </LoadingContent>
  );

  if (fullScreen) {
    return (
      <FullScreenContainer $overlay={overlay}>
        {LoadingComponent}
      </FullScreenContainer>
    );
  }

  return LoadingComponent;
};
/**
 * 스켈레톤 로딩 컴포넌트
 * 
 * 콘텐츠의 구조를 미리 보여주는 스켈레톤 UI입니다.
 */
export const Skeleton: React.FC<{
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius,
  className 
}) => {
  return (
    <SkeletonBox 
      $width={width} 
      $height={height} 
      $borderRadius={borderRadius}
      className={className}
    />
  );
};