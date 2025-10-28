/**
 * 다른 사용자 프로필 관련 커스텀 훅
 * 
 * 다른 사용자의 공개 프로필 정보, 찜한 행사, 작성한 리뷰를 조회합니다.
 * 개인정보는 제외하고 공개 정보만 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../services/userService';
import { UserSummary, UserRole } from '../types';
import { FavoriteListItem } from '../types/favorites';
import { ReviewListItem } from '../types/reviews';

// 안전한 타입 가드: 임의의 아이템을 ReviewListItem로 좁히기
const toReviewApi = (item: unknown): ReviewListItem | null => {
  if (
    item &&
    typeof item === 'object' &&
    'user' in item &&
    'event' in item &&
    'updated_at' in item
  ) {
    return item as ReviewListItem;
  }
  return null;
};

// 안전한 타입 가드: 임의의 아이템을 FavoriteListItem로 좁히기
const toFavoriteApi = (item: unknown): FavoriteListItem | null => {
  if (
    item &&
    typeof item === 'object' &&
    'user' in item &&
    'event' in item
  ) {
    return item as FavoriteListItem;
  }
  return null;
};

/**
 * 사용자 프로필 훅 반환 타입
 */
export interface UseUserProfileReturn {
  // 사용자 정보 (공개 정보만)
  user: UserSummary | null;
  userLoading: boolean;
  userError: string | null;

  // 찜한 행사
  favorites: FavoriteListItem[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  totalFavorites: number;
  hasMoreFavorites: boolean;

  // 작성한 리뷰
  reviews: ReviewListItem[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  totalReviews: number;
  hasMoreReviews: boolean;

  // 액션 함수들
  loadMoreFavorites: () => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  refreshReviews: () => Promise<void>;
}

/**
 * 다른 사용자 프로필 관련 데이터를 관리하는 커스텀 훅
 *
 * @param userId 조회할 사용자 ID
 * @returns 사용자 프로필 관련 데이터와 함수들
 */
export const useUserProfile = (userId: number): UseUserProfileReturn => {
  // 사용자 정보 상태
  const [user, setUser] = useState<UserSummary | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // 찜한 행사 상태
  const [favorites, setFavorites] = useState<FavoriteListItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(false);

  // 작성한 리뷰 상태
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

  /**
   * 사용자 프로필 정보 로드
   * User API의 GET /api/users/{id} 엔드포인트를 사용합니다.
   */
  const loadUserProfile = useCallback(async () => {
    if (!userId) return;

    setUserLoading(true);
    setUserError(null);

    try {
      const userProfile = await UserService.getUser(userId);

      // UserProfile을 UserSummary 형식으로 변환
      const userData: UserSummary = {
        id: userProfile.id,
        nickname: userProfile.nickname,
        profile_image: userProfile.profile_image ?? undefined,
        role: (userProfile.role || 'user') as UserRole
      };

      setUser(userData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '사용자 정보를 불러오는데 실패했습니다.';
      setUserError(errorMessage);
      console.error('사용자 프로필 로드 실패:', error);
    } finally {
      setUserLoading(false);
    }
  }, [userId]);

  /**
   * 찜한 행사 목록 로드
   */
  const loadFavorites = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!userId) return;

    setFavoritesLoading(true);
    setFavoritesError(null);

    try {
      // UserService에 getUserFavorites가 없으므로 임시로 빈 배열 반환
      // TODO: UserService에 getUserFavorites 메서드 추가 필요
      const response = { items: [], pagination: { total_items: 0, current_page: page, total_pages: 1 } };

      const items: FavoriteListItem[] = (response.items ?? [])
        .map(toFavoriteApi)
        .filter((x): x is FavoriteListItem => x !== null);

      if (append) {
        setFavorites(prev => [...prev, ...items]);
      } else {
        setFavorites(items);
      }

      setTotalFavorites(response.pagination.total_items);
      setHasMoreFavorites(response.pagination.current_page < response.pagination.total_pages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '찜한 행사를 불러오는데 실패했습니다.';
      setFavoritesError(errorMessage);
      console.error('찜한 행사 로드 실패:', error);
    } finally {
      setFavoritesLoading(false);
    }
  }, [userId]);

  /**
   * 작성한 리뷰 목록 로드
   */
  const loadReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!userId) return;

    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const response = await UserService.getUserReviews(userId, page, 10);

      const items: ReviewListItem[] = (response.reviews ?? [])
        .map(toReviewApi)
        .filter((x): x is ReviewListItem => x !== null);

      if (append) {
        setReviews(prev => [...prev, ...items]);
      } else {
        setReviews(items);
      }
      
      setTotalReviews(response.pagination.total);
      setHasMoreReviews(response.pagination.page < response.pagination.pages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '작성한 리뷰를 불러오는데 실패했습니다.';
      setReviewsError(errorMessage);
      console.error('작성한 리뷰 로드 실패:', error);
    } finally {
      setReviewsLoading(false);
    }
  }, [userId]);

  /**
   * 더 많은 찜한 행사 로드
   */
  const loadMoreFavorites = useCallback(async () => {
    if (!hasMoreFavorites || favoritesLoading) return;
    
    const nextPage = favoritesPage + 1;
    setFavoritesPage(nextPage);
    await loadFavorites(nextPage, true);
  }, [hasMoreFavorites, favoritesLoading, favoritesPage, loadFavorites]);

  /**
   * 더 많은 리뷰 로드
   */
  const loadMoreReviews = useCallback(async () => {
    if (!hasMoreReviews || reviewsLoading) return;
    
    const nextPage = reviewsPage + 1;
    setReviewsPage(nextPage);
    await loadReviews(nextPage, true);
  }, [hasMoreReviews, reviewsLoading, reviewsPage, loadReviews]);

  /**
   * 프로필 정보 새로고침
   */
  const refreshProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  /**
   * 찜한 행사 새로고침
   */
  const refreshFavorites = useCallback(async () => {
    setFavoritesPage(1);
    await loadFavorites(1, false);
  }, [loadFavorites]);

  /**
   * 작성한 리뷰 새로고침
   */
  const refreshReviews = useCallback(async () => {
    setReviewsPage(1);
    await loadReviews(1, false);
  }, [loadReviews]);

  // 초기 데이터 로드
  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadFavorites(1, false);
      loadReviews(1, false);
    }
  }, [userId, loadUserProfile, loadFavorites, loadReviews]);

  return {
    // 사용자 정보
    user,
    userLoading,
    userError,
    
    // 찜한 행사
    favorites,
    favoritesLoading,
    favoritesError,
    totalFavorites,
    hasMoreFavorites,
    
    // 작성한 리뷰
    reviews,
    reviewsLoading,
    reviewsError,
    totalReviews,
    hasMoreReviews,
    
    // 액션 함수들
    loadMoreFavorites,
    loadMoreReviews,
    refreshProfile,
    refreshFavorites,
    refreshReviews,
  };
};