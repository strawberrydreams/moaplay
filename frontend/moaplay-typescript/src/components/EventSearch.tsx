// src/pages/EventSearchPage.tsx
import React, { useState, type KeyboardEvent, type MouseEvent } from 'react';
import {useForm} from '../hooks/useForm';
import * as E from '../types/events'; // 행사 타입
import EventCard from './EventCard';
import * as EventApi from '../service/eventsApi'; // 행사 API
import { FaFilter, FaSearch } from 'react-icons/fa';
import * as S from '../styles/EventSearch.styles';


// const initialSearchValues: E.GetEventsPayload = {
//     // search: '',
//     page: 1,
//     limit: 12,
//     region: '',
//     tag: [],
//     date_from: '',
//     date_to: '',
//     sort: '',
//     order: 'desc',
// };

const initialSearchValues: E.GetEventsPayload = {
    page: 1,
    per_page: 12,
    status: 'approved',
    location: '',
    sort: 'start_date',
    order: 'desc',
};

const validateSearch = (values: E.GetEventsPayload): Partial<Record<keyof E.GetEventsPayload, string>> => {
    const errors: Partial<Record<keyof E.GetEventsPayload, string>> = {};
    // if (!values.search) {
    //     errors.search = '검색어를 입력해주세요.';
    // }
    return errors;
};

// 태그 최대 개수 상수로 정의
const MAX_TAGS = 5;

// 초기 태그 목록을 빈 배열로 변경
const initialTags: string[] = [];

const EventSearchPage: React.FC = () => {
  const [tags, setTags] = useState(initialTags); 
  // 3. activeTag 초기값을 null로 변경
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [events, setEvents] = useState<E.Event[]>([]);

  // 4. 태그 추가 UI를 위한 state 추가
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddTag = () => {
    // 1. 태그 개수가 이미 5개 이상인지 먼저 확인
    if (tags.length >= MAX_TAGS) {
      alert("태그는 최대 5개까지 추가할 수 있습니다.");
      setIsAddingTag(false); // 입력창 닫기
      setNewTagInput(""); // 입력창 초기화
      return;
    }

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

  // 검색 입력 지우는 함수
  const clearSearch = () => {
      // useForm 훅의 setValues를 사용해 'search' 필드 업데이트
      setValues(prev => ({
          ...prev,
          search: '' // search 값을 빈 문자열로 설정
      }));
  };

  const {values, setValues, errors, isSubmitting, handleChange, handleSubmit} = useForm<E.GetEventsPayload>({
      initialValues: initialSearchValues,
      validate: validateSearch,
      onSubmit: EventApi.getEvents,
      onSuccess: (response) => {
          console.log('검색 성공:', response);
          setEvents(response.events || []);
      },
      onError: (error) => {
          console.error('검색 오류:', error);
          alert(error.response?.data?.error || "검색 중 오류가 발생했습니다.");
      }
  });

  // 2. 모든 컴포넌트를 S.xxx로 변경
  return (
    <S.Container>
      <S.SearchContainer onSubmit={handleSubmit}>
        <S.FormRow>
          <S.InputGroup className="search-bar">
            <label htmlFor="event-search">검색</label>
            <input
                id="event-search"
                type="text"
                // name="search"
                placeholder="행사의 제목을 입력해주세요"
                // value={values.search || ''}
                // onChange={handleChange}
            />
            {/* {values.search && (
                <S.ClearButton type="button" onClick={clearSearch}>
                    &times;
                </S.ClearButton>
            )} */}
            <S.SearchButton type="submit" disabled={isSubmitting}>
                <FaSearch />
            </S.SearchButton>
        </S.InputGroup>
          <S.InputGroup>
            <label htmlFor="location">장소</label>
            <select id="location"
              name='location'
              // value={values.region || ''}
              value={values.location || ''}
              onChange={handleChange}
            >
              <option value="">전체</option>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="인천">인천</option>
              <option value="광주">광주</option>
              <option value="대전">대전</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
              <option value="경기">경기</option>
              <option value="강원">강원</option>
              <option value="충북">충북</option>
              <option value="충남">충남</option>
              <option value="전북">전북</option>
              <option value="전남">전남</option>
              <option value="경북">경북</option>
              <option value="경남">경남</option>
              <option value="제주">제주</option>
            </select>
          </S.InputGroup>
          <S.DateRangeGroup>
            <label htmlFor="start-date">시작일</label>
            <input 
                type="date" 
                id="start-date" 
                // name='date_from'
                // value={values.date_from}
                // onChange={handleChange}
            />
            <span>~</span>
            <label htmlFor="end-date">종료일</label>
            <input 
                type="date" 
                id="end-date" 
                // name='date_to'
                // value={values.date_to}
                // onChange={handleChange}
            />
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
                  <S.DeleteTagButton onClick={(e) => handleDeleteTag(e, tag)}>
                    &times;
                  </S.DeleteTagButton>
                </S.TagButton>
              ))}

              {isAddingTag ? (
                <S.TagInput //
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
            <select 
              id="sort" 
              name='sort' 
              value={values.sort || 'start_date'}
              onChange={handleChange}
              onSubmit={handleSubmit}
            >
              <option value="start_date">최신순</option>
              <option value="view_count">인기순</option>
            </select>
          </S.InputGroup>
        </S.FilterRow>

      </S.SearchContainer>

      <S.EventGrid>
        {events.length === 0 && 
          <S.NoResultsMessage>검색된 행사가 없습니다.</S.NoResultsMessage>
        }
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </S.EventGrid>
    </S.Container>
  );
};

export default EventSearchPage;