// src/pages/EventSearchPage.styles.ts
import styled from 'styled-components';

// --- 타입 정의 ---
export interface ITagButtonProps {
  active?: boolean;
}

// --- 스타일 컴포넌트 ---
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

export const TagButton = styled.button<ITagButtonProps>`
  background-color: ${props => props.active ? '#F2E9FF' : '#F0F0F0'};
  border: 1px solid ${props => props.active ? '#8A2BE2' : '#E0E0E0'};
  color: ${props => props.active ? '#8A2BE2' : '#333'};
  font-weight: ${props => props.active ? '700' : '500'};
  border-radius: 15px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background-color: #E0E0E0; }
  &.add-tag { background-color: #fff; color: #777; }
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