/**
 * 찜하기 버튼 컴포넌트
 * 
 * 하트 아이콘을 사용한 찜하기 토글 버튼입니다.
 * 로그인 상태에 따라 다른 동작을 수행합니다.
 */

import React, { useContext } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useAuth, useFavoriteToggle } from '../../hooks';
import { CalendarContext } from '../../contexts/calendarContextUtils';
import { useFavoriteContext } from '../../contexts';

/**
 * FavoriteButton 컴포넌트 Props
 */
export interface FavoriteButtonProps {
  eventId: number;
  initialFavoriteState?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'filled';
  onToggle?: (eventId: number, isFavorite: boolean) => void;
  onLoginRequired?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * 찜하기 버튼 컴포넌트
 * 
 * 하트 아이콘을 사용한 찜하기 토글 버튼입니다.
 * 로그인하지 않은 사용자가 클릭하면 로그인 모달을 표시합니다.
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  eventId,
  initialFavoriteState = false,
  size = 'medium',
  variant = 'default',
  onToggle,
  onLoginRequired,
  className,
  disabled = false
}) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, loading, toggleFavorite } = useFavoriteToggle(eventId, initialFavoriteState);
  
  // 캘린더 컨텍스트를 항상 최상위에서 호출 (React Hooks 규칙 준수)
  // useContext는 항상 호출되어야 하며, 조건부 로직은 반환값을 사용할 때 처리
  const calendarContext = useContext(CalendarContext); // null일 수 있음
  
  // 찜하기 전역 컨텍스트 - React Hooks 규칙 준수를 위해 항상 호출
  const favoriteContext = useFavoriteContext();

  /**
   * 찜하기 버튼 클릭 핸들러 (낙관적 업데이트)
   */
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || loading) return;

    // 로그인하지 않은 경우
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    try {
      // 찜하기 토글 실행 (낙관적 업데이트 적용)
      const newFavoriteState = await toggleFavorite();
      
      // 부모 컴포넌트에 알림
      onToggle?.(eventId, newFavoriteState);
      
      // 전역 컨텍스트에 알림 (다른 컴포넌트 동기화)
      if (favoriteContext) {
        favoriteContext.notifyFavoriteChange(eventId, newFavoriteState);
      }
      
      // 캘린더 새로고침 (컨텍스트가 있는 경우)
      if (calendarContext && calendarContext) {
        await calendarContext.onFavoriteChange(eventId);
      }
    } catch (error) {
      console.error('찜하기 토글 실패:', error);
    }
  };

  return (
    <StyledButton
      onClick={handleClick}
      $isFavorite={isFavorite}
      $loading={loading}
      $size={size}
      $variant={variant}
      $disabled={disabled}
      className={className}
      aria-label={isFavorite ? '찜하기 취소' : '찜하기'}
      title={isFavorite ? '찜하기 취소' : '찜하기'}
    >
      <HeartIcon $isFavorite={isFavorite} $loading={loading} $size={size}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
            stroke="currentColor"
            fill={isFavorite ? "currentColor" : "none"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </HeartIcon>
      
      {loading && <LoadingSpinner $size={size} />}
    </StyledButton>
  );
};

// 애니메이션 정의
const heartBeat = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 스타일 컴포넌트
const StyledButton = styled.button<{
  $isFavorite: boolean;
  $loading: boolean;
  $size: string;
  $variant: string;
  $disabled: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: ${({ $disabled, $loading }) => ($disabled || $loading) ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ $disabled, $loading }) => ($disabled || $loading) ? 0.6 : 1};

  /* 크기별 스타일 */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          width: 28px;
          height: 28px;
          padding: 4px;
        `;
      case 'large':
        return `
          width: 44px;
          height: 44px;
          padding: 8px;
        `;
      default: // medium
        return `
          width: 36px;
          height: 36px;
          padding: 6px;
        `;
    }
  }}

  /* 변형별 스타일 */
  ${({ $variant, $isFavorite, theme }) => {
    switch ($variant) {
      case 'minimal':
        return `
          background: transparent;
          &:hover {
            background: ${theme.colors.backgroundHover};
          }
        `;
      case 'filled':
        return `
          background: ${$isFavorite ? theme.colors.danger : theme.colors.backgroundLight};
          &:hover {
            background: ${$isFavorite ? theme.colors.dangerDark : theme.colors.backgroundDark};
          }
        `;
      default: // default
        return `
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          &:hover {
            background: white;
            transform: scale(1.05);
          }
        `;
    }
  }}

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const HeartIcon = styled.div<{
  $isFavorite: boolean;
  $loading: boolean;
  $size: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isFavorite, theme }) => 
    $isFavorite ? theme.colors.danger : theme.colors.textSecondary
  };
  transition: color 0.2s ease;

  svg {
    ${({ $size }) => {
      switch ($size) {
        case 'small':
          return 'width: 16px; height: 16px;';
        case 'large':
          return 'width: 24px; height: 24px;';
        default: // medium
          return 'width: 20px; height: 20px;';
      }
    }}
  }

  /* 찜하기 상태 변경 시 애니메이션 */
  ${({ $isFavorite }) => 
    $isFavorite && css`
      animation: ${heartBeat} 0.3s ease-in-out;
    `
  }

  ${StyledButton}:hover & {
    color: ${({ $isFavorite, theme }) => 
      $isFavorite ? theme.colors.dangerDark : theme.colors.danger
    };
  }
`;

const LoadingSpinner = styled.div<{ $size: string }>`
  position: absolute;
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return 'width: 12px; height: 12px;';
      case 'large':
        return 'width: 18px; height: 18px;';
      default: // medium
        return 'width: 16px; height: 16px;';
    }
  }}
`;