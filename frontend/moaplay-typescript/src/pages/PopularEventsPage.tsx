import React, { useEffect, useState } from 'react';
import * as EventApi from '../service/eventsApi'; // 행사 API 경로 확인
import type * as E from '../types/events';      // Event 타입 경로 확인
import EventCard from '../components/EventCard';           // EventCard 컴포넌트 경로 확인
import { EventGrid, NoResultsMessage } from '../styles/EventSearch.styles'; // EventGrid 스타일 경로 확인 (재사용)
import styled from 'styled-components';        // styled-components 임포트
import EventSearchPage from '../components/EventSearch';

// --- API 요청 파라미터 (인기순) ---
const popularEventsParams: E.GetEventsPayload = {
  page: 1,
  per_page: 4, // 한 번에 불러올 인기 행사 개수 (조절 가능)
  status: 'approved',
  sort: 'view_count', // 👈 인기순 정렬 기준
  order: 'desc',      // 👈 내림차순 (조회수 높은 순)
  // location, tags 등 다른 필터는 필요시 추가
};

// --- 페이지 컨테이너 스타일 (선택 사항) ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color : #131313;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;


// --- 인기 행사 페이지 컴포넌트 ---
const PopularEventsPage: React.FC = () => {
  const [popularEvents, setPopularEvents] = useState<E.Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 컴포넌트 마운트 시 인기 행사 데이터 로드 ---
  useEffect(() => {
    const fetchPopularEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await EventApi.getEvents(popularEventsParams);
        setPopularEvents(response.events || []); // API 응답 구조 확인!
      } catch (err: any) {
        console.error("인기 행사 로딩 실패:", err);
        setError("행사 목록을 불러오는 중 오류가 발생했습니다.");
        setPopularEvents([]); // 에러 시 빈 목록
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularEvents();
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  return (
    <PageContainer>
      <PageTitle>✨ 현재 인기있는 행사들 입니다 ✨</PageTitle>

      {/* 로딩 상태 표시 */}
      {isLoading && <div>인기 행사 목록을 불러오는 중...</div>}

      {/* 에러 상태 표시 */}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

      {/* 행사 목록 표시 */}
      {!isLoading && !error && (
        <EventGrid>
          {popularEvents.length === 0 ? (
            <NoResultsMessage>인기 행사가 없습니다.</NoResultsMessage>
          ) : (
            popularEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </EventGrid>
      )}

      <EventSearchPage/>
    </PageContainer>
  );
};

export default PopularEventsPage;