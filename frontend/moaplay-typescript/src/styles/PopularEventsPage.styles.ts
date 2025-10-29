import styled from 'styled-components';
import flagImg from '../assets/rank_flag.png';

export const PageContainer = styled.div`
  max-width: 1200px; // 페이지 전체 최대 너비
  margin: 2rem auto;
  padding: 0 1rem;
  color: #131313;
`;

// --- 상단 인기 랭킹 섹션 ---
export const TopEventsSection = styled.section`
  margin-bottom: 3rem; // 하단 검색 섹션과의 간격
`;

export const TopEventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 3열 그리드
  gap: 1.5rem; // 카드 간 간격

  @media (max-width: 992px) { // 화면 줄어들면 1열로
    grid-template-columns: 1fr;
  }
`;

// --- 랭킹 카드 스타일 ---
export const RankedEventCardWrapper = styled.div`
  position: relative; // 랭킹 번호 위치 기준
  background-color: #f8f8f8; // 카드 배경색 (이미지 참고)
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  /* EventCard 컴포넌트를 직접 스타일링하기 어려우므로 래퍼 사용 */
  & > div { // EventCard 컴포넌트를 가리킴 (구조에 따라 변경 필요)
    border: none; // EventCard 자체 테두리 제거 (선택 사항)
    box-shadow: none; // EventCard 자체 그림자 제거 (선택 사항)
    height: 100%; // 래퍼 높이에 맞춤
  }
`;

export const RankNumber = styled.div`
  position: absolute;
  top: -170px;
  left: 10px;
  
  /* --- 👇 배경 이미지 설정 --- */
  background-image: url(${flagImg}); /* 👈 실제 이미지 경로로 수정! */
  background-size: contain; /* 이미지가 요소 안에 맞게 크기 조절 */
  background-repeat: no-repeat;
  background-position: center; 
  /* --- 👆 --- */

  /* --- 👇 요소 크기 및 텍스트 스타일 (이미지에 맞게 조절 필요) --- */
  width: 45px;  /* 👈 깃발 이미지의 실제 너비에 맞게 조절 */
  height: 60px; /* 👈 깃발 이미지의 실제 높이에 맞게 조절 */
  
  display: flex;
  justify-content: center; /* 숫자 가로 중앙 */
  align-items: center; /* 숫자 세로 중앙 */
  padding-bottom: 10px; /* 👈 숫자 위치 미세 조정 (꼬리 부분 피하기) */
  box-sizing: border-box; /* 패딩 포함 크기 계산 */

  color: white; /* 숫자 색상 */
  font-size: 1.4rem; /* 숫자 크기 (조절 가능) */
  font-weight: bold;
  text-align: center;
  /* --- 👆 --- */
  
  z-index: 1;

`;