import styled, { keyframes } from 'styled-components';

// 👇 부드럽게 나타나는 애니메이션
const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* ─────────────── 프로필 컨테이너 ─────────────── */
export const ProfileContainer = styled.div`
  background: #fff;
  display: flex;
  align-items: center;
  position: relative; /* 드롭다운 기준점 */
  cursor: pointer;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

/* ─────────────── 프로필 이미지 ─────────────── */
export const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
  border: 1px solid #eee;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(0.95);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    margin-right: 6px;
  }

  @media (max-width: 480px) {
    width: 26px;
    height: 26px;
    margin-right: 4px;
  }
`;

/* ─────────────── 드롭다운 화살표 버튼 ─────────────── */
export const DropdownArrowButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #555;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

/* ─────────────── 드롭다운 메뉴 ─────────────── */
export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% - 4px); /* 버튼 아래에 살짝 간격 */
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1000;
  animation: ${fadeInDown} 0.25s ease forwards;
  opacity: 0; /* fadeInDown 애니메이션과 함께 나타남 */

  /* 반응형 - 모바일일 때 드롭다운이 화면 밖으로 안 나가게 */
  @media (max-width: 768px) {
    min-width: 140px;
  }

  @media (max-width: 480px) {
    right: 50%;
    transform: translateX(50%); /* 가운데 정렬 */
    min-width: 20vw; /* 거의 화면 전체 폭 사용 */
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
`;

/* ─────────────── 메뉴 항목 ─────────────── */
export const MenuItem = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 10px 16px;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: #f5f5f5;
    color: #6a0dad;
  }

  &:active {
    background-color: #ece7fa;
  }

  /* 모바일 터치 대응 */
  @media (max-width: 768px) {
    padding: 9px 14px;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 12px 18px;
    margin: 10px;
    font-size: 0.9rem;
  }
`;
