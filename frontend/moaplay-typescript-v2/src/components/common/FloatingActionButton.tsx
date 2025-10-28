/**
 * Floating Action Button (FAB) 컴포넌트
 * 
 * 모바일 환경에서 우측 하단에 고정되는 플로팅 액션 버튼입니다.
 * 주로 주요 액션(행사 작성 등)에 사용됩니다.
 */

import React from 'react';
import styled from 'styled-components';

/**
 * FloatingActionButton Props 타입
 */
interface FloatingActionButtonProps {
  /** 버튼 클릭 핸들러 */
  onClick: () => void;
  /** 버튼 내부 텍스트 또는 아이콘 */
  children: React.ReactNode;
  /** 접근성을 위한 aria-label */
  ariaLabel: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * Floating Action Button 컴포넌트
 * 
 * 모바일 화면에서만 표시되며, 우측 하단에 고정됩니다.
 * 스크롤 시에도 항상 같은 위치에 유지됩니다.
 * 
 * @example
 * ```tsx
 * <FloatingActionButton
 *   onClick={() => navigate('/events/new')}
 *   ariaLabel="새 행사 작성"
 * >
 *   + 새 행사
 * </FloatingActionButton>
 * ```
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  children,
  ariaLabel,
  className,
}) => {
  return (
    <FABContainer
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      type="button"
    >
      {children}
    </FABContainer>
  );
};

/**
 * FAB 컨테이너 스타일
 * 
 * - 모바일에서만 표시 (768px 이하)
 * - 우측 하단 고정 위치
 * - 원형 버튼 스타일
 * - 그림자 효과로 부각
 * - 호버 시 확대 효과
 */
const FABContainer = styled.button`
  /* 데스크톱에서는 숨김 */
  display: none;
  
  /* 모바일에서만 표시 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* 고정 위치 */
    position: fixed;
    bottom: ${({ theme }) => theme.spacing.xl};
    right: ${({ theme }) => theme.spacing.lg};
    
    /* 버튼 스타일 */
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.full};
    
    /* 크기 */
    min-width: 56px;
    min-height: 56px;
    padding: ${({ theme }) => theme.spacing.md};
    
    /* 폰트 */
    font-size: ${({ theme }) => theme.fonts.size.md};
    font-weight: ${({ theme }) => theme.fonts.weight.semibold};
    font-family: ${({ theme }) => theme.fonts.primary};
    white-space: nowrap;
    
    /* 그림자 효과 */
    box-shadow: ${({ theme }) => theme.shadows.lg};
    
    /* 레이어 순서 */
    z-index: ${({ theme }) => theme.zIndex.fixed};
    
    /* 커서 */
    cursor: pointer;
    
    /* 트랜지션 */
    transition: all ${({ theme }) => theme.transitions.normal};
    
    /* 호버 효과 */
    &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
      transform: scale(1.05);
      box-shadow: ${({ theme }) => theme.shadows.xl};
    }
    
    /* 활성화 효과 */
    &:active {
      transform: scale(0.95);
    }
    
    /* 포커스 효과 (접근성) */
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary};
      outline-offset: 2px;
    }
    
    /* 비활성화 상태 */
    &:disabled {
      background: ${({ theme }) => theme.colors.backgroundDisabled};
      color: ${({ theme }) => theme.colors.textDisabled};
      cursor: not-allowed;
      transform: none;
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  }
`;
