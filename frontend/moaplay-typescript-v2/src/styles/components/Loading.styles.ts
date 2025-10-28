/**
 * Loading 컴포넌트 스타일
 * 
 * 로딩 인디케이터와 스켈레톤 UI의 스타일을 정의합니다.
 * 접근성과 성능을 고려한 애니메이션을 포함합니다.
 */

import styled, { css, keyframes } from 'styled-components';

/**
 * 로딩 크기 타입
 */
export type LoadingSize = 'small' | 'sm' | 'md' | 'lg';

/**
 * 스피너 회전 애니메이션
 */
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

/**
 * 펄스 애니메이션 (모션 감소 모드용)
 */
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

/**
 * 전체 화면 로딩 컨테이너
 */
export const FullScreenContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $overlay?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background-color: ${({ $overlay }) => 
    $overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent'};
  backdrop-filter: ${({ $overlay }) => $overlay ? 'blur(2px)' : 'none'};
  
  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    background-color: ${({ $overlay }) => 
      $overlay ? 'rgba(0, 0, 0, 0.8)' : 'transparent'};
  }
`;

/**
 * 로딩 콘텐츠 컨테이너
 */
export const LoadingContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $size: LoadingSize }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  
  ${({ $size }) => {
    switch ($size) {
      case 'small':
      case 'sm':
        return css`
          gap: ${({ theme }) => theme.spacing.sm};
          padding: ${({ theme }) => theme.spacing.md};
        `;
      case 'lg':
        return css`
          gap: ${({ theme }) => theme.spacing.lg};
          padding: ${({ theme }) => theme.spacing['2xl']};
        `;
      default:
        return css`
          gap: ${({ theme }) => theme.spacing.md};
          padding: ${({ theme }) => theme.spacing.xl};
        `;
    }
  }}
`;

/**
 * 스피너 컴포넌트
 */
export const Spinner = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $size: LoadingSize; $color?: string }>`
  width: ${({ $size }) => {
    switch ($size) {
      case 'small':
      case 'sm': return '20px';
      case 'md': return '32px';
      case 'lg': return '48px';
      default: return '32px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small':
      case 'sm': return '20px';
      case 'md': return '32px';
      case 'lg': return '48px';
      default: return '32px';
    }
  }};
  border: ${({ $size, theme }) => {
    const width = ($size === 'small' || $size === 'sm') ? '2px' : $size === 'lg' ? '4px' : '3px';
    return `${width} solid ${theme.colors.borderLight}`;
  }};
  border-top: ${({ $size, $color, theme }) => {
    const width = ($size === 'small' || $size === 'sm') ? '2px' : $size === 'lg' ? '4px' : '3px';
    const color = $color || theme.colors.primary;
    return `${width} solid ${color}`;
  }};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  /* 모션 감소 모드 지원 */
  @media (prefers-reduced-motion: reduce) {
    animation: ${pulse} 1.5s ease-in-out infinite;
    border-top-color: ${({ $color, theme }) => $color || theme.colors.primary};
  }

  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    border-width: ${({ $size }) => {
      return $size === 'small' || $size === 'sm'
        ? '3px'
        : $size === 'lg'
          ? '5px'
          : '4px';
    }};
    border-top-width: ${({ $size }) => {
      return $size === 'small' || $size === 'sm'
        ? '3px'
        : $size === 'lg'
          ? '5px'
          : '4px';
    }};
  }
`;

/**
 * 로딩 메시지
 */
export const LoadingMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  text-align: center;
  margin: 0;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  line-height: ${({ theme }) => theme.fonts.lineHeight.normal};
`;

/**
 * 스켈레톤 애니메이션
 */
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

/**
 * 스켈레톤 박스
 */
export const SkeletonBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{
  $width?: string;
  $height?: string;
  $borderRadius?: string;
}>`
  width: ${({ $width = '100%' }) => $width};
  height: ${({ $height = '20px' }) => $height};
  border-radius: ${({ $borderRadius, theme }) => $borderRadius || theme.borderRadius.sm};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundLight} 0%,
    ${({ theme }) => theme.colors.borderLight} 50%,
    ${({ theme }) => theme.colors.backgroundLight} 100%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;

  /* 모션 감소 모드에서 애니메이션 비활성화 */
  @media (prefers-reduced-motion: reduce) {
    animation: ${pulse} 2s ease-in-out infinite;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      90deg,
      #2a2a2a 0%,
      #3a3a3a 50%,
      #2a2a2a 100%
    );
    background-size: 200px 100%;
  }
