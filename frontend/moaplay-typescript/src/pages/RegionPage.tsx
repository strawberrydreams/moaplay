import React, { useEffect, useState, useCallback, useRef } from 'react'; // useRef 추가
import * as EventApi from '../service/eventsApi'; // 행사 API 경로 확인
import type * as E from '../types/events';      // Event 타입 경로 확인
import EventCard from '../components/EventCard'; // EventCard 경로 확인
import { EventGrid, NoResultsMessage } from '../styles/EventSearch.styles'; // EventGrid 스타일 재사용
import * as S from '../styles/RegionPage.styles'; // 스타일 임포트
import { FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa'; // 아이콘 임포트

// --- 지역 목록 (EventSearchPage와 유사하게) ---
const regions = [
  { value: "서울", label: "서울", icon: '🏙️' },
  { value: "부산", label: "부산", icon: '🌊' },
  { value: "대구", label: "대구", icon: '🍎' },
  { value: "인천", label: "인천", icon: '✈️' },
  { value: "광주", label: "광주", icon: '🎨' },
  { value: "대전", label: "대전", icon: '🔬' },
  { value: "울산", label: "울산", icon: '🏭' },
  { value: "세종", label: "세종", icon: '🏛️' },
  { value: "경기", label: "경기", icon: '🏞️' },
  { value: "강원", label: "강원", icon: '⛰️' },
  { value: "충북", label: "충북", icon: '🏞️' }, // 아이콘 중복 가능
  { value: "충남", label: "충남", icon: '🍓' },
  { value: "전북", label: "전북", icon: '🍚' },
  { value: "전남", label: "전남", icon: '☀️' },
  { value: "경북", label: "경북", icon: '🏯' },
  { value: "경남", label: "경남", icon: '🚢' },
  { value: "제주", label: "제주", icon: '🍊' },
  // 필요시 더 추가
];

const RegionPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("부산"); // 초기 선택 지역 (예: 부산)
  const [regionalEvents, setRegionalEvents] = useState<E.Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 더보기 로딩 상태
  const [error, setError] = useState<string | null>(null);
  const regionListRef = useRef<HTMLDivElement>(null); // 지역 리스트 스크롤용

  // --- 지역별 행사 데이터 로드 (페이지네이션 포함) ---
  const fetchEvents = useCallback(async (region: string, page: number = 1, loadMore: boolean = false) => {
    if (loadMore) setIsLoadingMore(true); // 더보기 로딩 시작
    else setIsLoading(true); // 초기 로딩 또는 지역 변경 시 로딩 시작
    
    setError(null);
    try {
      const params: E.GetEventsPayload = {
        page: page,
        per_page: 9, // 한 번에 불러올 개수 (3x3 그리드 가정)
        status: 'approved',
        location: region, // 선택된 지역 전달
        sort: 'start_date', 
        order: 'desc',
      };
      const response = await EventApi.getEvents(params);

      // API 응답 구조 확인! (response.events, response.pagination 등 가정)
      const newEvents = response.events || [];
      const pagination = response.pagination; 

      if (loadMore) {
        // 더보기: 기존 목록에 새 목록 추가
        setRegionalEvents(prev => [...prev, ...newEvents]);
      } else {
        // 지역 변경 또는 첫 로드: 목록 교체
        setRegionalEvents(newEvents);
      }
      
      if (pagination) {
          setTotalPages(pagination.page || 1); // 총 페이지 수 업데이트
      }
      setCurrentPage(page); // 현재 페이지 업데이트

    } catch (err: any) {
      console.error(`${region} 지역 행사 로딩 실패:`, err);
      setError("행사 목록을 불러오는 중 오류가 발생했습니다.");
      setRegionalEvents([]); // 에러 시 빈 목록
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // selectedRegion 변경 시 첫 페이지부터 다시 로드
  useEffect(() => {
    fetchEvents(selectedRegion, 1);
  }, [selectedRegion, fetchEvents]);

  // 지역 선택 핸들러
  const handleRegionSelect = (regionValue: string) => {
    setSelectedRegion(regionValue);
    setCurrentPage(1); // 지역 변경 시 페이지 1로 리셋
    setTotalPages(1); // 총 페이지도 리셋
  };

  // 더보기 버튼 핸들러
  const handleLoadMore = () => {
    if (!isLoadingMore && currentPage < totalPages) {
      fetchEvents(selectedRegion, currentPage + 1, true); // 다음 페이지 로드
    }
  };

  // 좌우 스크롤 버튼 핸들러
  const scrollRegions = (direction: 'left' | 'right') => {
      if (regionListRef.current) {
          const scrollAmount = 300; // 한 번에 스크롤할 양 (조절 가능)
          regionListRef.current.scrollBy({
              left: direction === 'left' ? -scrollAmount : scrollAmount,
              behavior: 'smooth' // 부드러운 스크롤
          });
      }
  };

  return (
    <S.PageContainer>
      {/* --- 지역 선택 --- */}
      <S.RegionSelectorContainer>
        <S.RegionContentWrapper>
        <S.ArrowButton direction="left" onClick={() => scrollRegions('left')} aria-label="왼쪽으로 스크롤">
            <FaChevronLeft />
        </S.ArrowButton>
        <S.RegionList ref={regionListRef}>
          {regions.map(region => (
            <S.RegionButtonWrapper
              key={region.value}
              onClick={() => handleRegionSelect(region.value)}
            >
              <S.RegionButtonIcon $isActive={selectedRegion === region.value}>
                {/* 실제 아이콘 라이브러리 사용하거나 이미지 사용 */}
                <span style={{ fontSize: '2.5rem' }}>{region.icon || <FaImage />}</span> 
              </S.RegionButtonIcon>
              <S.RegionButtonLabel $isActive={selectedRegion === region.value}>{region.label}</S.RegionButtonLabel>
            </S.RegionButtonWrapper>
          ))}
        </S.RegionList>
        <S.ArrowButton direction="right" onClick={() => scrollRegions('right')} aria-label="오른쪽으로 스크롤">
            <FaChevronRight />
        </S.ArrowButton>
        </S.RegionContentWrapper>
      </S.RegionSelectorContainer>

      {/* --- 행사 목록 --- */}
      <S.EventGridContainer>
        {isLoading && !isLoadingMore && <div>{selectedRegion} 지역 행사 목록을 불러오는 중...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        
        {!isLoading && !error && (
          <EventGrid>
            {regionalEvents.length === 0 ? (
              <NoResultsMessage>{selectedRegion} 지역에 행사가 없습니다.</NoResultsMessage>
            ) : (
              regionalEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </EventGrid>
        )}
      </S.EventGridContainer>

      {/* --- 더보기 버튼 --- */}
      {!isLoading && !error && currentPage < totalPages && (
        <S.LoadMoreButton onClick={handleLoadMore} disabled={isLoadingMore}>
          {isLoadingMore ? '불러오는 중...' : '더 많은 행사 보기 >'}
        </S.LoadMoreButton>
      )}
    </S.PageContainer>
  );
};

export default RegionPage;