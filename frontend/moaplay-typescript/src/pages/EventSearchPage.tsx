// src/pages/EventSearchPage.tsx
import React, { useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { IEvent } from '../types';
import EventCard from '../components/EventCard';
import { FaFilter } from 'react-icons/fa';
import * as S from '../styles/EventSearchPage.styles';

// --- 샘플 데이터 ---
const rawSampleEvents: Omit<IEvent, 'color'>[] = [
  { id: 1, title: '오케스트라 특별 공연', start_date: '2025-10-07', end_date: '2025-10-07', location: '대전 예술의전당', tag: ['음악', '콘서트'], description: '...', host: '대전예술의전당', contact: '042-2222-3333' , isLiked: false },
  { id: 2, title: '현대 미술 전시회', start_date: '2025-10-09', end_date: '2025-10-09', location: '서울 시립 미술관', tag: ['미술', '전시'], description: '...', host: '시립미술관', contact: '02-1111-2222', isLiked: false },
  { id: 3, title: '지역 축제', start_date: '2025-10-11', end_date: '2025-10-11', location: '부산 해운대', tag: ['축제', '야외'], description: '...', host: '부산시청', contact: '051-3333-4444', isLiked: false },
  { id: 4, title: '축구 경기', start_date: '2025-10-16', end_date: '2025-10-18', location: '상암 월드컵 경기장', tag: ['스포츠', '축구'], description: '...', host: 'K리그', contact: '02-0000-0000', isLiked: false },
];

// 2. 초기 태그 목록을 빈 배열로 변경
const initialTags: string[] = [];

const EventSearchPage: React.FC = () => {
  const [tags, setTags] = useState(initialTags); 
  // 3. activeTag 초기값을 null로 변경
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [events, setEvents] = useState(rawSampleEvents);

  // 4. 태그 추가 UI를 위한 state 추가
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      const newTag = newTagInput.trim();
      setTags([...tags, newTag]);
      setActiveTag(newTag); // 4. 새 태그를 추가하면 바로 활성화
      setNewTagInput(""); 
      setIsAddingTag(false); 
    }
  };

  // 6. Enter 키로 태그를 추가하는 핸들러
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 방지
      handleAddTag();
    }
    if (e.key === 'Escape') {
      setIsAddingTag(false); // Esc로 취소
      setNewTagInput("");
    }
  };

  // 태그 삭제 핸들러 추가
  const handleDeleteTag = (e: MouseEvent<HTMLSpanElement>, tagToDelete: string) => {
    e.stopPropagation(); // 👈 중요: 부모(TagButton)의 onClick이 실행되지 않도록 막기
    setTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));

    // 6. 만약 활성화된 태그를 삭제하면 activeTag를 null로 초기화
    if (activeTag === tagToDelete) {
      setActiveTag(null);
    }
  };

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
            <label htmlFor="end-date">종료일</label>
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
                  $active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                  {/* 7. 삭제 버튼 추가 */}
                  <S.DeleteTagButton onClick={(e) => handleDeleteTag(e, tag)}>
                    &times; {/* 'x' 기호 */}
                  </S.DeleteTagButton>
                </S.TagButton>
              ))}

              {isAddingTag ? (
                <S.TagInput // (styles.ts에 새로 추가해야 함)
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onBlur={handleAddTag} // 포커스가T(DOM)에서 벗어날 때도 추가
                  placeholder="태그 입력..."
                  autoFocus // 입력창이 나타날 때 자동으로 포커스
                />
              ) : (
                <S.TagButton
                  className="add-tag"
                  onClick={() => setIsAddingTag(true)} // + 버튼 클릭 시 입력창 표시
                >
                  태그 추가 +
                </S.TagButton>
              )}
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
          <EventCard key={event.id} event={event} events={events} />
        ))}
      </S.EventGrid>
    </S.Container>
  );
};

export default EventSearchPage;