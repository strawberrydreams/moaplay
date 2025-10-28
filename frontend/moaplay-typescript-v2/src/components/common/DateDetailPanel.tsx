/**
 * 날짜 상세 정보 패널 컴포넌트
 *
 * 캘린더에서 선택된 날짜의 상세 정보를 표시합니다.
 * 로그인 상태에 따라 개인 일정 요약 또는 로그인 유도 패널을 표시합니다.
 * 행사 클릭 시 상세 정보를 표시합니다.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ScheduleListItem } from '../../types/schedules';
import { EventDetailResponse } from '../../types/events';
import { formatDate } from '../../utils/date';
import { FavoriteButton } from '../common';

/**
 * DateDetailPanel 컴포넌트 Props
 */
interface DateDetailPanelProps {
  selectedDate: Date | null;
  isAuthenticated: boolean;
  personalSchedules?: ScheduleListItem[];
  selectedEvent?: EventDetailResponse | null;
  isEventLoading?: boolean;
  onLoginClick?: () => void;
  onAddSchedule?: () => void;
  onRemoveSchedule?: (scheduleId: number) => void;
  onViewEventDetail?: (eventId: number) => void;
  onFavoriteToggle?: (eventId: number) => Promise<void>;
  onCloseEvent?: () => void;
  className?: string;
}

/**
 * 날짜 상세 정보 패널 컴포넌트
 *
 * 선택된 날짜의 개인 일정을 표시하거나 로그인을 유도합니다.
 * 로그인한 사용자에게는 해당 날짜의 개인 일정 목록을 보여줍니다.
 * 행사 클릭 시 상세 정보를 표시합니다.
 */
export const DateDetailPanel: React.FC<DateDetailPanelProps> = ({
  selectedDate,
  isAuthenticated,
  personalSchedules = [],
  selectedEvent,
  isEventLoading = false,
  onLoginClick,
  onAddSchedule,
  onRemoveSchedule,
  onViewEventDetail,
  onFavoriteToggle,
  onCloseEvent,
  className,
}) => {
  /**
   * 행사 상세 정보가 선택된 경우
   */
  if (selectedEvent) {
    return (
      <PanelContainer className={className}>
        <EventDetailView
          event={selectedEvent}
          isLoading={isEventLoading}
          isAuthenticated={isAuthenticated}
          onClose={onCloseEvent}
          onFavoriteToggle={onFavoriteToggle}
        />
      </PanelContainer>
    );
  }

  /**
   * 선택된 날짜가 없는 경우
   */
  if (!selectedDate) {
    return (
      <PanelContainer className={className}>
        <EmptyState>
          <EmptyIcon>📅</EmptyIcon>
          <EmptyTitle>날짜를 선택해주세요</EmptyTitle>
          <EmptyDescription>
            캘린더에서 날짜를 클릭하면 해당 날짜의 일정을 확인할 수 있습니다.
          </EmptyDescription>
        </EmptyState>
      </PanelContainer>
    );
  }

  /**
   * 로그인하지 않은 사용자
   */
  if (!isAuthenticated) {
    return (
      <PanelContainer className={className}>
        <LoginPromptPanel
          onLoginClick={onLoginClick}
          selectedDate={selectedDate}
        />
      </PanelContainer>
    );
  }

  /**
   * 로그인한 사용자
   */
  return (
    <PanelContainer className={className}>
      <PersonalScheduleSummary
        selectedDate={selectedDate}
        schedules={personalSchedules}
        onAddSchedule={onAddSchedule}
        onRemoveSchedule={onRemoveSchedule}
        onViewEventDetail={onViewEventDetail}
      />
    </PanelContainer>
  );
};

/**
 * 행사 상세 정보 뷰 컴포넌트
 */
interface EventDetailViewProps {
  event: EventDetailResponse;
  isLoading: boolean;
  isAuthenticated: boolean;
  onClose?: () => void;
  onFavoriteToggle?: (eventId: number) => Promise<void>;
}

/**
 * 날짜 포맷팅 함수
 */
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const endStr = end.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (startStr === endStr) {
    return startStr;
  }

  return `${startStr} ~ ${endStr}`;
};

