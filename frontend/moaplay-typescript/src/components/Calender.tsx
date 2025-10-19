import React from 'react';
import FullCalendar from '@fullcalendar/react'; // 1. FullCalendar 임포트
import dayGridPlugin from '@fullcalendar/daygrid'; // 2. dayGrid 플러그인 임포트
// 이벤트 데이터 타입 정의
interface IEvent {
  start_date: string;
  end_date: string;
  title: string;
}

interface ICalendarProps {
  events?: IEvent[];
}

const Calendar: React.FC<ICalendarProps> = ({ events = [] }) => {

// 3. 데이터를 FullCalendar 형식으로 변환
  const formattedEvents = events.map(event => {
    
    // --- (수정 시작) ---
    // end_date를 Date 객체로 변환
    const endDate = new Date(event.end_date);
    
    // end_date의 날짜에 +1일을 함 (18일 -> 19일)
    endDate.setDate(endDate.getDate() + 1);

    // FullCalendar가 인식할 수 있는 'YYYY-MM-DD' 문자열로 다시 변환
    const newEndDateStr = endDate.toISOString().split('T')[0];
    // --- (수정 끝) ---

    return {
      title: event.title,
      start: event.start_date,
      end: newEndDateStr, // end_date 대신 +1일 된 newEndDateStr 사용
    //   allDay: true // 이벤트가 하루 종일 지속됨을 명시 (권장)
    };
  });

    const handleDayCellContent = (arg: any) => {
        const dayNumber = arg.dayNumberText.replace("일", ""); // "15일" -> "15"
        return dayNumber;
    };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <FullCalendar
        plugins={[dayGridPlugin]} // 4. 사용할 플러그인 등록
        initialView="dayGridMonth" // 5. 기본 뷰를 월간 달력으로 설정
        events={formattedEvents}    // 6. 변환된 이벤트 데이터 전달
        dayCellContent={handleDayCellContent} // 일자 표시 형식 커스터마이징
        headerToolbar={{             // 헤더 툴바 설정 (이미지와 유사하게)
          left: 'prev',
          center: 'title',
          right: 'next'
        }}
        locale="ko" // 한국어 설정
        height="auto" // 내용에 맞게 높이 자동 조절
        // dateClick={}
        eventClick={(info) => {
          const event = info.event;
          alert(`Event: ${event.title}`);
        }}
      />
    </div>
  );
};

export default Calendar;