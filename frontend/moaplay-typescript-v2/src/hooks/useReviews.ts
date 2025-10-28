/**
 * 리뷰 관련 커스텀 훅
 *
 * 리뷰 목록 조회, 생성, 수정, 삭제 등의
 * 비즈니스 로직을 관리합니다.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReviewService } from '../services/reviewService';
import {
  ReviewListItem,
  ReviewListParams,
  ReviewListResponse,
} from '../types/reviews';
import { LoadingState } from '../types';
import { useAuth } from './useAuth.ts';
import { useReviewSync } from '../contexts/ReviewContext';

// 로컬 쿼리 타입: ReviewListParams(이벤트 스코프) + 선택적 user_id(유저 스코프)
type ReviewQuery = Partial<ReviewListParams> & { user_id?: number };

/**
 * 리뷰 목록 훅의 반환 타입
 */
export interface UseReviewsReturn {
  reviews: ReviewListItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalReviews: number;
  averageRating?: number;
  ratingDistribution?: { [key: number]: number };
  refreshReviews: () => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  addReview: (review: ReviewListItem) => void;
  updateReview: (review: ReviewListItem) => void;
  removeReview: (reviewId: number) => void;
}

/**
 * 리뷰 목록을 관리하는 커스텀 훅
 *
 * @param params 리뷰 조회 파라미터
 * @returns 리뷰 목록과 관련 액션들
 */
export const useReviews = (params: ReviewQuery = {}): UseReviewsReturn => {
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution] = useState<
    { [key: number]: number } | undefined
  >();
  
  // 평균 평점을 리뷰 목록에서 계산
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  // ⚓ params 객체가 렌더마다 새로 생겨 무한 재요청되는 것을 방지
  useMemo(() => JSON.stringify(params || {}), [params]);
  const stableParams = useMemo(() => params || {}, [params]);
  const inFlightRef = useRef(false);

  /**
   * 리뷰 목록을 조회합니다
   */
  const fetchReviews = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (inFlightRef.current) return; // 동시 중복 요청 차단
      inFlightRef.current = true;
      try {
        if (reset) {
          setLoadingState({ isLoading: true, error: null });
        }

        const response: ReviewListResponse = await ReviewService.getReviews({
          event_id: stableParams.event_id ?? 0,
          page,
          per_page: stableParams.per_page ?? 20,
        });

        if (reset) {
          setReviews(response.reviews);
        } else {
          setReviews(prev => [...prev, ...response.reviews]);
        }

        setHasMore(response.pagination.page < response.pagination.pages);
        setTotalReviews(response.pagination.total);
        setCurrentPage(page);

        setLoadingState({ isLoading: false, error: null });
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setLoadingState({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : '리뷰 목록을 불러오는데 실패했습니다.',
        });
        // 404 같은 경우 추가 재시도를 막기 위해 더 로드할 것 없다고 표시
        setHasMore(false);
      } finally {
        inFlightRef.current = false;
      }
    },
    [stableParams]
  );

  /**
   * 리뷰 목록을 새로고침합니다
   */
  const refreshReviews = useCallback(async () => {
    await fetchReviews(1, true);
  }, [fetchReviews]);

  /**
   * 더 많은 리뷰를 로드합니다
   */
  const loadMoreReviews = useCallback(async () => {
    if (!loadingState.isLoading && hasMore) {
      await fetchReviews(currentPage + 1, false);
    }
  }, [loadingState.isLoading, hasMore, currentPage, fetchReviews]);

  /**
   * 새 리뷰를 목록에 추가합니다
   */
  const addReview = useCallback((review: ReviewListItem) => {
    setReviews(prev => [review, ...prev]);
    setTotalReviews(prev => prev + 1);
  }, []);

  /**
   * 기존 리뷰를 업데이트합니다
   */
  const updateReview = useCallback((updatedReview: ReviewListItem) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  }, []);

  /**
   * 리뷰를 목록에서 제거합니다
   */
  const removeReview = useCallback((reviewId: number) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
    setTotalReviews(prev => Math.max(0, prev - 1));
  }, []);

  // 파라미터 변경 시 리뷰 목록 새로고침
  useEffect(() => {
    fetchReviews(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableParams.event_id, stableParams.per_page]);

  // 리뷰 변경 이벤트 구독 (전역 동기화)
  useReviewSync(stableParams.event_id, event => {
    if (event.type === 'created' && event.review) {
      // 새 리뷰 추가
      addReview(event.review as unknown as ReviewListItem);
    } else if (event.type === 'updated' && event.review) {
      // 리뷰 업데이트
      updateReview(event.review as unknown as ReviewListItem);
    } else if (event.type === 'deleted' && event.reviewId) {
      // 리뷰 삭제
      removeReview(event.reviewId);
    }
  });

  return {
    reviews,
    loading: loadingState.isLoading,
    error: loadingState.error ?? null,
    hasMore,
    totalReviews,
    averageRating,
    ratingDistribution,
    refreshReviews,
    loadMoreReviews,
    addReview,
    updateReview,
    removeReview,
  };
};

