// src/components/EventCard.tsx
import React, { useState } from 'react';
import type { IEvent } from '../types';
import { FaImage, FaHeart, FaRegHeart } from 'react-icons/fa';
import * as S from '../styles/EventCard.styles';

// --- Props 타입 정의 ---
interface IEventCardProps {
  event: IEvent;
}

const EventCard: React.FC<IEventCardProps> = ({ event }) => {
  const [isLiked, setIsLiked] = useState(event.isLiked);

  const toggleLike = () => {
    setIsLiked(prev => !prev);
  };

  // 2. 모든 컴포넌트를 S.xxx로 변경
  return (
    <S.Card>
      <S.CardImage>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <FaImage className="placeholder-icon" />
        )}
        <S.LikeButton isLiked={isLiked} onClick={toggleLike}>
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </S.LikeButton>
      </S.CardImage>
      <S.CardContent>
        <h3>{event.title}</h3>
        <p>날짜: {event.date}</p>
        <p>주소: {event.location}</p>
        <span className="card-tag">태그: {event.tag}</span>
      </S.CardContent>
      <S.CardFooter>
        <S.AddScheduleButton>일정 추가</S.AddScheduleButton>
      </S.CardFooter>
    </S.Card>
  );
};

export default EventCard;