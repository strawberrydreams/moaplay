import React, { useState, useEffect, useCallback } from 'react';
import type * as E from '../types/events'; // Event 타입 임포트
// import type { Schedule } from '../types/schedules'; // Schedule 타입 불필요
import * as S from '../styles/CalendarEventDetail.styles'; // 스타일 경로 확인!
import { FaImage, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import { useModal } from '../hooks/useModal'; // 1. AuthModalContext 훅 임포트
import * as SchedulesApi from '../service/schedulesApi'; // 일정 삭제 API
import type { Schedule } from '../types/schedules'; // Schedule 타입 임포트

// --- Props 타입 정의 ---
interface IDetailProps {
  // 👇 Prop 이름은 events, 타입은 E.Event[] (색상 포함)
  events: E.Event[];      
  schedules: Schedule[];
  event: E.Event | null; // Calendar에서 클릭된 *이벤트* 정보 (유지)
  onScheduleDeleted: () => void;
}

const CalendarEventDetail: React.FC<IDetailProps> = ({ events = [], event, schedules, onScheduleDeleted}) => {
  // --- 👇 로그인 관련 로직 유지 ---
  const { openLoginModal } = useModal();  // 로그인 모달 열기 함수 가져오기
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  useEffect(() => {
    checkLoginStatus(); // 마운트 시 로그인 상태 확인
  }, []);
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token'); // 또는 쿠키 확인 로직
    setIsLoggedIn(!!token); 
  };
  // --- 👆 로그인 관련 로직 끝 ---


  // 상세 보기 상태 (E.Event 타입 사용)
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<E.Event | null>(null);

  // 뒤로가기 핸들러
  const handleBackToList = () => {
    setSelectedDetailEvent(null); 
  };

  // Calendar에서 이벤트 클릭 시 selectedDetailEvent 업데이트
  useEffect(() => {
    if (event) {
      setSelectedDetailEvent(event);
    } else {
      // event prop이 null일 때 목록 보기로 돌아가도록 설정 (선택 사항)
      // setSelectedDetailEvent(null); 
    }
  }, [event]); 

  // --- 상세 카드 보기 ---
  const ShowEventsDetail: React.FC = () => {
    const displayEvent = selectedDetailEvent; 
    console.log('선택된 상세 이벤트:', displayEvent);

    if (!displayEvent) {      
      return (
        <S.DetailCardWrapper>
          <S.Placeholder>상세 정보를 볼 이벤트를 선택해주세요.</S.Placeholder>
        </S.DetailCardWrapper>
      );
    }

  const handleDeleteSchedule = async () => {
      if (!displayEvent) return; // 삭제할 이벤트 없으면 종료

      // 3. (중요!) 삭제할 대상은 Schedule(찜) ID여야 함.
      //    displayEvent(Event 타입)에서 Schedule ID를 찾아야 함.
      //    찜 목록(events prop)에서 event ID가 일치하는 항목을 찾아 그 ID 사용
      const scheduleToDelete = schedules.find(s => s.event?.id === displayEvent.id); 
      
      if (!scheduleToDelete) {
        alert("삭제할 찜 정보를 찾을 수 없습니다.");
        return;
      }

      // 4. 확인 메시지 (선택 사항)
      if (!window.confirm(`'${displayEvent.title}' 찜을 삭제하시겠습니까?`)) {
          return;
      }

      try {
        // 5. 삭제 API 호출 (Schedule ID 사용)
        await SchedulesApi.deleteSchedule(scheduleToDelete.id); 
        
        // 6. 성공 시: 목록 보기로 돌아가고, 부모에게 새로고침 요청
        setSelectedDetailEvent(null); 
        onScheduleDeleted(); // 👈 부모의 fetchAndSetSchedules 호출
        alert("찜이 삭제되었습니다.");

      } catch (error) {
        console.error("찜 삭제 중 오류 발생:", error);
        alert("찜 삭제 중 오류가 발생했습니다.");
      }
    };
    
    const tagsArray = displayEvent.tags || []; 

    return (
      <S.DetailCardWrapper> 
        <S.DetailImagePlaceholder>
          {displayEvent.image_urls && displayEvent.image_urls.length > 0 ? ( 
            <img src={displayEvent.image_urls[0]} alt={displayEvent.title} />
          ) : ( <FaImage className="placeholder-icon" /> )}
        </S.DetailImagePlaceholder>
        <S.DetailTitle>{displayEvent.title}</S.DetailTitle>
        <S.DetailInfoGrid>
          <p>날짜: <span>{displayEvent.start_date}</span> ~ <span>{displayEvent.end_date}</span></p>
          <p>주최자: <span>{displayEvent.host?.nickname || '정보 없음'}</span></p> 
          <p>장소: <span>{displayEvent.location}</span></p>
          <p>연락처: <span>{displayEvent.phone || '정보 없음'}</span></p> 
        </S.DetailInfoGrid>
        <S.DetailTagList>
          <h4>태그</h4> <br />
          {tagsArray.map((tag, index) => ( <S.DetailTag key={index}>{tag}</S.DetailTag> ))}
        </S.DetailTagList>
        <S.DetailDescription>
          <h4>행사 소개</h4>
          <p>{displayEvent.description || '행사 소개가 없습니다.'}</p> 
        </S.DetailDescription>
        <S.ButtonGroup>
          <S.DetailButton>상세보기</S.DetailButton>
          <S.DetailButton danger onClick={handleDeleteSchedule}>삭제하기</S.DetailButton>
        </S.ButtonGroup>
      </S.DetailCardWrapper>
    );
  };

  // --- 담은 행사 목록 보기 ---
  const ShowEventList: React.FC = () => {
    return (
      <S.EventListWrapper>
        {/* events 배열 (E.Event[]) 직접 사용 */}
        {events.map(eventCard => ( 
          console.log('이벤트 카드:', eventCard),
          <S.EventListItem 
            key={eventCard.id} 
            $dotColor={eventCard.color || '#4285F4'} 
            onClick={() => setSelectedDetailEvent(eventCard)} 
          >
            <div className="event-dot"></div>
            <div className="event-title">{eventCard.title}</div> 
            <div className="event-date">{eventCard.start_date} ~ {eventCard.end_date}</div>
          </S.EventListItem>
        ))}
      </S.EventListWrapper>
    );
  };

  // --- 최종 렌더링 ---
  return (
    <S.CalendarDetailWrapper>
      <S.CalendarDetailHeader>
        {selectedDetailEvent && ( 
          <S.BackButton onClick={handleBackToList}> <FaArrowLeft /> </S.BackButton>
        )}
        <S.HeaderTitle>담은 행사</S.HeaderTitle>
      </S.CalendarDetailHeader>

      {/* --- 👇 로그인 관련 조건 렌더링 유지 --- */}
      {isLoggedIn ? ( 
        <S.LoginPromptWrapper>
          <p>담은 행사를 보려면 로그인 해주세요.</p>
          <S.LoginButton onClick={openLoginModal}> 
            <FaSignInAlt /> 
            로그인하기
          </S.LoginButton>
        </S.LoginPromptWrapper>
      ) : ( // 로그인 되었을 때
        events.length === 0 ? ( 
          <S.NoEventsMessage>담은 행사가 없습니다.</S.NoEventsMessage> // 스타일 필요
        ) : ( 
          selectedDetailEvent ? <ShowEventsDetail /> : <ShowEventList /> 
        )
      )}
      {/* --- 👆 --- */}
    </S.CalendarDetailWrapper>
  );
};

export default CalendarEventDetail;