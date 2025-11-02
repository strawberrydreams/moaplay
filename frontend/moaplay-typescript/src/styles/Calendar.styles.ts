import styled from 'styled-components';

export const StyledCalendarWrapper = styled.div`
  
  /* --- 1. CalendarContainer 스타일 (전체 래퍼) --- */
  background-color: #ffffff;
  width: 100%;
  max-width: 960px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  color: #131313;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* border-radius 적용을 위해 */

  /* --- 2. CalendarHeader 스타일 --- */
  .fc-header-toolbar {
    /* CalendarHeader 스타일 적용 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 0 !important;
  }

  .fc-toolbar-title {
    /* HeaderTitle 스타일 적용 */
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1f2937;
  }

  .fc-prev-button, .fc-next-button {
    /* NavButton 스타일 적용 */
    background: none !important;
    border: 1px solid #d1d5db !important;
    box-shadow: none !important;
    margin: 0 -4px;
    padding: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    color: #4b5563;
    border-radius: 6px;

    &:hover {
      background-color: #f3f4f6 !important;
      color: #111;
    }
  }

  /* --- 3. DayCell / DayNumber 스타일 --- */
  .fc-daygrid-day {
    border-right: 1px solid #f3f4f6;
    border-bottom: 1px solid #f3f4f6;
    background: #ffffffff;

    &:nth-child(7n) {
      border-right: none !important;
    }

    /* 날짜가 없는 칸은 흐린 표시 */
    &.fc-daygrid-day-other {
      background-color: #fafafb;
      color: #9ca3af;
    }

    &:hover{
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      filter: brightness(95%);
      transition: all 0.2s ease-in-out;
    }
  }

/* --- 3. 요일 헤더 스타일 (월화수목금토일) --- */
  .fc-col-header-cell {
    background-color: #f8f9fa; /* 헤더 배경색 변경 */
    border-bottom: 1px solid #ddd; /* 헤더 하단 테두리 */
    font-size: 0.9rem;
    font-weight: 600;
  
  }

  /* 요일 헤더 글자 (예: "월") */
  .fc-col-header-cell-cushion {
    color: #555; /* 글자색 변경 */
    padding: 12px 6px;
  }

  /* --- 4. (참고) 주말 요일 헤더 색상 변경 --- */
  .fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion {
    color: #d9534f; /* 일요일 헤더 글자색 */
  }
  .fc-col-header-cell.fc-day-sat .fc-col-header-cell-cushion {
    color: #0275d8; /* 토요일 헤더 글자색 */
  }

  /* DayCell의 높이 적용 (내부 프레임에 적용) */
  .fc-daygrid-day-frame {
    height: 106px;
  }

  /* 날짜 숫자 스타일 (DayNumber) */
  .fc-daygrid-day-number {
    font-weight: 500;
    margin-bottom: 0.25rem;
    padding: 6px;
    color: #131313; /* DayCell의 color */

    .fc-daygrid-day-other & {
      color: #9ca3af !important;
    }
  }

  /* --- 4. 주말 색상 적용 --- */
  .fc-day-sun .fc-daygrid-day-number {
    color: #d9534f !important; /* FullCalendar 기본 스타일 덮어쓰기 */
  }
  .fc-day-sat .fc-daygrid-day-number {
    color: #0275d8 !important;
  }

  /* --- 5. EventTag 스타일 --- */
  .fc-event {
    background-color: #e0f2ff;
    border: 1px solid #a3d8ff;
    color: #1e3a8a;
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
   
    /* EventTag의 텍스트 스타일 */
    .fc-event-title {
      color: #0056b3; /* (기본값) */
      font-weight: 600;
      /* white-space: nowrap; */
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  
    /* 이벤트 호버 시 스타일 */
  .fc-event.event-hovered {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    filter: brightness(80%);
    transition: all 0.2s ease-in-out;
  }

  /* 이벤트 클릭 시 스타일 */
  .fc-event.event-clicked {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    filter: brightness(80%);
    transition: all 0.2s ease-in-out;
  }


  /* --- 6. 기타 스타일 정리 --- */
  
  /* 캘린더의 기본 테두리 제거 (Wrapper 테두리 사용) */
  .fc-scrollgrid, .fc-view {
    border: none;
  }

`;