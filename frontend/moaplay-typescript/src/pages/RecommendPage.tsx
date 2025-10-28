import React, { useEffect, useState, useCallback } from 'react';
import * as EventApi from '../service/eventsApi';   // 행사 API 경로 확인
import * as UserApi from '../service/userApi';     // 사용자 API 경로 확인 (선호 태그 가져오기용)
import type * as E from '../types/events';          // Event 타입 경로 확인
import EventCard from '../components/EventCard';               // EventCard 컴포넌트 경로 확인
import { EventGrid, NoResultsMessage } from '../styles/EventSearch.styles'; // EventGrid 스타일 경로 확인
import styled from 'styled-components';            // styled-components 임포트
import { useAuth } from '../context/AuthContext'; // 사용자 로그인 상태 확인용

// --- 페이지 스타일 (다른 추천 페이지와 유사하게) ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// --- 선호 태그 기반 추천 페이지 컴포넌트 ---
const RecommendedEventsPage: React.FC = () => {
  const { currentUser } = useAuth(); // 로그인 사용자 정보 가져오기
  const [recommendedEvents, setRecommendedEvents] = useState<E.Event[]>([]);
  const [preferredTags, setPreferredTags] = useState<string[]>([]); // 사용자 선호 태그
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 사용자 선호 태그 가져오기 ---
  const fetchPreferredTags = useCallback(async () => {
    // 로그인 상태가 아니면 실행하지 않음
    if (!currentUser) {
      setIsLoading(false); // 로딩 종료
      return;
    }
    try {
      // 사용자 선호 태그를 가져오는 API 호출 (UserApi에 함수 필요)
      // 예: const tagsResponse = await UserApi.getMyTags();
      // 여기서는 임시 데이터 사용
      const tagsResponse = ['음악', '콘서트']; // 🚨 임시 데이터! 실제 API 호출로 변경 필요
      setPreferredTags(tagsResponse || []);
    } catch (err) {
      console.error("선호 태그 로딩 실패:", err);
      setPreferredTags([]); // 에러 시 빈 배열
      // 에러 메시지를 표시할 수도 있음
    }
  }, [currentUser]); // currentUser가 변경될 때마다 실행

  // --- 선호 태그 기반 행사 데이터 로드 ---
  const fetchRecommendedEvents = useCallback(async (tags: string[]) => {
    // 선호 태그가 없으면 실행하지 않음
    if (tags.length === 0) {
      setRecommendedEvents([]); // 빈 목록으로 설정
      setIsLoading(false); // 로딩 종료
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params: E.GetEventsPayload = {
        page: 1,
        per_page: 12, // 추천 개수 (조절 가능)
        status: 'approved',
        // API가 tags 파라미터를 어떻게 받는지 확인 필요 (쉼표 구분 문자열 or 배열)
        // tags: tags, // 👈 선호 태그 전달 (배열이라고 가정)
        // tags: tags.join(','), // 👈 쉼표 구분 문자열이라면
        sort: 'start_date', // 최신순 추천 (선택 사항)
        order: 'desc',
      };
      const response = await EventApi.getEvents(params);
      setRecommendedEvents(response.events || []); // API 응답 구조 확인!
    } catch (err: any) {
      console.error("추천 행사 로딩 실패:", err);
      setError("추천 행사 목록을 불러오는 중 오류가 발생했습니다.");
      setRecommendedEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // 의존성 없음

  // 1. 마운트 시 및 사용자 변경 시 선호 태그 가져오기
  useEffect(() => {
    fetchPreferredTags();
  }, [fetchPreferredTags]); // useCallback으로 감쌌으므로 의존성 추가

  // 2. 선호 태그가 변경되면 추천 행사 다시 가져오기
  useEffect(() => {
    // preferredTags 상태가 설정된 후에만 추천 행사 로드
    if (preferredTags.length > 0) {
      fetchRecommendedEvents(preferredTags);
    } else if (currentUser) {
        // 로그인했지만 선호 태그가 없는 경우 (아직 로딩 중일 수 있음)
        // 또는 선호 태그가 0개인 경우 -> 로딩 상태 해제
        setIsLoading(false);
        setRecommendedEvents([]);
    } else {
        // 비로그인 상태 -> 로딩 상태 해제
        setIsLoading(false);
        setRecommendedEvents([]);
    }
  }, [preferredTags, fetchRecommendedEvents, currentUser]); // preferredTags가 변경될 때 실행

  // --- 렌더링 ---
  return (
    <PageContainer>
      <PageTitle>🎯 맞춤 추천 행사</PageTitle>

      {/* 로그인 상태 확인 */}
      {!currentUser && !isLoading && (
        <div style={{ textAlign: 'center', color: '#777' }}>
          로그인 후 선호하는 태그를 설정하시면 맞춤 행사를 추천해 드려요!
        </div>
      )}

      {/* 로딩 상태 표시 */}
      {isLoading && <div>추천 행사 목록을 불러오는 중...</div>}

      {/* 에러 상태 표시 */}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

      {/* 행사 목록 표시 (로그인 상태이고 로딩/에러 아닐 때) */}
      {currentUser && !isLoading && !error && (
        <EventGrid>
          {preferredTags.length === 0 ? (
            <NoResultsMessage>선호 태그를 설정해주세요.</NoResultsMessage>
          ) : recommendedEvents.length === 0 ? (
            <NoResultsMessage>추천할 행사가 없습니다.</NoResultsMessage>
          ) : (
            recommendedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </EventGrid>
      )}
    </PageContainer>
  );
};

export default RecommendedEventsPage;