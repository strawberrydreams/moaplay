/**
 * 찜하기 관련 커스텀 훅
 * 
 * 찜하기 상태 관리, 토글 기능, 찜 목록 조회 등의 로직을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { FavoriteService } from '../services/favoriteService';
import { FavoriteListItem, FavoritePaginationInfo } from '../types/favorites';
import { useAuth } from './useAuth';

/**
 * 찜하기 토글 훅 (낙관적 업데이트 적용)
 * @param eventId 행사 ID
 * @param initialFavoriteState 초기 찜하기 상태
 */
export const useFavoriteToggle = (eventId: number, initialFavoriteState = false) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialFavoriteState);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 초기 찜하기 상태 확인
   * 사용자의 찜 목록에서 해당 이벤트가 있는지 확인하고 favoriteId를 설정
   */
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) {
        setIsFavorite(false);
        setFavoriteId(null);
        return;
      }

      try {
        const response = await FavoriteService.getFavorites();
        const favorite = response.favorites.find(f => f.event.id === eventId);
        
        if (favorite) {
          setIsFavorite(true);
          setFavoriteId(favorite.id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (err) {
        console.error('찜하기 상태 확인 실패:', err);
        setIsFavorite(initialFavoriteState);
        setFavoriteId(null);
      }
    };

    checkFavoriteStatus();
  }, [eventId, isAuthenticated, initialFavoriteState]);

  /**
   * 찜하기 토글 실행 (낙관적 업데이트)
   *
   * 1. 즉시 UI 상태 변경 (낙관적 업데이트)
   * 2. 서버 API 호출
   * 3. 실패 시 이전 상태로 롤백
   */
  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    if (loading) return isFavorite;

    // 낙관적 업데이트: 즉시 UI 상태 변경
    const previousState = isFavorite;
    const previousFavoriteId = favoriteId;
    const optimisticState = !isFavorite;
    setIsFavorite(optimisticState);
    setLoading(true);
    setError(null);

    try {
      if (isFavorite && favoriteId) {
        // 찜하기 제거
        await FavoriteService.removeFavorite(favoriteId);
        setFavoriteId(null);
        return false;
      } else {
        // 찜하기 추가
        const favorite = await FavoriteService.addFavorite({ event_id: eventId });
        setFavoriteId(favorite.id);
        return true;
      }
    } catch (err) {
      // 실패 시 이전 상태로 롤백
      setIsFavorite(previousState);
      setFavoriteId(previousFavoriteId);

      const errorMessage = err instanceof Error ? err.message : '찜하기 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [eventId, isAuthenticated, isFavorite, favoriteId, loading]);

  return {
    isFavorite,
    loading,
    error,
    toggleFavorite,
    setIsFavorite // 외부에서 상태 업데이트 가능
  };
};

/**
 * 사용자 찜 목록 훅 (낙관적 업데이트 및 캐시 무효화 지원)
 */
export const useUserFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteListItem[]>([]);
  const [pagination, setPagination] = useState<FavoritePaginationInfo>({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 찜 목록 조회
   */
  const fetchFavorites = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await FavoriteService.getFavorites();
      // FavoriteListResponse: { favorites, total }
      setFavorites(response.favorites);
      const { pagination } = response;
      setPagination({
        page: pagination.page ?? page,
        per_page: pagination.per_page ?? limit,
        total: pagination.total,
        pages:
          pagination.pages ??
          Math.max(1, Math.ceil(pagination.total / (pagination.per_page ?? limit))),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '찜 목록 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * 찜하기 삭제 (낙관적 업데이트)
   *
   * 1. 즉시 목록에서 제거 (낙관적 업데이트)
   * 2. 서버 API 호출
   * 3. 실패 시 목록 새로고침으로 복구
   */
  const removeFavorite = useCallback(async (favoriteId: number) => {
    // 낙관적 업데이트: 즉시 목록에서 제거
    const previousFavorites = favorites;
    const previousPagination = pagination;

    setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1)
    }));

    try {
      await FavoriteService.removeFavorite(favoriteId);
    } catch (err) {
      // 실패 시 이전 상태로 롤백
      setFavorites(previousFavorites);
      setPagination(previousPagination);

      const errorMessage = err instanceof Error ? err.message : '찜하기 삭제 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    }
  }, [favorites, pagination]);

  /**
   * 찜하기 추가 (낙관적 업데이트)
   *
   * 외부에서 찜하기 추가 시 목록을 즉시 갱신합니다.
   */
  const addFavorite = useCallback((favorite: FavoriteListItem) => {
    setFavorites(prev => [favorite, ...prev]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1
    }));
  }, []);

  /**
   * 페이지 변경
   */
  const changePage = useCallback((page: number) => {
    fetchFavorites(page, pagination.per_page);
  }, [fetchFavorites, pagination.per_page]);

  /**
   * 새로고침 (캐시 무효화)
   */
  const refresh = useCallback(() => {
    fetchFavorites(pagination.page, pagination.per_page);
  }, [fetchFavorites, pagination.page, pagination.per_page]);

  /**
   * 특정 이벤트의 찜 상태 업데이트
   *
   * 다른 컴포넌트에서 찜하기 토글 시 목록 동기화에 사용
   */
  const updateFavoriteStatus = useCallback((eventId: number, isFavorite: boolean) => {
    if (isFavorite) {
      // 찜하기 추가 - 전체 목록 새로고침 필요 (favorite 객체 정보 필요)
      refresh();
    } else {
      // 찜하기 제거 - 즉시 목록에서 제거 (event.id로 필터링)
      setFavorites(prev => prev.filter(fav => fav.event.id !== eventId));
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    }
  }, [refresh]);

  // 인증 상태 변경 시 자동 조회
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setError(null);
    }
  }, [isAuthenticated, fetchFavorites]);

  return {
    favorites,
    pagination,
    loading,
    error,
    fetchFavorites,
    removeFavorite,
    addFavorite,
    changePage,
    refresh,
    updateFavoriteStatus
  };
};

/**
 * 다중 찜하기 상태 확인 훅
 */
export const useMultipleFavoriteStatus = (eventIds: number[]) => {
  const { isAuthenticated } = useAuth();
  const [favoriteStatus, setFavoriteStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    if (!isAuthenticated || eventIds.length === 0) {
      setFavoriteStatus({});
      return;
    }

    setLoading(true);
    try {
      const response = await FavoriteService.getFavorites();
      const favoriteIdSet = new Set<number>(response.favorites.map(f => f.id));
      const status: Record<number, boolean> = {};
      for (const id of eventIds) {
        status[id] = favoriteIdSet.has(id);
      }
      setFavoriteStatus(status);
    } catch (error) {
      console.error('찜하기 상태 확인 실패:', error);
      setFavoriteStatus({});
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, eventIds]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return {
    favoriteStatus,
    loading,
    refresh: checkFavoriteStatus
  };
};