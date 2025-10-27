// src/components/Calendar.tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { DayCellContentArg, EventClickArg, EventMountArg } from '@fullcalendar/core';
import { StyledCalendarWrapper } from '../styles/Calendar.styles';
import type * as E from '../types/events'; // Event 타입 임포트

interface ICalendarProps {
  events?: E.Event[]; 
  onEventClick: (event: E.Event) => void;
}

const Calendar: React.FC<ICalendarProps> = ({ events = [], onEventClick }) => {

  console.log('CalendarEventDetail 렌더링, event prop:', events);

  const handleDayCellContent = (arg: DayCellContentArg) => {
    return arg.dayNumberText.replace("일", "");
  };

  // 이제 'events' 배열 (E.Event[])을 직접 사용합니다.
  const formattedEvents = events.map(event => { 
    // event 객체에서 직접 end_date 사용 (schedule.event 제거)
    const endDate = new Date(event.end_date); 
    endDate.setDate(endDate.getDate() + 1);
    const newEndDateStr = endDate.toISOString().split('T')[0];

    return {
      id: String(event.id), // event.id 사용
      title: event.title, // event.title 사용
      start: event.start_date, // event.start_date 사용
      end: newEndDateStr,
      allDay: true,
      extendedProps: {
        originalData: event, // 원본 event 객체 전달
        color: event.color // event.color 사용
      }
    };
  });

  const handleCalendarClick = (clickInfo: EventClickArg) => {
    const clickedEventId = clickInfo.event.id;
    
    // 원본 'events' 배열에서 id로 원본 데이터를 찾습니다.
    const originalEvent = events.find(e => String(e.id) === clickedEventId); 

    if (originalEvent) {
      // 부모에게 E.Event 타입 객체 전달
      onEventClick(originalEvent); 
    }
  };

  const handleEventMount = (mountInfo: EventMountArg) => {
    // extendedProps에서 color 가져오기 (이전과 동일)
    const color = mountInfo.event.extendedProps.color; 
    if (color) {
      mountInfo.el.style.backgroundColor = color + '33'; 
      mountInfo.el.style.borderColor = color + '33'; 
      mountInfo.el.style.color = color;
      const titleEl = mountInfo.el.querySelector('.fc-event-title');
      if (titleEl) {
        (titleEl as HTMLElement).style.color = color;
      }
    }
  };

  return (
    <StyledCalendarWrapper> 
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={formattedEvents}
        eventClick={handleCalendarClick} 
        eventDidMount={handleEventMount} 
        dayCellContent={handleDayCellContent}
        headerToolbar={{
          left: 'title',
          right: 'prev next'
        }}
        locale="ko"
        height="auto"
      />
    </StyledCalendarWrapper>
  );
};

export default Calendar;