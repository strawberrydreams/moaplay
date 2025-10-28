// src/components/EventCard.tsx
import React, { useState } from 'react';
import { replace, useNavigate } from 'react-router-dom';
import * as E from '../types/events'; // 행사 타입
import { FaImage, FaHeart, FaRegHeart } from 'react-icons/fa';
import * as S from '../styles/EventCard.styles';
import * as FavoriteApi from '../service/favoritesApi';
import { useAuth } from '../context/AuthContext';
import type {FavoriteStatus } from '../types/favorites';
import * as CalendarApi from '../service/schedulesApi';

const favorite: FavoriteStatus = {
  is_favorite: false,
  favorite_id: 0
};

const EventCard: React.FC<{ event: E.Event }> = ({ event }) => {
  const [isLiked, setIsLiked] = useState(false);
  let navigate = useNavigate();
  
  const { currentUser } = useAuth();
  const checkFavorite = async () => {
    if (!currentUser) return;
    const favorite = await FavoriteApi.getFavoriteById(event.id);
    setIsLiked(!!favorite.is_favorite);
  };

  React.useEffect(() => {
    checkFavorite();
  }, [currentUser, event.id]);

  const handleFavorite = async () => {
    if (isLiked) {
      try {
        const fav = await FavoriteApi.getFavoriteById(event.id);
        if (fav && typeof fav.favorite_id === 'number') {
          await FavoriteApi.deleteFavorite(fav.favorite_id);
        } else {
          console.warn("삭제할 찜 ID가 없습니다. event id:", event.id);
        }
      } catch (error) {
        console.error("찜 삭제 중 오류 발생:", error);
      }
    } else {
      try {
        await FavoriteApi.addFavorite(event.id);
      } catch (error) {
        console.error("찜 추가 중 오류 발생:", error);
      }
    }
    setIsLiked(!isLiked);
  };

  const handleAddToSchedule = async () => {
    // 일정 추가 기능
    await CalendarApi.addSchedule(event.id);
    alert(`${event.title} 일정이 추가되었습니다.`);
    window.location.reload();
  }


  // 2. 모든 컴포넌트를 S.xxx로 변경
  return (
    <S.Card onClick={() =>{navigate(`/events/${event.id}`)}}>
      <S.CardImage>
        {event.image_urls ? (
          <img src={event.image_urls[0]} alt={event.title} />
        ) : (
          <FaImage className="placeholder-icon" />
        )}
        <S.LikeButton $isLiked={isLiked} onClick={handleFavorite}>
          {isLiked ? <FaHeart /> : <FaRegHeart />}
        </S.LikeButton>
      </S.CardImage>
      <S.CardContent>
        <h3>{event.title}</h3>
        <p>날짜: {event.start_date} ~ {event.end_date}</p>
        <p>주소: {event.location}</p>
        <span className="card-tag">태그: {event.tags.join(', ')}</span>
      </S.CardContent>
      <S.CardFooter>
        <S.AddScheduleButton onClick={handleAddToSchedule}>일정 추가</S.AddScheduleButton>
      </S.CardFooter>
    </S.Card>
  );
};

export default EventCard;