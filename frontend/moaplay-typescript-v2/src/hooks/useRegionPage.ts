import { useState, useEffect, useCallback, useMemo } from 'react';
import { EventService } from '../services/eventService';
import { ErrorHandler } from '../utils/error';
import type { EventListItem } from '../types/events';
import type { CarouselImage } from '../components/common/ImageCarousel';

/**
 * 지역별 페이지 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 지역 필터링, 이미지 캐러셀, 행사 목록 조회 기능 제공
 * 
 * 백엔드 API 변경 없이 프론트엔드에서 location 텍스트를 정규화하여 지역 추출
 */
interface UseRegionPageReturn {
  events: EventListItem[];
  regions: string[];
  featuredImages: CarouselImage[];
  selectedRegion: string | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  setSelectedRegion: (region: string | null) => void;
  loadMore: () => void;
  refresh: () => void;
}

/**
 * location 텍스트에서 핵심 지역명을 추출하는 유틸리티 함수
 * 예: "서울특별시 강남구 테헤란로 123" -> "서울"
 */
const extractRegionFromLocation = (location: string): string | null => {
  if (!location) return null;
  
  // 주요 지역 키워드 목록 (우선순위 순서)
  const regionKeywords = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];
  
  // location 텍스트에서 첫 번째로 매칭되는 지역 반환
  for (const region of regionKeywords) {
    if (location.includes(region)) {
      return region;
    }
  }
  
  return null;
};

export const useRegionPage = (): UseRegionPageReturn => {
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 캐러셀 이미지 (하드코딩 또는 추후 API 연동)
  const featuredImages: CarouselImage[] = [
    { url: 'https://via.placeholder.com/1200x400?text=Region+Event+1', alt: '지역 행사 1' },
    { url: 'https://via.placeholder.com/1200x400?text=Region+Event+2', alt: '지역 행사 2' },
    { url: 'https://via.placeholder.com/1200x400?text=Region+Event+3', alt: '지역 행사 3' },
  ];

  /**
   * 전체 행사 데이터에서 지역 목록 추출
   */
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    allEvents.forEach(event => {
      const region = extractRegionFromLocation(event.location);
      if (region) {
        regionSet.add(region);
      }
    });
    return Array.from(regionSet).sort();
  }, [allEvents]);

  /**
   * 선택된 지역으로 필터링된 행사 목록
   */
  const filteredEvents = useMemo(() => {
    if (!selectedRegion) {
      return allEvents;
    }
    
    return allEvents.filter(event => {
      const eventRegion = extractRegionFromLocation(event.location);
      return eventRegion === selectedRegion;
    });
  }, [allEvents, selectedRegion]);

  /**
   * 페이지네이션 적용된 행사 목록
   */
  const paginatedEvents = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage]);

  /**
   * 페이지네이션 정보
   */
  const pagination = useMemo(() => {
    const totalItems = filteredEvents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      limit: itemsPerPage
    };
  }, [filteredEvents.length, currentPage]);

  /**
   * 전체 행사 데이터를 가져오는 함수
   */
  const fetchAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 전체 행사 데이터 가져오기 (페이지네이션 없이 많은 데이터 가져오기)
      const response = await EventService.getEvents({ 
        page: 1, 
        limit: 1000, // 충분히 큰 값
        sort: 'created_at',
        order: 'desc'
      });
      
      setAllEvents(response.events);
    } catch (err) {
      const errorMessage = '지역별 행사를 불러오는데 실패했습니다.';
      setError(errorMessage);
      ErrorHandler.handle(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 지역 선택 핸들러
   */
  const handleRegionSelect = useCallback((region: string | null) => {
    setSelectedRegion(region);
    setCurrentPage(1); // 지역 변경 시 첫 페이지로 리셋
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
    events: paginatedEvents,
    regions,
    featuredImages,
    selectedRegion,
    loading,
    error,
    pagination,
    setSelectedRegion: handleRegionSelect,
    loadMore,
    refresh
  };
};