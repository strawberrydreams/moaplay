import React, { useEffect, useState, useRef, useCallback, type CSSProperties } from 'react'; // useRef 추가
import * as UserApi from '../services/usersApi';     // 사용자 정보 API
import * as ReviewApi from '../services/reviewsApi';  // 리뷰 API
import * as FavoriteApi from '../services/favoritesApi';// 찜 API
import { useAuthContext } from '../contexts/AuthContext';
import type * as U from '../types/users';        // User 타입
import type * as R from '../types/reviews';       // Review 타입
import type * as F from '../types/favorites';     // Favorite 타입 (찜 목록용)
import type * as E from '../types/events';        // Event 타입 (찜 목록 내부용)
import EventCard from '../components/EventCard';   // EventCard 재사용
import ReviewCard from '../components/ReviewCard'
import { useModal } from '../hooks/useModal';
import Modal from '../components/common/Modal';
import { ProfileUploadModal } from '../components/ProfileUploadModal';
import DeleteAccountForm from '../components/auth/DeleteAccountForm';
import ChangePasswordForm from '../components/auth/ChangePasswordForm';
import * as S from '../styles/Mypage.styles';    // 스타일 임포트
import { FaPencilAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // 아이콘
import FieldEditForm from '../components/FieldEditForm';
import HostApplyForm from './HostApplyForm';
import defaultImage from '../assets/default-profile.png';
import BeatLoader from "react-spinners/BeatLoader";

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

const MyPage: React.FC = () => {
  const [userData, setUserData] = useState<U.Users | null>(null);
  const [myReviews, setMyReviews] = useState<R.Review[]>([]);
  const [myFavorites, setMyFavorites] = useState<F.Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<EditableUserField | null>(null);
  const favoriteListRef = useRef<HTMLDivElement>(null); // 찜 목록 스크롤용
  const { user } = useAuthContext();
  

  const { 
    isDeleteAccountModalOpen,
    isProfileModalOpen,
    isHostApplyModalOpen,
    setIsProfileModalOpen,
    setIsHostApplyModalOpen,
    openDeleteAccountModal,
    openHostApplyModal,
    closeDeleteAccountModal,
    closeAllModals
  } = useModal();

  // 데이터 로딩
  const loadMyPageData = useCallback(async () => {
    setIsLoading(true);
    try {
        // API 호출 로직 (이전과 동일)
        const [userRes, favoritesRes] = await Promise.all([
            UserApi.getMe(), // 내 정보 가져오기
            //reviewsRes,
            // ReviewApi.getMyReview(currentUser?.id || 0), // 내 리뷰 3개
            FavoriteApi.getFavorites(), // 내 찜 8개
        ]);
        
        // 가상 데이터 사용 (이전과 동일)
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setUserData(userRes);
        // setMyReviews(reviewsRes.review || []);
        // console.log('리뷰 응답:', reviewsRes);
        // console.log('리뷰 응답:', myReviews);
        setMyFavorites(favoritesRes.favorites || []);

    } catch (error) {
        console.error("마이페이지 데이터 로딩 실패:", error);
      // 필요 시 에러 상태 설정
    } finally {
        setIsLoading(false);
    }
  }, []); // 의존성 배열 비움 (처음 한 번만 생성)
  // --- 👆 ---

    // --- 2. useEffect는 loadMyPageData 호출만 하도록 변경 ---
    useEffect(() => {
        loadMyPageData(); // 마운트 시 데이터 로딩 함수 호출
    }, [loadMyPageData]);

  const handleFieldUpdate = async (field: keyof U.Users, value: string) => {
    if (!userData) return;
    try {
      // API 호출 예: UserApi.changeUser({ [field]: value })
      const payload = { [field]: value } as Partial<U.Users>;
      const updated = await UserApi.updateMe(payload);
      setUserData((prev) => prev ? { ...prev, ...updated } : prev);
      setEditingField(null);
    } catch (error) {
      console.error('필드 수정 실패:', error);
    }
  };

  // 찜 목록 스크롤 함수
  const scrollFavorites = (direction: 'left' | 'right') => {
      if (favoriteListRef.current) {
          const scrollAmount = favoriteListRef.current.offsetWidth * 0.8; // 화면 너비의 80% 스크롤
          favoriteListRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth'
          });
      }
  };

  const handleEditReview = (reviewId: number) => {
      console.log(`MyPage에서 리뷰 수정: ${reviewId}`);
      // TODO: 리뷰 수정 로직 (예: 수정 폼 모달 열기)
  };
  const handleDeleteReview = (reviewId: number) => {
      console.log(`MyPage에서 리뷰 삭제: ${reviewId}`);
      // TODO: 리뷰 삭제 API 호출 및 목록 새로고침 로직
      if (window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
        ReviewApi.deleteReview(reviewId).then(() => loadMyPageData()); // 예시
      }
  };
  

  const handleAccountDeleted = () => {
    // 예: 로그아웃 처리, 홈으로 이동 등
    alert('회원탈퇴가 완료되었습니다.');
    // 로그아웃 로직
    // navigate('/');
  };

  if (isLoading) {
    return  <BeatLoader
        color="#8b8b8bff"
        loading={isLoading}
        cssOverride={override}
        size={15}
        aria-label="Loading Spinner"
        data-testid="loader"
      />;
  }
  if (!userData) {
    return <S.PageContainer>사용자 정보를 불러올 수 없습니다.</S.PageContainer>; // 로그인 안 된 경우 등
  }

  return (
    <S.PageContainer>
      {/* --- 1. 프로필 섹션 --- */}
      <S.ProfileSection>
        <S.ProfileAvatar src={user?.profile_image || defaultImage} alt="프로필 사진" />
        <S.ProfileInfo>
          <S.ProfileName>{userData.nickname}</S.ProfileName>
          <S.ProfileUserId>{userData.user_id}</S.ProfileUserId>
        </S.ProfileInfo>
        <S.EditProfileButton 
          aria-label="프로필 수정"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <FaPencilAlt />
        </S.EditProfileButton>
      </S.ProfileSection>

      {/* --- 2. 기본 정보 --- */}
      <S.InfoSection>
        <S.SectionTitle>기본 정보</S.SectionTitle>
        <S.InfoRow>
          <S.InfoLabel>닉네임</S.InfoLabel>
          <S.InfoValue>{userData.nickname}</S.InfoValue>
          <S.ChangeButton onClick={() => setEditingField('nickname')}>변경</S.ChangeButton>
        </S.InfoRow>
        <S.InfoRow>
          <S.InfoLabel>아이디</S.InfoLabel>
          <S.InfoValue>{userData.user_id}</S.InfoValue>
          {/* 아이디는 변경 불가하므로 버튼 없음 */}
        </S.InfoRow>
        <S.InfoRow>
          <S.InfoLabel>비밀번호</S.InfoLabel>
          <S.InfoValue>************</S.InfoValue>
          <S.ChangeButton onClick={() => setEditingField('password')}>변경</S.ChangeButton>
        </S.InfoRow>
        <S.InfoRow>
          <S.InfoLabel>이메일</S.InfoLabel>
          <S.InfoValue>{userData.email}</S.InfoValue>
          <S.ChangeButton onClick={() => setEditingField('email')}>변경</S.ChangeButton>
        </S.InfoRow>
        <S.InfoRow>
          <S.InfoLabel>전화번호</S.InfoLabel>
          <S.InfoValue>{userData.phone || '-'}</S.InfoValue>
          <S.ChangeButton onClick={() => setEditingField('phone')}>변경</S.ChangeButton>
        </S.InfoRow>
        <S.InfoRow>
          <S.InfoLabel>선호 태그</S.InfoLabel>
          {/* <S.InfoValue>{(userData.tags || []).join(', ') || '-'}</S.InfoValue> */}
          <S.ChangeButton>변경</S.ChangeButton>
        </S.InfoRow>
      </S.InfoSection>

      {/* --- 3. 내 리뷰 --- */}
      <section>
        <S.ListHeader>
          <S.SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>리뷰</S.SectionTitle>
          <S.ViewMoreButton>더보기</S.ViewMoreButton>
        </S.ListHeader>
        <S.ReviewGrid>
          {myReviews.length === 0 ? (
            <p>작성한 리뷰가 없습니다.</p> 
          ) : (
            // 👇 ReviewCard 컴포넌트 사용
            myReviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                // onClick={() => openReviewDetailModal(review)} // 상세 모달 열기 함수 전달 (필요 시)
                onEdit={handleEditReview} // 수정 함수 전달
                onDelete={handleDeleteReview} // 삭제 함수 전달
              />
            ))
            // 👆 ReviewCard 컴포넌트 사용
          )}
        </S.ReviewGrid>
      </section>

      {/* --- 4. 찜한 행사 --- */}
      <section>
        <S.ListHeader>
          <S.SectionTitle style={{ borderBottom: 'none', marginBottom: 0 }}>찜한 행사</S.SectionTitle>
          <S.ViewMoreButton>더보기</S.ViewMoreButton>
        </S.ListHeader>
        <S.FavoriteListContainer>
          <S.ArrowButton direction="left" onClick={() => scrollFavorites('left')} aria-label="왼쪽으로 스크롤">
            <FaChevronLeft />
          </S.ArrowButton>
          <S.FavoriteGrid ref={favoriteListRef}>
            {myFavorites.length === 0 ? (
              <p>찜한 행사가 없습니다.</p> // NoResultsMessage 재사용 가능
            ) : (
              myFavorites.map(favorite => (
                // 찜 목록의 favorite 객체 안에 event 객체가 포함되어야 함
                favorite.event && <EventCard key={favorite.id} event={favorite.event as E.Event} /> 
              ))
            )}
            <S.ArrowButton direction="right" onClick={() => scrollFavorites('right')} aria-label="오른쪽으로 스크롤">
            <FaChevronRight />
          </S.ArrowButton>
          </S.FavoriteGrid>
          
        </S.FavoriteListContainer>
      </section>

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
        currentImageUrl={userData.profile_image ?? null} // 현재 프로필 이미지 URL
      />

      <HostApplyForm 
        isOpen={isHostApplyModalOpen}
        onClose={() => setIsHostApplyModalOpen(false)}
      />
    </S.PageContainer>
  );
};

export default MyPage;