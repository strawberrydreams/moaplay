// src/components/CalendarEventDetail.tsx
import React, { useState, useEffect } from 'react';
import type { IEvent } from '../types';
import * as S from '../styles/CalendarEvendDetail.styles';
import { FaImage, FaSignInAlt, FaArrowLeft } from 'react-icons/fa'; // 이미지 플레이스홀더 아이콘
// useAuthModal 훅 임포트
// import { useAuthModal } from '../../AuthModalContext';
import { useSignupFlow } from '../hooks/useSignupFlow';

// 이벤트를 위한 랜덤 색상 생성 (Image 1의 점)
// const getRandomColor = () => {
//   const colors = ['#4286f4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#FF6D00'];
//   return colors[Math.floor(Math.random() * colors.length)];
// };

interface IDetailProps {
  events: IEvent[];        // 모든 담은 행사 목록
  event: IEvent | null;    // 캘린더에서 클릭된 특정 행사 (원래 props)
}

const CalendarEventDetail: React.FC<IDetailProps> = ({ events, event }) => {
  // 컨텍스트에서 로그인 모달 여는 함수를 직접 가져옴
  const { openLoginModal } = useSignupFlow();
  // 로그인 상태 대신 토큰 여부로 판단
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Image 1의 목록에서 클릭된 행사
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<IEvent | null>(null);
  // '이전' 버튼 클릭 시 실행될 핸들러
  const handleBackToList = () => {
    setSelectedDetailEvent(null); // 상태를 null로 바꿔 ShowEventList가 보이게 함
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 로그인 상태 확인
    checkLoginStatus();
  }, []);

  useEffect(() => {
    // 캘린더에서 이벤트가 클릭되면 (event props 변경 시) 상세 카드 표시
    if (event) {
      setSelectedDetailEvent(event);
    }
  }, [event]);

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token'); // 토큰 존재 여부 확인
    setIsLoggedIn(!!token); // 토큰이 있으면 true, 없으면 false
  };

  // 상세 카드 보기 (Image 2)
  const ShowEventsDetail: React.FC = () => {
    // event props 또는 selectedDetailEvent 중 하나를 사용
    const displayEvent = selectedDetailEvent || event; 

    if (!displayEvent) {
      return (
        <S.DetailCardWrapper>
          <S.Placeholder>상세 정보를 볼 이벤트를 선택해주세요.</S.Placeholder>
        </S.DetailCardWrapper>
      );
    }

    // 4. 'tag'가 이미 배열이므로 split 로직을 제거합니다.
    const tagsArray = displayEvent.tag || []; // || []는 tag가 undefined일 경우를 대비

    return (
      <S.DetailCardWrapper> 
        <S.DetailImagePlaceholder>
          {displayEvent.imageUrl ? (
            <img src={displayEvent.imageUrl} alt={displayEvent.title} />
          ) : (
            <FaImage className="placeholder-icon" />
          )}
        </S.DetailImagePlaceholder>

        <S.DetailTitle>{displayEvent.title}</S.DetailTitle>
        
        <S.DetailInfoGrid>
            <p>날짜: <span>{displayEvent.start_date}</span></p>
            <p>주최자: <span>{displayEvent.host || '정보 없음'}</span></p>
            <p>장소: <span>{displayEvent.location}</span></p>
            <p>연락처: <span>{displayEvent.contact || '정보 없음'}</span></p>
        </S.DetailInfoGrid>

        <S.DetailTagList>
          <h4>태그</h4>
          {tagsArray.map((tag, index) => (
            <S.DetailTag key={index}>{tag}</S.DetailTag>
          ))}
        </S.DetailTagList>

        <S.DetailDescription>
          <h4>행사 소개</h4>
          <p>{displayEvent.description || '행사 소개가 없습니다.'}</p>
        </S.DetailDescription>

        <S.ButtonGroup>
          <S.DetailButton>상세보기</S.DetailButton>
          <S.DetailButton danger>삭제하기</S.DetailButton>
        </S.ButtonGroup>
      </S.DetailCardWrapper>
    );
  };

  // 담은 행사 목록 보기 (Image 1)
  const ShowEventList: React.FC = () => {
    return (
    <S.EventListWrapper>
        {events.map(eventCard => (
          <S.EventListItem 
            key={eventCard.id} 
            // 2. 랜덤 생성 대신 eventCard.color prop 사용 (fallback 색상 지정)
            $dotColor={eventCard.color || '#4285F4'} 
            onClick={() => setSelectedDetailEvent(eventCard)} 
          >
            <div className="event-dot"></div>
            <div className="event-title">{eventCard.title}</div>
            <div className="event-date">{eventCard.start_date}</div>
          </S.EventListItem>
        ))}
      </S.EventListWrapper>
    );
  };

  return (
    <S.CalendarDetailWrapper>
      {/* 4. 헤더 렌더링 수정 */}
      <S.CalendarDetailHeader>
        {/* 5. selectedDetailEvent가 있을 때 (상세 뷰일 때)만 버튼 표시 */}
        {selectedDetailEvent && (
          <S.BackButton onClick={handleBackToList}>
            <FaArrowLeft /> {/* 뒤로가기 아이콘 */}
          </S.BackButton>
        )}
        {/* 6. 제목을 S.HeaderTitle로 감싸 중앙 정렬 유지 */}
        <S.HeaderTitle>담은 행사</S.HeaderTitle>
      </S.CalendarDetailHeader>

      {isLoggedIn ? ( 
        <S.LoginPromptWrapper>
          <p>담은 행사를 보려면 로그인 해주세요.</p>
          {/* 4. prop 대신 컨텍스트에서 가져온 함수를 사용 */}
          <S.LoginButton onClick={openLoginModal}> 
            <FaSignInAlt />
            로그인하기
          </S.LoginButton>
        </S.LoginPromptWrapper>
      ) : (
        // 캘린더에서 이벤트가 클릭되었거나, 목록에서 특정 이벤트가 선택된 경우 상세 카드 표시
        selectedDetailEvent ? <ShowEventsDetail /> : <ShowEventList />
      )}
    </S.CalendarDetailWrapper>
  );
};

export default CalendarEventDetail;