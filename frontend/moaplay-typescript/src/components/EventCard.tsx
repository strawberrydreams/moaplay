// src/components/EventCard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from '../types/events'; // 행사 타입
import { FaImage, FaHeart, FaRegHeart } from 'react-icons/fa';
import * as S from '../styles/EventCard.styles';
import * as FavoriteApi from '../services/favoritesApi';
import { useAuthContext } from '../contexts/AuthContext';
import * as CalendarApi from '../services/schedulesApi';
import { useFavorite } from '../hooks/useFavorite';


const EventCard: React.FC<{ event: E.Event }> = ({ event }) => {
   const navigate = useNavigate();
  const { favorites, toggleFavorite, loadFavorites } = useFavorite();
  const { user } = useAuthContext();

  const favoriteItem = favorites.find(fav => fav.event?.id === event.id);
  const isFavorited = !!favoriteItem
  console.log("찜 확인: ", favoriteItem );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  

  const handleFavoriteClick = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    toggleFavorite(event.id, isFavorited, favoriteItem?.id);
  };


  const handleAddToSchedule = async () => {
    // 일정 추가 기능
    await CalendarApi.addSchedule(event.id);
    alert(`${event.title} 일정이 추가되었습니다.`);
    window.location.reload();
  }


  // 2. 모든 컴포넌트를 S.xxx로 변경
  return (
    <S.Card >
      <S.CardImage>
        {event.image_urls ? (
          <img src={event.image_urls[0]} alt={event.title} />
        ) : (
          <FaImage className="placeholder-icon" />
        )}
        <S.LikeButton $isLiked={isFavorited} onClick={handleFavoriteClick}>
          {isFavorited ? <FaHeart /> : <FaRegHeart />}
        </S.LikeButton>
      </S.CardImage>
      <S.CardContent onClick={() =>{navigate(`/events/${event.id}`)}}>
        <h3>{event.title}</h3>
        <p>날짜: {event.start_date} ~ {event.end_date}</p>
        <p>주소: {event.location}</p>
        <span className="card-tag">
          태그: {event.tags?.length ? event.tags.join(', ') : '없음'}
        </span>
      </S.CardContent>
      <S.CardFooter>
        <S.AddScheduleButton onClick={handleAddToSchedule}>일정 추가</S.AddScheduleButton>
      </S.CardFooter>
    </S.Card>
  );
};

export default EventCard;