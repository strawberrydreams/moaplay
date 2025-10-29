import styled from 'styled-components';

export const PageContainer = styled.div`
  /* max-width: 1440px; // 최대 너비 설정 (참고 CSS 반영)
  margin: 2rem auto; */
  margin-top: 0;
  margin-bottom: 2rem;
  padding: 0;
`;

// --- 지역 선택 섹션 ---
export const RegionSelectorContainer = styled.div`
  background-color: #f0f3ff; 
  padding: 2rem 0; /* 좌우 패딩은 내부 래퍼로 옮김 */
  border-radius: 12px;
  margin-bottom: 2rem;
  overflow: hidden; 
  position: relative; 

  /* 👇 max-width와 margin: auto 제거 */
  /* max-width: 1200px; */
  /* margin-left: auto; */
  /* margin-right: auto; */
`;

export const RegionContentWrapper = styled.div`
  max-width: 1200px; /* 내용물의 최대 너비 (조절 가능) */
  margin: 0 auto;    /* 내용물을 가운데 정렬 */
  position: relative; /* 화살표 위치 기준 */
  padding: 0 1rem;    /* 내용물 좌우 여백 */
`;

export const RegionList = styled.div`
  display: flex;
  gap: 20px; // 버튼 간 간격
  overflow-x: auto; // 내용 많으면 가로 스크롤 (화살표로 제어할 수도 있음)
  padding: 0 20px; // 좌우 화살표 공간 확보
  margin : 0 35px;
  /* 스크롤바 숨기기 (선택 사항) */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none; 
  scrollbar-width: none; 
`;

export const RegionButtonWrapper = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  
  min-width: 120px; // 버튼 최소 너비
`;

export const RegionButtonIcon = styled.div<{ $isActive: boolean }>`
  width: 120px; // 원형 아이콘 크기
  height: 120px;
  border-radius: 50%;
  background-color: white; // 흰색 원
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform ease;

  // 선택 시 효과 (예: 배경색 변경 또는 테두리)
  transform: ${props => props.$isActive ? 'scale(1.2)' : 'transparent'};

  // box-shadow: 0 2px 4px rgba(0,0,0,0.1); // 그림자 효과 (선택 사항)
`;

export const RegionButtonLabel = styled.span<{ $isActive: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  transition: margin transform ease;

  // 선택 시 효과 (예: 배경색 변경 또는 테두리)
  margin: ${props => props.$isActive ? '13px' : 'transparent'};
  transform: ${props => props.$isActive ? 'scale(1.2)' : 'transparent'};
`;

export const ArrowButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  /* 👇 버튼 위치를 RegionList 패딩 영역 안쪽으로 명확히 지정 */
  ${props => props.direction === 'left' ? 'left: 10px;' : 'right: 10px;'} 
  /* RegionContentWrapper의 padding(1rem = 16px)보다 작은 값 + RegionList 패딩(50px) 고려 */
  
  /* ... (나머지 ArrowButton 스타일은 동일) ... */
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 1.2rem;
  color: #555;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  z-index: 2; // 스크롤 내용 위에 오도록

  &:hover {
    background-color: white;
  }
`;

// --- 이벤트 그리드 및 더보기 버튼 ---
export const EventGridContainer = styled.div`
  margin-bottom: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const LoadMoreButton = styled.button`
  display: block;
  margin: 2rem auto 0;
  padding: 10px 25px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  color: #495057;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;