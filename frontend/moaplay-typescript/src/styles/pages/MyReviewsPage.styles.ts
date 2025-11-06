import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif;

  @media (max-width: 1024px) {
    max-width: 700px;
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 1.2rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

export const NoResultsWrapper = styled.div`
  text-align: center;
  padding: 4rem 0;

  @media (max-width: 480px) {
    padding: 2rem 0;
  }
`;

export const NoResultsMessage = styled.p`
  color: #aaa;
`;

export const ReviewGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  /* 카드 내부가 너무 좁아지는 걸 방지 */
  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap; /* ✅ 모바일에서 버튼 줄바꿈 허용 */

  button {
    background: #9e77ed;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: #734ebdff;
    }

    @media (max-width: 480px) {
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
    }
  }

  span {
    font-size: 0.9rem;
    color: #ccc;

    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 6px;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #555;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
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
