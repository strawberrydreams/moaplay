import React from 'react';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { SearchBar } from '../components/common';
import { ImageCarousel } from '../components/common';
import { EventGrid } from '../components/event/EventGrid';
import { Loading } from '../components/common';
import { usePopularPage } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

/**
 * 인기 행사 페이지 컴포넌트
 * 조회수 기반 인기 행사 정렬과 기간별 필터링 기능 제공
 */
const PopularPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    popularEvents,
    featuredImages,
    trendingTags,
    selectedPeriod,
    loading,
    error,
    pagination,
    setPeriod,
    loadMore,
    refresh
  } = usePopularPage();

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    searchParams.set('sort', 'popular');
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

  /**
   * 기간 선택 핸들러
   */
  const handlePeriodChange = (period: string) => {
    setPeriod(period as 'daily' | 'weekly' | 'monthly' | 'all');
  };

  /**
   * 트렌딩 태그 클릭 핸들러
   */
  const handleTrendingTagClick = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tags', tagName);
    searchParams.set('sort', 'popular');
    navigate(`/events?${searchParams.toString()}`);
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
            placeholder="인기 행사를 검색하세요"
            onSearchExecuted={handleSearch}
          />
        </SearchSection>

        {/* 하단: 기간 필터 + 트렌딩 태그 + 행사 그리드 */}
        <ContentSection>
          {/* 기간별 필터 */}
          <FilterSection>
            <PeriodFilter>
              <FilterTitle>인기 기간</FilterTitle>
              <PeriodButtons>
                <PeriodButton
                  active={selectedPeriod === 'daily'}
                  onClick={() => handlePeriodChange('daily')}
                >
                  일간
                </PeriodButton>
                <PeriodButton
                  active={selectedPeriod === 'weekly'}
                  onClick={() => handlePeriodChange('weekly')}
                >
                  주간
                </PeriodButton>
                <PeriodButton
                  active={selectedPeriod === 'monthly'}
                  onClick={() => handlePeriodChange('monthly')}
                >
                  월간
                </PeriodButton>
                <PeriodButton
                  active={selectedPeriod === 'all'}
                  onClick={() => handlePeriodChange('all')}
                >
                  전체
                </PeriodButton>
              </PeriodButtons>
            </PeriodFilter>
          </FilterSection>

          {/* 트렌딩 태그 */}
          {trendingTags.length > 0 && (
            <TrendingSection>
              <TrendingTitle>🔥 트렌딩 태그</TrendingTitle>
              <TrendingTags>
                {trendingTags.map((tag) => (
                  <TrendingTag
                    key={tag.name}
                    onClick={() => handleTrendingTagClick(tag.name)}
                  >
                    <TagName>#{tag.name}</TagName>
                    {tag.count && <TagCount>({tag.count})</TagCount>}
                  </TrendingTag>
                ))}
              </TrendingTags>
            </TrendingSection>
          )}

          <EventsSection>
            {/* 페이지 헤더 */}
            <SectionHeader>
              <SectionTitle>
                {selectedPeriod === 'daily' && '일간 인기 행사'}
                {selectedPeriod === 'weekly' && '주간 인기 행사'}
                {selectedPeriod === 'monthly' && '월간 인기 행사'}
                {selectedPeriod === 'all' && '전체 인기 행사'}
              </SectionTitle>
              <EventCount>
                총 {pagination.totalItems.toLocaleString()}개의 행사
              </EventCount>
            </SectionHeader>

            {/* 인기 순위 안내 */}
            <RankingInfo>
              <InfoIcon>📊</InfoIcon>
              <InfoText>조회수를 기준으로 인기 순위가 결정됩니다</InfoText>
            </RankingInfo>

            {/* 에러 상태 */}
            {error && (
              <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <RetryButton onClick={refresh}>다시 시도</RetryButton>
              </ErrorContainer>
            )}

            {/* 로딩 상태 */}
            {loading && popularEvents.length === 0 && (
              <LoadingContainer>
                <Loading />
              </LoadingContainer>
            )}

            {/* 행사 그리드 */}
            {!error && (
              <EventGrid
                events={popularEvents}
                isLoading={loading && popularEvents.length === 0}
                showViewCount={true}
                showFavoriteButton={true}
                showScheduleButton={true}
                isAuthenticated={isAuthenticated}
                emptyMessage="해당 기간의 인기 행사가 없습니다."
                emptyDescription="다른 기간을 선택해보세요."
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
            {popularEvents.length > 0 && (
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

const PeriodFilter = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const PeriodButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const PeriodButton = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.light};
  border-radius: 24px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : 'white'};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.dark};
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ active }) => active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ active, theme }) => 
      active ? theme.colors.primary : theme.colors.light};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const TrendingSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TrendingTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const TrendingTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TrendingTag = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 2px solid ${({ theme }) => theme.colors.warning};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.warning}15;
  color: ${({ theme }) => theme.colors.dark};
  font-size: ${({ theme }) => theme.fonts.size.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.warning};
    color: white;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.warning};
    outline-offset: 2px;
  }
`;

const TagName = styled.span`
  font-weight: 500;
`;

const TagCount = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  opacity: 0.8;
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
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
`;

const RankingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.info}15;
  border-radius: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoIcon = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.lg};
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.info};
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: 500;
  margin: 0;
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
  font-size: ${({ theme }) => theme.fonts.size.md};
  text-align: center;
  margin: 0;
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fonts.size.md};
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
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary}dd;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export default PopularPage;