/**
 * 캘린더 관련 커스텀 훅
 * 
 * FullCalendar 컴포넌트에서 사용할 이벤트 데이터 관리,
 * 날짜 선택, 이벤트 클릭 처리 등의 기능을 제공합니다.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventListItem } from '../types/events';
import { ScheduleListItem } from '../types/schedules';
import { ScheduleService } from '../services/scheduleService';
import { calendarNormalizer } from '../normalizers/calendarNormalizer';
import { useAuth } from './useAuth';
import { CalendarEvent } from '../types';

// ScheduleService.getSchedules 첫 번째 인자의 타입을 안전하게 추론
type SvcGetSchedulesParams = Parameters<typeof ScheduleService.getSchedules>[0];

// 안전 변환: ScheduleItem → ScheduleApiResponse (created_at 보정)
const toScheduleApi = (item: ScheduleListItem): ScheduleListItem => ({
  ...item,
  created_at: item?.created_at ?? new Date().toISOString(),
});

// FullCalendar 이벤트 클릭 정보 타입 (일관성 유지)
type EventClickInfo = {
  event: {
    id: string;
    extendedProps: {
      isPersonal?: boolean;
      type?: string;
      event_id?: number;
      schedule_id?: number;
    };
  };
};

/**
 * 캘린더 뷰 타입
 */
export type CalendarView = 'dayGridMonth' | 'dayGridWeek' | 'dayGridDay';

/**
 * 날짜 범위 타입
 */
interface DateRange {
  start: Date;
  end: Date;
}

/**
 * 캘린더 상태 타입
 */
interface CalendarState {
  events: EventListItem[];
  schedules: ScheduleListItem[];
  selectedDate: Date | null;
  currentView: CalendarView;
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;
}

/**
 * 캘린더 훅 반환 타입
 */
interface UseCalendarReturn extends CalendarState {
  calendarEvents: CalendarEvent[];
  selectedDateSchedules: ScheduleListItem[];
  scheduleEventIds: number[];
  setSelectedDate: (date: Date | null) => void;
  setCurrentView: (view: CalendarView) => void;
  handleDateSelect: (selectInfo: { start: Date; end: Date }) => void;
  handleEventClick: (clickInfo: EventClickInfo) => number | null;
  handleViewChange: (view: CalendarView) => void;
  handleDatesSet: (dateInfo: { start: Date; end: Date }) => void;
  refreshEvents: () => Promise<void>;
  refreshCalendar: () => Promise<void>;
  addToPersonalSchedule: (eventId: number) => Promise<void>;
  removeFromPersonalSchedule: (eventId: number) => Promise<void>;
  togglePersonalSchedule: (eventId: number) => Promise<boolean>;
  showLoginModal: () => void;
}

/**
 * 캘린더 관련 커스텀 훅
 *
 * FullCalendar에서 사용할 이벤트 데이터와 상호작용 로직을 제공합니다.
 * 로그인 상태에 따라 다른 이벤트를 표시하고, 개인 일정 관리 기능을 포함합니다.
 */