const EventDetailView: React.FC<EventDetailViewProps> = ({
  event,
  isLoading,
  isAuthenticated,
  onClose,
  onFavoriteToggle,
}) => {
  const navigate = useNavigate();

  /**
   * "자세히 보기" 버튼 클릭 핸들러
   */
  const handleDetailClick = () => {
    if (event) {
      navigate(`/events/${event.id}`);
      onClose?.();
    }
  };

  /**
   * 찜하기 토글 핸들러
   */
  const handleFavoriteToggle = async (eventId: number) => {
    if (onFavoriteToggle) {
      await onFavoriteToggle(eventId);
    }
  };

  if (isLoading) {
    return (
      <EventDetailContainer>
        <LoadingSpinner>
          <div>로딩 중...</div>
        </LoadingSpinner>
      </EventDetailContainer>
    );
  }

  return (
    <EventDetailContainer>
      {/* 헤더 */}
      <EventDetailHeader>
        <EventDetailTitle>행사 정보</EventDetailTitle>
        {onClose && (
          <CloseButton onClick={onClose} aria-label="닫기" type="button">
            ✕
          </CloseButton>
        )}
      </EventDetailHeader>

      {/* 컨텐츠 */}
      <EventDetailContent>
        {/* 이미지 */}
        {event.image_urls && event.image_urls.length > 0 && (
          <EventImage
            src={event.image_urls[0]}
            alt={event.title}
            loading="lazy"
          />
        )}

        {/* 제목 */}
        <EventTitle>{event.title}</EventTitle>

        {/* 한 줄 소개 */}
        {event.summary && (
          <InfoSection>
            <InfoValue>{event.summary}</InfoValue>
          </InfoSection>
        )}

        {/* 날짜 */}
        <InfoSection>
          <InfoLabel>📅 일정</InfoLabel>
          <InfoValue>
            {formatDateRange(event.start_date, event.end_date)}
          </InfoValue>
        </InfoSection>

        {/* 장소 */}
        {event.location && (
          <InfoSection>
            <InfoLabel>📍 장소</InfoLabel>
            <InfoValue>{event.location}</InfoValue>
          </InfoSection>
        )}

        {/* 주최자 */}
        {event.host && (
          <InfoSection>
            <InfoLabel>👤 주최자</InfoLabel>
            <InfoValue>{event.host.nickname}</InfoValue>
          </InfoSection>
        )}

        {/* 태그 */}
        {event.tags && event.tags.length > 0 && (
          <InfoSection>
            <InfoLabel>🏷️ 태그</InfoLabel>
            <TagContainer>
              {event.tags.map((tag, index) => (
                <Tag key={index}>#{tag}</Tag>
              ))}
            </TagContainer>
          </InfoSection>
        )}

        {/* 통계 */}
        {event.stats && (
          <InfoSection>
            <InfoLabel>📊 통계</InfoLabel>
            <InfoValue>
              조회수: {event.stats.view_count.toLocaleString()}
              {event.stats.favorites_count !== undefined && (
                <> · 찜: {event.stats.favorites_count.toLocaleString()}</>
              )}
            </InfoValue>
          </InfoSection>
        )}

        {/* 액션 버튼 */}
        <ActionButtons>
          {isAuthenticated && onFavoriteToggle && (
            <FavoriteButton
              eventId={event.id}
              initialFavoriteState={false}
              onToggle={handleFavoriteToggle}
            />
          )}
          <DetailButton onClick={handleDetailClick}>자세히 보기</DetailButton>
        </ActionButtons>
      </EventDetailContent>
    </EventDetailContainer>
  );
};

/**
 * 개인 일정 요약 컴포넌트
 */
interface PersonalScheduleSummaryProps {
  selectedDate: Date;
  schedules: ScheduleListItem[];
  onAddSchedule?: () => void;
  onRemoveSchedule?: (scheduleId: number) => void;
  onViewEventDetail?: (eventId: number) => void;
}

