/**
 * 홈페이지 관련 커스텀 훅
 * 
 * 홈페이지에서 필요한 모든 데이터와 상태를 관리합니다.
 * FullCalendar, 검색, 행사 그리드, 개인 일정 요약 등의 기능을 제공합니다.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { EventListItem } from '../types/events';
import { ScheduleListItem } from '../types/schedules';
import { EventService } from '../services/eventService';
import { useAuth } from './useAuth';
import { useCalendar } from './useCalendar';

/**
 * 홈페이지 상태 타입
 */
interface HomePageState {
  featuredEvents: EventListItem[];
  popularTags: string[];
  selectedTags: string[];
  selectedDate: Date | null;
  personalScheduleSummary: ScheduleListItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * 홈페이지 훅 반환 타입
 */
interface UseHomePageReturn extends HomePageState {
  // 캘린더 관련
  calendarEvents: import('../types').CalendarEvent[];
  handleDateSelect: (date: Date) => void;
  handleEventClick: (eventInfo: { event: import('../types').CalendarEvent }) => void;
  
  // 검색 관련
  handleSearch: (query: string) => void;
  
  // 태그 필터 관련
  handleTagSelect: (tag: string) => void;
  handleTagClear: () => void;
  
  // 행사 그리드 관련
  filteredEvents: EventListItem[];
  handleFavoriteToggle: (eventId: number, isFavorite: boolean) => Promise<void>;
  
  // 개인 일정 관련
  getScheduleSummaryForDate: (date: Date) => ScheduleListItem[];
  
