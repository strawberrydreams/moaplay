import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapComponent from '../../components/common/MapComponent';
import ExpandableText from '../../components/common/ExpandableText';
import * as E from '../../types/events';
import * as R from '../../types/reviews';

import * as ReviewApi from '../../services/reviewsApi';
import * as EventApi from '../../services/eventsApi';
import * as ScheduleApi from '../../services/schedulesApi';

import * as S from '../../styles/EventDetail.styles';
import { FaImage, FaHeart, FaRegHeart, FaRegCalendarPlus, FaEdit, FaTrash } from 'react-icons/fa';

import Modal from '../../components/common/Modal'
import {useModal} from '../../hooks/useModal';
import {useReview} from '../../hooks/useReview';
import { useFavorite } from '../../hooks/useFavorite';
import ReviewForm from '../../components/ReviewForm';
import ReviewDetail from '../../components/ReviewDetail';
import ReviewCard from '../../components/ReviewCard';

import {useAuthContext} from '../../contexts/AuthContext';
import { NotificationFormDropdown } from '../../components/NotificationFormDropdown';



  // 리뷰 배열을 받아 평균 평점을 계산하는 함수
const calculateAverageRating = (reviews: R.Review[]): number => {
  // 👇 reviews가 배열이 아니면 0점 반환
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = totalRating / reviews.length;
  return parseFloat(average.toFixed(1)); 
};


