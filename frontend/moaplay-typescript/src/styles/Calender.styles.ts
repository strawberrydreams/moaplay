import styled from 'styled-components';

// DayCell에서 사용할 props 타입을 정의
interface IDayCellProps {
  header?: boolean;
  blank?: boolean;
}

// DayNumber를 DayCell보다 먼저 정의해야 DayCell에서 참조 가능
export const DayNumber = styled.span`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

// props 타입을 <IDayCellProps>로 전달
export const DayCell = styled.div<IDayCellProps>`
  height: 120px;
  padding: 0.5rem;
  font-size: 0.9rem;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* 7번째 셀(토요일)마다 오른쪽 테두리 제거 */
  &:nth-child(7n) {
    border-right: none;
  }
  
  /* 주말 색상 적용 */
  &:nth-child(7n+1) ${DayNumber} { /* 일요일 */
    color: #d9534f;
  }
  &:nth-child(7n) ${DayNumber} { /* 토요일 */
    color: #0275d8;
  }

  /* props에 따른 조건부 스타일 */
  ${props => props.header && `
    height: auto;
    padding: 0.75rem 0.5rem;
    font-weight: 600;
    text-align: center;
    background-color: #f9f9f9;
  `}

  ${props => props.blank && `
    background-color: #fafafa;
  `}
`;

export const CalendarContainer = styled.div`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Pretendard', sans-serif;
`;

export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ddd;
`;

export const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #555;
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: left;

  /* DayCell을 참조해야 하므로 DayCell보다 아래에 정의 */
  &:last-child ${DayCell} {
    border-bottom: none;
  }
`;

export const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const EventTag = styled.div`
  background-color: #e6f7ff;
  border: 1px solid #b3e0ff;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #0056b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;