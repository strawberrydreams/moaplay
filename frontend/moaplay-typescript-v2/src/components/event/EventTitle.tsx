/**
 * 행사 제목 컴포넌트
 * 
 * 행사 제목과 주최자 인증 마크를 함께 표시하는 컴포넌트입니다.
 * 다양한 크기와 스타일로 사용할 수 있습니다.
 */

import React from 'react';
import styled from 'styled-components';
import { EventHost } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';

/**
 * EventTitle 컴포넌트 Props
 */
interface EventTitleProps {
  /** 행사 제목 */
  title: string;
  /** 행사 주최자 정보 */
  host: EventHost;
  /** 제목 크기 */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** 제목 스타일 */
  variant?: 'default' | 'card' | 'detail';
  /** 인증 마크 표시 여부 */
  showVerifiedBadge?: boolean;
  /** 클릭 가능 여부 */
  clickable?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 클래스명 */
  className?: string;
}

/**
 * 행사 제목 컴포넌트
 * 
 * 행사 제목을 표시하고, 주최자가 인증된 경우 인증 마크를 함께 표시합니다.
 * 다양한 컨텍스트에서 사용할 수 있도록 크기와 스타일을 조정할 수 있습니다.
 */
export const EventTitle: React.FC<EventTitleProps> = ({
  title,
  host,
  size = 'medium',
  variant = 'default',
  showVerifiedBadge = true,
  clickable = false,
  onClick,
  className
}) => {
  /**
   * 제목 클릭 처리
   */
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  /**
   * 주최자가 인증되었는지 확인
   */
  const isVerified = host.role === 'host';

  return (
    <TitleContainer
      $size={size}
      $variant={variant}
      $clickable={clickable}
      className={className}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <TitleText $size={size} $variant={variant}>
        {title}
      </TitleText>
      
      {showVerifiedBadge && isVerified && (
        <BadgeWrapper>
          <VerifiedBadge
            size={size === 'small' ? 'small' : size === 'large' || size === 'xlarge' ? 'large' : 'medium'}
            variant="default"
            title={`${host.nickname}은(는) 인증된 주최자입니다`}
          />
        </BadgeWrapper>
      )}
    </TitleContainer>
  );
};

// 스타일 컴포넌트들
const TitleContainer = styled.div<{
  $size: 'small' | 'medium' | 'large' | 'xlarge';
  $variant: 'default' | 'card' | 'detail';
  $clickable: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  ${({ $clickable, theme }) => $clickable && `
    cursor: pointer;
    transition: all ${theme.transitions.fast};
    
    &:hover {
      color: ${theme.colors.primary};
    }
    
    &:focus {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
      border-radius: ${theme.borderRadius.sm};
    }
  `}
  
  /* 변형별 스타일 */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'card':
        return `
          margin-bottom: ${theme.spacing.xs};
        `;
      case 'detail':
        return `
          margin-bottom: ${theme.spacing.md};
          padding-bottom: ${theme.spacing.sm};
          border-bottom: 1px solid ${theme.colors.border};
        `;
      default:
        return '';
    }
  }}
`;

const TitleText = styled.h1<{
  $size: 'small' | 'medium' | 'large' | 'xlarge';
  $variant: 'default' | 'card' | 'detail';
}>`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  line-height: ${({ theme }) => theme.fonts.lineHeight.tight};
  word-break: break-word;
  
  /* 크기별 폰트 크기 */
  ${({ $size, theme }) => {
    switch ($size) {
      case 'small':
        return `font-size: ${theme.fonts.size.md};`;
      case 'medium':
        return `font-size: ${theme.fonts.size.lg};`;
      case 'large':
        return `font-size: ${theme.fonts.size.xl};`;
      case 'xlarge':
        return `font-size: ${theme.fonts.size['2xl']};`;
      default:
        return `font-size: ${theme.fonts.size.lg};`;
    }
  }}
  
  /* 변형별 추가 스타일 */
  ${({ $variant, $size, theme }) => {
    if ($variant === 'detail') {
      return `
        font-weight: ${theme.fonts.weight.bold};
        ${$size === 'xlarge' ? `font-size: ${theme.fonts.size['3xl']};` : ''}
      `;
    }
    return '';
  }}
`;

const BadgeWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export default EventTitle;