const EventDetailPage: React.FC = () => {
  const { user, schedules } = useAuthContext(); // 2. 로그인 사용자 정보 가져오기
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [eventDetail, setEventDetail] = useState<E.Event>();
  const [eventReview, setEventReview] = useState<R.Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<R.Review | null>(null);
  const { eventId } = useParams<{ eventId: string }>();
  const numericEventId = Number(eventId); // 숫자로 변환

  const navigate = useNavigate();

  const { favorites, loadFavorites, toggleFavorite, isLoading } = useFavorite();

  const favoriteItem = favorites.find(fav => fav.event?.id === numericEventId);
  const isFavorited = !!favoriteItem

  const { 
      setReviewDetailModalOpen,
      isReviewModalOpen,
      isReviewDetailModalOpen,
      openReviewModal,
      closeReviewModal,
      closeReviewDetailModal,
      openLoginModal,
  } = useModal();

  const {
      editingReview,
      setEditingReview,
      handleEditReview,
      handleDeleteReview,
    } = useReview(openReviewModal);

  const openDetailModal = (review: R.Review) => {
    setSelectedReview(review);
    setReviewDetailModalOpen(true);
  };

  useEffect(() => {
  const fetchEventDetail = async () => {
    if (!eventId) return;
    try {
      const responseEvent = await EventApi.getEventById(numericEventId);
      setEventDetail(responseEvent);

      const responseReview = await ReviewApi.getReviews({ event_id: numericEventId });
      setEventReview(responseReview.reviews || []);
      } catch (error) {
      console.error("API 실패", eventId);
    }
  };
  fetchEventDetail();
}, [eventId]);

  const averageRating = useMemo(() => 
    calculateAverageRating(eventReview), 
    [eventReview] // eventReviews 배열이 변경될 때만 재계산
  );

  useEffect(() => {
    loadFavorites();
  },[loadFavorites])

  // 이미지 배열 (가드)
  const images: string[] = Array.isArray(eventDetail?.image_urls) ? eventDetail.image_urls : [];


  const nextImage = (): void => {
    setCurrentImageIndex((prev) => (prev + 1) % (images.length || 1));
  };

  const prevImage = (): void => {
    setCurrentImageIndex((prev) => (prev - 1 + (images.length || 1)) % (images.length || 1));
  };

  const renderStars = (rating: number): string => {
    const r = Math.max(0, Math.min(5, Math.floor(rating)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  const loadEventDetails = async () => {
    try {
      const response = await ReviewApi.getReviews({ event_id: numericEventId });
      setEventReview(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load reviews', error);
      setEventReview([]);
    }
  }

  const onClose = () => {
    closeReviewModal();
    setEditingReview(null);
  }

    const handleFavoriteClick = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    toggleFavorite(numericEventId, isFavorited, favoriteItem?.id);
    };

  const handleAddSchedule = async() => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (schedules.some((s) => s.event?.id === numericEventId)) {
      alert("이미 캘린더에 들어가있는 행사입니다!")
    } else {
      await ScheduleApi.addSchedule(numericEventId);
      alert("캘린더에 일정이 추가되었습니다!"); // 실제 캘린더 연동은 별도 구현 필요
    }
  };

  const handleEditEvent = () => {
    if (!eventDetail) return;

    navigate(`/events/${eventDetail.id}/edit`);
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("정말로 이 행사를 삭제하시겠습니까?")) return;

    try {
      await EventApi.deleteEvent(numericEventId);
      alert("행사가 성공적으로 삭제되었습니다.");
      navigate('/'); // 삭제 후 홈 또는 행사 목록 페이지로 이동
    } catch (error) {
      console.error("행사 삭제 중 오류 발생", error);
      alert("행사 삭제에 실패했습니다.");
    }
  };


  return (
    <S.DetailContainer>
      {/* 1. 이벤트 제목 및 요약 */}
      <S.EventHeader>
        <S.EventTitle>{eventDetail?.title}</S.EventTitle>
        <S.EventLocation>
          {eventDetail?.location}{' '}
          {(eventDetail?.start_date)} ~{' '}
          {(eventDetail?.end_date)}
        </S.EventLocation>
        <S.EventSummary>{eventDetail?.summary}</S.EventSummary>

        {/* 버튼 그룹 */}
        <S.ImageActionGroup>
          <button onClick={handleFavoriteClick}  disabled={isLoading} title="찜하기">
            {isFavorited ? 
            <FaHeart color="#e25555" size={20} /> 
            : 
            <FaRegHeart color="#1E1E1E" size={20} />}
          </button>
          <button onClick={handleAddSchedule} title="일정 추가">
            <FaRegCalendarPlus color="#1E1E1E" size={20} />
          </button>
            {user && (
              (user.role === 'admin' || (user.role === 'host' && user.id === eventDetail?.host.id))
            ) && (
              <>
              {/* 알림 드롭다운 */}
               <NotificationFormDropdown
                  eventId={eventDetail?.id}
                  position={"left"}
                />
                <button onClick={handleEditEvent} title="행사 수정">
                  <FaEdit color="#4C8DFF" size={20} />
                </button>
                <button onClick={handleDeleteEvent} title="행사 삭제">
                  <FaTrash color="#e25555" size={20} />
                </button>
              </>
            )}
        </S.ImageActionGroup>
      </S.EventHeader>
      {/* 2. 이미지 캐러셀 */}
      <S.ImageCarousel>
        <S.CarouselButton $direction="left" onClick={prevImage} aria-label="previous image">
          {'<'}
        </S.CarouselButton>
        <S.ImageWrapper>
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={`event image ${currentImageIndex + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <S.Placeholder>이미지 {currentImageIndex + 1}</S.Placeholder>
          )}
        </S.ImageWrapper>
        <S.CarouselButton $direction="right" onClick={nextImage} aria-label="next image">
          {'>'}
        </S.CarouselButton>
        <S.DotContainer>
          {(images.length > 0 ? images : new Array(1).fill('')).map((_, index) => (
            <S.Dot key={index} $active={index === currentImageIndex} onClick={() => setCurrentImageIndex(index)} />
          ))}
        </S.DotContainer>
      </S.ImageCarousel>

      {/* 3. 상세 정보 */}
      <S.SectionTitle>상세 정보</S.SectionTitle>
      <S.ContentBlock>
        <ExpandableText content={eventDetail?.description} />
      </S.ContentBlock>

      {/* 4. 지도 및 일정 정보 섹션 */}
      <S.MapInfoSection>
        {/* 1. 지도 컨테이너 */}
        <S.MapContainer>
          <MapComponent address={eventDetail?.location} />
        </S.MapContainer>

        {/* 2. 정보 그리드 컨테이너 (2단 레이아웃) */}
        <S.InfoGridContainer>
          {/* [좌측 열 정보] */}
          <S.InfoList>
            <li><span>시작일 <p>{eventDetail?.start_date}</p></span></li>
            <li><span>주소 <p>{eventDetail?.location}</p></span></li>
            <li><span>주관 <p>{eventDetail?.hosted_by}</p></span></li>
          </S.InfoList>

          {/* [우측 열 정보] */}
          <S.InfoList>
            <li><span>종료일 <p>{eventDetail?.start_date}</p></span></li>
            <li><span>전화번호 <p>{eventDetail?.phone}</p></span></li>
            <li><span>주최 <p>{eventDetail?.organizer}</p></span></li>
          </S.InfoList>
        </S.InfoGridContainer>
      </S.MapInfoSection>

      {/* 5. 리뷰 섹션 (집계만 표시) */}
      <S.SectionTitle>리뷰</S.SectionTitle>
      <S.ReviewHeader>
        <S.ReviewStats>
          <p>
            평점 <span>{averageRating}점</span>
          </p>
          <p>
            총 <span>{eventReview?.length}개</span>
          </p>
        </S.ReviewStats>
        <S.ReviewWriteButton onClick={() => {
          if (user) {
            openReviewModal();
          } else {
            openLoginModal(); // 🔥 비로그인 시 로그인 유도
          }
        }}>
          글쓰기
        </S.ReviewWriteButton>
      </S.ReviewHeader>

      <S.ReviewGrid>
          {eventReview.length === 0 ? (
          <p>아직 작성된 리뷰가 없습니다.</p>
        ) : (
          eventReview.map((review) => (
            <ReviewCard
              review = {review}
               onClick = {() => openDetailModal(review)}
               onEdit = {()=>{handleEditReview(review)}}
               onDelete = {()=>{handleDeleteReview(review.id)}}
            />
          ))
        )}
      </S.ReviewGrid>

      <Modal 
        isOpen={isReviewModalOpen} 
        onClose={onClose} 
        title=""
      >
        <ReviewForm 
          event_id={Number(eventId)}
          onClose={onClose}
          onReviewSubmitSuccess={loadEventDetails}
          review={editingReview || undefined} // 수정용 데이터 전달
        />
      </Modal>

      <ReviewDetail
          isOpen={isReviewDetailModalOpen}
          onClose={closeReviewDetailModal}
          review={selectedReview}
          onEdit={(review) => {
            handleEditReview(review);
            closeReviewDetailModal();
          }}
          onDelete={(reviewId) => {
            handleDeleteReview(reviewId);
            closeReviewDetailModal();
          }}
      />

    </S.DetailContainer>
  );
};

export default EventDetailPage;