/**
 * 캘린더 이벤트 노멀라이저
 * 
 * 백엔드 API 응답을 FullCalendar에서 사용할 수 있는 형태로 변환합니다.
 * 이벤트 색상 구분, 상태별 스타일링 등을 처리합니다.
 */

import { EventDetailResponse, EventListItem } from '../types/events';
import { ScheduleListItem } from '../types/schedules';
import { CalendarEvent } from '../types';

/**
 * 이벤트 타입별 색상 정의
 */
const EVENT_COLORS = {
  // 공개 행사 (기본)
  public: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  // 찜한 행사
  favorite: {
    backgroundColor: '#ffc107',
    borderColor: '#e0a800',
  },
  // 개인 일정
  personal: {
    backgroundColor: '#28a745',
    borderColor: '#1e7e34',
  },
  // 내가 작성한 행사
  myEvent: {
    backgroundColor: '#9c27b0',
    borderColor: '#7b1fa2',
  },
  // 승인 대기 행사 (주최자가 볼 때)
  pending: {
    backgroundColor: '#6c757d',
    borderColor: '#545b62',
  },
  // 거절된 행사 (주최자가 볼 때)
  rejected: {
    backgroundColor: '#dc3545',
    borderColor: '#c82333',
  },
} as const;

/**
 * 이벤트 상태에 따른 색상을 반환합니다
 */
const getEventColors = (
  event: { is_favorite?: boolean; status?: string; host?: { id: number } },
  isPersonalSchedule: boolean = false,
  currentUserId?: number
): { backgroundColor: string; borderColor: string } => {
  // 개인 일정인 경우
  if (isPersonalSchedule) {
    return EVENT_COLORS.personal;
  }

  // 내가 작성한 행사인 경우 (찜한 행사보다 우선)
  if (currentUserId && event.host?.id === currentUserId) {
    return EVENT_COLORS.myEvent;
  }

  // 찜한 행사인 경우
  if (event.is_favorite) {
    return EVENT_COLORS.favorite;
  }

  // 상태별 색상 (주최자가 자신의 행사를 볼 때)
  switch (event.status) {
    case 'pending':
    case 'modified':
      return EVENT_COLORS.pending;
    case 'rejected':
      return EVENT_COLORS.rejected;
    case 'approved':
    default:
      return EVENT_COLORS.public;
  }
};
/**
 * 캘린더 노멀라이저 클래스
 */
export const calendarNormalizer = {
  /**
   * 개인 일정을 FullCalendar 이벤트로 변환합니다
   *
   * @param schedules - 개인 일정 목록
   * @returns FullCalendar 이벤트 배열
   */
  toPersonalScheduleEvents: (schedules: ScheduleListItem[]): CalendarEvent[] => {
    return schedules.map((schedule) => {
      const ev = schedule.event;

      // 개인 일정 색상/스타일 적용
      const colors = getEventColors(ev, true);

      // 제목: 개인일정 표기 + 행사 제목
      const title = `📅 ${ev.title}`;

      return {
        id: `schedule-${schedule.id}`,
        title,
        start: ev.start_date,
        end: ev.end_date,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        extendedProps: {
          isPersonal: true,
          isFavorite: false,
          status: ev.status,
          location: ev.location,
          eventId: ev.id,
          scheduleId: schedule.id,
          scheduleCreatedAt: schedule.created_at,
        },
      };
    });
  },

  /**
   * 혼합 이벤트 목록을 FullCalendar 이벤트로 변환합니다
   * 로그인한 사용자에게는 개인 일정만 표시합니다
   * 
   * @param _events - 공개 행사 목록 (사용하지 않음)
   * @param schedules - 개인 일정 목록
   * @returns FullCalendar 이벤트 배열
   */
  toMixedCalendarEvents: (
    _events: (EventDetailResponse | EventListItem)[],
    schedules: ScheduleListItem[] = []
  ): CalendarEvent[] => {
    // 로그인한 사용자에게는 개인 일정만 표시
    return calendarNormalizer.toPersonalScheduleEvents(schedules);
  },

  /**
   * 게스트 사용자용 이벤트 변환
   * 로그인하지 않은 사용자에게는 어떤 행사도 표시하지 않습니다
   * 
   * @param _events - 공개 행사 목록 (사용하지 않음)
   * @returns 빈 배열
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toGuestCalendarEvents: (_events: (EventDetailResponse | EventListItem)[]): CalendarEvent[] => {
    // 로그인하지 않은 사용자에게는 캘린더에 어떤 행사도 표시하지 않음
    return [];
  },
};