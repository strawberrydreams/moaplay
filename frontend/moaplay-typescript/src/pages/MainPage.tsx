import React, { useState } from 'react';
import Calendar from '../components/Calender';
import EventSearchPage from './EventSearchPage';

// 원본 데이터 형식 (start_date, end_date)
const sampleEvents = [
  { start_date: '2025-10-12', end_date: '2025-10-12', title: '하루짜리 행사' },
  { start_date: '2025-10-16', end_date: '2025-10-18', title: '3일짜리 행사' },
  { start_date: '2025-10-28', end_date: '2025-10-31', title: '월말 행사' },
];

function MainPage() {
  const [events, setEvents] = useState(sampleEvents);

  return (
    <div className="main-page-container">
      <div className="calendar-section">
        {/* FullCalendar 컴포넌트를 렌더링 */}
        <Calendar events={events} />
        <EventSearchPage />
      </div>
    </div>
  );
}

export default MainPage;