/**
 * 개인 일정 토글 버튼 컴포넌트
 * 
 * 행사를 개인 일정에 추가하거나 제거하는 토글 버튼입니다.
 * 로그인 상태에 따라 다른 동작을 수행합니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

/**
 * ScheduleToggleButton 컴포넌트 Props
 */
interface ScheduleToggleButtonProps {
  /** 행사 ID */
  eventId: number;
  /** 현재 개인 일정 추가 상태 */
  isInSchedule: boolean;
  /** 로그인 상태 */
  isAuthenticated: boolean;
  /** 토글 핸들러 */
  onToggle: (eventId: number) => Promise<boolean>;
  /** 로그인 모달 표시 핸들러 */
  onShowLogin: () => void;
  /** 버튼 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 개인 일정 토글 버튼 컴포넌트
 * 
 * 행사를 개인 일정에 추가하거나 제거할 수 있는 토글 버튼입니다.
 * 로그인하지 않은 사용자에게는 로그인을 유도합니다.
 */
export const ScheduleToggleButton: React.FC<ScheduleToggleButtonProps> = ({
  eventId,
  isInSchedule,
  isAuthenticated,
  onToggle,
  onShowLogin,
  size = 'medium',
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentState, setCurrentState] = useState(isInSchedule);

  /**
   * isInSchedule prop이 변경되면 currentState 업데이트
   * 외부에서 상태가 변경되었을 때 버튼 상태를 동기화합니다
   */
  useEffect(() => {
    setCurrentState(isInSchedule);
  }, [isInSchedule]);

  /**
   * 토글 버튼 클릭 처리
   */
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 로그인하지 않은 사용자
    if (!isAuthenticated) {
      onShowLogin();
      return;
    }

    // 이미 처리 중인 경우 무시
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const newState = await onToggle(eventId);
      setCurrentState(newState);
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      // TODO: 에러 토스트 표시
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 키보드 이벤트 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // 키보드 이벤트를 마우스 이벤트로 변환하여 처리
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
      } as React.MouseEvent;
      handleClick(syntheticEvent);
    }
  };

  return (
    <ToggleButton
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      $isInSchedule={currentState}
      $isLoading={isLoading}
      $size={size}
      className={className}
      disabled={isLoading}
      title={
        !isAuthenticated
          ? '로그인이 필요합니다'
          : currentState
          ? '개인 일정에서 제거'
          : '개인 일정에 추가'
      }
      aria-label={
        !isAuthenticated
          ? '로그인이 필요합니다'
          : currentState
          ? '개인 일정에서 제거'
          : '개인 일정에 추가'
      }
    >
      {isLoading ? (
        <LoadingSpinner $size={size} />
      ) : (
        <ScheduleIcon $isInSchedule={currentState}>
          {currentState ? '📅' : '📝'}
        </ScheduleIcon>
      )}
    </ToggleButton>
  );
};

// 스타일 컴포넌트들
const ToggleButton = styled.button<{
  $isInSchedule: boolean;
  $isLoading: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};
  position: relative;
  
  /* 크기별 스타일 */
  ${({ $size, theme }) => {
    switch ($size) {
      case 'small':
        return `
          width: 28px;
          height: 28px;
          font-size: ${theme.fonts.size.xs};
        `;
      case 'large':
        return `
          width: 44px;
          height: 44px;
          font-size: ${theme.fonts.size.lg};
        `;
      default:
        return `
          width: 36px;
          height: 36px;
          font-size: ${theme.fonts.size.sm};
        `;
    }
  }}

  /* 상태별 배경색 */
  background: ${({ $isInSchedule, theme }) =>
    $isInSchedule ? theme.colors.success : theme.colors.backgroundLight};
  
  /* 호버 효과 */
  &:hover:not(:disabled) {
    background: ${({ $isInSchedule, theme }) =>
      $isInSchedule ? theme.colors.successHover : theme.colors.backgroundHover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* 포커스 효과 */
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* 비활성화 상태 */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* 로딩 상태 */
  ${({ $isLoading }) =>
    $isLoading &&
    `
    pointer-events: none;
  `}
`;

const ScheduleIcon = styled.span<{ $isInSchedule: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.fast};
  
  /* 상태 변경 시 애니메이션 */
  transform: ${({ $isInSchedule }) => ($isInSchedule ? 'scale(1.1)' : 'scale(1)')};
`;

const LoadingSpinner = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  border: 2px solid ${({ theme }) => theme.colors.borderLight};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          width: 12px;
          height: 12px;
        `;
      case 'large':
        return `
          width: 20px;
          height: 20px;
        `;
      default:
        return `
          width: 16px;
          height: 16px;
        `;
    }
  }};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;