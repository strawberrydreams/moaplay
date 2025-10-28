/**
 * 인증 마크 컴포넌트
 * 
 * 인증된 주최자를 나타내는 배지 컴포넌트입니다.
 * 다양한 크기와 스타일로 사용할 수 있습니다.
 */

import React from 'react';
import styled from 'styled-components';

/**
 * VerifiedBadge 컴포넌트 Props
 */
interface VerifiedBadgeProps {
  /** 배지 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 배지 스타일 */
  variant?: 'default' | 'outline' | 'minimal';
  /** 툴팁 텍스트 */
  title?: string;
  /** 클래스명 */
  className?: string;
}

/**
 * 인증 마크 컴포넌트
 * 
 * 인증된 주최자임을 나타내는 체크 마크 배지를 표시합니다.
 * 접근성을 위해 적절한 aria-label과 title을 제공합니다.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'medium',
  variant = 'default',
  title = '인증된 주최자',
  className
}) => {
  return (
    <BadgeContainer
      $size={size}
      $variant={variant}
      className={className}
      title={title}
      aria-label={title}
      role="img"
    >
      <CheckIcon $size={size}>✓</CheckIcon>
    </BadgeContainer>
  );
};

// 스타일 컴포넌트들
const BadgeContainer = styled.span<{
  $size: 'small' | 'medium' | 'large';
  $variant: 'default' | 'outline' | 'minimal';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  
  /* 크기별 스타일 */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          width: 16px;
          height: 16px;
        `;
      case 'medium':
        return `
          width: 20px;
          height: 20px;
        `;
      case 'large':
        return `
          width: 24px;
          height: 24px;
        `;
      default:
        return `
          width: 20px;
          height: 20px;
        `;
    }
  }}
  
  /* 변형별 스타일 */
  ${({ $variant, theme: _theme }) => {
    switch ($variant) {
      case 'default':
        return `
          background: ${_theme.colors.success};
          color: white;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        `;
      case 'outline':
        return `
          background: white;
          color: ${_theme.colors.success};
          border: 2px solid ${_theme.colors.success};
        `;
      case 'minimal':
        return `
          background: transparent;
          color: ${_theme.colors.success};
          border: none;
        `;
      default:
        return `
          background: ${_theme.colors.success};
          color: white;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        `;
    }
  }}
  
  transition: all ${({ theme: _theme }) => _theme.transitions.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const CheckIcon = styled.span<{ $size: 'small' | 'medium' | 'large' }>`
  font-weight: bold;
  line-height: 1;
  
  /* 크기별 폰트 크기 */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `font-size: 10px;`;
      case 'medium':
        return `font-size: 12px;`;
      case 'large':
        return `font-size: 14px;`;
      default:
        return `font-size: 12px;`;
    }
  }}
`;