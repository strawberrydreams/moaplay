import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #333;
  font-family: 'Noto Sans KR', sans-serif;

  @media (max-width: 768px) {
    max-width: 95%;
    margin: 1.5rem auto;
  }

  @media (max-width: 480px) {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }
`;

/* --- 1. 상단 프로필 섹션 --- */
export const ProfileSection = styled.section`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 2rem 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    text-align: left;
    gap: 10px;
  }
`;

export const ProfileAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;

  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
  }
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

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const ProfileUserId = styled.p`
  font-size: 1rem;
  color: #777;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const EditProfileButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  transition: color 0.15s ease;

  &:hover {
    color: #333;
  }

  &:focus {
    outline: none;
  }
`;

/* --- 2. 기본 정보 섹션 --- */
export const InfoSection = styled.section`
  margin-bottom: 3rem;

  @media (max-width: 480px) {
    margin-bottom: 2rem;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

export const InfoLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  min-width: 100px;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const InfoValue = styled.span`
  font-size: 1rem;
  color: #333;
  flex-grow: 1;
  margin-left: 20px;
  max-width: 780px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;

  @media (max-width: 600px) {
    max-width: 100%;
    white-space: normal;
    word-break: break-all;
    margin-left: 0;
  }
`;

export const ChangeButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 0.85rem;
  color: #495057;
  cursor: pointer;

  &:hover {
    background-color: #e9ecef;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 4px 10px;
  }
`;

/* --- 3. 리뷰 / 찜 목록 공통 헤더 --- */
export const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    align-items: flex-start;
    gap: 10px;
  }
`;

export const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    color: #333;
  }
  margin-top: 10px;
  
  @media (max-width: 480px) {
    margin-top: 10px;
  }
`;

/* --- 4. 리뷰/찜 스크롤 컨테이너 --- */
export const ReviewScrollContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 10px 0 10px 5px;
  overflow-x: auto;
  scroll-behavior: smooth;
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  & > * {
    flex: 0 0 auto;
    min-width: 350px;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 60px;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, #f8f9fa80, transparent 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, #f8f9fa80, transparent 100%);
  }

  @media (max-width: 768px) {
    & > * {
      min-width: 300px;
    }
  }

  @media (max-width: 600px) {
    & > * {
      min-width: 260px;
    }
  }
`;

export const ReviewGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 50%;
  padding: 10px 0 10px 5px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

/* --- 5. 찜한 행사 섹션 --- */
export const FavoriteListContainer = styled.div`
  position: relative;
  margin-bottom: 3rem;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 60px;
    height: 100%;
    z-index: 3;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, #f8f9fa80, transparent 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, #f8f9fa80, transparent 100%);
  }

  @media (max-width: 480px) {
    &::before {
    left: 0;
    background: linear-gradient(to right, #f8f9fa5e, transparent 40%);
    }

    &::after {
      right: 0;
      background: linear-gradient(to left, #f8f9fa, transparent 40%);
    }
  }
`;

export const FavoriteGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 10px 0 10px 5px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

export const ArrowButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ direction }) => (direction === 'left' ? 'left: 0;' : 'right: 0;')}
  transform: translateY(-50%);
  background: none;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1;
  z-index: 5;

  &:hover {
    transform: translateY(-50%) scale(1.1);
  }

  &[hidden] {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-50%) scale(0.9);
  }

  &:focus {
    outline: none;
  }

  svg {
    color: #555;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
  }
`;

/* --- 6. 하단 링크 섹션 --- */
export const ActionLinks = styled.div`
  display: flex;
  justify-content: right;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #eee;
  margin-top: 2rem;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

export const ActionLink = styled.a`
  color: #888;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

export const NoResultsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`;

export const NoResultsMessage = styled.p`
  color: #888;
  text-align: center;
  width: 100%;
  margin: auto;
  padding: 100px 20px;

  @media (max-width: 480px) {
    padding: 60px 10px;
  }
`;
