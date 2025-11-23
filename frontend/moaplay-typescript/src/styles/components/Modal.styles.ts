import styled, { keyframes } from 'styled-components';

// --- 등장 애니메이션 (부드럽게 뜨는 효과) ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// --- 전체 오버레이 ---
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0; /* top, right, bottom, left = 0 */
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;

  /* 모바일에서 스크롤 방지 */
  overflow-y: auto;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
    background-color: rgba(0, 0, 0, 0.7);
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

// ---  모달 내용 ---
export const ModalContent = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 90%;
  position: relative;
  animation: ${fadeIn} 0.25s ease-out;

  @media (max-width: 1024px) {
    max-width: 380px;
    padding: 25px;
  }

  @media (max-width: 768px) {
    max-width: 340px;
    padding: 22px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    max-width: 65%;
    font-size: 0.7rem;
    padding: 18px 14px;
    border-radius: 10px;
  }

  /* 초소형 폰 (갤럭시 SE 등) */
  @media (max-width: 360px) {
    max-width: 70%;
    padding: 14px 12px;
    border-radius: 8px;
  }
`;

// --- 닫기 버튼 ---
export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s ease, transform 0.15s ease;

  &:hover {
    color: #333;
    transform: scale(1.15);
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
    top: 8px;
    right: 8px;
  }
`;
