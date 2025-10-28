/**
 * 행사 그리드 컴포넌트
 * 
 * 행사 목록을 그리드 형태로 표시하는 컴포넌트입니다.
 * 반응형 디자인을 지원하며, 로딩 상태와 빈 상태를 처리합니다.
 */

import React from 'react';
import { EventListItem } from '../../types/events';
import { EventCard } from './EventCard';
import {
  GridContainer,
  SkeletonCard,
  SkeletonImage,
  SkeletonContent,
  SkeletonTitle,
  SkeletonText,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from '../../styles/components';

/**
 * EventGrid 컴포넌트 Props
 */
interface EventGridProps {
  events: EventListItem[];
  isLoading?: boolean;
  showViewCount?: boolean;
  showFavoriteButton?: boolean;
  showScheduleButton?: boolean;
  isAuthenticated?: boolean;
  scheduleEventIds?: number[];
  onFavoriteToggle?: (eventId: number, isFavorite: boolean) => Promise<void>;
  onScheduleToggle?: (eventId: number) => Promise<boolean>;
  onShowLogin?: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  columns?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  className?: string;
}

/**
 * 행사 그리드 컴포넌트
 * 
 * 행사 목록을 반응형 그리드로 표시합니다.
 * 각 행사는 EventCard 컴포넌트로 렌더링됩니다.
 */
export const EventGrid: React.FC<EventGridProps> = ({
  events,
  isLoading = false,
  showViewCount = true,
  showFavoriteButton = true,
  showScheduleButton = true,
  isAuthenticated = false,
  scheduleEventIds = [],
  onFavoriteToggle,
  onScheduleToggle,
  onShowLogin,
  emptyMessage = "표시할 행사가 없습니다",
  emptyDescription = "다른 조건으로 검색해보세요.",
  columns = {
    desktop: 4,
    tablet: 3,
    mobile: 1
  },
  className
}) => {
  /**
   * 행사 카드 클릭 처리 (현재 EventCard 내부에서 Link로 처리되므로 사용하지 않음)
   */
  // const handleEventClick = (event: EventApiResponse) => {
  //   if (onEventClick) {
  //     onEventClick(event);
  //   }
  // };

  /**
   * 찜하기 토글 처리 (즉시 UI 반영)
   * 
   * 낙관적 업데이트가 FavoriteButton에서 이미 처리되므로
   * 여기서는 부모 컴포넌트에 알림만 전달합니다.
   */
  const handleFavoriteToggle = async (eventId: number, isFavorite: boolean) => {
    if (onFavoriteToggle) {
      await onFavoriteToggle(eventId, isFavorite);
    }
  };

  /**
   * 개인 일정 토글 처리
   */
  const handleScheduleToggle = async (eventId: number): Promise<boolean> => {
    if (onScheduleToggle) {
      return await onScheduleToggle(eventId);
    }
    return false;
  };

  /**
   * 로그인 모달 표시
   */
  const handleShowLogin = () => {
    if (onShowLogin) {
      onShowLogin();
    }
  };

  /**
   * 로딩 상태
   */
  if (isLoading) {
    return (
      <GridContainer $columns={columns} className={className}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index}>
            <SkeletonImage />
            <SkeletonContent>
              <SkeletonTitle />
              <SkeletonText />
              <SkeletonText $width="60%" />
            </SkeletonContent>
          </SkeletonCard>
        ))}
      </GridContainer>
    );
  }

  /**
   * 빈 상태
   */
  if (events.length === 0) {
    return (
      <EmptyStateContainer className={className}>
        <EmptyStateIcon aria-label="행사 없음">🎪</EmptyStateIcon>
        <EmptyStateTitle>{emptyMessage}</EmptyStateTitle>
        <EmptyStateDescription>{emptyDescription}</EmptyStateDescription>
      </EmptyStateContainer>
    );
  }

  /**
   * 행사 목록 렌더링
   */
  return (
    <GridContainer $columns={columns} className={className}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          showViewCount={showViewCount}
          showFavoriteButton={showFavoriteButton}
          showScheduleButton={showScheduleButton}
          isAuthenticated={isAuthenticated}
          isInSchedule={scheduleEventIds.includes(event.id)}
          onFavoriteToggle={handleFavoriteToggle}
          onScheduleToggle={handleScheduleToggle}
          onShowLogin={handleShowLogin}
        />
      ))}
    </GridContainer>
  );
};

