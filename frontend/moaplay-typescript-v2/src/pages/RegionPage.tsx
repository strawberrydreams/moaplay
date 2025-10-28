import React from 'react';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { SearchBar } from '../components/common';
import { ImageCarousel } from '../components/common';
import { RegionFilterBar } from '../components/event';
import { EventGrid } from '../components/event/EventGrid';
import { Loading } from '../components/common';
import { useRegionPage } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

/**
 * 지역별 행사 페이지 컴포넌트
 * 이미지 캐러셀, 지역 필터, 행사 그리드를 포함한 지역별 행사 탐색 기능 제공
 */
const RegionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    events,
    regions,
    featuredImages,
    selectedRegion,
    loading,
    error,
    pagination,
    setSelectedRegion,
    loadMore,
    refresh
  } = useRegionPage();

  /**
   * 검색 실행 핸들러
   * 검색어와 함께 이벤트 리스트 페이지로 이동
   */
  const handleSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    if (selectedRegion) {
      searchParams.set('region', selectedRegion);
    }
    navigate(`/events?${searchParams.toString()}`);
  };
  /**
   * 더보기 버튼 클릭 핸들러
   */
  const handleLoadMore = () => {
    if (!loading && pagination.currentPage < pagination.totalPages) {
      loadMore();
    }
  };

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        {/* 상단: 이미지 캐러셀 */}
        <CarouselSection>
          <ImageCarousel 
            images={featuredImages}
            height="400px"
            autoPlay={true}
            interval={6000}
          />
        </CarouselSection>

        {/* 중단: 검색창 */}
        <SearchSection>
          <SearchBar 
            placeholder="지역별 행사를 검색하세요"
            onSearchExecuted={handleSearch}
          />
        </SearchSection>

        {/* 하단: 지역 필터 + 행사 그리드 */}
        <ContentSection>
          <FilterSection>
            <RegionFilterBar
              regions={regions.map(region => ({ code: region, name: region }))}
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              showAllOption={true}
            />
          </FilterSection>

          <EventsSection>
            {/* 페이지 헤더 */}
            <SectionHeader>
              <SectionTitle>
                {selectedRegion 
                  ? `${selectedRegion} 지역 행사`
                  : '전체 지역 행사'
                }
              </SectionTitle>
              <EventCount>
                총 {pagination.totalItems.toLocaleString()}개의 행사
              </EventCount>
            </SectionHeader>

            {/* 에러 상태 */}
            {error && (
              <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <RetryButton onClick={refresh}>다시 시도</RetryButton>
              </ErrorContainer>
            )}

            {/* 로딩 상태 */}
            {loading && events.length === 0 && (
              <LoadingContainer>
                <Loading />
              </LoadingContainer>
            )}

            {/* 행사 그리드 */}
            {!error && (
              <EventGrid
                events={events}
                isLoading={loading && events.length === 0}
                showViewCount={true}
                showFavoriteButton={true}
                showScheduleButton={true}
                isAuthenticated={isAuthenticated}
                emptyMessage={
                  selectedRegion 
                    ? '해당 지역에 등록된 행사가 없습니다.'
                    : '등록된 행사가 없습니다.'
                }
                emptyDescription="다른 지역을 선택해보세요."
              />
            )}

            {/* 더보기 버튼 */}
            {pagination.currentPage < pagination.totalPages && (
              <LoadMoreSection>
                <LoadMoreButton 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? '로딩 중...' : '더보기'}
                </LoadMoreButton>
              </LoadMoreSection>
            )}

            {/* 페이지네이션 정보 */}
            {events.length > 0 && (
              <PaginationInfo>
                {pagination.currentPage} / {pagination.totalPages} 페이지
              </PaginationInfo>
            )}
          </EventsSection>
        </ContentSection>
      </MainContent>

      <Footer />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const CarouselSection = styled.section`
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const SearchSection = styled.section`
  margin: ${({ theme }) => theme.spacing.xl} 0;
  display: flex;
  justify-content: center;
`;

const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FilterSection = styled.div`
  width: 100%;
`;

const EventsSection = styled.div`
  flex: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.xlarge};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.dark};
  margin: 0;
`;

const EventCount = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.medium};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.light};
  border-radius: 12px;
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fonts.size.medium};
  text-align: center;
  margin: 0;
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fonts.size.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;
const LoadMoreSection = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const LoadMoreButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fonts.size.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary}dd;
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PaginationInfo = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fonts.size.small};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export default RegionPage;