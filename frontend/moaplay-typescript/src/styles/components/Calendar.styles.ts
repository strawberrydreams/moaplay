import styled from 'styled-components';

export const StyledCalendarWrapper = styled.div`
  background-color: #ffffff;
  width: 100%;
  max-width: 960px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  color: #131313;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0 auto;
  transition: all 0.3s ease;

  /* 반응형: 모바일에서는 좌우 여백을 줄임 */
  @media (max-width: 768px) {
    max-width: 100%;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }


  /* --- 1. Toolbar 스타일 --- */
  .fc-header-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 0 !important;
    flex-wrap: wrap;
    gap: 0.5rem;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 1rem;
      gap: 0.75rem;
    }
  }

  .fc-toolbar-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #1f2937;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  .fc-prev-button,
  .fc-next-button {
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

    @media (max-width: 768px) {
      padding: 0.4rem 0.6rem;
      font-size: 0.9rem;
    }
  }

  /* --- 2. 날짜 셀 --- */
  .fc-daygrid-day {
    border-right: 1px solid #f3f4f6;
    border-bottom: 1px solid #f3f4f6;
    background: #ffffff;

    &:nth-child(7n) {
      border-right: none !important;
    }

    &.fc-daygrid-day-other {
      background-color: #fafafb;
      color: #9ca3af;
    }

  }

  /* --- 3. 요일 헤더 --- */
  /* --- 3. 요일 헤더 (크기 줄이기 & 간격 압축) --- */
  .fc-col-header-cell {
    background-color: #f8f9fa;
    border-bottom: 1px solid #ddd;
    font-size: 0.8rem; /* 기존 0.9rem → 더 작게 */
    font-weight: 600;
    padding: 0 !important; /*전체 여백 제거 */

    @media (max-width: 768px) {
      font-size: 0.7rem; /* 모바일에선 더 작게 */
    }
  }

  .fc-col-header-cell-cushion {
    color: #555;
    padding: 6px 0 !important; /* 위아래 여백 축소 */
    display: block;
    text-align: center;
  }

  /*  요일 색상 유지 */
  .fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion {
    color: #d9534f;
  }
  .fc-col-header-cell.fc-day-sat .fc-col-header-cell-cushion {
    color: #0275d8;
  }

    /* --- 4. 날짜 셀 내부 프레임 --- */
  .fc-daygrid-day-frame {
    height: auto !important; /* 고정 높이 제거 */

    display: flex;
    flex-direction: column;
    overflow: visible !important; /*  내부 콘텐츠 잘림 방지 */
    box-sizing: border-box;

    @media (max-width: 768px) {
      min-height: 80px;
    }

    @media (max-width: 480px) {
      max-height: 60px;
      min-height: 30px;
    }
  }

  .fc-daygrid-day {
  padding: 0 !important;
  }


  /* 이벤트가 여러 개일 때 자동 줄바꿈 허용 */
  .fc-daygrid-day-events {
    overflow: visible !important;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .fc-daygrid-day-number {
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #131313;

    .fc-daygrid-day-other & {
      color: #9ca3af !important;
    }

    @media (max-width: 768px) {
      font-size: 0.8rem;
      padding: 4px;
    }
  }

  .fc-day-sun .fc-daygrid-day-number {
    color: #d9534f !important;
  }
  .fc-day-sat .fc-daygrid-day-number {
    color: #0275d8 !important;
  }

  /* --- 5. 이벤트 태그 --- */
  .fc-event {
    background-color: #e0f2ff;
    border: 1px solid #a3d8ff;
    color: #1e3a8a;
    border-radius: 8px;
    padding: 3px 15px;
    align-items: center;
    justify-content: center;
    margin-top: 3px;
    font-size: 0.8rem;
    font-weight: 600;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
      font-size: 0.7rem;
      padding: 3px 6px;
      border-radius: 6px;
    }

    .fc-event-title {
      color: #0056b3;
      width: 100%;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .fc-event.event-hovered,
  .fc-event.event-clicked {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    filter: brightness(90%);
    transition: all 0.2s ease-in-out;
  }

  .fc-daygrid-event {
  /* Or use a fixed pixel value */
  width: 100%;
  cursor: pointer;
  }

  /* --- 6. FullCalendar 기본 테두리 제거 --- */
  .fc-scrollgrid,
  .fc-view {
    border: none;
  }

  /* ✅ 모바일에서 캘린더 전체를 스크롤 가능하게 */
  @media (max-width: 480px) {
    .fc-daygrid {
      overflow-x: auto;
      min-width: 450px;
    }
  }

  .fc-toolbar-chunk .fc-googleSync-button {
    border-radius: 999px;
    background: linear-gradient(135deg, #4285f4, #5c9dff);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.35rem 0.9rem;
    border: none;
    box-shadow: 0 3px 8px rgba(66, 133, 244, 0.3);
  }

  .fc-toolbar-chunk .fc-googleSync-button:hover {
    background: linear-gradient(135deg, #2f6ad6, #4a8cff);
    box-shadow: 0 4px 10px rgba(66, 133, 244, 0.4);
  }
`;