/**
 * 특정 행사의 리뷰 목록을 관리하는 커스텀 훅
 *
 * @param eventId 행사 ID
 * @param params 추가 조회 파라미터
 * @returns 행사별 리뷰 목록과 관련 액션들
 */
export const useEventReviews = (
  eventId: number,
  params: Omit<ReviewListParams, 'event_id'> = {}
): UseReviewsReturn => {
  return useReviews({ ...params, event_id: eventId });
};

/**
 * 내 리뷰 목록을 관리하는 커스텀 훅
 *
 * @param params 추가 조회 파라미터
 * @returns 내 리뷰 목록과 관련 액션들
 */
export const useMyReviews = (
  params: Partial<Omit<ReviewListParams, 'event_id'>> = {}
): UseReviewsReturn => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  // ⚓ params 안정화로 불필요한 재호출 방지
  useMemo(() => JSON.stringify(params || {}), [params]);
  const stableMyParams = useMemo(() => params || {}, [params]);
  const inFlightMyRef = useRef(false);

  /**
   * 내 리뷰 목록을 조회합니다
   */
  const fetchMyReviews = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (inFlightMyRef.current) return;
      inFlightMyRef.current = true;
      try {
        if (reset) {
          setLoadingState({ isLoading: true, error: null });
        }

        if (!isAuthenticated || !userId) {
          setReviews([]);
          setTotalReviews(0);
          setLoadingState({ isLoading: false, error: null });
          return;
        }

        const response: ReviewListResponse = await ReviewService.getMyReviews(
          userId,
          page
        );

        if (reset) {
          setReviews(response.reviews);
        } else {
          setReviews(prev => [...prev, ...response.reviews]);
        }

        setHasMore(response.pagination.page < response.pagination.pages);
        setTotalReviews(response.pagination.total);
        setCurrentPage(page);

        setLoadingState({ isLoading: false, error: null });
      } catch (error) {
        console.error('Failed to fetch my reviews:', error);
        setLoadingState({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : '내 리뷰 목록을 불러오는데 실패했습니다.',
        });
        setHasMore(false);
      } finally {
        inFlightMyRef.current = false;
      }
    },
    [isAuthenticated, userId]
  );

  /**
   * 내 리뷰 목록을 새로고침합니다
   */
  const refreshReviews = useCallback(async () => {
    await fetchMyReviews(1, true);
  }, [fetchMyReviews]);

  /**
   * 더 많은 내 리뷰를 로드합니다
   */
  const loadMoreReviews = useCallback(async () => {
    if (!loadingState.isLoading && hasMore) {
      await fetchMyReviews(currentPage + 1, false);
    }
  }, [loadingState.isLoading, hasMore, currentPage, fetchMyReviews]);

  /**
   * 새 리뷰를 목록에 추가합니다
   */
  const addReview = useCallback((review: ReviewListItem) => {
    setReviews(prev => [review, ...prev]);
    setTotalReviews(prev => prev + 1);
  }, []);

  /**
   * 기존 리뷰를 업데이트합니다
   */
  const updateReview = useCallback((updatedReview: ReviewListItem) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  }, []);

  /**
   * 리뷰를 목록에서 제거합니다
   */
  const removeReview = useCallback((reviewId: number) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
    setTotalReviews(prev => Math.max(0, prev - 1));
  }, []);

  // 파라미터 변경 시 리뷰 목록 새로고침
  useEffect(() => {
    fetchMyReviews(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId, stableMyParams.per_page]);

  // 리뷰 변경 이벤트 구독 (전역 동기화) - 모든 이벤트 감지
  useReviewSync(undefined, event => {
    if (event.type === 'created' && event.review && 'user' in event.review) {
      const reviewUser = (event.review as any).user;
      // 내가 작성한 리뷰만 추가
      if (reviewUser && reviewUser.id === userId) {
        addReview(event.review as unknown as ReviewListItem);
      }
    } else if (
      event.type === 'updated' &&
      event.review &&
      'user' in event.review
    ) {
      const reviewUser = (event.review as { user?: { id?: number } }).user;
      // 내 리뷰 업데이트
      if (reviewUser && reviewUser.id === userId) {
        updateReview(event.review as unknown as ReviewListItem);
      }
    } else if (event.type === 'deleted' && event.reviewId) {
      // 내 리뷰 삭제
      removeReview(event.reviewId);
    }
  });

  return {
    reviews,
    loading: loadingState.isLoading,
    error: loadingState.error ?? null,
    hasMore,
    totalReviews,
    averageRating: undefined,
    ratingDistribution: undefined,
    refreshReviews,
    loadMoreReviews,
    addReview,
    updateReview,
    removeReview,
  };
};

/**
 * 특정 사용자의 리뷰 목록을 관리하는 커스텀 훅
 *
 * @param _userId
 * @param params 추가 조회 파라미터
 * @returns 사용자별 리뷰 목록과 관련 액션들
 */
export const useUserReviews = (
  _userId: number,
  params: Omit<ReviewListParams, 'event_id'> = {}
): UseReviewsReturn => {
  return useReviews({ ...params, event_id: 0 });
};
