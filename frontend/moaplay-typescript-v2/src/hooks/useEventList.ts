/**
 * 행사 목록 관리를 위한 커스텀 훅
 * 
 * 행사 목록 조회, 검색, 필터링, 페이지네이션 등의 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { EventService } from '../services/eventService';
import { EventListItem, EventFilterParams } from '../types/events';
import { PaginationInfo } from '../types';
import { ErrorHandler } from '../utils/error';

/**
 * 필터 상태 타입
 */
export interface EventFilters {
  region?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  sort: 'latest' | 'popular' | 'recommended';
}

// UI → API 정렬 매핑
const mapUiSortToApi = (ui: EventFilters['sort']): 'created_at' | 'view_count' | 'average_rating' => {
  switch (ui) {
    case 'popular':
      return 'view_count';
    case 'recommended':
      return 'average_rating';
    case 'latest':
    default:
      return 'created_at';
  }
};

/**
 * useEventList 훅의 반환 타입
 */
export interface UseEventListReturn {
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: EventFilters;
  searchQuery: string;

  // 액션 함수들
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  loadEvents: () => Promise<void>;
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  resetFilters: () => void;
}

/**
 * 기본 필터 설정
 */
const DEFAULT_FILTERS: EventFilters = {
  sort: 'latest'
};

/**
 * 행사 목록 관리 커스텀 훅
 *
 * @param initialParams 초기 검색 파라미터
 * @returns 행사 목록 상태와 관리 함수들
 */
export const useEventList = (initialParams?: Partial<EventFilterParams>): UseEventListReturn => {
  // 상태 관리
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFiltersState] = useState<EventFilters>({
    ...DEFAULT_FILTERS,
    region: initialParams?.region,
    tags: initialParams?.tag ? [initialParams.tag] : undefined,
    startDate: initialParams?.date_from,
    endDate: initialParams?.date_to,
    sort: 'latest'
  });

  /**
   * 행사 목록을 로드합니다
   */
  const loadEvents = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // API 파라미터 구성
      const params: EventFilterParams = {
        page,
        limit: 20,
        region: filters.region,
        tag: filters.tags?.[0],
        date_from: filters.startDate,
        date_to: filters.endDate,
        sort: mapUiSortToApi(filters.sort)
      };

      // API 호출
      const response = await EventService.getEvents(params);

      // 상태 업데이트
      if (append) {
        setEvents(prev => [...prev, ...response.events]);
      } else {
        setEvents(response.events);
      }
      setPagination(response.pagination);

    } catch (err) {
      const errorMessage = ErrorHandler.getErrorMessage(err);
      setError(errorMessage);
      console.error('행사 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * 더 많은 행사를 로드합니다 (무한 스크롤용)
   */
  const loadMore = useCallback(async () => {
    if (!pagination || pagination.current_page >= pagination.total_pages) {
      return;
    }

    await loadEvents(pagination.current_page + 1, true);
  }, [pagination, loadEvents]);

  /**
   * 특정 페이지로 이동합니다
   */
  const goToPage = useCallback(async (page: number) => {
    await loadEvents(page, false);
  }, [loadEvents]);

  /**
   * 필터를 업데이트합니다
   */
  const setFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * 필터를 초기화합니다
   */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  /**
   * 검색어나 필터가 변경될 때 자동으로 새로운 검색 실행
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEvents(1, false);
    }, 300); // 디바운싱

    return () => clearTimeout(timeoutId);
  }, [filters, loadEvents]);

  /**
   * 컴포넌트 마운트 시 초기 데이터 로드
   */
  useEffect(() => {
    loadEvents(1, false);
  }, [loadEvents]); // loadEvents를 의존성 배열에 추가

  return {
    events,
    loading,
    error,
    pagination,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    loadEvents: () => loadEvents(1, false),
    loadMore,
    goToPage,
    resetFilters
  };
};