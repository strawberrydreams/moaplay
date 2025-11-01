import React, { useState, useCallback } from 'react';
import Calendar from '../components/Calendar';
import EventSearchPage from '../components/EventSearch';
import CalendarEventDetail from '../components/CalendarEventDetail';
import { useAuthContext } from '../contexts/AuthContext'; // 1. AuthContext 훅
import { useCalendarEvents } from '../hooks/useCalendarEvents'; // 2. 새로 만든 훅 임포트
import type * as E from '../types/events';
import type * as S from '../types/schedules';
import Banner from '../assets/banner.png';

import { 
  MainPageContainer, 
  CalendarSection, 
  CalendarWrapper, 
  CalendarDetailWrapper,
  BannerImage
} from '../styles/MainPage.styles';

// --- MainPage 컴포넌트 ---
function MainPage() {
  // 3. AuthContext에서 캘린더 외 필요한 정보 가져오기
  const { 
    user: currentUser, 
    schedules, // 원본 찜 목록 (자식에게 전달용)
    schedulesLoading, 
    fetchSchedules // 새로고침 함수 (자식에게 전달용)
  } = useAuthContext(); 
  
  // 4. 새로 만든 훅에서 캘린더용 이벤트 목록 가져오기
  const { calendarEvents } = useCalendarEvents(); 

  // 5. MainPage 내부 상태 (클릭된 이벤트만 관리)
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<E.Event | null>(null);

  // 6. 캘린더 클릭 핸들러 (이벤트 선택/해제)
  const handleCalendarEventSelect = useCallback((on: boolean, event?: E.Event) => {
    if (on && event) {
      setSelectedCalendarEvent(event);
    } else if (!on) {
      setSelectedCalendarEvent(null);
    }
  }, []);

  // 7. 로딩 상태 (Context의 찜 로딩 상태 사용)
  if (schedulesLoading) {
    return <div>찜한 일정 목록을 불러오는 중...</div>; 
  }

  return (
    <MainPageContainer style={{padding: '50px'}}>
      <BannerImage src={Banner} style={{width: '1200px', height: '200px', objectFit: 'cover'}} alt='배너 이미지'/>
      <CalendarSection>
        <CalendarWrapper style={{zoom: '1'}}>
          <Calendar 
            events={calendarEvents} // 👈 훅에서 가져온 값
            onEventClick={handleCalendarEventSelect}
            CalendarEvent={selectedCalendarEvent ?? undefined}
          />
        </CalendarWrapper>
        <CalendarDetailWrapper>
          <CalendarEventDetail 
            events={calendarEvents} // 👈 훅에서 가져온 값
            event={selectedCalendarEvent} // 👈 현재 선택된 이벤트
            schedules={schedules} // 👈 Context에서 가져온 원본 찜 목록
            onScheduleDeleted={fetchSchedules} // 👈 Context에서 가져온 새로고침 함수
            onBackToList={() => handleCalendarEventSelect(false)} // 👈 뒤로가기 핸들러
            onEventClick={handleCalendarEventSelect} // 👈 목록에서 클릭 시 핸들러
          />
        </CalendarDetailWrapper>
      </CalendarSection>
      <EventSearchPage />
    </MainPageContainer>
  );
}

export default MainPage;