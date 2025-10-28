/**
 * Button 컴포넌트 스타일
 * 
 * 다양한 버튼 변형과 상태를 지원하는 스타일을 정의합니다.
 * 접근성, 성능 최적화, 반응형 디자인을 고려한 스타일링을 포함합니다.
 */

import styled, { css } from 'styled-components';

/**
 * 버튼 변형 타입
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link';

/**
 * 버튼 크기 타입
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * 버튼 Props 인터페이스
 */
interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $loading?: boolean;
  $fullWidth?: boolean;
  $iconOnly?: boolean;
}

/**
 * 버튼 크기별 스타일
 */
const sizeStyles = {
  xs: css`
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fonts.size.xs};
    min-height: 28px;
    gap: ${({ theme }) => theme.spacing.xs};
  `,
  sm: css`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fonts.size.sm};
    min-height: 36px;
    gap: ${({ theme }) => theme.spacing.xs};
  `,
  md: css`
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.fonts.size.md};
    min-height: 40px;
    gap: ${({ theme }) => theme.spacing.sm};
  `,
  lg: css`
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.fonts.size.lg};
    min-height: 48px;
    gap: ${({ theme }) => theme.spacing.sm};
  `,
  xl: css`
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing['2xl']};
    font-size: ${({ theme }) => theme.fonts.size.xl};
    min-height: 56px;
    gap: ${({ theme }) => theme.spacing.md};
  `,
};

/**
 * 버튼 변형별 스타일
 */
const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.background};
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.secondaryDark};
      border-color: ${({ theme }) => theme.colors.secondaryDark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.secondary};
      outline-offset: 2px;
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.background};
    border: 2px solid ${({ theme }) => theme.colors.danger};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.dangerDark};
      border-color: ${({ theme }) => theme.colors.dangerDark};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.danger};
      outline-offset: 2px;
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.background};
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 2px solid transparent;
    
    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.backgroundHover};
      color: ${({ theme }) => theme.colors.primary};
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }
  `,
  link: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid transparent;
    text-decoration: underline;
    min-height: auto;
    padding: 0;
    
    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.primaryHover};
      text-decoration: none;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
    }
  `,
};

/**
 * 메인 버튼 스타일 컴포넌트
 */
export const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<StyledButtonProps>`
  /* 기본 스타일 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;

  /* 크기별 스타일 적용 */
  ${({ $size }) => sizeStyles[$size]}

  /* 변형별 스타일 적용 */
  ${({ $variant }) => variantStyles[$variant]}

  /* 전체 너비 */
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  /* 아이콘 전용 버튼 */
  ${({ $iconOnly, $size }) => $iconOnly && css`
    padding: ${sizeStyles[$size]?.toString().includes('xs') ? 
      ({ theme }) => theme.spacing.xs : 
      ({ theme }) => theme.spacing.sm};
    aspect-ratio: 1;
    min-width: auto;
  `}

  /* 활성 상태 */
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* 비활성 상태 */
  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundDisabled};
    color: ${({ theme }) => theme.colors.textDisabled};
    border-color: ${({ theme }) => theme.colors.borderLight};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;
  }

  /* 로딩 상태 */
  ${({ $loading }) => $loading && css`
    cursor: wait;
    
    /* 로딩 중일 때 텍스트 숨김 */
    color: transparent;
  `};

  /* 고대비 모드 지원 */
  @media (prefers-contrast: more) {
    border-width: 3px;
  }

  /* 모션 감소 모드 지원 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover:not(:disabled) {
      transform: none;
    }
  }

  /* 터치 디바이스 최적화 */
  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  /* 모바일 반응형 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    ${({ $size }) => $size === 'lg' && css`
      padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
      font-size: ${({ theme }) => theme.fonts.size.md};
      min-height: 44px;
    `}
    
    ${({ $size }) => $size === 'xl' && css`
      padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
      font-size: ${({ theme }) => theme.fonts.size.lg};
      min-height: 48px;
    `}
  }
`;

/**
 * 로딩 스피너 컴포넌트
 */
export const LoadingSpinner = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $size?: ButtonSize }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '14px';
      case 'md':
        return '16px';
      case 'lg':
        return '18px';
      case 'xl':
        return '20px';
      default:
        return '16px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '14px';
      case 'md':
        return '16px';
      case 'lg':
        return '18px';
      case 'xl':
        return '20px';
      default:
        return '16px';
    }
  }};
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  /* 모션 감소 모드에서 애니메이션 비활성화 */
  @media (prefers-reduced-motion: reduce) {
    /* 대신 점멸 효과 사용 */
    animation: pulse 1.5s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  }
`;

/**
 * 버튼 콘텐츠 래퍼
 */
export const ButtonContent = styled.span.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: inherit;
  opacity: ${({ $loading }) => $loading ? 0 : 1};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

/**
 * 버튼 그룹 컨테이너
 */
export const ButtonGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $orientation?: 'horizontal' | 'vertical'; $spacing?: 'sm' | 'md' | 'lg' }>`
  display: flex;
  flex-direction: ${({ $orientation = 'horizontal' }) => 
    $orientation === 'vertical' ? 'column' : 'row'};
  gap: ${({ $spacing = 'md', theme }) => {
    switch ($spacing) {
      case 'sm': return theme.spacing.sm;
      case 'lg': return theme.spacing.lg;
      default: return theme.spacing.md;
    }
  }};
  align-items: ${({ $orientation = 'horizontal' }) => 
    $orientation === 'vertical' ? 'stretch' : 'center'};

  /* 연결된 버튼 그룹 스타일 */
  &.connected {
    gap: 0;
    
    ${StyledButton} {
      border-radius: 0;
      
      &:first-child {
        border-radius: ${({ theme }) => theme.borderRadius.md} 0 0 ${({ theme }) => theme.borderRadius.md};
      }
      
      &:last-child {
        border-radius: 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0;
      }
      
      &:not(:last-child) {
        border-right-width: 1px;
      }
    }
  }

  /* 모바일에서 세로 정렬 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    &.mobile-vertical {
      flex-direction: column;
      
      ${StyledButton} {
        width: 100%;
      }
    }
  }
`;

/**
 * 플로팅 액션 버튼 (FAB)
 */
export const FloatingActionButton = styled(StyledButton).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.fixed};
  
  &:hover:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.xl};
    transform: scale(1.05);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    bottom: ${({ theme }) => theme.spacing.lg};
    right: ${({ theme }) => theme.spacing.lg};
    width: 48px;
    height: 48px;
  }
`;

/**
 * 토글 버튼
 */
export const ToggleButton = styled(StyledButton).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $active?: boolean }>`
  ${({ $active, theme }) => $active && css`
    background-color: ${theme.colors.primary};
    color: ${theme.colors.background};
    border-color: ${theme.colors.primary};
  `}
`;