// hooks/useMyReviews.ts
import { useState, useCallback } from 'react';
import * as R from '../types/reviews';
import * as ReviewApi from '../services/reviewsApi';

export const useReview = (openReviewModal: () => void) => {
  const [myReviews, setMyReviews] = useState<R.Review[]>([]);
  const [editingReview, setEditingReview] = useState<R.Review | null>(null);

  const loadMyReviews = useCallback(async () => {
    try {
      const response = await ReviewApi.getMyReview();
      setMyReviews(response.reviews || []);
    } catch (error) {
      console.error('리뷰 로딩 실패', error);
    }
  }, []);

  const handleEditReview = (review: R.Review) => {
    setEditingReview(review);
    openReviewModal(); 
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
      await ReviewApi.deleteReview(reviewId);
      loadMyReviews(); // 데이터 새로고침
    }
  };

  return {
    myReviews,
    editingReview,
    setEditingReview,
    loadMyReviews,
    handleEditReview,
    handleDeleteReview,
  };
};