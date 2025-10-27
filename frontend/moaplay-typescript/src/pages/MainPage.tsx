import React, { useEffect, useState, useCallback } from 'react';
import Calendar from '../components/Calendar';
import EventSearchPage from '../components/EventSearch'; // 경로 확인 필요
import CalendarEventDetail from '../components/CalendarEventDetail';
import * as SchedulesApi from '../service/schedulesApi'; // SchedulesApi 사용 확인
import * as E from '../types/events'; // Event 타입
import type * as S from '../types/schedules'; // Schedule 타입 임포트

import { MainPageContainer, CalendarSection, CalendarWrapper, CalendarDetailWrapper } from '../styles/MainPage.styles';

// --- localStorage 색상 관리 로직 ---
const getRandomColor = () => {
  const colors = ['#4286f4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#FF6D00'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const EVENT_COLORS_KEY = 'moaplay_event_colors_main';

// getPersistentEventColors 함수는 E.Event[]를 받음 (수정 없음)
const getPersistentEventColors = (events: E.Event[]): Map<string | number, string> => {
    const savedColors = localStorage.getItem(EVENT_COLORS_KEY);
    let colorMap: Map<string | number, string>;

    if (savedColors) {
      try {
        colorMap = new Map(JSON.parse(savedColors));
      } catch (e) {
        console.error("저장된 색상 파싱 오류:", e);
        colorMap = new Map();
        localStorage.removeItem(EVENT_COLORS_KEY);
      }
    } else {
      colorMap = new Map();
    }

    let updated = false;
    events.forEach(event => {
      if (!colorMap.has(event.id)) { 
        colorMap.set(event.id, getRandomColor());
        updated = true;
      }
    });

    if (updated) {
      try {
        localStorage.setItem(EVENT_COLORS_KEY, JSON.stringify(Array.from(colorMap.entries())));
      } catch (e) { console.error("localStorage 색상 저장 오류:", e); }
    }
    
    return colorMap;
};
// --- 색상 관리 로직 끝 ---


// --- MainPage 컴포넌트 ---
function MainPage() {
  // Calendar 컴포넌트에 전달할 이벤트 목록 (색상 포함)
  const [calendarEvents, setCalendarEvents] = useState<E.Event[]>([]); 
  // CalendarEventDetail에 전달할 찜 목록 (원본 스케줄 데이터)
  const [schedules, setSchedules] = useState<S.Schedule[]>([]); 
  // Calendar에서 클릭된 *이벤트* 정보 (CalendarEventDetail 상세 보기용)
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<E.Event | null>(null); // 👈 타입 S.Schedule -> E.Event 로 수정
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // Calendar 컴포넌트에서 이벤트 클릭 시 호출될 핸들러 (파라미터 타입 E.Event)
  const handleCalendarEventSelect = useCallback((event: E.Event) => { // 👈 파라미터 타입 S.Schedule -> E.Event 로 수정
    setSelectedCalendarEvent(event);
  }, []);

  // API 호출 및 상태 업데이트 함수
  const fetchAndSetSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await SchedulesApi.getSchedules(); 
      const fetchedSchedules: S.Schedule[] = response.schedules || [];
      setSchedules(fetchedSchedules);
      console.log('실제 API 응답:', fetchedSchedules.map((e) => e.event?.host.nickname).filter(Boolean));

      // 3. 찜 목록에서 이벤트 정보만 추출 (schedule.event가 있는지 확인!)
      const eventsFromSchedules: E.Event[] = fetchedSchedules
        .map((schedule) => schedule.event) // schedule.event 추출
        .filter((event): event is E.Event => event !== null && event !== undefined); // null/undefined 제거 및 타입 가드


      // 4. 이벤트 목록 기준으로 색상 맵 가져오기/생성
      const colorMap = getPersistentEventColors(eventsFromSchedules);

      // 5. 이벤트 목록에 색상 정보 추가
      const eventsWithColors = eventsFromSchedules.map(event => ({
        ...event,
        color: colorMap.get(event.id) || getRandomColor(), // fallback
      }));

      setCalendarEvents(eventsWithColors); // 캘린더용 이벤트 상태 업데이트

    } catch (error) {
      console.error("일정 목록 로딩 실패:", error); 
      setCalendarEvents([]); 
      setSchedules([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchAndSetSchedules(); 
  }, [fetchAndSetSchedules]);

  if (isLoading) {
    return <div>찜한 일정 목록을 불러오는 중...</div>; // 로딩 메시지 수정
  }

  return (
    <MainPageContainer>
      <CalendarSection>
        <CalendarWrapper>
          <Calendar 
            events={calendarEvents} // 👈 Calendar에는 색상이 포함된 이벤트 목록 전달
            onEventClick={handleCalendarEventSelect}
          />
        </CalendarWrapper>
        <CalendarDetailWrapper>
          <CalendarEventDetail 
            events={calendarEvents} // 👈 찜한 전체 이벤트 목록 전달
            event={selectedCalendarEvent} // 👈 Calendar에서 클릭된 *이벤트* 정보 전달
            schedules={schedules} // 👈 원본 스케줄 데이터 전달
            onScheduleDeleted={fetchAndSetSchedules}
          />
        </CalendarDetailWrapper>
      </CalendarSection>
      <EventSearchPage />
    </MainPageContainer>
  );
}

export default MainPage;