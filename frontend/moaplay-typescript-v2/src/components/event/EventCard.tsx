/**
 * 행사 카드 컴포넌트
 *
 * 행사 정보를 카드 형태로 표시하며, 찜하기 버튼과 조회수를 포함합니다.
 * 성능 최적화를 위해 React.memo, useMemo, useCallback을 적용했습니다.
 */

import React, { useMemo, useCallback } from 'react';
import { EventListItem } from '../../types/events';
import { formatDateRange } from '../../utils/date';
import { getImageUrl } from '../../utils/image';
import { ScheduleToggleButton } from './ScheduleToggleButton';
import { FavoriteButton } from '../common';
import { EventTitle } from './EventTitle';
import { OptimizedImage } from '../common/OptimizedImage';
import {
  CardContainer,
  CardLink,
  ImageContainer,
  ActionButtons,
  StatusBadge,
  ContentContainer,
  EventSummary,
  EventDate,
  EventLocation,
  TagContainer,
  Tag,
  MoreTags,
  ViewCount,
} from '../../styles/components';

/**
 * EventCard 컴포넌트 Props
 */
export interface EventCardProps {
  event: EventListItem;
  showViewCount?: boolean;
  showFavoriteButton?: boolean;
  showScheduleButton?: boolean;
  isAuthenticated?: boolean;
  isInSchedule?: boolean;
  onFavoriteToggle?: (eventId: number, isFavorite: boolean) => void;
  onScheduleToggle?: (eventId: number) => Promise<boolean>;
  onShowLogin?: () => void;
  className?: string;
}

/**
 * 행사 카드 컴포넌트
 *
 * 행사 정보를 카드 형태로 표시하며, 찜하기 버튼과 조회수를 포함합니다.
 * 카드 클릭 시 행사 상세 페이지로 이동합니다.
 *
 * 성능 최적화 적용:
 * - React.memo로 불필요한 리렌더링 방지
 * - useMemo로 계산 결과 메모이제이션
 * - useCallback으로 함수 참조 안정화
 * - OptimizedImage로 이미지 지연 로딩
 */
const EventCardComponent: React.FC<EventCardProps> = ({
  event,
  showViewCount = true,
  showFavoriteButton = true,
  showScheduleButton = true,
  isAuthenticated = false,
  isInSchedule = false,
  onFavoriteToggle,
  onScheduleToggle,
  onShowLogin,
  className,
}) => {
  /**
   * 찜하기 토글 처리 (useCallback으로 최적화)
   */
  const handleFavoriteToggle = useCallback(
    (eventId: number, isFavorite: boolean) => {
      onFavoriteToggle?.(eventId, isFavorite);
    },
    [onFavoriteToggle]
  );

  /**
   * 날짜 포맷팅 (useMemo로 최적화)
   */
  const formattedDate = useMemo(
    () => formatDateRange(event.start_date, event.start_date),
    [event.start_date]
  );

  /**
   * 대표 이미지 URL (useMemo로 최적화)
   */
  const imageUrl = useMemo(
    () =>
      event.image_urls && event.image_urls.length > 0
        ? getImageUrl(event.image_urls[0])
        : '/placeholder-event.jpg',
    [event.image_urls]
  );

  /**
   * 상태 배지 텍스트 (useMemo로 최적화)
   */
  const statusBadgeText = useMemo(() => {
    switch (event.status) {
      case 'pending':
        return '승인 대기';
      case 'rejected':
        return '거절됨';
      default:
        return '';
    }
  }, [event.status]);

  /**
   * 표시할 태그 목록 (useMemo로 최적화)
   */
  const displayTags = useMemo(() => {
    if (!event.tags || event.tags.length === 0) return null;

    return {
      visible: event.tags.slice(0, 3),
      remaining: Math.max(0, event.tags.length - 3),
    };
  }, [event.tags]);

  /**
   * 포맷된 조회수 (useMemo로 최적화)
   * 서버 값과 정확히 일치하도록 숫자 포맷팅 적용 (1,234 형식)
   */
  const formattedViewCount = useMemo(
    () => event.stats.view_count.toLocaleString('ko-KR'),
    [event.stats.view_count]
  );

  return (
    <CardContainer className={className}>
      <CardLink to={`/events/${event.id}`}>
        <ImageContainer>
          {/* 최적화된 이미지 컴포넌트 사용 (지연 로딩 적용) */}
          <OptimizedImage
            src={imageUrl}
            alt={event.title}
            width="100%"
            height="200px"
            lazy={true}
            quality={80}
            placeholder="이미지 로딩 중..."
            fallback="이미지를 불러올 수 없습니다"
          />

          {/* 액션 버튼들 */}
          <ActionButtons>
            {/* 찜하기 버튼 */}
            {showFavoriteButton && (
              <FavoriteButton
                eventId={event.id}
                initialFavoriteState={false}
                size="medium"
                variant="default"
                onToggle={handleFavoriteToggle}
                onLoginRequired={onShowLogin}
              />
            )}

            {/* 개인 일정 토글 버튼 */}
            {showScheduleButton && onScheduleToggle && onShowLogin && (
              <ScheduleToggleButton
                eventId={event.id}
                isInSchedule={isInSchedule}
                isAuthenticated={isAuthenticated}
                onToggle={onScheduleToggle}
                onShowLogin={onShowLogin}
                size="medium"
              />
            )}
          </ActionButtons>

          {/* 행사 상태 배지 */}
          {event.status !== 'approved' && statusBadgeText && (
            <StatusBadge $status={event.status}>{statusBadgeText}</StatusBadge>
          )}
        </ImageContainer>

        <ContentContainer>
          <EventTitle
            title={event.title}
            host={{ ...event.host, role: 'user' }}
            size="medium"
            variant="card"
            showVerifiedBadge={true}
          />

          {event.summary && <EventSummary>{event.summary}</EventSummary>}

          <EventDate>{formattedDate}</EventDate>

          {event.location && <EventLocation>{event.location}</EventLocation>}

          {/* 태그 목록 (최적화된 렌더링) */}
          {displayTags && (
            <TagContainer>
              {displayTags.visible.map((tag, index) => (
                <Tag key={`${event.id}-tag-${index}`}>#{tag}</Tag>
              ))}
              {displayTags.remaining > 0 && (
                <MoreTags>+{displayTags.remaining}</MoreTags>
              )}
            </TagContainer>
          )}

          {/* 조회수 표시 */}
          {showViewCount && <ViewCount>{formattedViewCount}</ViewCount>}
        </ContentContainer>
      </CardLink>
    </CardContainer>
  );
};

/**
 * React.memo로 감싸서 props가 변경되지 않으면 리렌더링을 방지
 * 얕은 비교로 충분하므로 커스텀 비교 함수는 사용하지 않음
 */
export const EventCard = React.memo(EventCardComponent);
