// src/components/EventCard.styles.ts
import styled from 'styled-components';

// '좋아요' 버튼 props 타입
export interface ILikeButtonProps {
  isLiked: boolean;
}

export const Card = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
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
  font-size: 1.5rem;
  color: ${props => props.isLiked ? '#FF4136' : 'white'};
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  cursor: pointer;
`;

export const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;

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
  padding: 0 1rem 1rem 1rem;
`;

export const AddScheduleButton = styled.button`
  width: 100%;
  background-color: #F2E9FF;
  border: 1px solid #F2E9FF;
  color: #8A2BE2;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #8A2BE2;
    color: #fff;
  }
`;