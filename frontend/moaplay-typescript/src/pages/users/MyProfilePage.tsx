import React, { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import * as UserApi from '../../services/usersApi';
import * as EventApi from '../../services/eventsApi';
import { useAuthContext } from '../../contexts/AuthContext';
import { useModal } from '../../hooks/useModal';
import { useReview } from '../../hooks/useReview';
import { useFavorite } from '../../hooks/useFavorite';

import type * as U from '../../types/users';
import type * as R from '../../types/reviews';
import * as E from '../../types/events';

import EventCard from '../../components/events/EventCard';
import ReviewCard from '../../components/reviews/ReviewCard'
import Modal from '../../components/common/Modal';
import { ProfileUploadModal } from '../../components/users/ProfileUploadModal';
import DeleteAccountForm from '../../components/auth/DeleteAccountForm';
import ChangePasswordForm from '../../components/auth/ChangePasswordForm';
import FieldEditForm from '../../components/common/FieldEditForm';
import HostApplyPage from '../HostApplyPage';
import defaultImage from '../../assets/default-profile.png';
import BeatLoader from "react-spinners/BeatLoader";
import ReviewDetail from '../../components/reviews/ReviewDetail';
import ReviewForm from '../../components/reviews/ReviewForm';

import * as S from '../../styles/pages/MyProfilePage.styles';
import { FaPencilAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import UpdateSelectTagsForm from '../../components/auth/UpdateSelectTagsForm';


type EditableUserField = 'nickname' | 'email' | 'phone' | 'password' | 'tags';

const fieldLabels: Record<string, string> = {
    nickname: '닉네임',
    email: '이메일',
    phone: '전화번호',
};

const override: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
    height: "100vh"
};

const MyProfilePage: React.FC = () => {
    const [userData, setUserData] = useState<U.Users | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingField, setEditingField] = useState<EditableUserField | null>(null);
    const [selectedReview, setSelectedReview] = useState<R.Review | null>(null);
    const [myEvents, setMyEvent] = useState<E.Event[]>([]);


    // ★ 추가된 상태 (스크롤 감지용)
    const [isAtStartFavorites, setIsAtStartFavorites] = useState(true);
    const [isAtEndFavorites, setIsAtEndFavorites] = useState(false);
    const [isAtStartEvents, setIsAtStartEvents] = useState(true);
    const [isAtEndEvents, setIsAtEndEvents] = useState(false);
    const [isAtStartReviews] = useState(true);
    const [isAtEndReviews] = useState(false);

    const reviewListRef = useRef<HTMLDivElement>(null);
    const favoriteListRef = useRef<HTMLDivElement>(null);
    const myEventListRef = useRef<HTMLDivElement>(null); // ★ 작성한 행사용 ref
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const {
        isReviewModalOpen,
        isDeleteAccountModalOpen,
        isProfileModalOpen,
        isReviewDetailModalOpen,
        isHostApplyModalOpen,
        setIsProfileModalOpen,
        setIsHostApplyModalOpen,
        setReviewDetailModalOpen,
        openDeleteAccountModal,
        openReviewModal,
        closeDeleteAccountModal,
        closeReviewModal,
        closeReviewDetailModal,
    } = useModal();

    const {
        myReviews,
        editingReview,
        setEditingReview,
        loadMyReviews,
        handleEditReview,
        handleDeleteReview,
    } = useReview(openReviewModal);

    const { favorites, loadFavorites } = useFavorite();

    /** 한 번에 모든 마이페이지 데이터 로딩 */
    const loadMyPageData = useCallback(async () => {
        setIsLoading(true);
        try {
            // user / events 만 로드
            const [userRes, eventsRes] = await Promise.all([
                UserApi.getMe(),
                (userData?.role === 'host' || userData?.role === 'admin')
                    ? EventApi.getEvents({ host_id: userData?.id })
                    : Promise.resolve({ events: [] }),
            ]);

            setUserData(userRes);
            setMyEvent(eventsRes?.events || []);

            loadFavorites();
            loadMyReviews();

        } catch (error) {
            console.error("마이페이지 데이터 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userData?.id, userData?.role, loadFavorites, loadMyReviews]);

    useEffect(() => {
        loadMyPageData();
    }, [loadMyPageData]);

    useEffect(() => {
        loadMyPageData();
    }, [loadMyPageData]);


    const handleFieldUpdate = async (field: keyof U.Users, value: string) => {
        if (!userData) return;
        try {
            const payload = { [field]: value } as Partial<U.Users>;
            const updated = await UserApi.updateMe(payload);
            setUserData((prev) => prev ? { ...prev, ...updated } : prev);
            setEditingField(null);
        } catch (error) {
            console.error('필드 수정 실패:', error);
        }
    };

    const handleScroll = (ref: React.RefObject<HTMLDivElement>, setStart: any, setEnd: any) => {
        if (!ref.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = ref.current;
        setStart(scrollLeft <= 0);
        setEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    };

    const scrollFavorites = (direction: 'left' | 'right') => {
        if (!favoriteListRef.current) return;
        const scrollAmount = favoriteListRef.current.offsetWidth * 0.8;
        favoriteListRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    const scrollEvents = (direction: 'left' | 'right') => {
        if (!myEventListRef.current) return;
        const scrollAmount = myEventListRef.current.offsetWidth * 0.8;
        myEventListRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    const scrollReviews = (direction: 'left' | 'right') => {
        if (!reviewListRef.current) return;
        const scrollAmount = reviewListRef.current.offsetWidth * 0.8;
        reviewListRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        const favRef = favoriteListRef.current;
        const evtRef = myEventListRef.current;

        if (!favRef && !evtRef) return; // null일 경우 바로 return

        const handleFavScroll = () =>
            handleScroll(favoriteListRef, setIsAtStartFavorites, setIsAtEndFavorites);
        const handleEvtScroll = () =>
            handleScroll(myEventListRef, setIsAtStartEvents, setIsAtEndEvents);

        if (favRef) favRef.addEventListener('scroll', handleFavScroll);
        if (evtRef) evtRef.addEventListener('scroll', handleEvtScroll);

        // 초기 상태 세팅 시도할 때도 null 체크
        if (favRef) handleFavScroll();
        if (evtRef) handleEvtScroll();

        // cleanup 시 동일 핸들러로 제거 (익명함수로 하면 안 됨)
        return () => {
            if (favRef) favRef.removeEventListener('scroll', handleFavScroll);
            if (evtRef) evtRef.removeEventListener('scroll', handleEvtScroll);
        };
    }, [favorites, myEvents]);

    const handleAccountDeleted = () => {
        alert('회원탈퇴가 완료되었습니다.');
        navigate('/');
    };

    if (isLoading) {
        return (
            <BeatLoader color="#8b8b8bff" loading={isLoading} cssOverride={override} size={15} />
        );
    }

    if (!isLoading && !userData) {
        navigate('/');
        return null;
    }

    /* 유저 정보 없을 때 홈으로 리다이렉트 */
    const onClose = () => {
        closeReviewModal();
        setEditingReview(null);
    };

    const openDetailModal = (review: R.Review) => {
        setSelectedReview(review);
        setReviewDetailModalOpen(true);
    };

    return (
        <S.PageContainer>
            {/* --- 프로필 섹션 --- */}
            <S.ProfileSection>
                <S.ProfileAvatar src={user?.profile_image || defaultImage} alt="프로필 사진" />
                <S.ProfileInfo>
                    <S.ProfileName>{userData?.nickname}</S.ProfileName>
                    <S.ProfileUserId>{userData?.user_id}</S.ProfileUserId>
                </S.ProfileInfo>
                <S.EditProfileButton onClick={() => setIsProfileModalOpen(true)}>
                    <FaPencilAlt />
                </S.EditProfileButton>
            </S.ProfileSection>

            {/* --- 2. 기본 정보 --- */}
            <S.InfoSection>
                <S.SectionTitle>기본 정보</S.SectionTitle>
                <S.InfoRow>
                    <S.InfoLabel>닉네임</S.InfoLabel>
                    <S.InfoValue>{userData?.nickname}</S.InfoValue>
                    <S.ChangeButton onClick={() => setEditingField('nickname')}>변경</S.ChangeButton>
                </S.InfoRow>
                <S.InfoRow>
                    <S.InfoLabel>아이디</S.InfoLabel>
                    <S.InfoValue>{userData?.user_id}</S.InfoValue>
                    {/* 아이디는 변경 불가하므로 버튼 없음 */}
                </S.InfoRow>
                <S.InfoRow>
                    <S.InfoLabel>비밀번호</S.InfoLabel>
                    <S.InfoValue>************</S.InfoValue>
                    <S.ChangeButton onClick={() => setEditingField('password')}>변경</S.ChangeButton>
                </S.InfoRow>
                <S.InfoRow>
                    <S.InfoLabel>이메일</S.InfoLabel>
                    <S.InfoValue>{userData?.email}</S.InfoValue>
                    <S.ChangeButton onClick={() => setEditingField('email')}>변경</S.ChangeButton>
                </S.InfoRow>
                <S.InfoRow>
                    <S.InfoLabel>전화번호</S.InfoLabel>
                    <S.InfoValue>{userData?.phone || '-'}</S.InfoValue>
                    <S.ChangeButton onClick={() => setEditingField('phone')}>변경</S.ChangeButton>
                </S.InfoRow>
                <S.InfoRow>
                    <S.InfoLabel>선호 태그</S.InfoLabel>
                    <S.InfoValue>{(userData?.preferred_tags || []).join(', ') || '-'}</S.InfoValue>
                    <S.ChangeButton onClick={() => setEditingField('tags')}>변경</S.ChangeButton>
                </S.InfoRow>
            </S.InfoSection>

            {/* --- 리뷰 섹션 --- */}
            <section>
                <S.ListHeader>
                    <S.SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>리뷰</S.SectionTitle>
                    <S.ViewMoreButton onClick={() => navigate('/mypage/reviews')}>더보기</S.ViewMoreButton>
                </S.ListHeader>

                <S.FavoriteListContainer>
                    {myReviews.length > 0 && !isAtStartReviews && (
                        <S.ArrowButton direction="left" onClick={() => scrollReviews('left')}>
                            <FaChevronLeft />
                        </S.ArrowButton>
                    )}

                    <S.ReviewScrollContainer ref={reviewListRef}>
                        {myReviews.length === 0 ? (
                            <S.NoResultsMessage>작성한 리뷰가 없습니다.</S.NoResultsMessage>
                        ) : (
                            myReviews.slice(0, 5).map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onClick={() => openDetailModal(review)}
                                    onEdit={() => handleEditReview(review)}
                                    onDelete={() => handleDeleteReview(review.id)}
                                />
                            ))
                        )}
                    </S.ReviewScrollContainer>

                    {myReviews.length > 0 && !isAtEndReviews && (
                        <S.ArrowButton direction="right" onClick={() => scrollReviews('right')}>
                            <FaChevronRight />
                        </S.ArrowButton>
                    )}
                </S.FavoriteListContainer>
            </section>

            {/* --- 찜한 행사 섹션 --- */}
            <section>
                <S.ListHeader>
                    <S.SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>찜한 행사</S.SectionTitle>
                    <S.ViewMoreButton onClick={() => navigate('/mypage/favorites')}>더보기</S.ViewMoreButton>
                </S.ListHeader>

                <S.FavoriteListContainer>
                    {favorites.length > 0 && !isAtStartFavorites && (
                        <S.ArrowButton direction="left" onClick={() => scrollFavorites('left')} aria-label="왼쪽으로 스크롤">
                            <FaChevronLeft />
                        </S.ArrowButton>
                    )}

                    <S.FavoriteGrid ref={favoriteListRef}>
                        {favorites.length === 0 ? (
                            <S.NoResultsMessage>찜한 행사가 없습니다.</S.NoResultsMessage>
                        ) : (
                            favorites.slice(0, 5).map(favorite =>
                                favorite.event && <EventCard key={favorite.id} event={favorite.event as E.Event} />
                            )
                        )}
                    </S.FavoriteGrid>

                    {favorites.length > 0 && !isAtEndFavorites && (
                        <S.ArrowButton direction="right" onClick={() => scrollFavorites('right')} aria-label="오른쪽으로 스크롤">
                            <FaChevronRight />
                        </S.ArrowButton>
                    )}
                </S.FavoriteListContainer>
            </section>

            {/* --- 작성한 행사 섹션 (host/admin만) --- */}
            {(userData?.role === 'host' || userData?.role === 'admin') && (
                <section>
                    <S.ListHeader>
                        <S.SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>작성한 행사</S.SectionTitle>
                        <S.ViewMoreButton onClick={() => navigate('/mypage/events')}>더보기</S.ViewMoreButton>
                    </S.ListHeader>

                    <S.FavoriteListContainer>
                        {myEvents.length > 0 && !isAtStartEvents && (
                            <S.ArrowButton direction="left" onClick={() => scrollEvents('left')} aria-label="왼쪽으로 스크롤">
                                <FaChevronLeft />
                            </S.ArrowButton>
                        )}

                        <S.FavoriteGrid ref={myEventListRef}>
                            {myEvents.length === 0 ? (
                                <S.NoResultsMessage>작성한 행사가 없습니다.</S.NoResultsMessage>
                            ) : (
                                myEvents.slice(0, 5).map(event => event && <EventCard key={event.id} event={event as E.Event} />)
                            )}
                        </S.FavoriteGrid>

                        {myEvents.length > 0 && !isAtEndEvents && (
                            <S.ArrowButton direction="right" onClick={() => scrollEvents('right')} aria-label="오른쪽으로 스크롤">
                                <FaChevronRight />
                            </S.ArrowButton>
                        )}
                    </S.FavoriteListContainer>
                </section>
            )}

            {/* --- 5. 하단 링크 --- */}
            <S.ActionLinks>
                {/* <S.ActionLink onClick={openHostApplyModal}>행사 주최자 신청하기</S.ActionLink> */}
                <S.ActionLink onClick={openDeleteAccountModal}>회원탈퇴</S.ActionLink>
            </S.ActionLinks>


            {/* --- 6. 모달창 --- */}
            {/* 필드 수정용 모달 */}
            {editingField && editingField !== 'password' && editingField !== 'tags' && (
                <Modal
                    isOpen={true}
                    onClose={() => setEditingField(null)}
                    title={`${fieldLabels[editingField]} 변경`}
                >
                    <FieldEditForm
                        field={editingField}
                        initialValue={String(userData[editingField] || '')}
                        onCancel={() => setEditingField(null)}
                        onSave={(value) => handleFieldUpdate(editingField, value)}
                    />
                </Modal>
            )}

            {editingField === 'password' && (
                <Modal isOpen={true} onClose={() => setEditingField(null)} title="">
                    <ChangePasswordForm
                        onClose={() => setEditingField(null)}
                        onSuccess={() => alert('비밀번호가 변경되었습니다.')}
                    />
                </Modal>
            )}


            <Modal
                isOpen={isDeleteAccountModalOpen}
                onClose={closeDeleteAccountModal}
                title=""
            >
                <DeleteAccountForm
                    onClose={closeDeleteAccountModal}
                    onDeleted={handleAccountDeleted}
                />
            </Modal>

            <ProfileUploadModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                currentImageUrl={userData?.profile_image ?? null} // 현재 프로필 이미지 URL
            />

            <HostApplyPage
                isOpen={isHostApplyModalOpen}
                onClose={() => setIsHostApplyModalOpen(false)}
            />

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

            {editingField === 'tags' && (
                <Modal isOpen={true} onClose={() => setEditingField(null)} title="">
                    <UpdateSelectTagsForm
                        userTags={userData?.preferred_tags || []}
                        onCloseModal={() => setEditingField(null)}
                        onSuccess={loadMyPageData} // 데이터 새로고침
                    />
                </Modal>
            )}
        </S.PageContainer>
    );
};

export default MyProfilePage;