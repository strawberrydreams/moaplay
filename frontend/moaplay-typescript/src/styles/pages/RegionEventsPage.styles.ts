import styled from 'styled-components';

/* 전체 페이지 컨테이너 */
export const PageContainer = styled.div`
  color: #333;
  max-width: 1200px;
  margin: -16px auto;
  padding: 0 1rem;
`;

/* 상단 지역 선택 컨테이너 */
export const RegionSelectorContainer = styled.section`
  position: relative;
  background-color: #e8e4ff; /* 💜 연보라 배경 */
  border-radius: 0 0 24px 24px;
  padding: 1.8rem 2rem 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
`;

/* 지역 선택 스크롤 감싸는 박스 */
export const RegionContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  width: 100%;
  max-width: 1000px;
  height: 140px;
  position: relative;
`;

/* 지역 리스트 */
export const RegionList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.2rem;
  overflow-x: auto;
  overflow-y: visible;
  scroll-behavior: smooth;
  scrollbar-width: none;
  flex-grow: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;

/* 지역 버튼 전체 */
export const RegionButtonWrapper = styled.div`
  flex-shrink: 0;
  text-align: center;
  cursor: pointer;
  padding-top: 10px;
  transition: transform 0.2s ease, margin 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    margin-top: -3px;
  }
`;

/* 지역 아이콘 */
export const RegionButtonIcon = styled.div<{ $isActive?: boolean }>`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: ${({ $isActive }) => ($isActive ? '#7a5af8' : '#ffffff')};
  color: ${({ $isActive }) => ($isActive ? '#fff' : '#c5b9ff')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: ${({ $isActive }) =>
    $isActive
      ? '0 4px 10px rgba(122, 90, 248, 0.3)'
      : '0 3px 8px rgba(0, 0, 0, 0.08)'};
  transition: all 0.25s ease;
  position: relative; /* ✅ hover시 그림자까지 표시되도록 */
  z-index: 1;
`;

/* 지역 이름 */
export const RegionButtonLabel = styled.div<{ $isActive?: boolean }>`
  margin-top: 0.6rem;
  font-size: 0.95rem;
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '400')};
  color: ${({ $isActive }) => ($isActive ? '#333' : '#555')};
`;

/* 좌우 화살표 버튼 */
export const ArrowButton = styled.button<{ direction: 'left' | 'right' }>`
  background: transparent;
  border: none;
  color: #7a5af8;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: #5f40c7;
  }
`;

/* 행사 카드 영역 */
export const EventGridContainer = styled.div`
  min-height: 300px;
  background-color: #fafafa;
  padding: 2.5rem 1rem;
  border-radius: 24px;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.02);
`;

/* 더보기 버튼 */
export const LoadMoreButton = styled.button`
  display: block;
  margin: 3rem auto;
  background: #f3f3f3;
  color: #333;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

   &:hover {
    background: #e0e0e0;
  }

  &:focus { outline : none; }
`;

/* 로딩 / 에러 문구 */
export const LoadingText = styled.div`
  text-align: center;
  color: #777;
  margin: 2rem 0;
  font-size: 1rem;
`;

export const ErrorText = styled.div`
  text-align: center;
  color: #e25555;
  margin: 2rem 0;
  font-size: 1rem;
`;
