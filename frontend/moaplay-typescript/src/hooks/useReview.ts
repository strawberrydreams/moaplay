import { useState, useCallback } from 'react';
import * as R from '../types/reviews';
import * as ReviewApi from '../services/reviewsApi';

// openReviewModal은 리뷰 수정 시 사용하는 모달 열기 함수
export const useReview = (openReviewModal: () => void) => {
  const [myReviews, setMyReviews] = useState<R.Review[]>([]);
  const [editingReview, setEditingReview] = useState<R.Review | null>(null);

  // ✅ 상세 보기 관련 상태
  const [selectedReview, setSelectedReview] = useState<R.Review | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 리뷰 목록 로드
  const loadMyReviews = useCallback(async () => {
    try {
      const response = await ReviewApi.getMyReview();
      setMyReviews(response.reviews || []);
    } catch (error) {
      console.error('리뷰 로딩 실패', error);
    }
  }, []);

  // 리뷰 수정
  const handleEditReview = (review: R.Review) => {
    setEditingReview(review);
    openReviewModal();
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: number) => {
    if (window.confirm('정말로 리뷰를 삭제하시겠습니까?')) {
      await ReviewApi.deleteReview(reviewId);
      loadMyReviews(); // 삭제 후 다시 불러오기
      window.location.reload();
    }
  };

  // 상세 보기 열기 / 닫기
  const openDetailModal = (review: R.Review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedReview(null);
    setIsDetailModalOpen(false);
  };

  return {
    myReviews,
    editingReview,
    setEditingReview,
    loadMyReviews,
    handleEditReview,
    handleDeleteReview,
    selectedReview,
    isDetailModalOpen,
    openDetailModal,
    closeDetailModal,
  };
};
