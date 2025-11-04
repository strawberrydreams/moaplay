import React, { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { useForm } from '../hooks/useForm';
import { useTags } from '../hooks/useTags';
import * as E from '../types/events';
import * as EventApi from '../services/eventsApi';
import EventCard from './EventCard';
import { FaFilter, FaSearch } from 'react-icons/fa';
import * as S from '../styles/EventSearch.styles';
import styled, { keyframes } from 'styled-components'; // ✅ 스피너 추가용

// ✅ 스피너 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #865dd1; /* 포인트 컬러 */
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: ${spin} 0.8s linear infinite;
`;

const initialSearchValues: E.GetEventsPayload = {
  page: 1,
  per_page: 12,
  status: 'approved',
  location: '',
  sort: 'start_date',
  order: 'desc',
};

const EventSearchPage: React.FC = () => {
  const { values, isSubmitting, handleChange, handleSubmit } = useForm<E.GetEventsPayload>({
    initialValues: initialSearchValues,
    validate: () => ({}),
    onSubmit: async (payload) => {
      await fetchEvents(1, payload); // 수동 검색 버튼용
    },
  });

  const {
    tags,
    activeTag,
    newTagInput,
    setNewTagInput,
    handleNewTagInputChange,
    addTag,
    deleteTag,
    setActiveTag,
  } = useTags(5);

  const [events, setEvents] = React.useState<E.Event[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  /** ✅ 이벤트 데이터 로드 함수 (API 연동) */
  const fetchEvents = async (pageToLoad: number, customValues?: E.GetEventsPayload) => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const payload: E.GetEventsPayload = {
        ...(customValues || values),
        page: pageToLoad,
        per_page: 12,
        title: (customValues || values).title || undefined,
        location: (customValues || values).location || undefined,
        sort: (customValues || values).sort || 'start_date',
        order: (customValues || values).order || 'desc',
        tags: tags.length > 0 ? tags : undefined,
        date_from: (customValues || values).date_from || undefined,
        date_to: (customValues || values).date_to || undefined,
      };

      const res = await EventApi.getEvents(payload);
      const newEvents = res.events || [];

      if (pageToLoad === 1) setEvents(newEvents);
      else setEvents((prev) => [...prev, ...newEvents]);

      setHasMore(newEvents.length >= payload.per_page!);
    } catch (err) {
      console.error('❌ 행사 목록 로딩 실패:', err);
    } finally {
      setLoadingMore(false);
      setIsTyping(false);
    }
  };

  /** ✅ 실시간 검색 (디바운스 500ms) */
  useEffect(() => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      fetchEvents(1);
    }, 500);

    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.title,
    values.location,
    values.date_from,
    values.date_to,
    values.sort,
    tags.join(','),
  ]);

  /** 무한 스크롤 */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    const current = bottomRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loadingMore]);

  /** 페이지 증가 시 추가 데이터 로드 */
  useEffect(() => {
    if (page === 1) return;
    fetchEvents(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /** 태그 입력 이벤트 */
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Escape') {
      setNewTagInput('');
    }
  };

  /** 태그 삭제 */
  const handleDeleteTagClick = (e: MouseEvent<HTMLSpanElement>, tag: string) => {
    e.stopPropagation();
    deleteTag(tag);
  };

  return (
    <S.Container>
      <S.SearchContainer onSubmit={handleSubmit}>
        <S.FormRow>
          <S.InputGroup className="search-bar">
            <label htmlFor="event-search">검색</label>
            <input
              id="event-title"
              type="text"
              name="title"
              placeholder="행사의 제목을 입력해주세요"
              value={values.title || ''}
              onChange={(e) => {
                handleChange(e);
                setIsTyping(true);
              }}
            />
            <S.SearchButton type="submit" disabled={isSubmitting}>
              <FaSearch />
            </S.SearchButton>
          </S.InputGroup>

          <S.InputGroup>
            <label htmlFor="location">장소</label>
            <select
              id="location"
              name="location"
              value={values.location || ''}
              onChange={handleChange}
            >
              <option value="">전체</option>
              {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </S.InputGroup>

          <S.DateRangeGroup>
            <label htmlFor="start-date">시작일</label>
            <input
              type="date"
              id="start-date"
              name="date_from"
              value={values.date_from || ''}
              onChange={handleChange}
            />
            <span>~</span>
            <label htmlFor="end-date">종료일</label>
            <input
              type="date"
              id="end-date"
              name="date_to"
              value={values.date_to || ''}
              onChange={handleChange}
            />
          </S.DateRangeGroup>
        </S.FormRow>

        <S.FilterRow>
          <S.FilterGroup>
            <label className="filter-label"><FaFilter size={14} /> 필터</label>
            <S.TagList>
              {tags.map((tag) => (
                <S.TagButton
                  key={tag}
                  $active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                  <S.DeleteTagButton onClick={(e) => handleDeleteTagClick(e, tag)}>
                    &times;
                  </S.DeleteTagButton>
                </S.TagButton>
              ))}

              <S.TagInput
                type="text"
                value={newTagInput}
                onChange={handleNewTagInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="태그 입력"
              />
            </S.TagList>
          </S.FilterGroup>

          <S.InputGroup className="order-select">
            <select
              id="sort"
              name="sort"
              value={values.sort || 'start_date'}
              onChange={handleChange}
            >
              <option value="start_date">최신순</option>
              <option value="view_count">인기순</option>
            </select>
          </S.InputGroup>
        </S.FilterRow>
      </S.SearchContainer>

      <S.EventGrid>
        {events.length === 0 && !loadingMore && (
          <S.NoResultsMessage>검색된 행사가 없습니다.</S.NoResultsMessage>
        )}
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </S.EventGrid>

      {loadingMore && (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      )}
      <div ref={bottomRef} />
    </S.Container>
  );
};

export default EventSearchPage;
