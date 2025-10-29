import { useState, useEffect, useCallback, useMemo } from 'react';
import { EventService } from '../services/eventService';
import { ErrorHandler } from '../utils/error';
import type { EventListItem } from '../types/events';
import type { TagInfo } from '../components/event';
import type { CarouselImage } from '../components/common/ImageCarousel';

/**
 * 인기 페이지 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 조회수 기반 인기 행사 정렬과 트렌딩 태그 기능 제공
 * 
 * 백엔드 API 변경 없이 프론트엔드에서 view_count 기준 정렬 수행
 */
interface UsePopularPageReturn {
  popularEvents: EventListItem[];
  featuredImages: CarouselImage[];
  trendingTags: TagInfo[];
  selectedPeriod: PopularPeriod;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  setPeriod: (period: PopularPeriod) => void;
  loadMore: () => void;
  refresh: () => void;
}

type PopularPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

export const usePopularPage = (): UsePopularPageReturn => {
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PopularPeriod>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 캐러셀 이미지 (현재는 Placeholder 이미지 하드코딩, 추후 업로드 기능 만들고 API 연동)
  const featuredImages: CarouselImage[] = [
    { id: 1, url: 'https://via.placeholder.com/1200x400?text=Popular+Event+1', title: '인기 행사 1' },
    { id: 2, url: 'https://via.placeholder.com/1200x400?text=Popular+Event+2', title: '인기 행사 2' },
    { id: 3, url: 'https://via.placeholder.com/1200x400?text=Popular+Event+3', title: '인기 행사 3' },
  ];

  /**
   * 기간별 필터링 (현재는 'all'만 지원, 추후 확장 가능)
   */
  const filteredByPeriod = useMemo(() => {
    // TODO: 기간별 필터링 로직 추가 (start_date 기준)
    // 현재는 전체 행사 반환
    return allEvents;
  }, [allEvents]);

  /**
   * 조회수 기준 정렬된 인기 행사 목록
   */
  const sortedByViewCount = useMemo(() => {
    return [...filteredByPeriod].sort((a, b) => 
      b.stats.view_count - a.stats.view_count
    );
  }, [filteredByPeriod]);

  /**
   * 트렌딩 태그 추출 (인기 행사의 태그 빈도 기준)
   */
  const trendingTags = useMemo((): TagInfo[] => {
    const tagMap = new Map<string, number>();
    
    // 상위 50개 인기 행사의 태그만 집계
    const topEvents = sortedByViewCount.slice(0, 50);
    topEvents.forEach(event => {
      event.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 상위 10개 태그만
  }, [sortedByViewCount]);

  /**
   * 페이지네이션 적용된 행사 목록
   */
  const paginatedEvents = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return sortedByViewCount.slice(startIndex, endIndex);
  }, [sortedByViewCount, currentPage]);

  /**
   * 페이지네이션 정보
   */
  const pagination = useMemo(() => {
    const totalItems = sortedByViewCount.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      limit: itemsPerPage
    };
  }, [sortedByViewCount.length, currentPage]);

  /**
   * 전체 행사 데이터 가져오기
   */
  const fetchAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 전체 행사 데이터 가져오기
      const response = await EventService.getEvents({ 
        page: 1, 
        limit: 1000,
        sort: 'view_count',
        order: 'desc'
      });
      
      setAllEvents(response.events);
    } catch (err) {
      const errorMessage = '인기 행사를 불러오는데 실패했습니다.';
      setError(errorMessage);
      ErrorHandler.handle(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 기간 선택 핸들러
   */
  const handleSetPeriod = useCallback((period: PopularPeriod) => {
    setSelectedPeriod(period);
    setCurrentPage(1); // 기간 변경 시 첫 페이지로 리셋
  }, []);

  /**
   * 더 많은 행사 로드 (페이지네이션)
   */
  const loadMore = useCallback(() => {
    if (currentPage < pagination.totalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, pagination.totalPages, loading]);

  /**
   * 데이터 새로고침
   */
  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchAllEvents();
  }, [fetchAllEvents]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  return {
    popularEvents: paginatedEvents,
    featuredImages,
    trendingTags,
    selectedPeriod,
    loading,
    error,
    pagination,
    setPeriod: handleSetPeriod,
    loadMore,
    refresh
  };
};