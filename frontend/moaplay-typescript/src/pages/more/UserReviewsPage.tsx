import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import * as R from '../../types/reviews';
import { FaArrowLeft } from 'react-icons/fa';
import * as ReviewApi from '../../services/reviewsApi';
import ReviewCard from '../../components/ReviewCard';
import ReviewDetail from '../../components/ReviewDetail';
import * as S from '../../styles/ReviewsPage.styles';
import { useReview } from '../../hooks/useReview';
import { useModal } from '../../hooks/useModal';
import Modal from '../../components/common/Modal';
import ReviewForm from '../../components/ReviewForm';
import { useNavigate, useParams } from 'react-router-dom';

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<R.Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(1);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = Number(userId); // 숫자로 변환

  const [selectedReview, setSelectedReview] = useState<R.Review | null>(null);

  const {
    isReviewDetailModalOpen,
    isReviewModalOpen,
    openReviewDetailModal,
    closeReviewDetailModal,
    closeReviewModal,
    openReviewModal,
  } = useModal();

  const onClose = () => {
    closeReviewModal();
    setEditingReview(null);
  };

  // 리뷰 수정/삭제 로직은 커스텀 훅 사용
  const { 
    handleEditReview, 
    handleDeleteReview,
    editingReview,
    setEditingReview,
    loadMyReviews
} = useReview(openReviewModal);

  const perPage = 5; // 한 페이지에 5개

  useEffect(() => {
    const load = async () => {

      setIsLoading(true);
      try {
        // 서버에 page, per_page 넘기기
        const resp = await ReviewApi.getReviewByUser({ page, per_page: perPage, user_Id: numericUserId });

        setReviews(resp.reviews || []);

        const pagination = resp.pagination;
        if (pagination) {
          const total = pagination.total ?? 0;
          const perPageCount = pagination.per_page ?? perPage;
          const pages = Math.ceil(total / perPageCount);
          setTotalPages(pages);
          setTotal(total);
        } else {
          setTotalPages(1);
        }
      } catch (error) {
        console.error('리뷰 로딩 실패', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [page, perPage]);

  // 카드 클릭 시: 선택된 리뷰 세팅 + 상세 모달 오픈
  const handleOpenDetail = (review: R.Review) => {
    setSelectedReview(review);
    openReviewDetailModal();
  };

  return (
    <S.PageContainer>
      {/* 상단 헤더 */}
      <S.PageHeader>
        <S.BackButton onClick={() => navigate('/mypage')} aria-label="마이페이지로 돌아가기">
          <FaArrowLeft />
        </S.BackButton>
        <S.SectionTitle>리뷰 전체 보기</S.SectionTitle>
      </S.PageHeader>

      <p style={{textAlign:'right'}}>{total}개</p>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : reviews.length === 0 ? (
        <S.NoResultsWrapper>
          <S.NoResultsMessage>작성한 리뷰가 없습니다.</S.NoResultsMessage>
        </S.NoResultsWrapper>
      ) : (
        <>
          {/* 서버에서 이미 5개로 잘려온 걸 그대로 뿌리기 */}
          <S.ReviewGrid>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onClick={() => handleOpenDetail(review)}  // 상세 모달 열기
                onEdit={() => handleEditReview(review)}   // 수정 모달 열기
                onDelete={() => handleDeleteReview(review.id)} // 삭제
              />
            ))}
          </S.ReviewGrid>

          {/* 이전/다음 버튼은 실제로 넘길 페이지 있을 때만 노출 */}
          <S.Pagination>
            {page > 1 && (
              <button onClick={() => setPage((prev) => prev - 1)}>이전</button>
            )}
            <span>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <button onClick={() => setPage((prev) => prev + 1)}>다음</button>
            )}
          </S.Pagination>
        </>
      )}

      {selectedReview && (
        <ReviewDetail
          isOpen={isReviewDetailModalOpen}
          onClose={closeReviewDetailModal}
          review={selectedReview}
          onEdit={() => {
            handleEditReview(selectedReview);
            closeReviewDetailModal();
          }}
          onDelete={() => {
            handleDeleteReview(selectedReview.id);
            closeReviewDetailModal();
          }}
        />
      )}

      <Modal 
          isOpen={isReviewModalOpen} 
          onClose={onClose} 
          title=""
        >
          <ReviewForm 
            event_id={Number(editingReview?.event_id)}
            onClose={onClose}
            onReviewSubmitSuccess={loadMyReviews}
            review={editingReview || undefined} // 수정용 데이터 전달
          />
        </Modal>
    </S.PageContainer>
  );
};

export default ReviewsPage;
