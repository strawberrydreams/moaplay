import React, { useEffect, useState, useCallback, type ChangeEvent } from 'react'; // ChangeEvent 추가
import * as EventApi from '../service/eventsApi'; // 행사 API 경로 확인
import type * as E from '../types/events';      // Event 타입 경로 확인
import EventCard from '../components/EventCard';           // EventCard 컴포넌트 경로 확인
import { EventGrid, NoResultsMessage } from '../styles/EventSearch.styles'; // EventGrid 스타일 경로 확인
import styled from 'styled-components';        // styled-components 임포트

// --- 지역 목록 (EventSearchPage와 동일하게) ---
const regions = [
  { value: "", label: "전체 지역" }, // 기본값
  { value: "서울", label: "서울" },
  { value: "부산", label: "부산" },
  { value: "대구", label: "대구" },
  { value: "인천", label: "인천" },
  { value: "광주", label: "광주" },
  { value: "대전", label: "대전" },
  { value: "울산", label: "울산" },
  { value: "세종", label: "세종" },
  { value: "경기", label: "경기" },
  { value: "강원", label: "강원" },
  { value: "충북", label: "충북" },
  { value: "충남", label: "충남" },
  { value: "전북", label: "전북" },
  { value: "전남", label: "전남" },
  { value: "경북", label: "경북" },
  { value: "경남", label: "경남" },
  { value: "제주", label: "제주" },
];

// --- 페이지 스타일 (PopularEventsPage와 유사하게) ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #131313;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  margin: 0;
`;

const RegionSelector = styled.select`
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  background-color: #fff;
  font-family: inherit;
  min-width: 150px; /* 드롭다운 너비 */
`;

// --- 지역별 행사 페이지 컴포넌트 ---
const RegionalEventsPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>(""); // 선택된 지역 (초기값: 전체)
  const [regionalEvents, setRegionalEvents] = useState<E.Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 지역 변경 시 행사 데이터 로드 ---
  const fetchRegionalEvents = useCallback(async (region: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: E.GetEventsPayload = {
        page: 1,
        per_page: 12, // 필요시 더 많이 불러오도록 조절
        status: 'approved',
        location: region || undefined, // region이 빈 문자열("")이면 undefined로 보내 전체 검색
        sort: 'start_date', // 지역별 행사도 최신순으로 정렬 (선택 사항)
        order: 'desc',
      };
      const response = await EventApi.getEvents(params);
      setRegionalEvents(response.events || []); // API 응답 구조 확인!
    } catch (err: any) {
      console.error(`${region} 지역 행사 로딩 실패:`, err);
      setError("행사 목록을 불러오는 중 오류가 발생했습니다.");
      setRegionalEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // 의존성 없음

  // selectedRegion이 변경될 때마다 fetchRegionalEvents 호출
  useEffect(() => {
    fetchRegionalEvents(selectedRegion);
  }, [selectedRegion, fetchRegionalEvents]); // fetchRegionalEvents는 useCallback으로 감쌌으므로 추가

  // 지역 선택 핸들러
  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>📍 지역별 행사</PageTitle>
        <RegionSelector value={selectedRegion} onChange={handleRegionChange}>
          {regions.map(region => (
            <option key={region.value} value={region.value}>
              {region.label}
            </option>
          ))}
        </RegionSelector>
      </PageHeader>

      {/* 로딩 상태 표시 */}
      {isLoading && <div>{selectedRegion || '전체'} 지역 행사 목록을 불러오는 중...</div>}

      {/* 에러 상태 표시 */}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

      {/* 행사 목록 표시 */}
      {!isLoading && !error && (
        <EventGrid>
          {regionalEvents.length === 0 ? (
            <NoResultsMessage>{selectedRegion || '전체'} 지역에 행사가 없습니다.</NoResultsMessage>
          ) : (
            regionalEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </EventGrid>
      )}
    </PageContainer>
  );
};

export default RegionalEventsPage;