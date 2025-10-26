// src/pages/EventSearchPage.styles.ts
import styled from 'styled-components';

// --- 타입 정의 ---
export interface ITagButtonProps {
  $active?: boolean;
}

// --- 스타일 컴포넌트 ---
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #131313;
`;

export const SearchContainer = styled.section`
  background-color: #F9F9F9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #E0E0E0;
`;

export const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;

  &:last-child { margin-bottom: 0; }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  label {
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
  }
  input[type="text"],
  input[type="date"],
  select {
    color: #777;
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    background-color: #fff;
    font-family: inherit;
  }
  &.search-bar {
    flex-grow: 1;
    input { width: 100%; padding-right: 2rem; }
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #777;
  cursor: pointer;
`;

export const DateRangeGroup = styled(InputGroup)`
  span { color: #777; font-weight: 500; }

  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    display: block !important;
    opacity: 1 !important;
    filter: invert(56%) sepia(61%) saturate(1510%) hue-rotate(224deg) brightness(94%) contrast(91%);
  }

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    input { flex-grow: 1; }
  }
`;

export const FilterRow = styled(FormRow)`
  justify-content: space-between;
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  .filter-label {
    font-weight: 700;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const DeleteTagButton = styled.span`
  display: none; /* 평소에는 숨김 */
  position: absolute;
  top: 50%;
  right: 5px; /* 오른쪽에서 5px 떨어짐 */
  transform: translateY(-50%); /* 세로 중앙 정렬 */
  
  width: 14px;
  height: 14px;
  line-height: 14px; /* 'x' 기호 중앙 정렬 */
  text-align: center;
  
  background-color: #865dd1;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background-color: #865dd1;
  }
`;

export const TagButton = styled.button<ITagButtonProps>`
  /* ... (기존 스타일: background-color, border, color, etc.) ... */
  border-radius: 15px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #865dd1;
  border: 1px solid #d9d9d9;

  /* 3. 삭제 버튼을 위한 position과 padding 추가 */
  position: relative; /* 자식(DeleteTagButton)을 absolute로 위치시키기 위함 */
  padding: 0.4rem 22px 0.4rem 1rem; /* 👈 오른쪽 패딩(22px)을 줘서 'x' 버튼 공간 확보 */

  /* 4. 마우스를 올리면 삭제 버튼을 보여줌 */
  &:hover ${DeleteTagButton} {
    display: block;
  }

  &.add-tag { 
    background-color: #fff; 
    color: #777; 
    padding: 0.4rem 1rem; /* 👈 + 버튼은 오른쪽 패딩이 필요 없음 */
  }
`;

// --- 👇 1. 이 스타일을 새로 추가합니다. ---
export const TagInput = styled.input`
  background-color: #fff;
  border: 1px solid #8A2BE2; /* 활성화된 태그 버튼과 유사하게 */
  border-radius: 15px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  width: 100px; /* 입력창 너비 (조절 가능) */
  outline: none;
  font-family: inherit;
  color: #333;
  
  &::placeholder {
    color: #aaa;
  }
`;

export const EventGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;