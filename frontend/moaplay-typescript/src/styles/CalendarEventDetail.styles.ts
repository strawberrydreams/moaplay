import styled from 'styled-components';

// 공통 인터페이스
interface IEventListItemProps {
  $dotColor: string;
}

/* --- 전체 래퍼 --- */
export const CalendarDetailWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 3px;
  color: #333;
  border: 2px solid #d9d9d9;
  display: flex;
  flex-direction: column;
  height: 765px;

  @media (max-width: 768px) {
    max-width: 100%;
    height: auto;
    border: none;
    border-radius: 0;
  }
`;

/* --- 헤더 --- */
export const CalendarDetailHeader = styled.h2`
  background-color: #fff;
  padding: 1.2rem 1.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.8rem;
  }
`;

export const HeaderTitle = styled.span`
  flex-grow: 1;
  text-align: center;
`;

export const BackButton = styled.button`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #555;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    top: 45%;
    left: 1rem;
  }
`;

export const LoginPrompt = styled.div`
  padding: 2rem;
  text-align: center;
  color: #777;
  font-size: 0.95rem;
`;

/* --- 이벤트 리스트 --- */
export const EventListWrapper = styled.div`
  padding: 0.5rem 0;
  flex-grow: 1;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 0;
  }
`;

export const EventListItem = styled.div<IEventListItemProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #d9d9d9;

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
    background-color: ${(props) => props.$dotColor};
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

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;

    .event-title {
      font-size: 0.85rem;
    }
    .event-date {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;

    .event-date {
      margin-left: 0;
      color: #666;
    }
  }
`;

/* --- 상세 카드 --- */
export const DetailCardWrapper = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    height: 160px;
    font-size: 2rem;
  }
`;

export const DetailTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.8rem 0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const DetailInfoGrid = styled.div`
  display: grid;
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

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;

    p {
      font-size: 0.85rem;
    }
  }
`;

export const DetailTagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  h4 {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
`;

export const DetailTag = styled.span`
  display:flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #f1f1f1ff;
  padding: 4px 5px;
  font-size: 0.75rem;
  color: #8d8d8dff;
  font-weight: 500;
  cursor: pointer;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 3px 4px;
  }
`;

export const DetailDescription = styled.div`
  margin-bottom: 1.5rem;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
  p {
    font-size: 0.9rem;
    color: #555;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  @media (max-width: 480px) {
    p {
      font-size: 0.85rem;
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const DetailButton = styled.button<{ primary?: boolean; danger?: boolean }>`
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  background-color: ${(props) =>
    props.danger ? '#ff4d4f' : props.primary ? '#8A2BE2' : '#f0f0f0'};
  color: ${(props) => (props.danger || props.primary ? '#fff' : '#555')};
  border: 1px solid
    ${(props) => (props.danger ? '#ff4d4f' : props.primary ? '#8A2BE2' : '#ddd')};

  &:hover {
    opacity: 0.9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.7rem 0.9rem;
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

export const LoginPromptWrapper = styled.div`
  padding: 2rem;
  text-align: center;

  p {
    color: #777;
    font-size: 0.95rem;
    margin: 0 0 1rem 0;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    p {
      font-size: 0.9rem;
    }
  }
`;

export const LoginButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  width: 128px;
  height: 30px;
  border: 1px solid #757575;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  @media (max-width: 480px) {
    width: 100%;
    height: 36px;
  }
`;

export const NoEventsMessage = styled.p`
  padding: 2rem;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.95rem;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 1rem;
  }
`;