export const useCalendar = (): UseCalendarReturn => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [calendarState, setCalendarState] = useState<CalendarState>({
    events: [],
    schedules: [],
    selectedDate: null,
    currentView: 'dayGridMonth',
    dateRange: {
      start: new Date(),
      end: new Date(),
    },
    isLoading: true,
    error: null,
  });

  const [selectedDateSchedules, setSelectedDateSchedules] = useState<ScheduleListItem[]>([]);

  /**
   * 로그인 모달 표시
   */
  const showLoginModal = useCallback(() => {
    // TODO: 로그인 모달 구현 또는 로그인 페이지로 이동
    navigate('/login');
  }, [navigate]);

  /**
   * 이벤트 데이터를 가져옵니다
   * - 로그인 안 한 상태: 아무것도 가져오지 않음
   * - 로그인 한 상태: 개인 일정만 가져옴
   */
  const fetchEvents = useCallback(async () => {
    try {
      setCalendarState(prev => ({ ...prev, isLoading: true, error: null }));

      // 로그인하지 않은 경우 아무것도 가져오지 않음
      if (!isAuthenticated || !user) {
        setCalendarState(prev => ({
          ...prev,
          events: [],
          schedules: [],
          isLoading: false,
        }));
        return;
      }

      // 로그인한 사용자의 경우 개인 일정만 가져오기
      let schedules: ScheduleListItem[] = [];
      try {
        // 날짜 범위 필터링 없이 전체 일정 가져오기
        const scheduleParams: SvcGetSchedulesParams = {} as SvcGetSchedulesParams;

        const scheduleResult = await ScheduleService.getSchedules(scheduleParams);
        console.log('Fetched schedules:', scheduleResult);
        
        if (scheduleResult && scheduleResult.schedules) {
          schedules = scheduleResult.schedules.map(toScheduleApi);
        }
      } catch (error) {
        console.error('Failed to fetch personal schedules:', error);
        // 일정 가져오기 실패 시 에러 표시
        setCalendarState(prev => ({
          ...prev,
          error: '개인 일정을 불러오는데 실패했습니다.',
          isLoading: false,
        }));
        return;
      }

      setCalendarState(prev => ({
        ...prev,
        events: [], // 공개 행사는 가져오지 않음
        schedules,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setCalendarState(prev => ({
        ...prev,
        error: '캘린더 데이터를 불러오는데 실패했습니다.',
        isLoading: false,
      }));
    }
  }, [isAuthenticated, user]);

  /**
   * FullCalendar에서 사용할 이벤트 목록을 생성합니다
   * - 로그인 안 한 상태: 빈 배열 (어떤 행사도 표시하지 않음)
   * - 로그인 한 상태: 내가 캘린더에 추가한 행사만 표시 (개인 일정)
   */
  const calendarEvents = useMemo(() => {
    if (isAuthenticated) {
      // 로그인한 사용자: 개인 일정만 표시
      return calendarNormalizer.toMixedCalendarEvents(
        calendarState.events,
        calendarState.schedules,
      );
    } else {
      // 게스트 사용자: 어떤 행사도 표시하지 않음
      return calendarNormalizer.toGuestCalendarEvents(calendarState.events);
    }
  }, [calendarState.events, calendarState.schedules, isAuthenticated]);

  /**
   * 개인 일정에 추가된 행사 ID 목록
   * EventGrid에서 버튼 상태를 표시하는데 사용됩니다
   */
  const scheduleEventIds = useMemo(() => {
    return calendarState.schedules.map(schedule => schedule.event.id);
  }, [calendarState.schedules]);

  /**
   * 선택된 날짜를 설정합니다
   */
  const setSelectedDate = useCallback((date: Date | null) => {
    setCalendarState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  /**
   * 현재 뷰를 설정합니다
   */
  const setCurrentView = useCallback((view: CalendarView) => {
    setCalendarState(prev => ({ ...prev, currentView: view }));
  }, []);

  /**
   * 날짜 선택 처리
   * 선택된 날짜의 개인 일정을 로드하고 상세 패널을 업데이트합니다
   */
  const handleDateSelect = useCallback(async (selectInfo: { start: Date }) => {
    const selectedDate = selectInfo.start;
    setSelectedDate(selectedDate);

    // 로그인하지 않은 사용자에게는 로그인 유도
    if (!isAuthenticated) {
      setSelectedDateSchedules([]);
      return;
    }

    // 선택된 날짜의 개인 일정 필터링 (이미 로드된 일정에서 필터링)
    try {
      // 선택된 날짜를 UTC 기준으로 정규화 (시간 부분 제거)
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);
      
      // 현재 로드된 일정에서 선택된 날짜에 해당하는 일정만 필터링
      const schedulesForDate = calendarState.schedules.filter(schedule => {
        // 행사 시작일과 종료일을 Date 객체로 변환 (시간 부분 제거)
        const eventStart = new Date(schedule.event.start_date);
        eventStart.setHours(0, 0, 0, 0);
        
        const eventEnd = new Date(schedule.event.end_date);
        eventEnd.setHours(0, 0, 0, 0);
        
        // 선택된 날짜가 행사 기간 내에 있는지 확인 (시작일과 종료일 포함)
        return selectedDateOnly >= eventStart && selectedDateOnly <= eventEnd;
      });
      
      console.log('Selected date:', selectedDateOnly.toISOString().split('T')[0]);
      console.log('Total schedules:', calendarState.schedules.length);
      console.log('Filtered schedules for date:', schedulesForDate.length, schedulesForDate);
      
      setSelectedDateSchedules(schedulesForDate);
    } catch (error) {
      console.error('Failed to filter schedules for selected date:', error);
      setSelectedDateSchedules([]);
    }
  }, [isAuthenticated, setSelectedDate, calendarState.schedules]);

  /**
   * 이벤트 클릭 처리
   * 이벤트 타입에 따라 다른 액션을 수행합니다
   * 
   * 이 함수는 이벤트 ID만 반환하고, 실제 처리는 호출하는 쪽에서 담당합니다.
   * (사이드 패널 열기 또는 페이지 이동)
   */
  const handleEventClick = useCallback((clickInfo: EventClickInfo): number | null => {
    const event = clickInfo.event;
    const eventId = event.id;
    const extendedProps = event.extendedProps;
    const isPersonal = extendedProps.isPersonal || extendedProps.type === 'personal_schedule';

    // 개인 일정인 경우
    if (isPersonal) {
      const actualEventId = extendedProps.event_id;
      if (actualEventId) {
        return actualEventId;
      }
      return null;
    }

    // 로그인하지 않은 사용자의 경우 로그인 유도
    if (!isAuthenticated) {
      showLoginModal();
      return null;
    }

    // 일반 행사 ID 반환
    const numericEventId = eventId.replace(/\D/g, ''); // 숫자만 추출
    if (numericEventId) {
      return parseInt(numericEventId, 10);
    }
    
    return null;
  }, [isAuthenticated, showLoginModal]);

  /**
   * 뷰 변경 처리
   */
  const handleViewChange = useCallback((view: CalendarView) => {
    setCurrentView(view);
  }, [setCurrentView]);

  /**
   * 이벤트 새로고침
   */
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  /**
   * 캘린더 새로고침 (찜하기 상태 변경 시 사용)
   */
  const refreshCalendar = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  /**
   * 개인 일정에 추가
   */
  const addToPersonalSchedule = useCallback(async (eventId: number) => {
    if (!isAuthenticated || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      await ScheduleService.addSchedule({ event_id: eventId });

      // 이벤트 목록 새로고침 (useEffect가 자동으로 selectedDateSchedules 업데이트)
      await refreshEvents();

      console.log('Added to personal schedule:', eventId);
    } catch (error) {
      console.error('Failed to add to personal schedule:', error);
      throw error;
    }
  }, [isAuthenticated, user, refreshEvents]);

  /**
   * 개인 일정에서 제거
   */
  const removeFromPersonalSchedule = useCallback(async (scheduleId: number) => {
    if (!isAuthenticated || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      await ScheduleService.removeSchedule(scheduleId);

      // 이벤트 목록 새로고침 (useEffect가 자동으로 selectedDateSchedules 업데이트)
      await refreshEvents();

      console.log('Removed from personal schedule:', scheduleId);
    } catch (error) {
      console.error('Failed to remove from personal schedule:', error);
      throw error;
    }
  }, [isAuthenticated, user, refreshEvents]);

  /**
   * 개인 일정 토글 (추가/제거)
   */
  const togglePersonalSchedule = useCallback(async (eventId: number): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const result = await ScheduleService.toggleSchedule(eventId);

      // 이벤트 목록 새로고침 (useEffect가 자동으로 selectedDateSchedules 업데이트)
      await refreshEvents();

      return result != null &&
        typeof result === 'object' &&
        'is_in_schedule' in result &&
        typeof (result as { is_in_schedule?: unknown }).is_in_schedule ===
          'boolean'
        ? (result as { is_in_schedule: boolean }).is_in_schedule
        : false;
    } catch (error) {
      console.error('Failed to toggle personal schedule:', error);
      throw error;
    }
  }, [isAuthenticated, user, refreshEvents]);

  /**
   * 날짜 범위 변경 처리 (FullCalendar의 datesSet 이벤트)
   */
  const handleDatesSet = useCallback((dateInfo: { start: Date; end: Date }) => {
    const newDateRange = {
      start: dateInfo.start,
      end: dateInfo.end,
    };
    
    setCalendarState(prev => ({ ...prev, dateRange: newDateRange }));
    
    // 새로운 날짜 범위의 이벤트 로드
    fetchEvents();
  }, [fetchEvents]);

  /**
   * 컴포넌트 마운트 시 이벤트 로드
   */
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /**
   * 로그인 상태 변경 시 이벤트 새로고침
   */
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      fetchEvents();
    }
  }, [isAuthenticated, fetchEvents]);

  /**
   * 일정이 변경되거나 선택된 날짜가 변경될 때 selectedDateSchedules 업데이트
   */
  useEffect(() => {
    if (!calendarState.selectedDate || !isAuthenticated) {
      setSelectedDateSchedules([]);
      return;
    }

    // 선택된 날짜를 UTC 기준으로 정규화 (시간 부분 제거)
    const selectedDateOnly = new Date(calendarState.selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    // 현재 로드된 일정에서 선택된 날짜에 해당하는 일정만 필터링
    const schedulesForDate = calendarState.schedules.filter(schedule => {
      // 행사 시작일과 종료일을 Date 객체로 변환 (시간 부분 제거)
      const eventStart = new Date(schedule.event.start_date);
      eventStart.setHours(0, 0, 0, 0);
      
      const eventEnd = new Date(schedule.event.end_date);
      eventEnd.setHours(0, 0, 0, 0);
      
      // 선택된 날짜가 행사 기간 내에 있는지 확인 (시작일과 종료일 포함)
      return selectedDateOnly >= eventStart && selectedDateOnly <= eventEnd;
    });
    
    console.log('Auto-updating selected date schedules:', {
      selectedDate: selectedDateOnly.toISOString().split('T')[0],
      totalSchedules: calendarState.schedules.length,
      filteredSchedules: schedulesForDate.length
    });
    
    setSelectedDateSchedules(schedulesForDate);
  }, [calendarState.schedules, calendarState.selectedDate, isAuthenticated]);

  return {
    ...calendarState,
    calendarEvents,
    selectedDateSchedules,
    scheduleEventIds,
    setSelectedDate,
    setCurrentView,
    handleDateSelect,
    handleEventClick,
    handleViewChange,
    handleDatesSet,
    refreshEvents,
    refreshCalendar,
    addToPersonalSchedule,
    removeFromPersonalSchedule,
    togglePersonalSchedule,
    showLoginModal,
  };
};