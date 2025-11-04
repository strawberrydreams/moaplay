import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;

  @media (max-width: 1024px) {
    max-width: 850px;
    padding: 0 1.5rem;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1.2rem;
  }

  @media (max-width: 480px) {
    padding: 0 1rem;
    margin: 1rem auto;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.8rem;

  @media (max-width: 600px) {
    gap: 6px;
    margin-bottom: 1.2rem;
    padding-bottom: 0.6rem;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap; /* ✅ 모바일에서 줄바꿈 허용 */

  button {
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background-color: #eaeaea;
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }

    @media (max-width: 480px) {
      font-size: 0.85rem;
      padding: 5px 10px;
    }
  }

  span {
    font-size: 0.95rem;
    color: #333;

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }
`;

export const NoResultsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;

  @media (max-width: 480px) {
    height: 150px;
  }
`;

export const NoResultsMessage = styled.p`
  color: #888;
  text-align: center;
  width: 100%;
  margin: 0;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
