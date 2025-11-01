import React, { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { useForm } from '../hooks/useForm';
import { useTags } from '../hooks/useTags';
import * as E from '../types/events';
import * as EventApi from '../services/eventsApi';
import EventCard from './EventCard';
import { FaFilter, FaSearch } from 'react-icons/fa';
import * as S from '../styles/EventSearch.styles';

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
    return errors;
};

const EventSearchPage: React.FC = () => {
    const {
        values,
        isSubmitting,
        handleChange,
        handleSubmit
    } = useForm<E.GetEventsPayload>({
        initialValues: initialSearchValues,
        validate: validateSearch,
        onSubmit: EventApi.getEvents,
        onSuccess: () => {
            // 초기 호출에서는 아래 effect에서 처리
        },
        onError: (err) => {
            console.error('검색 오류:', err);
            alert(err.response?.data?.error || '검색 중 오류가 발생했습니다.');
        }
    });

    const { tags, activeTag, newTagInput, setNewTagInput, handleNewTagInputChange, addTag, deleteTag, setActiveTag } = useTags(5);

    const [events, setEvents] = React.useState<E.Event[]>([]);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    // 검색 조건이 바뀌면 페이지 리셋 & 데이터 초기화
    useEffect(() => {
        setPage(1);
        setEvents([]);
        setHasMore(true);
        // fetch first page
        fetchEvents(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.location, values.sort, activeTag /* + tags if 태그 필터 API 반영시 */]);

    // 페이지 변경시 더 로드
    useEffect(() => {
        if (page === 1) return; // 이미 첫 페이지는 위에서 호출됨
        fetchEvents(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchEvents = async (pageToLoad: number) => {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const payload: E.GetEventsPayload = {
                ...values,
                page: pageToLoad,
                // 태그 필터가 있다면 추가
                tag: tags,
            } as any;
            const res = await EventApi.getEvents(payload);
            const newEvents = res.events || [];
            setEvents(prev => (pageToLoad === 1 ? newEvents : [...prev, ...newEvents]));
            setHasMore(newEvents.length >= values.per_page!);
        } catch (err) {
            console.error('행사 목록 로딩 실패:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
        if (e.key === 'Escape') {
            setNewTagInput('');
        }
    };

    const handleDeleteTagClick = (e: MouseEvent<HTMLSpanElement>, tag: string) => {
        e.stopPropagation();
        deleteTag(tag);
    };

    // IntersectionObserver for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loadingMore) {
                    setPage(prev => prev + 1);
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

    return (
        <S.Container>
            <S.SearchContainer onSubmit={handleSubmit}>
                <S.FormRow>
                    <S.InputGroup className="search-bar">
                        <label htmlFor="event-search">검색</label>
                        <input
                            id="event-search"
                            type="text"
                            name="search"
                            placeholder="행사의 제목을 입력해주세요"
                            value={(values as any).search || ''}
                            onChange={handleChange}
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
                            onClick={handleSubmit}
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
                            <option value="서울">서울</option>
                            {/* ... */}
                        </select>
                    </S.InputGroup>

                    <S.DateRangeGroup>
                        <label htmlFor="start-date">시작일</label>
                        <input
                            type="date"
                            id="start-date"
                            name="date_from"
                            value={(values as any).date_from || ''}
                            onChange={handleChange}
                        />
                        <span>~</span>
                        <label htmlFor="end-date">종료일</label>
                        <input
                            type="date"
                            id="end-date"
                            name="date_to"
                            value={(values as any).date_to || ''}
                            onChange={handleChange}
                        />
                    </S.DateRangeGroup>
                </S.FormRow>

                <S.FilterRow>
                    <S.FilterGroup>
                        <label className="filter-label"><FaFilter size={14} /> 필터</label>
                        <S.TagList>
                            {tags.map(tag => (
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

                    <S.InputGroup>
                        <select
                            id="sort"
                            name="sort"
                            value={values.sort || 'start_date'}
                            onChange={handleChange}
                            onClick={handleSubmit}
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
                {events.map(event => <EventCard key={event.id} event={event} />)}
            </S.EventGrid>

            {loadingMore && <S.LoadingMessage>불러오는 중…</S.LoadingMessage>}
            <div ref={bottomRef} />
        </S.Container>
    );
};

export default EventSearchPage;