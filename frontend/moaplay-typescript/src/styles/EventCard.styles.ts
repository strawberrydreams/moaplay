import styled, { keyframes } from 'styled-components';

export interface ILikeButtonProps {
  $isLiked: boolean;
}

const pop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

/* --- 카드 컨테이너 --- */
export const Card = styled.div`
  width: 100%;
  min-width: 260px;
  flex: 0 0 260px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 8px 10px rgba(0, 0, 0, 0.07);
  }

  /* ✅ 반응형 */
  @media (max-width: 1024px) {
    flex: 0 0 calc(33.33% - 1rem);
    min-width: 220px;
  }

  @media (max-width: 768px) {
    flex: 0 0 calc(50% - 0.75rem);
    min-width: 180px;
  }

  @media (max-width: 480px) {
    flex: 0 0 100%;
    min-width: 100%;
    border-radius: 6px;
  }
`;

/* --- 카드 이미지 --- */
export const CardImage = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-icon {
    font-size: 3rem;
    color: #ccc;
  }

  @media (max-width: 768px) {
    height: 160px;
  }

  @media (max-width: 480px) {
    height: 140px;
  }
`;

/* --- 좋아요 버튼 --- */
export const LikeButton = styled.button<ILikeButtonProps>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 0;
  color: ${(props) => (props.$isLiked ? '#FF4136' : 'white')};
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  transition: transform 0.2s ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    transform: scale(1.2);
  }

  &:active {
    animation: ${pop} 0.3s ease;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    top: 0.5rem;
    right: 0.5rem;
  }
`;

/* --- 카드 내용 --- */
export const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  cursor: pointer;

  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    line-height: 1.3;
  }

  p {
    font-size: 0.9rem;
    color: #777;
    margin: 0.25rem 0;
  }

  .card-tag {
    font-size: 0.9rem;
    color: #8a2be2;
    font-weight: 500;
    margin-top: 0.25rem;
    display: block;
  }

  @media (max-width: 768px) {
    padding: 0.8rem;

    h3 {
      font-size: 1rem;
    }
    p {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem;

    h3 {
      font-size: 0.95rem;
    }
    p {
      font-size: 0.8rem;
    }
  }
`;

/* --- 카드 하단 --- */
export const CardFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 0.75rem 1rem;
  gap: 18px;

  @media (max-width: 480px) {
    justify-content: center;
    padding: 0.5rem;
    gap: 12px;
  }
`;

/* --- 일정 추가 버튼 --- */
export const AddScheduleButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  width: 91px;
  height: 36px;
  background: #9e77ed;
  border: 1.15px solid #9e77ed;
  border-radius: 9px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #865dd1;
    border-color: #865dd1;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    width: 85px;
    height: 34px;
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    height: 38px;
    font-size: 0.8rem;
    border-radius: 8px;
  }
`;
