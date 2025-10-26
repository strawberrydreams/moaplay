import React, { useState } from 'react';
import Calendar from '../components/Calendar';
import EventSearchPage from './EventSearchPage';
import CalendarEventDetail from '../components/CalendarEventDetail';
import type { IEvent } from '../types';

import { MainPageContainer, CalendarSection, CalendarWrapper, CalendarDetailWrapper } from '../styles/MainPage.styles';

const getRandomColor = () => {
  const colors = ['#4286f4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#FF6D00'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 원본 샘플 데이터 (색상 없음)
const rawSampleEvents: Omit<IEvent, 'color'>[] = [
  { id: 1, title: '오케스트라 특별 공연', start_date: '2025-10-07', end_date: '2025-10-07', location: '대전 예술의전당', tag: ['음악', '콘서트'], description: '...', host: '대전예술의전당', contact: '042-2222-3333' , isLiked: false },
  { id: 2, title: '현대 미술 전시회', start_date: '2025-10-09', end_date: '2025-10-09', location: '서울 시립 미술관', tag: ['미술', '전시'], description: '...', host: '시립미술관', contact: '02-1111-2222', isLiked: false },
  { id: 3, title: '지역 축제', start_date: '2025-10-11', end_date: '2025-10-11', location: '부산 해운대', tag: ['축제', '야외'], description: '...', host: '부산시청', contact: '051-3333-4444', isLiked: false },
  { id: 4, title: '축구 경기', start_date: '2025-10-16', end_date: '2025-10-18', location: '상암 월드컵 경기장', tag: ['스포츠', '축구'], description: '...', host: 'K리그', contact: '02-0000-0000', isLiked: false },
  { id: 5, title: '북 콘서트', start_date: '2025-10-31', end_date: '2025-10-31', location: '강남 교보문고', tag: ['도서', '강연'], description: '...', host: '교보문고', contact: '02-5555-6666', isLiked: false },
];

// 원본 데이터에 랜덤 색상을 추가하여 처리
const processedSampleEvents: IEvent[] = rawSampleEvents.map(event => ({
  ...event,
  color: getRandomColor(), // 👈 각 이벤트에 랜덤 색상 1회 할당
}));
function MainPage() {
  const [calendarEvents, setCalendarEvents] = useState(processedSampleEvents);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<IEvent | null>(null);

  const handleCalendarEventSelect = (event: IEvent) => {
    setSelectedCalendarEvent(event);
  };

  return (
    <MainPageContainer>
      <CalendarSection>
        
        <CalendarWrapper>
          <Calendar 
            events={calendarEvents} 
            onEventClick={handleCalendarEventSelect}
          />
        </CalendarWrapper>

        <CalendarDetailWrapper>
          <CalendarEventDetail 
            events={calendarEvents}
            event={selectedCalendarEvent} 
          />
        </CalendarDetailWrapper>

      </CalendarSection>
      <EventSearchPage />
    </MainPageContainer>
  );
}

export default MainPage;