// src/components/Calendar.tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { DayCellContentArg, EventClickArg, EventMountArg } from '@fullcalendar/core'; // EventClickArg 임포트
import { StyledCalendarWrapper } from '../styles/Calendar.styles';
import type { IEvent } from '../types'; // IEvent 타입 임포트 (외부 타입 사용)

interface ICalendarProps {
  events?: IEvent[];
  onEventClick: (event: IEvent) => void;
}

const Calendar: React.FC<ICalendarProps> = ({ events = [], onEventClick }) => {

  const handleDayCellContent = (arg: DayCellContentArg) => {
    return arg.dayNumberText.replace("일", "");
  };

  // FullCalendar 형식으로 데이터 변환 (id 포함!)
  const formattedEvents = events.map(event => {
    const endDate = new Date(event.end_date);
    endDate.setDate(endDate.getDate() + 1);
    const newEndDateStr = endDate.toISOString().split('T')[0];

    return {
      id: String(event.id), // 2. FullCalendar가 식별할 수 있도록 id를 전달
      title: event.title,
      start: event.start_date,
      end: newEndDateStr,
      allDay: true,
      // 'extendedProps'를 사용해 원본 데이터를 통째로 넘길 수도 있습니다.
      extendedProps: {
        originalData: event ,
        color: event.color
      }
    };
  });

  // 3. FullCalendar의 eventClick 핸들러
  const handleCalendarClick = (clickInfo: EventClickArg) => {
    const clickedEventId = clickInfo.event.id;
    
    // 원본 events 배열에서 id로 원본 데이터를 찾습니다.
    const originalEvent = events.find(e => String(e.id) === clickedEventId);

    // 또는 extendedProps에 저장된 원본 데이터를 사용합니다.
    // const originalEvent = clickInfo.event.extendedProps.originalData as IEvent;

    if (originalEvent) {
      onEventClick(originalEvent); // 4. 부모로부터 받은 함수를 실행
    }
  };

  // 3. eventDidMount 핸들러 추가
  //   이벤트 태그가 캘린더에 렌더링될 때마다 실행됩니다.
  const handleEventMount = (mountInfo: EventMountArg) => {
    const color = mountInfo.event.extendedProps.color;
    if (color) {
      // 4. 이벤트 태그(DOM)에 직접 인라인 스타일 적용
      mountInfo.el.style.backgroundColor = color + '33'; // 투명도 추가
      mountInfo.el.style.borderColor = color  + '33'; // 투명도 추가
      
      // (선택사항) 텍스트 색상을 흰색으로 변경
      mountInfo.el.style.color = color;
      const titleEl = mountInfo.el.querySelector('.fc-event-title');
      if (titleEl) {
        (titleEl as HTMLElement).style.color = color ;
      }
    }
  };

  return (
    // 2. <FullCalendar>를 <StyledCalendarWrapper>로 감싸줍니다.
    <StyledCalendarWrapper> 
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={formattedEvents}
        eventClick={handleCalendarClick} // 5. FullCalendar 이벤트에 핸들러 연결
        eventDidMount={handleEventMount} // 6. 이벤트 마운트 핸들러 연결
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