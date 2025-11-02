// src/components/EventCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from '../types/events'; // 행사 타입
import { FaImage, FaHeart, FaRegHeart } from 'react-icons/fa';
import * as S from '../styles/EventCard.styles';
import * as FavoriteApi from '../services/favoritesApi';
import { useAuthContext } from '../contexts/AuthContext';
import type {FavoriteStatus } from '../types/favorites';
import * as CalendarApi from '../services/schedulesApi';
import type { FavoriteGrid } from '../styles/Mypage.styles';

const favorite: FavoriteStatus = {
  is_favorite: false,
  favorite_id: 0
};

const EventCard: React.FC<{ event: E.Event }> = ({ event }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();
  
  const { user: currentUser} = useAuthContext();
  const checkFavorite = async () => {
    if (!currentUser) return;
    const favorite = await FavoriteApi.getFavorites();
    const fav = favorite.favorites.find(f => f.event?.id === event.id); 
    console.log("찜하기 결과: ", fav);
    setIsLiked(!!fav); // fav가 존재하면 true, undefined이면 false로 설정
  };

  React.useEffect(() => {
    checkFavorite();
  }, [currentUser, event.id]);

  const handleFavorite = async () => {
    if (isLiked) {
      try {
        if (isLiked) {
          await FavoriteApi.deleteFavorite(event.id);
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
    <S.Card >
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