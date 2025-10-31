import styled from 'styled-components';

export const MainPageContainer = styled.div`
  /* 1. 최대 너비 설정 */
  width: 1200px; 
  
  /* 2. 'margin: 0 auto'를 사용해 컨테이너 자체를 가운데 정렬합니다. */
  margin-left: auto;
  margin-right: auto;

  /* 페이지 좌우에 여백을 줄 수도 있습니다. */
  padding: 0 20px;
`;

export const CalendarSection = styled.section`
  /* 캘린더 + 상세정보 섹션을 가로(행)로 배치 */
  display: flex;
  flex-direction: row; /* 행 방향 */
  gap: 20px; /* 캘린더와 상세정보 사이의 간격 */
  margin-bottom: 2rem; /* EventSearchPage와의 간격 */
`;

export const CalendarWrapper = styled.div`
  /* 캘린더가 차지할 비율 */
  flex: 2; /* 2의 비율 (약 66%) */
  min-width: 0; /* flex 아이템이 부모보다 커지는 것을 방지 */
`;

export const CalendarDetailWrapper = styled.div`
  /* 상세정보가 차지할 비율 */
  flex: 1; /* 1의 비율 (약 33%) */
  min-width: 0;
`;

export const BannerImage = styled.img`
  display: block;
  align-item: center;
  justify-content: center;
  margin-top: -30px;
  margin-bottom: 50px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));

  transition: filter 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
  }
`;