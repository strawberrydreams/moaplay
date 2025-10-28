/**
 * EventGrid 컴포넌트 스타일
 * 
 * 행사 그리드 레이아웃과 관련된 모든 스타일을 정의합니다.
 * 반응형 그리드, 로딩 상태, 빈 상태 스타일을 포함합니다.
 */

import styled, { keyframes } from 'styled-components';

/**
 * 그리드 컬럼 설정 타입
 */
interface GridColumns {
  desktop: number;
  tablet: number;
  mobile: number;
}

/**
 * 메인 그리드 컨테이너
 */
export const GridContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $columns: GridColumns }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  
  /* 데스크톱 그리드 */
  grid-template-columns: repeat(${({ $columns }) => $columns.desktop}, 1fr);
  
  /* 태블릿 그리드 */
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(${({ $columns }) => $columns.tablet}, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  }
  
  /* 모바일 그리드 */
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(${({ $columns }) => $columns.mobile}, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
  }

  /* 작은 모바일 화면 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 펄스 애니메이션 (로딩용)
 */
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

/**
 * 로딩 스켈레톤 카드
 */
export const SkeletonCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  overflow: hidden;
  animation: ${pulse} 1.5s ease-in-out infinite;

  /* 모션 감소 모드에서 애니메이션 비활성화 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.8;
  }
`;

/**
 * 스켈레톤 이미지
 */
export const SkeletonImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundLight} 0%,
    ${({ theme }) => theme.colors.borderLight} 50%,
    ${({ theme }) => theme.colors.backgroundLight} 100%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 180px;
  }
`;

/**
 * 스켈레톤 콘텐츠
 */
export const SkeletonContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

/**
 * 스켈레톤 제목
 */
export const SkeletonTitle = styled.div`
  height: 20px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundLight} 0%,
    ${({ theme }) => theme.colors.borderLight} 50%,
    ${({ theme }) => theme.colors.backgroundLight} 100%
  );
  background-size: 200px 100%;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  animation: shimmer 1.5s ease-in-out infinite;
  animation-delay: 0.1s;

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 16px;
  }
`;

/**
 * 스켈레톤 텍스트
 */
export const SkeletonText = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $width?: string }>`
  height: 14px;
  width: ${({ $width = '100%' }) => $width};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.backgroundLight} 0%,
    ${({ theme }) => theme.colors.borderLight} 50%,
    ${({ theme }) => theme.colors.backgroundLight} 100%
  );
  background-size: 200px 100%;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  animation: shimmer 1.5s ease-in-out infinite;
  animation-delay: 0.2s;

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 12px;
  }
`;

/**
 * 빈 상태 컨테이너
 */
export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  min-height: 400px;
  grid-column: 1 / -1; /* 전체 그리드 컬럼 차지 */

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.md};
    min-height: 300px;
  }
`;

/**
 * 빈 상태 아이콘
 */
export const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  opacity: 0.6;
  
  /* 접근성을 위한 대체 텍스트 */
  &::after {
    content: attr(aria-label);
    position: absolute;
    left: -9999px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

/**
 * 빈 상태 제목
 */
export const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  margin-top: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.lg};
  }
`;

/**
 * 빈 상태 설명
 */
export const EmptyStateDescription = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.fonts.lineHeight.relaxed};
  max-width: 400px;
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.sm};
    max-width: 300px;
  }
`;

/**
 * 빈 상태 액션 버튼
 */
export const EmptyStateAction = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 컴팩트 그리드 변형
 */
export const CompactGridContainer = styled(GridContainer)`
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 리스트 형태 그리드 변형
 */
export const ListGridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

/**
 * 마소니 그리드 (Pinterest 스타일)
 */
export const MasonryGridContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<{ $columns: GridColumns }>`
  column-count: ${({ $columns }) => $columns.desktop};
  column-gap: ${({ theme }) => theme.spacing.lg};
  
  > * {
    break-inside: avoid;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    column-count: ${({ $columns }) => $columns.tablet};
    column-gap: ${({ theme }) => theme.spacing.md};
    
    > * {
      margin-bottom: ${({ theme }) => theme.spacing.md};
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    column-count: ${({ $columns }) => $columns.mobile};
    column-gap: ${({ theme }) => theme.spacing.sm};
    
    > * {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }
  }
`;

/**
 * 그리드 헤더
 */
export const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  grid-column: 1 / -1;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

/**
 * 그리드 제목
 */
export const GridTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size['2xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fonts.size.xl};
  }
`;

/**
 * 그리드 메타 정보
 */
export const GridMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

/**
 * 아이템 카운트
 */
export const ItemCount = styled.span`
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

/**
 * 로딩 오버레이
 */
export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
`;

/**
 * 에러 상태 컨테이너
 */
export const ErrorStateContainer = styled(EmptyStateContainer)`
  color: ${({ theme }) => theme.colors.danger};
  
  ${EmptyStateIcon} {
    color: ${({ theme }) => theme.colors.danger};
  }
  
  ${EmptyStateTitle} {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

/**
 * 무한 스크롤 로딩 인디케이터
 */
export const InfiniteScrollLoader = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

/**
 * 그리드 필터 바
 */
export const GridFilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  grid-column: 1 / -1;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

/**
 * 반응형 그리드 (자동 크기 조정)
 */
export const ResponsiveGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;