/**
 * EventCard 컴포넌트 스타일
 * 
 * 행사 카드의 모든 스타일을 정의합니다.
 * 반응형 디자인, 접근성, 성능 최적화를 고려한 스타일링을 포함합니다.
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * 카드 컨테이너
 */
export const CardContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    border: 2px solid ${({ theme }) => theme.colors.border};
  }

  /* 모션 감소 모드 지원 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }

  /* 터치 디바이스에서 호버 효과 제거 */
  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  }
`;

/**
 * 카드 링크
 */
export const CardLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})`
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  
  &:focus {
    outline: none;
  }
`;

/**
 * 이미지 컨테이너
 */
export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 180px;
  }
`;

/**
 * 액션 버튼 컨테이너
 */
export const ActionButtons = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  z-index: 2;

  /* 버튼들이 이미지 위에서 잘 보이도록 배경 추가 */
  > * {
    backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    top: ${({ theme }) => theme.spacing.xs};
    right: ${({ theme }) => theme.spacing.xs};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

/**
 * 상태 배지
 */
export const StatusBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $status: string }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'pending': return theme.colors.warning;
      case 'modified': return theme.colors.info;
      case 'rejected': return theme.colors.danger;
      default: return theme.colors.secondary;
    }
  }};
  color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  z-index: 2;
  backdrop-filter: blur(4px);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    top: ${({ theme }) => theme.spacing.xs};
    left: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.fonts.size.xs};
    padding: ${({ theme }) => theme.spacing.xs};
  }
`;

/**
 * 콘텐츠 컨테이너
 */
export const ContentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

/**
 * 행사 요약
 */
export const EventSummary = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: ${({ theme }) => theme.fonts.lineHeight.normal};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    -webkit-line-clamp: 1;
  }
`;

/**
 * 행사 날짜
 */
export const EventDate = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &::before {
    content: '📅';
    font-size: ${({ theme }) => theme.fonts.size.sm};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 행사 위치
 */
export const EventLocation = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: '📍';
    font-size: ${({ theme }) => theme.fonts.size.sm};
    flex-shrink: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 태그 컨테이너
 */
export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

/**
 * 개별 태그
 */
export const Tag = styled.span`
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 2px ${({ theme }) => theme.spacing.xs};
    font-size: 10px;
  }
`;

/**
 * 더 많은 태그 표시
 */
export const MoreTags = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 10px;
  }
`;

/**
 * 조회수 표시
 */
export const ViewCount = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};

  &::before {
    content: '👁';
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 10px;
  }
`;

/**
 * 카드 푸터 (조회수, 좋아요 등)
 */
export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin-top: auto;
`;

/**
 * 카드 메타 정보
 */
export const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 컴팩트 카드 변형
 */
export const CompactCardContainer = styled(CardContainer)`
  ${ImageContainer} {
    height: 150px;
  }

  ${ContentContainer} {
    padding: ${({ theme }) => theme.spacing.sm};
  }

  ${EventSummary} {
    -webkit-line-clamp: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    ${ImageContainer} {
      height: 120px;
    }
  }
`;

/**
 * 리스트 형태 카드 변형
 */
export const ListCardContainer = styled(CardContainer)`
  flex-direction: row;
  height: auto;
  max-height: 200px;

  ${ImageContainer} {
    width: 300px;
    height: auto;
    flex-shrink: 0;
  }

  ${ContentContainer} {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    max-height: none;

    ${ImageContainer} {
      width: 100%;
      height: 200px;
    }
  }
`;

/**
 * 피처드 카드 변형 (큰 카드)
 */
export const FeaturedCardContainer = styled(CardContainer)`
  ${ImageContainer} {
    height: 300px;
  }

  ${ContentContainer} {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${EventSummary} {
    font-size: ${({ theme }) => theme.fonts.size.md};
    -webkit-line-clamp: 3;
  }

  ${EventDate}, ${EventLocation} {
    font-size: ${({ theme }) => theme.fonts.size.md};
  }

  ${Tag} {
    font-size: ${({ theme }) => theme.fonts.size.sm};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    ${ImageContainer} {
      height: 250px;
    }

    ${ContentContainer} {
      padding: ${({ theme }) => theme.spacing.md};
    }
  }
`;

/**
 * 로딩 상태 카드
 */
export const LoadingCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

/**
 * 에러 상태 카드
 */
export const ErrorCard = styled(CardContainer)`
  border: 2px dashed ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.dangerLight};
  
  ${ContentContainer} {
    text-align: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.danger};
  }
`;

/**
 * 빈 상태 카드
 */
export const EmptyCard = styled(CardContainer)`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundLight};
  
  ${ContentContainer} {
    text-align: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;