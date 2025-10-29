// src/components/EventCard.styles.ts
import styled, {keyframes} from 'styled-components';

// '좋아요' 버튼 props 타입
export interface ILikeButtonProps {
  $isLiked: boolean;
}

const pop = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2); /* 중간에 1.2배로 커짐 */
  }
  100% {
    transform: scale(1); /* 다시 원래 크기로 */
  }
`;

export const Card = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;

  transition: transform 0.2s ease-in-out;

  &:hover {
    /* 마우스를 올리면 1.1배 커지도록 설정 */
    transform: scale(1.01); 
  }
`;

export const CardImage = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  background-color: #F0F0F0;
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
    color: #CCC;
  }
`;

export const LikeButton = styled.button<ILikeButtonProps>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 0;
  color: ${props => props.$isLiked ? '#FF4136' : 'white'};
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));

  transition: transform 0.2s ease-in-out;

  &:focus { 
    outline: none; 
  }

  &:hover {
    /* 마우스를 올리면 1.1배 커지도록 설정 */
    transform: scale(1.2); 
  }
`;

export const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  cursor: pointer;

  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  p {
    font-size: 0.9rem;
    color: #777;
    margin: 0.25rem 0;
  }
  .card-tag {
    font-size: 0.9rem;
    color: #8A2BE2;
    font-weight: 500;
    margin-top: 0.25rem;
    display: block;
  }
`;

export const CardFooter = styled.div`
  /* (이전 요청에서 수정한 내용 - 그대로 둡니다) */
  display: flex;
  flex-direction: row;
  justify-content: flex-end; 
  align-items: center;
  padding: 0px 11.5181px; 
  gap: 18.43px; 
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
`;

// --- 👇 'AddScheduleButton' 스타일을 아래 코드로 교체합니다. ---
export const AddScheduleButton = styled.button`
  /* --- 유저 요청 CSS --- */
  box-sizing: border-box;

  /* 버튼 내부 레이아웃 (아이콘 + 텍스트) */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 9.21449px;
  gap: 9.21px; /* 👈 아이콘과 텍스트 사이 간격 */

  /* 크기 */
  width: 91.43px;
  height: 36.43px;

  /* 스타일 */
  background: #9E77ED;
  border: 1.15181px solid #9E77ED;
  border-radius: 9.07786px;

  /* 버튼의 flex item 속성 (CardFooter 내부) */
  flex: none;
  order: 1;
  flex-grow: 0;

  /* --- 추가된 기본 스타일 --- */
  color: #fff; /* 글자색 */
  font-size: 0.8rem; /* 폰트 크기 (버튼에 맞게 조절) */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #865dd1; /* 호버 시 약간 어둡게 */
    border-color: #865dd1;
  }
`;