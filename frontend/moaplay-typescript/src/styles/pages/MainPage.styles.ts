import styled from 'styled-components';

export const MainPageContainer = styled.div`
  /* 1 최대 너비 설정 */
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  /* 2 반응형 조정 */
  @media (max-width: 1024px) {
    padding: 0 16px;
  }

  @media (max-width: 768px) {
    padding: 0 12px;
  }

  @media (max-width: 480px) {
    padding: 0 8px;
  }
`;

export const CalendarSection = styled.section`
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-bottom: 2rem;

  /* 반응형: 모바일에서 세로 정렬 */
  @media (max-width: 1024px) {
    gap: 16px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

export const CalendarWrapper = styled.div`
  position: relative;   /* 버튼 기준점 */
  flex: 2;
  min-width: 0;
  background-color: #fff;

  @media (max-width: 768px) {
    width: 100%;
    flex: none;
  }
`;

export const CalendarDetailWrapper = styled.div`
  flex: 1;
  min-width: 0;
  background-color: #fff;

  @media (max-width: 768px) {
    width: 100%;
    flex: none;
    order: -1; /* 모바일에서 상세 패널을 캘린더 위로 */
  }
`;

export const BannerWrapper = styled.div`
  width: 100vw; /* 화면 전체 폭 */
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw; /* 부모의 중앙 정렬 깨지지 않게 조정 */

  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    margin-top: 0;
  }
`;

export const BannerImage = styled.img`
  display: block;
  width: 100%;
  max-width: 1200px;
  aspect-ratio: 6 / 1; /* 1200x200 비율 유지 */
  object-fit: cover;
  margin: 0px auto 50px auto;

  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  transition: filter 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
  }

  /* ✅ 반응형 크기 조정 */
  @media (max-width: 768px) {
    max-height: 180px;
  }
`;

export const SyncButtonWrapper = styled.div`
  margin-left: 59%;
  margin-bottom: 10px;
  z-index: 10;

  @media (max-width: 768px) {
    top: 10px;
    left: 60%;
  }
`;