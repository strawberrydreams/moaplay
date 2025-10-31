// src/styles/CalendarEventDetail.styles.ts
import styled from 'styled-components';

interface IEventListItemProps {
  $dotColor: string;
}

export const CalendarDetailWrapper = styled.div`
  max-width: 400px; /* 이미지와 유사한 고정 너비 */
  min-height: 600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  border: 2px solid #d9d9d9;
  overflow: hidden;
  font-family: 'Noto Sans KR', sans-serif;
  height: 765px;
  color: #131313;
`;

export const CalendarDetailHeader = styled.h2`
  background-color: #fff;
  padding: 1.2rem 1.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;

  /* --- 👇 1. 수정/추가 --- */
  display: flex;
  align-items: center;
  justify-content: center; /* 제목을 중앙에 유지 */
  position: relative; /* 버튼을 좌우에 배치하기 위함 */
`;

// 2. 제목을 감싸는 span (중앙 정렬을 위해)
export const HeaderTitle = styled.span`
  flex-grow: 1;
  text-align: center;
`;

// 3. 새로 추가할 '이전' 버튼 스타일
export const BackButton = styled.button`
  /* 헤더의 왼쪽에 절대 위치 */
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);

  /* 버튼 스타일 초기화 */
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  
  /* 아이콘 스타일 */
  font-size: 1.25rem; /* 아이콘 크기 */
  color: #555;
  line-height: 1; /* 아이콘 세로 정렬 */
  
  &:hover {
    color: #000;
  }
`;

export const LoginPrompt = styled.div`
  padding: 2rem;
  text-align: center;
  color: #777;
  font-size: 0.95rem;
`;

export const EventListWrapper = styled.div`
  padding: 0.5rem 0;
  max-height: calc(100% - 60px); /* 헤더 높이 제외 */
  overflow-y: auto;
`;

export const EventListItem = styled.div<{ $dotColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #d9d9d9; /* 구분선 */

  &:hover {
    background-color: #f5f5f5;
  }
  &:last-child {
    border-bottom: none;
  }

  .event-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.$dotColor};
    margin-right: 10px;
    flex-shrink: 0;
  }

  .event-title {
    flex-grow: 1;
    font-size: 0.95rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-date {
    font-size: 0.9rem;
    color: #888;
    margin-left: 10px;
    flex-shrink: 0;
  }
`;

// --- 상세 행사 카드 스타일 (Image 2) ---
export const DetailCardWrapper = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

export const DetailImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background-color: #e0e0e0;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.2rem;
  color: #aaa;
  font-size: 3rem;
  .placeholder-icon {
    font-size: 3rem;
    color: #CCC;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
`;

export const DetailTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.8rem;
`;

export const DetailInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    span {
      font-weight: 500;
      color: #333;
    }
  }
`;

export const DetailTagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
`;

export const DetailTag = styled.span`

  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #f1f1f1ff;
  padding: 4px 5px;
  width: auto;
  height: 15px;
  font-size: 0.75rem;
  color: #8d8d8dff;
  font-weight: 500;
`;

export const DetailDescription = styled.div`
  margin-bottom: 1.5rem;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.5;
    white-space: pre-wrap; /* 줄바꿈 유지 */
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto; /* 하단에 붙도록 */
`;

export const DetailButton = styled.button<{ primary?: boolean; danger?: boolean }>`
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${props => 
    props.danger ? '#ff4d4f' : 
    props.primary ? '#8A2BE2' : '#f0f0f0'
  };
  color: ${props => 
    props.danger || props.primary ? '#fff' : '#555'
  };
  border: 1px solid ${props => 
    props.danger ? '#ff4d4f' : 
    props.primary ? '#8A2BE2' : '#ddd'
  };

  &:hover {
    opacity: 0.9;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

export const Placeholder = styled.p`
  padding: 2rem;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.95rem;
  margin: 0;
`;

// 'LoginPrompt'를 'LoginPromptWrapper'로 변경하고 스타일 수정
export const LoginPromptWrapper = styled.div`
  padding: 2rem;
  text-align: center;
  align-items: center;
  
  p {
    color: #777;
    font-size: 0.95rem;
    margin-top: 0;
    margin-bottom: 1rem; /* 버튼과 간격 */
  }
`;

// 새로 추가할 로그인 버튼 스타일
export const LoginButton = styled.button`
  display: inline-flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;  /* (기존 코드) */
  gap: 8px; /* 👈 아이콘과 텍스트 사이의 공백 (10px로 수정 가능) */
  padding: 0px 10px;

  width: 128px;
  height: 30px;

  border: 1px solid #757575;
  border-radius: 5px;
  
  /* --- 기본 버튼 스타일 추가 --- */
  background-color: #fff; /* 배경색 */
  color: #333; /* 글자색 */
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5; /* 호버 시 약간 어둡게 */
  }
`;

export const NoEventsMessage = styled.p`
  padding: 2rem;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.95rem;
  margin: 0;
`;