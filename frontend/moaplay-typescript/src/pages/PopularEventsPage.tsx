import React, { useEffect, useState } from 'react';
import * as EventApi from '../services/eventsApi'; // 행사 API 경로 확인
import type * as E from '../types/events';      // Event 타입 경로 확인
import EventCard from '../components/events/EventCard'; // EventCard 컴포넌트 경로 확인
import { NoResultsMessage } from '../styles/components/EventSearch.styles'; // NoResultsMessage 재사용
import * as S from '../styles/pages/PopularEventsPage.styles'; // 스타일 임포트
import EventSearchPage from '../components/events/EventSearch'; // EventSearchPage 임포트

// --- API 요청 파라미터 (상위 3개만) ---
const popularEventsParams: E.GetEventsPayload = {
    page: 1,
    per_page: 3, // 👈 상위 3개만 요청
    status: 'approved',
    sort: 'view_count',
    order: 'desc',
};

const PopularEventsPage: React.FC = () => {
    const [topEvents, setTopEvents] = useState<E.Event[]>([]); // 상위 3개 행사 상태
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- 컴포넌트 마운트 시 상위 3개 행사 데이터 로드 ---
    useEffect(() => {
        const fetchTopEvents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await EventApi.getEvents(popularEventsParams);
                setTopEvents(response.events || []); // API 응답 구조 확인!
            } catch (err: any) {
                console.error("인기 행사(Top 3) 로딩 실패:", err);
                setError("인기 행사 정보를 불러오는 중 오류가 발생했습니다.");
                setTopEvents([]); // 에러 시 빈 목록
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopEvents();
    }, []); // 빈 배열: 마운트 시 한 번만 실행

    return (
        <S.PageContainer>
            {/* --- 상단 Top 3 섹션 --- */}
            <S.TopEventsSection>
                {isLoading && <div>인기 행사 정보를 불러오는 중...</div>}
                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                {!isLoading && !error && (
                    <S.TopEventsGrid>
                        {topEvents.length === 0 ? (
                            <NoResultsMessage style={{ gridColumn: '1 / -1' }}> {/* 그리드 전체 차지 */}
                                인기 행사가 없습니다.
                            </NoResultsMessage>
                        ) : (
                            topEvents.map((event, index) => (
                                <S.RankedEventCardWrapper key={event.id}>
                                    <S.RankNumber>{index + 1}</S.RankNumber> {/* 순위 표시 */}
                                    {/* EventCard는 행사 정보만 표시 */}
                                    <EventCard event={event}/>
                                </S.RankedEventCardWrapper>
                            ))
                        )}
                    </S.TopEventsGrid>
                )}
            </S.TopEventsSection>

            {/* --- 하단 전체 검색 및 목록 (EventSearchPage 사용) --- */}
            {/* EventSearchPage가 자체적으로 API 호출 및 목록 관리를 함 */}
            <EventSearchPage />
        </S.PageContainer>
    );
};

export default PopularEventsPage;