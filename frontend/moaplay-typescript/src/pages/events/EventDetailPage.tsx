import React, { useEffect, useMemo, useState } from 'react';
import ExpandableText from '../../components/common/ExpandableText';
import * as E from '../../types/events';
import * as R from '../../types/reviews';
import * as ReviewApi from '../../services/reviewsApi';
import * as EventApi from '../../services/eventsApi';
import * as S from '../../styles/EventDetail.styles.ts';
import { useParams } from 'react-router-dom';
import Modal from '../../components/common/Modal'
import {useModal} from '../../hooks/useModal';
import ReviewForm from '../../components/ReviewForm.tsx';
import ReviewDetail from '../../components/ReviewDetail';
import { FaImage } from 'react-icons/fa';
import {useAuth} from '../../context/AuthContext.tsx';

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
    const { currentUser } = useAuth(); // 2. 로그인 사용자 정보 가져오기
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [eventDetail, setEventDetail] = useState<E.Event>();
    const [eventReview, setEventReview] = useState<R.Review[]>([]);
    const [selectedReview, setSelectedReview] = useState<R.Review | null>(null);
    const { eventId } = useParams<{ eventId: string }>();
    const numericEventId = Number(eventId); // 숫자로 변환

    const {
        setReviewDetailModalOpen,
        isReviewModalOpen,
        isReviewDetailModalOpen,
        openReviewModal,
        closeReviewModal,
        closeReviewDetailModal
    } = useModal();

    const openDetailModal = (review: R.Review) => {
        setSelectedReview(review);
        setReviewDetailModalOpen(true);
    };

    useEffect(() => {
        const fetchEventDetail = async () => {
            if (eventId) {
                try {
                    if (!isNaN(numericEventId)) {
                        const responseEvent = await EventApi.getEventById(numericEventId);
                        setEventDetail(responseEvent || []);

                        const responseReview = await ReviewApi.getReviews({ event_id: numericEventId });
                        console.log('실제 리뷰 API 응답:', responseReview);
                        setEventReview(responseReview.reviews || []);
                        console.log('렌더링 시 eventReviews:', eventReview);
                    } else {
                        console.error("Invalid events Id format:", eventId)
                    }
                } catch (error) {
                    console.error("API 응답 실패", error)
                }
            } else {
                console.error("eventId가 없습니다.")
            }

        };
        fetchEventDetail();
    }, [eventId, eventReview, numericEventId]);

    const averageRating = useMemo(() =>
            calculateAverageRating(eventReview),
        [eventReview] // eventReviews 배열이 변경될 때만 재계산
    );

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

    // --- (리뷰 수정/삭제 핸들러 - 임시) ---
    const handleEditReview = (reviewId: number) => {
        console.log(`리뷰 수정: ${reviewId}`);
        // TODO: 리뷰 수정 모달 열기 또는 페이지 이동 로직
    };
    const handleDeleteReview = (reviewId: number) => {
        console.log(`리뷰 삭제: ${reviewId}`);
        // TODO: 리뷰 삭제 API 호출 및 목록 새로고침 로직
        if (window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
            ReviewApi.deleteReview(reviewId);
            window.location.reload();
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
            </S.EventHeader>

            {/* 2. 이미지 캐러셀 */}
            <S.ImageCarousel>
                <S.CarouselButton $direction="left" onClick={prevImage} aria-label="previous image">
                    {'<'}
                </S.CarouselButton>
                <S.ImageWrapper>
                    {/* 실제 이미지가 있다면 img, 아니면 S.Placeholder */}
                    {images.length > 0 ? (
                        <img src={images[currentImageIndex]} alt={`event image ${currentImageIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    {/* <MapComponent address={eventDetail?.location} /> */}
                </S.MapContainer>

                {/* 2. 정보 그리드 컨테이너 (2단 레이아웃) */}
                <S.InfoGridContainer>
                    {/* [좌측 열 정보] */}
                    <S.InfoList>
                        <li><span>시작일: {eventDetail?.start_date}</span></li>
                        <li><span>전화번호: {eventDetail?.phone}</span></li>
                        <li><span>주소: {eventDetail?.location}</span></li>
                        <li><span>주최: {eventDetail?.host.nickname}</span></li>
                        <li><span>이용요금: 행사 주최측에 별도 문의 바랍니다.</span></li>
                    </S.InfoList>

                    {/* [우측 열 정보] */}
                    <S.InfoList>
                        <li><span>종료일: {eventDetail?.end_date}</span></li>
                        <li><span>홈페이지: 별도 등록된 홈페이지 주소가 없습니다.</span></li>
                        <li><span>행사 장소: {eventDetail?.location}</span></li>
                        <li><span>주관: {eventDetail?.host.nickname}</span></li>
                        <li><span>행사 시간: 행사 주최측에 별도 문의 바랍니다.</span></li>
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
                <S.ReviewWriteButton onClick={openReviewModal}>글쓰기</S.ReviewWriteButton>
            </S.ReviewHeader>

            <S.ReviewGrid>
                {eventReview.length === 0 ? (
                    <p>아직 작성된 리뷰가 없습니다.</p>
                ) : (
                    eventReview.map((review) => (
                        <S.ReviewCard
                            key={review.id}
                            onClick={() => openDetailModal(review)}
                        >
                            <S.ReviewTitle>{review.title}</S.ReviewTitle> {/* 제목 추가 */}
                            <S.ReviewText>{review.content}</S.ReviewText>

                            {review.image_urls && review.image_urls.length > 0 ? (
                                <S.ReviewImageGrid>
                                    {/* 최대 2개의 썸네일 또는 이미지 플레이스홀더 */}
                                    {review.image_urls.slice(0, 2).map((url, index) => (
                                        url ? <S.ReviewThumbnail key={index} src={url} alt={`리뷰 이미지 ${index + 1}`} />
                                            : <S.ReviewImagePlaceholder key={index}><FaImage /></S.ReviewImagePlaceholder>
                                    ))}
                                    {/* 이미지가 1개일 경우 두 번째 플레이스홀더 추가 (선택 사항) */}
                                    {review.image_urls.length === 1 && <S.ReviewImagePlaceholder><FaImage /></S.ReviewImagePlaceholder>}
                                </S.ReviewImageGrid>
                            ) : (
                                <S.ReviewImageGrid>
                                </S.ReviewImageGrid>
                            )}

                            <S.ReviewFooter> {/* 하단 푸터로 묶음 */}
                                <S.UserInfoWrapper>
                                    <S.UserProfileImage src={review.user.profile_image || '/default-profile.png'} alt={review.user.nickname} />
                                    <S.UserDetails>
                                        <S.ReviewUser>{review.user.nickname}</S.ReviewUser>
                                        <S.ReviewDate>{new Date(review.created_at).toLocaleDateString()}</S.ReviewDate>
                                    </S.UserDetails>
                                </S.UserInfoWrapper>
                                <S.ReviewRating>{renderStars(review.rating)}</S.ReviewRating>
                            </S.ReviewFooter>

                            {currentUser && currentUser.id === review.user.id && ( // 로그인했고 작성자와 ID가 같으면
                                <S.ReviewActions onClick={(e) => e.stopPropagation()}> {/* 카드 클릭 방지 */}
                                    <S.ActionButton onClick={() => handleEditReview(review.id)}>
                                        수정
                                    </S.ActionButton>
                                    <S.ActionButton danger onClick={() => handleDeleteReview(review.id)}>
                                        삭제
                                    </S.ActionButton>
                                </S.ReviewActions>
                            )}

                        </S.ReviewCard>
                    ))
                )}
            </S.ReviewGrid>

            <Modal
                isOpen={isReviewModalOpen}
                onClose={closeReviewModal}
                title=""
            >
                <ReviewForm
                    event_id={Number(eventId)}
                    onClose={closeReviewModal}
                    // (선택) 리뷰 작성 성공 시 리뷰 목록 새로고침 함수 전달
                    onReviewSubmitSuccess={loadEventDetails}
                />
            </Modal>

            <ReviewDetail
                isOpen={isReviewDetailModalOpen}
                onClose={closeReviewDetailModal}
                review={selectedReview}
            />

        </S.DetailContainer>
    );
};

export default EventDetailPage;