`;

/**
 * 카드 스켈레톤 컨테이너
 */
export const CardSkeletonContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

/**
 * 카드 스켈레톤 콘텐츠
 */
export const CardSkeletonContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

/**
 * 인라인 로딩 스피너
 */
export const InlineSpinner = styled(Spinner).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  display: inline-block;
  vertical-align: middle;
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

/**
 * 버튼 내부 로딩 스피너
 */
export const ButtonSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $size?: 'sm' | 'md' | 'lg' }>`
  width: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return '14px';
      case 'lg':
        return '18px';
      default:
        return '16px';
    }
  }};
  height: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return '14px';
      case 'lg':
        return '18px';
      default:
        return '16px';
    }
  }};
  border: 2px solid transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

/**
 * 도트 로딩 애니메이션
 */
const dotBounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

/**
 * 도트 로딩 컨테이너
 */
export const DotLoading = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
`;

/**
 * 도트 로딩 개별 도트
 */
export const DotLoadingDot = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $delay?: number }>`
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${dotBounce} 1.4s ease-in-out infinite both;
  animation-delay: ${({ $delay = 0 }) => $delay}s;

  @media (prefers-reduced-motion: reduce) {
    animation: ${pulse} 1.5s ease-in-out infinite;
    animation-delay: ${({ $delay = 0 }) => $delay * 0.5}s;
  }
`;

/**
 * 프로그레스 바
 */
export const ProgressBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $progress?: number }>`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ $progress = 0 }) => $progress}%;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: inherit;
    transition: width 0.3s ease;
  }
`;

/**
 * 무한 프로그레스 바
 */
const progressSlide = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

export const IndeterminateProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: inherit;
    animation: ${progressSlide} 1.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: ${pulse} 2s ease-in-out infinite;
      width: 100%;
      transform: none;
    }
  }
`;

/**
 * 텍스트 스켈레톤 (여러 줄)
 */
export const TextSkeleton = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $lines?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  ${({ $lines = 3 }) => Array.from({ length: $lines }, (_, index) => css`
    &::${index === 0 ? 'before' : `after`} {
      content: '';
      height: 16px;
      background: ${({ theme }) => theme.colors.backgroundLight};
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      width: ${index === $lines - 1 ? '60%' : '100%'};
      animation: ${shimmer} 1.5s ease-in-out infinite;
      animation-delay: ${index * 0.1}s;
    }
  `)}
`;

/**
 * 원형 스켈레톤 (아바타 등)
 */
export const CircleSkeleton = styled(SkeletonBox).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $size?: string }>`
  width: ${({ $size = '40px' }) => $size};
  height: ${({ $size = '40px' }) => $size};
  border-radius: 50%;
`;

/**
 * 테이블 스켈레톤
 */
export const TableSkeleton = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $rows?: number; $columns?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ $rows = 5, $columns = 4 }) => Array.from({ length: $rows }, (_, rowIndex) => css`
    &::${rowIndex === 0 ? 'before' : `after`} {
      content: '';
      display: flex;
      gap: ${({ theme }) => theme.spacing.md};
      
      ${Array.from({ length: $columns }, (_, colIndex) => css`
        &::${colIndex === 0 ? 'before' : `after`} {
          content: '';
          flex: 1;
          height: 20px;
          background: ${({ theme }) => theme.colors.backgroundLight};
          border-radius: ${({ theme }) => theme.borderRadius.sm};
          animation: ${shimmer} 1.5s ease-in-out infinite;
          animation-delay: ${(rowIndex * $columns + colIndex) * 0.05}s;
        }
      `)}
    }
  `)}
`;