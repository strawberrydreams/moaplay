// src/styles/MyPage.styles.ts (새 파일)
import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 900px; // 페이지 최대 너비 (조절 가능)
  margin: 2rem auto;
  padding: 0 1rem;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif; // 폰트 예시
`;

// --- 1. 상단 프로필 섹션 ---
export const ProfileSection = styled.section`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 2rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

export const ProfileAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee; // 이미지 없을 때 배경
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-grow: 1;
`;

export const ProfileName = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

export const ProfileUserId = styled.p`
  font-size: 1rem;
  color: #777;
  margin: 0;
`;

export const EditProfileButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.2rem; // 아이콘 크기
  padding: 5px;
  &:hover { color: #333; }
  &:focus { outline: none; }
`;

// --- 2. 기본 정보 섹션 ---
export const InfoSection = styled.section`
  margin-bottom: 3rem;
`;

export const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
`;

export const InfoLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  min-width: 100px; // 레이블 너비 고정
`;

export const InfoValue = styled.span`
  font-size: 1rem;
  color: #333;
  flex-grow: 1; // 값 영역 확장
  margin-left: 20px; // 레이블과의 간격
`;

export const ChangeButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 0.85rem;
  color: #495057;
  cursor: pointer;
  &:hover { background-color: #e9ecef; }
`;

// --- 3. 리뷰 / 찜 목록 공통 헤더 ---
export const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  &:hover { color: #333; }
`;

// --- 4. 내 리뷰 섹션 ---
export const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 3열
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; // 모바일 1열
  }
`;
// ReviewCard 스타일은 EventDetail.styles에서 가져오거나 여기에 정의

// --- 5. 찜한 행사 섹션 ---
export const FavoriteListContainer = styled.div`
  position: relative; // 화살표 위치 기준
  margin-bottom: 3rem;
  overflow: hidden;
`;

export const FavoriteGrid = styled.div`
  display: flex; // 가로 스크롤을 위해 flex 사용
  gap: 1.5rem;
  padding: 10px 0 10px 5px; // 카드 그림자 공간
  overflow-x: auto; // 가로 스크롤
  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none; 
  scrollbar-width: none; 
  
`;

export const ArrowButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: -15px;' : 'right: -15px;'} // 위치 조정
  background : none;
  border-radius: 50%;
  border: none;
  width: 45px;
  height: 45px;
  font-size: 1.5rem;
  color: #555;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding: 0px;

  &:hover {
    color: #333;
  }
  
  &:focus {
    outline: none;
  }
`;

// --- 6. 하단 링크 섹션 ---
export const ActionLinks = styled.div`
  display: flex;
  justify-content: right;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #eee;
  margin-top: 2rem;
`;

export const ActionLink = styled.a` // 또는 button
  color: #888;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  &:hover { color: #333; text-decoration: underline; }
`;

export const NoResultsMessage = styled.p `
  color: #888;
  align-items: center;
  justify-content: center;
  margin: auto ;
  padding: 100px 20px;
`