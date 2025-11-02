// src/hooks/useFavorite.ts
import { useState, useCallback } from 'react';
import type * as F from '../types/favorites';
import * as FavoriteApi from '../services/favoritesApi';

export const useFavorite = () => {
  const [favorites, setFavorites] = useState<F.Favorite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await FavoriteApi.getFavorites();
    //   console.log("res:", res);
      setFavorites(res.favorites || []);
    //   console.log("favorites inside hook:", favorites);
    } catch (err) {
      console.error('좋아요 목록 불러오기 실패:', err);
      setError('좋아요 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  const toggleFavorite = useCallback(async (event_id: number, isCurrentlyFavorited: boolean, favoriteId?: number) => {
    setError(null);
    try {
      if (isCurrentlyFavorited && favoriteId) {
        await FavoriteApi.deleteFavorite(favoriteId);
        // 삭제 성공 시 상태에서 제거
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      } else {
        await FavoriteApi.addFavorite(event_id);
        // 추가 성공 시 다시 불러오거나 새로운 항목 추가
        const res = await FavoriteApi.getFavorites();
        setFavorites(res.favorites || []);
      }
    } catch (err) {
      console.error('찜 토글 실패:', err);
      setError('찜 처리 중 오류가 발생했습니다.');
    }
  }, []);

  return {
    favorites,
    isLoading,
    error,
    loadFavorites,
    toggleFavorite,
  };
};
