// src/pages/EventSearchPage.tsx
import React, { useState } from 'react';
import type { IEvent } from '../types';
import EventCard from '../components/EventCard';
import { FaFilter } from 'react-icons/fa';
import * as S from '../styles/EventSearchPage.styles';

// --- 샘플 데이터 ---
const sampleEvents: IEvent[] = [
  { id: 1, title: '행사 제목 1', date: '2025.05.13', location: '주소 서울', tag: '스포츠', isLiked: false },
  { id: 2, title: '행사 제목 2', date: '2025.05.13', location: '주소 서울', tag: '스포츠', isLiked: true },
  { id: 3, title: '행사 제목 3', date: '2025.05.13', location: '주소 서울', tag: '스포츠', isLiked: false },
  { id: 4, title: '행사 제목 4', date: '2025.05.13', location: '주소 서울', tag: '스포츠', isLiked: false },
];

const EventSearchPage: React.FC = () => {
  const [activeTag, setActiveTag] = useState('스포츠');
  const [events, setEvents] = useState(sampleEvents);

  const tags = ['스포츠', '예술', '음식', '게임', '도서', '음악', '연설'];

  // 2. 모든 컴포넌트를 S.xxx로 변경
  return (
    <S.Container>
      <S.SearchContainer>
        <S.FormRow>
          <S.InputGroup className="search-bar">
            <label htmlFor="event-search">검색</label>
            <input type="text" id="event-search" placeholder="행사의 제목을 입력해주세요" />
            <S.ClearButton>&times;</S.ClearButton>
          </S.InputGroup>
          <S.InputGroup>
            <label htmlFor="location">장소</label>
            <select id="location">
              <option value="all">전체</option>
              <option value="seoul">서울</option>
            </select>
          </S.InputGroup>
          <S.DateRangeGroup>
            <label htmlFor="start-date">시작일</label>
            <input type="date" id="start-date" defaultValue="2025-07-25" />
            <span>~</span>
            <input type="date" id="end-date" defaultValue="2025-07-25" />
          </S.DateRangeGroup>
        </S.FormRow>

        <S.FilterRow>
          <S.FilterGroup>
            <label className="filter-label"><FaFilter size={14} /> 필터</label>
            <S.TagList>
              {tags.map(tag => (
                <S.TagButton
                  key={tag}
                  active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </S.TagButton>
              ))}
              <S.TagButton className="add-tag">+</S.TagButton>
            </S.TagList>
          </S.FilterGroup>
          <S.InputGroup>
            <select id="sort-by">
              <option value="popularity">인기순</option>
              <option value="latest">최신순</option>
            </select>
          </S.InputGroup>
        </S.FilterRow>
      </S.SearchContainer>

      <S.EventGrid>
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </S.EventGrid>
    </S.Container>
  );
};

export default EventSearchPage;