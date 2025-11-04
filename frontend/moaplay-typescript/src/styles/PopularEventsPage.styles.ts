import styled from 'styled-components';
import flagImg from '../assets/rank_flag.png';

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #131313;

  @media (max-width: 1024px) {
    padding: 0 1.5rem;
  }

  @media (max-width: 768px) {
    margin: 1.5rem auto;
    padding: 0 1rem;
  }

  @media (max-width: 480px) {
    margin: 1rem auto;
    padding: 0 0.75rem;
  }
`;

/* --- 상단 인기 랭킹 섹션 --- */
export const TopEventsSection = styled.section`
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

/* --- 랭킹 카드 그리드 --- */
export const TopEventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  /* ✅ 화면 크기에 따른 열 개수 조정 */
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

/* --- 랭킹 카드 --- */
export const RankedEventCardWrapper = styled.div`
  position: relative;
  background-color: #f8f8f8;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }

  & > div {
    border: none;
    box-shadow: none;
    height: 100%;
  }

  @media (max-width: 768px) {
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    border-radius: 8px;
  }
`;

/* --- 깃발 랭킹 넘버 --- */
export const RankNumber = styled.div`
  position: absolute;
  top: -160px;
  left: 12px;
  background-image: url(${flagImg});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  width: 45px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 10px;
  box-sizing: border-box;

  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  z-index: 1;

  /* ✅ 반응형 크기 조정 */
  @media (max-width: 1024px) {
    width: 40px;
    height: 55px;
    top: -170px;
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    width: 38px;
    height: 50px;
    top: -140px;
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    width: 34px;
    height: 45px;
    top: -115px;
    font-size: 1rem;
  }
`;
