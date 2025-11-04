import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as EventApi from '../services/eventsApi';
import type * as E from '../types/events';
import EventCard from '../components/EventCard';
import * as S from '../styles/RegionPage.styles';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { EventGrid, NoResultsMessage } from '../styles/EventSearch.styles';

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
  { value: "충북", label: "충북", icon: '🌾' },
  { value: "충남", label: "충남", icon: '🍓' },
  { value: "전북", label: "전북", icon: '🍚' },
  { value: "전남", label: "전남", icon: '☀️' },
  { value: "경북", label: "경북", icon: '🏯' },
  { value: "경남", label: "경남", icon: '🚢' },
  { value: "제주", label: "제주", icon: '🍊' },
];

const RegionPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState("서울");
  const [regionalEvents, setRegionalEvents] = useState<E.Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const regionListRef = useRef<HTMLDivElement>(null);

  const fetchEvents = useCallback(async (region: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: E.GetEventsPayload = {
        page: 1,
        per_page: 12,
        status: 'approved',
        location: region,
      };
      const response = await EventApi.getEvents(params);
      setRegionalEvents(response.events || []);
    } catch (err) {
      setError("행사 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(selectedRegion);
  }, [selectedRegion, fetchEvents]);

  const scrollRegions = (direction: 'left' | 'right') => {
    if (regionListRef.current) {
      regionListRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <S.PageContainer>
      <S.RegionSelectorContainer>
        <S.RegionContentWrapper>
          <S.ArrowButton direction="left" onClick={() => scrollRegions('left')}>
            <FaChevronLeft />
          </S.ArrowButton>

          <S.RegionList ref={regionListRef}>
            {regions.map(region => (
              <S.RegionButtonWrapper
                key={region.value}
                onClick={() => setSelectedRegion(region.value)}
              >
                <S.RegionButtonIcon $isActive={selectedRegion === region.value}>
                  {region.icon}
                </S.RegionButtonIcon>
                <S.RegionButtonLabel $isActive={selectedRegion === region.value}>
                  {region.value}
                </S.RegionButtonLabel>
              </S.RegionButtonWrapper>
            ))}
          </S.RegionList>

          <S.ArrowButton direction="right" onClick={() => scrollRegions('right')}>
            <FaChevronRight />
          </S.ArrowButton>
        </S.RegionContentWrapper>
      </S.RegionSelectorContainer>

      <S.EventGridContainer>
        {isLoading && <S.LoadingText>{selectedRegion} 행사 불러오는 중...</S.LoadingText>}
        {error && <S.ErrorText>{error}</S.ErrorText>}
        {!isLoading && !error && (
          <EventGrid>
            {regionalEvents.length === 0 ? (
              <NoResultsMessage>현재 {selectedRegion} 지역의 행사가 없습니다 😢</NoResultsMessage>
            ) : (
              regionalEvents.map(event => <EventCard key={event.id} event={event} />)
            )}
          </EventGrid>
        )}
      </S.EventGridContainer>

      {/* <S.LoadMoreButton>더 많은 여행지 보러가기 &gt;</S.LoadMoreButton> */}
    </S.PageContainer>
  );
};

export default RegionPage;
