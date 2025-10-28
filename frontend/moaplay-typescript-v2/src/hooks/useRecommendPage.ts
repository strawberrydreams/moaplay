import { useCallback, useEffect, useState, useMemo } from 'react';
import { EventService } from '../services/eventService';
import { useAuth } from './useAuth';
import { ErrorHandler } from '../utils/error';
import type { EventListItem } from '../types/events';
import type { TagInfo } from '../components/event';
import type { CarouselImage } from '../components/common/ImageCarousel';

/**
 * 추천 페이지 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 사용자 선호 태그 기반 추천 알고리즘과 태그 필터링 기능 제공
 * 
 * 백엔드 API 변경 없이 프론트엔드에서 태그 매칭 및 정렬 수행
 */
interface UseRecommendPageReturn {
  recommendedEvents: EventListItem[];
  featuredImages: CarouselImage[];
  userPreferredTags: string[];
  availableTags: TagInfo[];
  selectedTags: string[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  setSelectedTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearAllTags: () => void;
  loadMore: () => void;
  refresh: () => void;
  updatePreferredTags: (tags: string[]) => Promise<void>;
}

export const useRecommendPage = (): UseRecommendPageReturn => {
  const { user, isAuthenticated } = useAuth();
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [userPreferredTags, setUserPreferredTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 캐러셀 이미지 (하드코딩 또는 추후 API 연동)
  const featuredImages: CarouselImage[] = [
    { url: 'https://via.placeholder.com/1200x400?text=Recommended+Event+1', alt: '추천 행사 1' },
    { url: 'https://via.placeholder.com/1200x400?text=Recommended+Event+2', alt: '추천 행사 2' },
    { url: 'https://via.placeholder.com/1200x400?text=Recommended+Event+3', alt: '추천 행사 3' },
  ];

  /**
   * 전체 행사에서 사용 가능한 태그 목록 추출
   */
  const availableTags = useMemo((): TagInfo[] => {
    const tagMap = new Map<string, number>();
    
    allEvents.forEach(event => {
      event.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allEvents]);

  /**
   * 태그 매칭 점수 계산 함수
   * 사용자 선호 태그와 이벤트 태그가 얼마나 겹치는지 계산
   */
  const calculateTagMatchScore = useCallback((eventTags: string[], preferredTags: string[]): number => {
    if (preferredTags.length === 0) return 0;
    
    let matchCount = 0;
    eventTags.forEach(tag => {
      if (preferredTags.includes(tag)) {
        matchCount++;
      }
    });
    
    return matchCount;
  }, []);

  /**
   * 추천 행사 목록 (태그 매칭 점수 기반 정렬)
   */
  const recommendedEvents = useMemo(() => {
    let filtered = allEvents;
    
    // 선택된 태그로 필터링 (선택된 태그가 있는 경우)
    if (selectedTags.length > 0) {
      filtered = allEvents.filter(event =>
        event.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // 로그인한 사용자: 선호 태그 기반 정렬
    if (isAuthenticated && userPreferredTags.length > 0) {
      const tagsToMatch = selectedTags.length > 0 ? selectedTags : userPreferredTags;
      
      filtered = [...filtered].sort((a, b) => {
        const scoreA = calculateTagMatchScore(a.tags, tagsToMatch);
        const scoreB = calculateTagMatchScore(b.tags, tagsToMatch);
        
        // 태그 매칭 점수가 높은 순서대로 정렬
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        
        // 같은 점수면 조회수 기준 정렬
        return b.stats.view_count - a.stats.view_count;
      });
    } else {
      // 게스트 사용자: 조회수 기준 정렬
      filtered = [...filtered].sort((a, b) => 
        b.stats.view_count - a.stats.view_count
      );
    }
    
    return filtered;
  }, [allEvents, selectedTags, isAuthenticated, userPreferredTags, calculateTagMatchScore]);

  /**
   * 페이지네이션 적용된 행사 목록
   */
  const paginatedEvents = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return recommendedEvents.slice(startIndex, endIndex);
  }, [recommendedEvents, currentPage]);

  /**
   * 페이지네이션 정보
   */
  const pagination = useMemo(() => {
    const totalItems = recommendedEvents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      limit: itemsPerPage
    };
  }, [recommendedEvents.length, currentPage]);

  /**
   * 전체 행사 데이터 및 사용자 선호 태그 가져오기
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 전체 행사 데이터 가져오기
      const eventsResponse = await EventService.getEvents({ 
        page: 1, 
        limit: 1000,
        sort: 'created_at',
        order: 'desc'
      });
      
      setAllEvents(eventsResponse.events);

      // 로그인한 사용자의 선호 태그 가져오기 (추후 백엔드 API 추가 시 사용)
      if (isAuthenticated && user) {
        try {
          // TODO: 백엔드에 User API에 tags 필드 추가 후 활성화
          // const userProfile = await UserService.getMe();
          // if (userProfile.tags) {
          //   setUserPreferredTags(userProfile.tags);
          // }
          
          // 임시: 빈 배열로 설정 (추후 API 연동 대비)
          setUserPreferredTags([]);
        } catch (err) {
          console.warn('Failed to fetch user preferred tags:', err);
          setUserPreferredTags([]);
        }
      }
    } catch (err) {
      const errorMessage = '추천 행사를 불러오는데 실패했습니다.';
      setError(errorMessage);
      ErrorHandler.handle(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * 태그 추가 핸들러
   */
  const addTag = useCallback((tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setCurrentPage(1); // 태그 변경 시 첫 페이지로 리셋
    }
  }, [selectedTags]);

  /**
   * 태그 제거 핸들러
   */
  const removeTag = useCallback((tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    setCurrentPage(1);
  }, [selectedTags]);

  /**
   * 모든 태그 선택 해제
   */
  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
    setCurrentPage(1);
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
    fetchData();
  }, [fetchData]);

  /**
   * 사용자 선호 태그 업데이트
   */
  const updatePreferredTags = useCallback(async (tags: string[]) => {
    if (!isAuthenticated || !user) return;

    try {
      // TODO: 백엔드 API 추가 후 활성화
      // await EventService.updateUserPreferredTags(user.id, tags);
      setUserPreferredTags(tags);
      setCurrentPage(1);
    } catch (err) {
      ErrorHandler.handle(err);
      throw err;
    }
  }, [isAuthenticated, user]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    recommendedEvents: paginatedEvents,
    featuredImages,
    userPreferredTags,
    availableTags,
    selectedTags,
    loading,
    error,
    pagination,
    setSelectedTags,
    addTag,
    removeTag,
    clearAllTags,
    loadMore,
    refresh,
    updatePreferredTags
  };
};