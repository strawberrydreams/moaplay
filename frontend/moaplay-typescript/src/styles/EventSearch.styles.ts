// src/pages/EventSearch.styles.ts
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

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

export const SearchContainer = styled.form`
  background-color: #F9F9F9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #E0E0E0;

  @media (max-width: 600px) {
    padding: 1rem;
  }
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
  flex: 1;

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
    width: 100%;
  }

  &.order-select {
    select {
      display: flex;
      justify-content: right !important;
      width: 18%;
    }
  }

  &.search-bar {
    flex-grow: 3;
    input { width: 100%; padding-right: 2rem; }
  }

  input[type="text"] {
    padding: 0.5rem 65px 0.5rem 0.75rem;
  }

  @media (max-width: 600px) {
    label {
      font-size: 0.8rem;
    }
    input, select {
      font-size: 0.85rem;
    }
    input[type="date"] {
      display: flex;
    }
  }

  @media (max-width: 480px) {
    width: 100% !important;
    display: flex;
    justify-content: left;
    align-items: center;
    flex-direction: column;

    &.order-select {
    select {
      width: 100%;
    }
  }
  }
`;

export const SearchButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0 10px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80%;
  color: #777;
  right: 5px;

  &:hover { color: #333; }
  &:focus { outline: none; }

  @media (max-width: 480px) {
    right: 2px;
    margin-top: 13px;
    padding: 0 6px;
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0 10px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80%;
  color: #aaa;
  right: 35px;
  font-size: 1.2rem;

  &:hover { color: #555; }
  &:focus { outline: none; }

  @media (max-width: 480px) {
    font-size: 1rem;
    right: 28px;
  }
`;

export const DateRangeGroup = styled(InputGroup)`
  span {
    color: #777;
    font-weight: 500;
    font-size: 0.9rem;
  }

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
    width: 30% !important;

    input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    display: block !important;
    width: 50%;
    opacity: 1 !important;
    filter: invert(56%) sepia(61%) saturate(1510%) hue-rotate(224deg) brightness(94%) contrast(91%);
    }
  }

  @media (max-width: 480px) {
    span {
      font-size: 0.8rem;
    }
    width: 100% !important;
    display: flex;
    justify-content: left;
    align-items: center;
    flex-direction: column;

    input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    display: block !important;
    width: 15% !important;
    opacity: 1 !important;
    filter: invert(56%) sepia(61%) saturate(1510%) hue-rotate(224deg) brightness(94%) contrast(91%);
    }
  }
`;

export const FilterRow = styled(FormRow)`
  justify-content: space-between;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: flex-start;
    gap: 0.75rem;
  }
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

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;

    .filter-label {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  @media (max-width: 480px) {
    gap: 0.4rem;
  }
`;

export const DeleteTagButton = styled.span`
  display: none;
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  background-color: #865dd1;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #7043c1;
  }
`;

export const TagButton = styled.button<ITagButtonProps>`
  position: relative;
  border-radius: 15px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #865dd1;
  color: white;
  border: 1px solid #d9d9d9;
  padding: 0.4rem 22px 0.4rem 1rem;

  &:hover ${DeleteTagButton} {
    display: block;
  }

  &.add-tag {
    background-color: #fff;
    color: #777;
    padding: 0.4rem 1rem;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.35rem 18px 0.35rem 0.8rem;
  }
`;

export const TagInput = styled.input`
  background-color: #fff;
  border: 1px solid #E0E0E0;
  border-radius: 15px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  width: 100px;
  outline: none;
  font-family: inherit;
  color: #333;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    border: 1px solid #865dd1;
  }

  @media (max-width: 480px) {
    width: 100%;
    font-size: 0.8rem;
  }
`;

export const EventGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const NoResultsMessage = styled.p`
  grid-column: 1 / -1;
  width: 100%;
  text-align: center;
  color: #777;
  padding: 3rem 0;
  font-size: 1rem;

  @media (max-width: 480px) {
    padding: 2rem 0;
    font-size: 0.9rem;
  }
`;

export const LoadingMessage = styled.div`
  margin: 32px auto;
  text-align: center;
  color: #888;
  font-size: 1rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin: 24px auto;
  }
`;