  // 새로고침
  refreshData: () => Promise<void>;
}

/**
 * 홈페이지 관련 커스텀 훅
 * 
 * 홈페이지에서 필요한 모든 데이터와 상호작용 로직을 제공합니다.
 * 로그인 상태에 따라 다른 데이터를 표시하고, 개인화된 경험을 제공합니다.
 */
export const useHomePage = (): UseHomePageReturn => {
  const { isAuthenticated, user } = useAuth();
  const {
    calendarEvents,
    selectedDate,
    setSelectedDate,
    handleDateSelect: calendarHandleDateSelect,
    handleEventClick: calendarHandleEventClick,
    refreshEvents
  } = useCalendar();

  const [homePageState, setHomePageState] = useState<HomePageState>({
    featuredEvents: [],
    popularTags: [],
    selectedTags: [],
    selectedDate: null,
    personalScheduleSummary: [],
    isLoading: true,
    error: null,
  });

  /**
   * 홈페이지 데이터를 가져옵니다
   * 시작일 기준 최신순(start_date DESC) 정렬로 행사 목록 조회
   */
  const fetchHomePageData = useCallback(async () => {
    try {
      setHomePageState(prev => ({ ...prev, isLoading: true, error: null }));

      // 시작일 기준 최신순으로 정렬된 행사 리스트 가져오기
      let featuredEvents: EventListItem[] = [];
      try {
        const listResp = await EventService.getEvents({ 
          page: 1, 
          limit: 50, // 충분한 양의 데이터 가져오기
          sort: 'start_date',
          order: 'desc'
        });
        // EventListResponse: { events, pagination, ... } 형태 우선
        if (listResp && 'events' in listResp && Array.isArray(listResp.events)) {
          featuredEvents = listResp.events;
        } else {
          featuredEvents = [];
        }
      } catch (e) {
        console.warn('getEvents() 호출 실패:', e);
        featuredEvents = [];
      }

      // 인기 태그 가져오기
      const popularTags = [
        '음악', '전시', '축제', '스포츠', '교육', '문화',
        '예술', '푸드', '마켓', '워크샵', '세미나', '컨퍼런스'
      ];

      // 개인 일정 요약 가져오기 (로그인한 사용자만)
      const personalScheduleSummary: ScheduleListItem[] = [];
      if (isAuthenticated && user && selectedDate) {
        try {
          // TODO: ScheduleService 구현 후 연결
          // personalScheduleSummary = await ScheduleService.getScheduleSummaryForDate(
          //   user.id, 
          //   selectedDate
          // );
        } catch (err) {
          console.warn('Failed to fetch personal schedule summary:', err);
        }
      }

      setHomePageState(prev => ({
        ...prev,
        featuredEvents,
        popularTags,
        personalScheduleSummary,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to fetch homepage data:', err);
      setHomePageState(prev => ({
        ...prev,
        error: '데이터를 불러오는데 실패했습니다.',
        isLoading: false,
      }));
    }
  }, [isAuthenticated, user, selectedDate]);

  /**
   * 날짜 선택 처리
   */
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setHomePageState(prev => ({ ...prev, selectedDate: date }));
    calendarHandleDateSelect({ start: date, end: date });
  }, [setSelectedDate, calendarHandleDateSelect]);

  /**
   * 이벤트 클릭 처리
   */
  const handleEventClick = useCallback((eventInfo: { event: import('../types').CalendarEvent }) => {
    calendarHandleEventClick(eventInfo);
  }, [calendarHandleEventClick]);

  /**
   * 검색 처리
   */
  const handleSearch = useCallback((query: string) => {
    // 검색 결과 페이지로 이동하거나 필터링 적용
    console.log('Search query:', query);
    // TODO: 검색 기능 구현 후 연결
    // navigate(`/events?q=${encodeURIComponent(query)}`);
  }, []);

  /**
   * 태그 선택 처리
   */
  const handleTagSelect = useCallback((tag: string) => {
    setHomePageState(prev => {
      const isSelected = prev.selectedTags.includes(tag);
      const newSelectedTags = isSelected
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag];
      
      return {
        ...prev,
        selectedTags: newSelectedTags
      };
    });
  }, []);

  /**
   * 태그 필터 초기화
   */
  const handleTagClear = useCallback(() => {
    setHomePageState(prev => ({
      ...prev,
      selectedTags: []
    }));
  }, []);

  /**
   * 찜하기 토글 처리
   */
  const handleFavoriteToggle = useCallback(async (eventId: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // TODO: FavoriteService 구현 후 연결
      // if (isFavorite) {
      //   await FavoriteService.addFavorite(eventId);
      // } else {
      //   await FavoriteService.removeFavorite(eventId);
      // }

      // 이벤트 목록 업데이트 (EventListItem에는 is_favorite 필드가 없으므로 주석 처리)
      // setHomePageState(prev => ({
      //   ...prev,
      //   featuredEvents: prev.featuredEvents.map(event =>
      //     event.id === eventId
      //       ? { ...event, is_favorite: isFavorite }
      //       : event
      //   )
      // }));

      console.log(`Event ${eventId} ${isFavorite ? 'added to' : 'removed from'} favorites`);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  }, [isAuthenticated]);

  /**
   * 태그로 필터링된 행사 목록
   * 클라이언트 사이드에서 태그 매칭을 수행합니다.
   * 검색어가 행사의 태그, 제목, 요약, 위치에 포함되어 있으면 매칭됩니다.
   */
  const filteredEvents = useMemo(() => {
    if (homePageState.selectedTags.length === 0) {
      return homePageState.featuredEvents;
    }

    return homePageState.featuredEvents.filter(event => {
      // 선택된 태그 중 하나라도 매칭되면 표시
      return homePageState.selectedTags.some(selectedTag => {
        const query = selectedTag.toLowerCase();
        
        // 태그 배열에서 검색
        if (event.tags && event.tags.some((tag: string) => 
          tag.toLowerCase().includes(query)
        )) {
          return true;
        }
        
        // 제목에서 검색
        if (event.title.toLowerCase().includes(query)) {
          return true;
        }
        
        // 요약에서 검색
        if (event.summary && event.summary.toLowerCase().includes(query)) {
          return true;
        }
        
        // 위치에서 검색
        return !!(event.location && event.location.toLowerCase().includes(query));

      });
    });
  }, [homePageState.featuredEvents, homePageState.selectedTags]);

  /**
   * 특정 날짜의 개인 일정 요약 가져오기
   */
  const getScheduleSummaryForDate = useCallback((date: Date): ScheduleListItem[] => {
    if (!isAuthenticated || !homePageState.personalScheduleSummary) {
      return [];
    }

    const dateString = date.toISOString().split('T')[0];
    return homePageState.personalScheduleSummary.filter((schedule) => {
      const ev = schedule.event;
      // 우선순위: start_date, 없으면 제외
      const startRaw = ev.start_date;
      if (!startRaw) return false; // 안전 가드
      const endRaw = ev.end_date ?? startRaw;

      const startDay = String(startRaw).split('T')[0];
      const endDay = String(endRaw).split('T')[0];

      // ISO 형식(YYYY-MM-DD)이면 문자열 비교로도 범위 판정이 가능
      return startDay <= dateString && dateString <= endDay;
    });
  }, [isAuthenticated, homePageState.personalScheduleSummary]);

  /**
   * 데이터 새로고침
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchHomePageData(),
      refreshEvents()
    ]);
  }, [fetchHomePageData, refreshEvents]);

  /**
   * 컴포넌트 마운트 시 데이터 로드
   */
  useEffect(() => {
    fetchHomePageData();
  }, [fetchHomePageData]);

  /**
   * 로그인 상태 변경 시 데이터 새로고침
   */
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      fetchHomePageData();
    }
  }, [isAuthenticated, fetchHomePageData]);

  /**
   * 선택된 날짜 변경 시 개인 일정 요약 업데이트
   */
  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      // 개인 일정 요약 새로고침
      fetchHomePageData();
    }
  }, [selectedDate, isAuthenticated, fetchHomePageData]);

  return {
    ...homePageState,
    calendarEvents,
    handleDateSelect,
    handleEventClick,
    handleSearch,
    handleTagSelect,
    handleTagClear,
    filteredEvents,
    handleFavoriteToggle,
    getScheduleSummaryForDate,
    refreshData,
  };
};