import styled from 'styled-components';

// FullCalendar 컴포넌트를 감싸는 Wrapper입니다.
// 이 Wrapper 안에서 FullCalendar의 클래스들을 모두 선택합니다.
export const StyledCalendarWrapper = styled.div`
  
  /* --- 1. CalendarContainer 스타일 (전체 래퍼) --- */
  background-color: #ffffff;
  width: 100%;
  height: 100%;
  min-width: 50%;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Pretendard', sans-serif;
  color: #131313;
  overflow: hidden; /* border-radius 적용을 위해 */

  /* --- 2. CalendarHeader 스타일 --- */
  .fc-header-toolbar {
    /* CalendarHeader 스타일 적용 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #ddd;
    background-color: #fff;
    margin-bottom: 0 !important;
  }

  .fc-toolbar-title {
    /* HeaderTitle 스타일 적용 */
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }

  .fc-prev-button, .fc-next-button {
    /* NavButton 스타일 적용 */
    background: none !important;
    border: 1px solid #9d9d9dff !important;
    box-shadow: none !important; /* 기본 그림자 제거 */
    margin: 0;
    padding: 0.4rem;
    font-size: 1rem;
    cursor: pointer;
    color: #555;
  }

  /* --- 3. DayCell / DayNumber 스타일 --- */
  .fc-daygrid-day {
    /* DayCell의 테두리 스타일 적용 */
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
    
    /* 7번째 셀(토요일)마다 오른쪽 테두리 제거 */
    &:nth-child(7n) {
      border-right: none;
    }
  }

/* --- 👇 3. 요일 헤더 스타일 (월화수목금토일) --- */
  .fc-col-header-cell {
    background-color: #f8f9fa; /* 헤더 배경색 변경 */
    border-bottom: 1px solid #ddd; /* 헤더 하단 테두리 */
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* 요일 헤더 글자 (예: "월") */
  .fc-col-header-cell-cushion {
    color: #555; /* 글자색 변경 */
    padding: 12px 4px; /* 내부 여백 */
  }

  /* --- 👇 4. (참고) 주말 요일 헤더 색상 변경 --- */
  .fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion {
    color: #d9534f; /* 일요일 헤더 글자색 */
  }
  .fc-col-header-cell.fc-day-sat .fc-col-header-cell-cushion {
    color: #0275d8; /* 토요일 헤더 글자색 */
  }

  /* DayCell의 높이 적용 (내부 프레임에 적용) */
  .fc-daygrid-day-frame {
    height: 100px; 
    /* overflow-y: auto; 내용 많으면 스크롤 */
  }

  /* 날짜 숫자 스타일 (DayNumber) */
  .fc-daygrid-day-number {
    font-weight: 500;
    margin-bottom: 0.25rem;
    padding: 0.5rem; /* DayCell의 padding */
    color: #131313; /* DayCell의 color */
  }

  .fc-daygrid-day {
    color: #000;
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
    /* background-color: #e6f7ff !important;
    border: 1px solid #b3e0ff !important; */
    /* color: #0056b3 !important; */

    /* 2. !important가 없는 기본 스타일만 남김 */
    background-color: #e6f7ff; /* (기본값) */
    border: 1px solid #b3e0ff; /* (기본값) */
    color: #0056b3; /* (기본값) */

    border-radius: 4px;
    padding: 3px 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    
    /* EventTag의 텍스트 스타일 */
    .fc-event-title {
      color: #0056b3; /* (기본값) */
      font-weight: 500;
      /* white-space: nowrap; */
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* --- 6. 기타 스타일 정리 --- */
  
  /* 캘린더의 기본 테두리 제거 (Wrapper 테두리 사용) */
  .fc-scrollgrid, .fc-view {
    border: none;
  }
`;