const PersonalScheduleSummary: React.FC<PersonalScheduleSummaryProps> = ({
  selectedDate,
  schedules,
  onAddSchedule,
  onRemoveSchedule,
  onViewEventDetail,
}) => {
  const navigate = useNavigate();
  const formattedDate = formatDate(selectedDate);
  const hasSchedules = schedules.length > 0;

  /**
   * 날짜 범위를 포맷팅합니다
   */
  const formatScheduleDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = start.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });

    const endStr = end.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });

    if (startStr === endStr) {
      return startStr;
    }

    return `${startStr} ~ ${endStr}`;
  };

  return (
    <SummaryContainer>
      <SummaryHeader>
        <SummaryDate>{formattedDate}</SummaryDate>
        <ScheduleCount>
          {hasSchedules ? `${schedules.length}개의 일정` : '일정 없음'}
        </ScheduleCount>
      </SummaryHeader>

      {hasSchedules ? (
        <ScheduleList>
          {schedules.map(schedule => (
            <ScheduleItem key={schedule.id}>
              <ScheduleContent>
                <ScheduleEventTitle>{schedule.event.title}</ScheduleEventTitle>
                <EventTime>
                  📅 {formatScheduleDateRange(schedule.event.start_date, schedule.event.end_date)}
                </EventTime>
                {schedule.event.location && (
                  <EventLocation>📍 {schedule.event.location}</EventLocation>
                )}
                {schedule.event.summary && (
                  <EventSummary>{schedule.event.summary}</EventSummary>
                )}
                
                {/* 행사별 액션 버튼 */}
                <ScheduleItemActions>
                  <ViewDetailButton
                    onClick={() => {
                      if (onViewEventDetail) {
                        onViewEventDetail(schedule.event.id);
                      } else {
                        navigate(`/events/${schedule.event.id}`);
                      }
                    }}
                    title="행사 상세 보기"
                  >
                    상세 보기
                  </ViewDetailButton>
                  <RemoveScheduleButtonInline
                    onClick={() => onRemoveSchedule?.(schedule.id)}
                    title="일정에서 제거"
                    aria-label={`${schedule.event.title} 일정 제거`}
                  >
                    일정 삭제
                  </RemoveScheduleButtonInline>
                </ScheduleItemActions>
              </ScheduleContent>
            </ScheduleItem>
          ))}
        </ScheduleList>
      ) : (
        <EmptySchedule>
          <EmptyScheduleIcon>📝</EmptyScheduleIcon>
          <EmptyScheduleText>
            이 날짜에는 등록된 일정이 없습니다.
          </EmptyScheduleText>
        </EmptySchedule>
      )}

      {!hasSchedules && (
        <ActionButtons>
          <AddScheduleButton onClick={onAddSchedule}>일정 추가</AddScheduleButton>
        </ActionButtons>
      )}
    </SummaryContainer>
  );
};

/**
 * 로그인 유도 패널 컴포넌트
 */
interface LoginPromptPanelProps {
  selectedDate: Date;
  onLoginClick?: () => void;
}

const LoginPromptPanel: React.FC<LoginPromptPanelProps> = ({
  selectedDate,
  onLoginClick,
}) => {
  const formattedDate = formatDate(selectedDate);

  return (
    <LoginPromptContainer>
      <LoginPromptHeader>
        <LoginPromptDate>{formattedDate}</LoginPromptDate>
      </LoginPromptHeader>

      <LoginPromptContent>
        <LoginPromptIcon>🔐</LoginPromptIcon>
        <LoginPromptTitle>로그인하고 일정을 관리하세요</LoginPromptTitle>
        <LoginPromptDescription>
          로그인하면 개인 일정을 추가하고 관리할 수 있습니다. 찜한 행사도
          캘린더에서 확인할 수 있어요!
        </LoginPromptDescription>

        <LoginPromptFeatures>
          <FeatureItem>✅ 개인 일정 관리</FeatureItem>
          <FeatureItem>✅ 찜한 행사 확인</FeatureItem>
          <FeatureItem>✅ 맞춤형 추천</FeatureItem>
        </LoginPromptFeatures>

        <LoginButton onClick={onLoginClick}>로그인하기</LoginButton>
      </LoginPromptContent>
    </LoginPromptContainer>
  );
};

// 스타일 컴포넌트들
const PanelContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  height: fit-content;
  min-height: 300px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const EmptyDescription = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  line-height: ${({ theme }) => theme.fonts.lineHeight.relaxed};
  max-width: 250px;
`;

// 개인 일정 요약 스타일
const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SummaryHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const SummaryDate = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ScheduleCount = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
`;

const ScheduleItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const ScheduleContent = styled.div`
  flex: 1;
`;

const ScheduleItemActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ViewDetailButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const RemoveScheduleButtonInline = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: white;
  color: ${({ theme }) => theme.colors.danger};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.danger};
    outline-offset: 2px;
  }
`;

const ScheduleEventTitle = styled.h4`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1.3;
`;

const EventTime = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const EventLocation = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EventSummary = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptySchedule = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const EmptyScheduleIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const EmptyScheduleText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.fonts.lineHeight.relaxed};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const AddScheduleButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

// 로그인 유도 패널 스타일
const LoginPromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoginPromptHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoginPromptDate = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const LoginPromptContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoginPromptIcon = styled.div`
  font-size: 2.5rem;
`;

const LoginPromptTitle = styled.h4`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const LoginPromptDescription = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.fonts.lineHeight.relaxed};
`;

const LoginPromptFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: flex-start;
`;

const FeatureItem = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};
  min-width: 120px;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

// 행사 상세 정보 스타일
const EventDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EventDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const EventDetailTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fonts.size.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const EventDetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-height: 500px;
  overflow-y: auto;
`;

const EventImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const EventTitle = styled.h4`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InfoLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const InfoValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: ${({ theme }) => theme.fonts.lineHeight.relaxed};
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tag = styled.span`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
