/**
 * FullCalendar 래퍼 컴포넌트
 * 
 * FullCalendar 라이브러리를 사용하여 캘린더 UI를 제공합니다.
 * 월/주/일 뷰 전환, 이벤트 표시, 상호작용 등의 기능을 포함합니다.
 * 
 * 성능 최적화 적용:
 * - React.memo로 불필요한 리렌더링 방지
 * - useMemo로 계산 결과 메모이제이션
 * - useCallback으로 함수 참조 안정화
 * - 이벤트 렌더링 최적화
 */

import React, { useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { 
  EventClickArg, 
  DateSelectArg, 
  DatesSetArg,
  EventContentArg,
  EventMountArg
} from '@fullcalendar/core';
import styled from 'styled-components';
import { CalendarEvent } from '../../types';
import { CalendarView } from '../../hooks/useCalendar';
import { useCalendarRefresh } from '../../contexts/calendarContextUtils';

/**
 * FullCalendar 컴포넌트 Props
 */
interface FullCalendarWrapperProps {
  /** 표시할 이벤트 목록 */
  events: CalendarEvent[];
  /** 현재 뷰 타입 */
  view?: CalendarView;
  /** 로그인 상태 */
  isAuthenticated?: boolean;
  /** 개인 일정만 표시할지 여부 */
  showPersonalOnly?: boolean;
  /** 날짜 선택 핸들러 */
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  /** 이벤트 클릭 핸들러 */
  onEventClick?: (clickInfo: EventClickArg) => void;
  /** 뷰 변경 핸들러 */
  onViewChange?: (view: CalendarView) => void;
  /** 날짜 범위 변경 핸들러 */
  onDatesSet?: (dateInfo: DatesSetArg) => void;
  /** 캘린더 높이 */
  height?: string | number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 캘린더 새로고침 함수 */
  onRefresh?: () => Promise<void>;
}

/**
 * 캘린더 컨테이너 스타일
 */
const CalendarContainer = styled.div<{ $isAuthenticated?: boolean }>`
  .fc {
    font-family: ${({ theme }) => theme.fonts.primary};
  }

  /* 헤더 스타일링 */
  .fc-header-toolbar {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.backgroundLight};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  .fc-toolbar-title {
    font-size: ${({ theme }) => theme.fonts.size.xl};
    font-weight: ${({ theme }) => theme.fonts.weight.semibold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  .fc-button {
    background: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-weight: ${({ theme }) => theme.fonts.weight.medium};
    transition: ${({ theme }) => theme.transitions.normal};

    &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
    }

    &:focus {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }

    &.fc-button-active {
      background: ${({ theme }) => theme.colors.primaryDark};
      border-color: ${({ theme }) => theme.colors.primaryDark};
    }
  }

  /* 날짜 셀 스타일링 */
  .fc-daygrid-day {
    border-color: ${({ theme }) => theme.colors.borderLight};
    
    &:hover {
      background: ${({ theme }) => theme.colors.backgroundHover};
    }
  }

  .fc-day-today {
    background: ${({ theme }) => theme.colors.primaryLight} !important;
  }

  .fc-daygrid-day-number {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.fonts.weight.medium};
    padding: ${({ theme }) => theme.spacing.sm};
  }

  /* 이벤트 스타일링 */
  .fc-event {
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    border: none;
    padding: 2px 4px;
    margin: 1px 0;
    font-size: ${({ theme }) => theme.fonts.size.sm};
    font-weight: ${({ theme }) => theme.fonts.weight.medium};
    cursor: pointer;
    transition: ${({ theme }) => theme.transitions.fast};

    &:hover {
      opacity: 0.8;
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }
  }

  /* 내가 작성한 행사 스타일링 */
  .fc-event.my-event {
    background-color: #9c27b0 !important;
    border-color: #7b1fa2 !important;
    color: white !important;
    font-weight: ${({ theme }) => theme.fonts.weight.semibold};
    box-shadow: 0 2px 4px rgba(156, 39, 176, 0.3);
    
    &:hover {
      background-color: #7b1fa2 !important;
      box-shadow: 0 4px 8px rgba(156, 39, 176, 0.4);
      transform: translateY(-1px) scale(1.02);
    }

    &::before {
      content: '✏️';
      margin-right: 2px;
    }
  }

  /* 찜한 행사 전용 스타일링 */
  .fc-event.favorite-event {
    background-color: #ffc107 !important;
    border-color: #e0a800 !important;
    color: #212529 !important;
    font-weight: ${({ theme }) => theme.fonts.weight.semibold};
    box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
    
    &:hover {
      background-color: #e0a800 !important;
      box-shadow: 0 4px 8px rgba(255, 193, 7, 0.4);
      transform: translateY(-1px) scale(1.02);
    }

    &::before {
      content: '⭐';
      margin-right: 2px;
    }
  }

  /* 개인 일정 스타일링 */
  .fc-event.personal-schedule {
    background-color: #28a745 !important;
    border-color: #1e7e34 !important;
    color: white !important;
    font-weight: ${({ theme }) => theme.fonts.weight.semibold};
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
    
    &:hover {
      background-color: #1e7e34 !important;
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
      transform: translateY(-1px) scale(1.02);
    }

    &::before {
      content: '📅';
      margin-right: 2px;
    }
  }

  /* 공개 행사 스타일링 */
  .fc-event.public-event {
    background-color: #007bff !important;
    border-color: #0056b3 !important;
    color: white !important;
    
    &:hover {
      background-color: #0056b3 !important;
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
  }

  /* 승인 대기 행사 스타일링 */
  .fc-event.pending-event {
    background-color: #6c757d !important;
    border-color: #545b62 !important;
    color: white !important;
    opacity: 0.8;
    
    &::before {
      content: '⏳';
      margin-right: 2px;
    }
  }

  /* 거절된 행사 스타일링 */
  .fc-event.rejected-event {
    background-color: #dc3545 !important;
    border-color: #c82333 !important;
    color: white !important;
    opacity: 0.7;
    
    &::before {
      content: '❌';
      margin-right: 2px;
    }
  }

  .fc-event-title {
    font-weight: ${({ theme }) => theme.fonts.weight.medium};
  }

  /* 게스트 사용자용 작은 이벤트 표시 */
  ${({ $isAuthenticated }) => !$isAuthenticated && `
    .fc-event {
      font-size: 10px;
      padding: 1px 2px;
      margin: 0.5px 0;
      opacity: 0.7;
    }
    
    .fc-event-title {
      font-weight: normal;
    }
  `}

  /* 주간/일간 뷰 스타일링 */
  .fc-timegrid-slot {
    border-color: ${({ theme }) => theme.colors.borderLight};
  }

  .fc-timegrid-axis {
    border-color: ${({ theme }) => theme.colors.borderLight};
  }

  /* 선택 영역 스타일링 */
  .fc-highlight {
    background: ${({ theme }) => theme.colors.primaryLight};
    opacity: 0.3;
  }

  /* 반응형 디자인 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    .fc-header-toolbar {
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.sm};
    }

    .fc-toolbar-chunk {
      display: flex;
      justify-content: center;
    }

    .fc-button {
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      font-size: ${({ theme }) => theme.fonts.size.sm};
    }

    .fc-event {
      font-size: 10px;
    }
  }
`;

/**
 * 이벤트 범례 컴포넌트
 */
const EventLegend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: center;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ $color }) => $color};
`;

/**
 * FullCalendar 래퍼 컴포넌트
 * 
 * FullCalendar 라이브러리를 사용하여 캘린더를 렌더링합니다.
 * 로그인 상태에 따라 다른 스타일과 기능을 제공합니다.
 * 
 * 성능 최적화가 적용된 컴포넌트입니다.
 */
const FullCalendarWrapperComponent: React.FC<FullCalendarWrapperProps> = ({
  events,
  view = 'dayGridMonth',
  isAuthenticated = false,
  showPersonalOnly = false,
  onDateSelect,
  onEventClick,
  onViewChange,
  onDatesSet,
  height = 'auto',
  className,
  onRefresh,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  /**
   * 캘린더 새로고침 함수
   */
  const refreshCalendar = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
    // FullCalendar 인스턴스 새로고침
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.refetchEvents();
    }
  }, [onRefresh]);

  // 캘린더 새로고침 함수를 컨텍스트에 등록
  useCalendarRefresh(refreshCalendar);

  /**
   * 뷰 변경 처리
   */
  const handleViewChange = useCallback((viewInfo: { view: { type: string } }) => {
    const newView = viewInfo.view.type as CalendarView;
    onViewChange?.(newView);
  }, [onViewChange]);

  /**
   * 날짜 범위 변경 처리
   */
  const handleDatesSet = useCallback((dateInfo: DatesSetArg) => {
    onDatesSet?.(dateInfo);
  }, [onDatesSet]);

  /**
   * 이벤트 클릭 처리
   */
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    onEventClick?.(clickInfo);
  }, [onEventClick]);

  /**
   * 날짜 선택 처리
   */
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    onDateSelect?.(selectInfo);
  }, [onDateSelect]);

  /**
   * 필터링된 이벤트 목록 (useMemo로 최적화)
   */
  const filteredEvents = useMemo(() => {
    if (showPersonalOnly) {
      return events.filter(event => event.extendedProps?.isPersonal);
    }
    return events;
  }, [events, showPersonalOnly]);

  /**
   * 이벤트 범례 데이터 (useMemo로 최적화)
   */
  const legendItems = useMemo(() => {
    const items = [
      { label: '공개 행사', color: '#007bff' },
    ];

    if (isAuthenticated) {
      items.push(
        { label: '내가 작성한 행사', color: '#9c27b0' },
        { label: '찜한 행사', color: '#ffc107' },
        { label: '개인 일정', color: '#28a745' }
      );
    }

    return items;
  }, [isAuthenticated]);

  /**
   * 이벤트 CSS 클래스명 결정 함수
   */
  const getEventClassNames = useCallback((eventInfo: EventContentArg) => {
    const event = eventInfo.event;
    const extendedProps = event.extendedProps || {};
    const classNames = [];

    // 개인 일정인 경우
    if (extendedProps.isPersonal) {
      classNames.push('personal-schedule');
    }
    // 내가 작성한 행사인 경우 (찜한 행사보다 우선)
    else if (extendedProps.isMyEvent) {
      classNames.push('my-event');
    }
    // 찜한 행사인 경우
    else if (extendedProps.isFavorite) {
      classNames.push('favorite-event');
    }
    // 상태별 클래스
    else {
      switch (extendedProps.status) {
        case 'pending':
        case 'modified':
          classNames.push('pending-event');
          break;
        case 'rejected':
          classNames.push('rejected-event');
          break;
        case 'approved':
        default:
          classNames.push('public-event');
          break;
      }
    }

    return classNames;
  }, []);

  /**
   * 이벤트 마운트 핸들러 (useCallback으로 최적화)
   */
  const handleEventDidMount = useCallback((info: EventMountArg) => {
    const event = info.event;
    const element = info.el;
    
    // 접근성을 위한 속성 추가
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', 
      `${event.title}, ${event.start?.toLocaleDateString('ko-KR')}`
    );
    
    // 키보드 이벤트 처리
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEventClick(info as unknown as EventClickArg);
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // 클린업 함수 반환 (메모리 누수 방지)
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEventClick]);

  /**
   * 캘린더 설정 (useMemo로 최적화)
   */
  const calendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: view,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    events: filteredEvents,
    height,
    locale: 'ko',
    firstDay: 0, // 일요일부터 시작
    weekends: true,
    selectable: isAuthenticated, // 로그인한 사용자만 날짜 선택 가능
    selectMirror: true,
    dayMaxEvents: true,
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: 'numeric' as const,
      minute: '2-digit' as const,
      meridiem: false,
    },
    // 성능 최적화 설정
    eventMaxStack: 3, // 최대 이벤트 스택 수 제한
    dayMaxEventRows: 4, // 일별 최대 이벤트 행 수 제한
    moreLinkClick: 'popover', // 더보기 링크 클릭 시 팝오버 표시
    // 이벤트 클래스명 설정
    eventClassNames: getEventClassNames,
    // 이벤트 핸들러
    select: handleDateSelect,
    eventClick: handleEventClick,
    viewDidMount: handleViewChange,
    datesSet: handleDatesSet,
    eventDidMount: handleEventDidMount,
  }), [
    view,
    filteredEvents,
    height,
    isAuthenticated,
    getEventClassNames,
    handleDateSelect,
    handleEventClick,
    handleViewChange,
    handleDatesSet,
    handleEventDidMount
  ]);

  return (
    <CalendarContainer $isAuthenticated={isAuthenticated} className={className}>
      {/* 이벤트 범례 */}
      <EventLegend>
        {legendItems.map((item) => (
          <LegendItem key={item.label}>
            <LegendColor $color={item.color} />
            <span>{item.label}</span>
          </LegendItem>
        ))}
      </EventLegend>

      {/* FullCalendar */}
      <FullCalendar
        ref={calendarRef}
        {...calendarOptions}
      />
    </CalendarContainer>
  );
};

/**
 * React.memo로 감싸서 props가 변경되지 않으면 리렌더링을 방지
 * 캘린더는 복잡한 컴포넌트이므로 성능 최적화가 매우 중요합니다.
 */
export const FullCalendarWrapper = React.memo(FullCalendarWrapperComponent);