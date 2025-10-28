/**
 * 검색 결과 페이지 컴포넌트
 * 
 * 사용자의 검색 쿼리에 따른 행사 검색 결과를 표시합니다.
 * URL 파라미터를 통해 검색어와 필터를 유지하며, 페이지네이션을 지원합니다.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { SearchBar } from '../components/common';
import { EventCard } from '../components/event';
import { Pagination } from '../components/common';
import { Loading } from '../components/common';
import { SearchPerformanceIndicator, SearchStats } from '../components/common/SearchPerformanceIndicator';
import { SearchFilters, AppliedFilters } from '../components/search';

import { useAuth } from '../hooks';
import { SearchNormalizer, SearchResultViewModel } from '../normalizers/searchNormalizer';
import { SearchService } from '../services/searchService';
import { SearchParams, SearchFilters as SearchFiltersType } from '../types';

/**
 * 검색 결과 페이지 컴포넌트
 * 
 * URL 파라미터에서 검색어와 필터를 읽어와 검색을 실행하고,
 * 결과를 EventCard 컴포넌트를 사용하여 그리드 형태로 표시합니다.
 */
export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 검색 상태
  const [searchResults, setSearchResults] = useState<SearchResultViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 검색 조건 추출
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const region = searchParams.get('region') || undefined;
  const tags = searchParams.get('tags')?.split(',').filter(tag => tag.trim()) || undefined;
  const sortBy = searchParams.get('sort') as 'latest' | 'popular' | 'recommended' || 'latest';
  const startDate = searchParams.get('start_date') || undefined;
  const endDate = searchParams.get('end_date') || undefined;

  /**
   * 정렬 옵션 표시명 반환
   */
  const getSortDisplayName = useCallback((sortBy: string) => {
    switch (sortBy) {
      case 'popular':
        return '인기순';
      case 'recommended':
        return '추천순';
      case 'latest':
      default:
        return '최신순';
    }
  }, []);

  /**
   * 검색 실행
   */
  const executeSearch = useCallback(async (params: SearchParams) => {
    if (!params.query?.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await SearchService.search(params.query, {
        region: params.region,
        tags: params.tags,
        dateRange: params.dateRange,
        sortBy: params.sortBy,
        page: params.page,
        limit: 20,
      });

      const appliedFilters = [
        params.region && `지역: ${params.region}`,
        params.tags && params.tags.length > 0 && `태그: ${params.tags.join(', ')}`,
        params.dateRange && '날짜 필터 적용',
        params.sortBy && params.sortBy !== 'latest' && `정렬: ${getSortDisplayName(params.sortBy)}`,
      ].filter(Boolean) as string[];

      const viewModel = SearchNormalizer.toSearchResultViewModel(response, appliedFilters);
      setSearchResults(viewModel);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [getSortDisplayName]);

  /**
   * URL 파라미터 변경 시 검색 실행
   */
  useEffect(() => {
    const searchParams: SearchParams = {
      query: searchQuery,
      region,
      tags,
      sortBy,
      page: currentPage,
    };

    if (startDate && endDate) {
      searchParams.dateRange = { start: startDate, end: endDate };
    }

    executeSearch(searchParams);
  }, [searchQuery, region, tags, sortBy, currentPage, startDate, endDate, executeSearch]);

  /**
   * 새로운 검색 실행
   */
  const handleNewSearch = useCallback((query: string) => {
    const newParams = new URLSearchParams();
    newParams.set('q', query);
    setSearchParams(newParams);
  }, [setSearchParams]);

  /**
   * 페이지 변경
   */
  const handlePageChange = useCallback((page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page > 1) {
      newParams.set('page', page.toString());
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  /**
   * 필터 변경 처리
   */
  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    const newParams = new URLSearchParams();
    
    // 검색어 유지
    if (searchQuery) {
      newParams.set('q', searchQuery);
    }
    
    // 새로운 필터 적용
    if (newFilters.region) {
      newParams.set('region', newFilters.region);
    }
    
    if (newFilters.tags && newFilters.tags.length > 0) {
      newParams.set('tags', newFilters.tags.join(','));
    }
    
    if (newFilters.dateRange) {
      newParams.set('start_date', newFilters.dateRange.start);
      newParams.set('end_date', newFilters.dateRange.end);
    }
    
    if (newFilters.sortBy && newFilters.sortBy !== 'latest') {
      newParams.set('sort', newFilters.sortBy);
    }
    
    // 페이지를 1로 리셋
    newParams.delete('page');
    
    setSearchParams(newParams);
  }, [searchQuery, setSearchParams]);

  /**
   * 필터 초기화
   */
  const handleFiltersReset = useCallback(() => {
    const newParams = new URLSearchParams();
    
    // 검색어만 유지
    if (searchQuery) {
      newParams.set('q', searchQuery);
    }
    
    setSearchParams(newParams);
  }, [searchQuery, setSearchParams]);

  /**
   * 개별 필터 제거
   */
  const handleFilterRemove = useCallback((filterType: keyof SearchFiltersType, value?: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    switch (filterType) {
      case 'region':
        newParams.delete('region');
        break;
      case 'tags':
        if (value && tags) {
          const newTags = tags.filter(tag => tag !== value);
          if (newTags.length > 0) {
            newParams.set('tags', newTags.join(','));
          } else {
            newParams.delete('tags');
          }
        } else {
          newParams.delete('tags');
        }
        break;
      case 'dateRange':
        newParams.delete('start_date');
        newParams.delete('end_date');
        break;
      case 'sortBy':
        newParams.delete('sort');
        break;
    }
    
    // 페이지를 1로 리셋
    newParams.delete('page');
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, tags]);

  /**
   * 찜하기 토글 (로그인 필요)
   */
  const handleFavoriteToggle = useCallback(async (eventId: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // TODO: 찜하기 API 호출 구현
    console.log('Toggle favorite:', eventId, isFavorite);
  }, [isAuthenticated, navigate]);

  /**
   * 개인 일정 토글 (로그인 필요)
   */
  const handleScheduleToggle = useCallback(async (eventId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    
    // TODO: 개인 일정 API 호출 구현
    console.log('Toggle schedule:', eventId);
    return true;
  }, [isAuthenticated, navigate]);

  /**
   * 로그인 모달 표시
   */
  const handleShowLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  /**
   * 현재 필터 상태 생성
   */
  const getCurrentFilters = useCallback((): SearchFiltersType => {
    return {
      region,
      tags,
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
      sortBy,
    };
  }, [region, tags, startDate, endDate, sortBy]);

  return (
    <PageContainer>
      <Header />

      <MainContent>
        {/* 페이지 타이틀 */}
        <PageHeader>
          <PageTitleIcon>🔍</PageTitleIcon>
          <PageTitle>검색</PageTitle>
          <PageSubtitle>원하는 행사를 찾아보세요</PageSubtitle>
        </PageHeader>

        {/* 검색창 */}
        <SearchSection>
          <SearchBar
            initialValue={searchQuery}
            onSearchExecuted={handleNewSearch}
            placeholder="행사명, #해시태그, 지역으로 검색하세요"
          />
        </SearchSection>

        {/* 적용된 필터 및 검색 결과 헤더 */}
        <AppliedFilters
          filters={getCurrentFilters()}
          onFilterRemove={handleFilterRemove}
          onFiltersReset={handleFiltersReset}
          searchQuery={searchQuery}
        />

        {/* 검색 성능 인디케이터 */}
        {searchQuery && (
          <SearchPerformanceIndicator
            searchTime={searchResults?.searchInfo.searchTime || 0}
            totalResults={searchResults?.pagination.totalItems || 0}
            isLoading={isLoading}
          />
        )}

        {/* 검색 결과 정보 */}
        {searchResults && !isLoading && !searchResults.searchInfo.isEmpty && (
          <SearchStats
            searchTime={searchResults.searchInfo.searchTime}
            totalResults={searchResults.pagination.totalItems}
          />
        )}

        {/* 검색 필터 */}
        {searchQuery && (
          <SearchFilters
            filters={getCurrentFilters()}
            onFiltersChange={handleFiltersChange}
            onFiltersReset={handleFiltersReset}
            isLoading={isLoading}
          />
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <LoadingContainer>
            <Loading />
            <LoadingText>검색 중...</LoadingText>
            <LoadingSubtext>
              최적화된 검색으로 빠른 결과를 제공합니다
            </LoadingSubtext>
          </LoadingContainer>
        )}

        {/* 에러 상태 */}
        {error && (
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton
              onClick={() =>
                executeSearch({ query: searchQuery, page: currentPage })
              }
            >
              다시 시도
            </RetryButton>
          </ErrorContainer>
        )}

        {/* 검색 결과 없음 */}
        {searchResults && searchResults.searchInfo.isEmpty && !isLoading && (
          <EmptyResults>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
            <EmptyDescription>
              다른 검색어를 시도해보거나 필터를 조정해보세요.
            </EmptyDescription>
            <EmptyTips>
              <h4>검색 팁:</h4>
              <ul>
                <li>검색어의 철자를 확인해보세요</li>
                <li>더 일반적인 검색어를 사용해보세요</li>
                <li>#태그명 형식으로 태그를 검색해보세요</li>
                <li>지역명으로 검색해보세요 (예: 서울, 강남)</li>
              </ul>
            </EmptyTips>
          </EmptyResults>
        )}

        {/* 검색 결과 그리드 */}
        {searchResults && !searchResults.searchInfo.isEmpty && !isLoading && (
          <>
            <ResultsGrid>
              {searchResults.items.map(event => (
                <EventCard
                  key={event.id}
                  event={{
                    id: event.id,
                    title: event.title,
                    summary: event.summary ?? null,
                    start_date: '', // EventCard에서 displayDate 사용
                    location: event.location,
                    image_urls: event.imageUrl ? [event.imageUrl] : [],
                    organizer: null,
                    status: 'approved',
                    host: event.host,
                    tags: event.tags,
                    stats: {
                      average_rating: event.statistics.averageRating,
                      total_reviews: event.statistics.totalReviews,
                      view_count: event.statistics.viewCount,
                      favorites_count: event.statistics.favoritesCount,
                      schedules_count: 0,
                    }
                  }}
                  showViewCount={true}
                  showFavoriteButton={true}
                  showScheduleButton={true}
                  isAuthenticated={isAuthenticated}
                  onFavoriteToggle={handleFavoriteToggle}
                  onScheduleToggle={handleScheduleToggle}
                  onShowLogin={handleShowLogin}
                />
              ))}
            </ResultsGrid>

            {/* 페이지네이션 */}
            <Pagination
              currentPage={searchResults.pagination.currentPage}
              totalPages={searchResults.pagination.totalPages}
              totalItems={searchResults.pagination.totalItems}
              itemsPerPage={searchResults.pagination.limit}
              onPageChange={handlePageChange}
              showInfo={true}
            />
          </>
        )}
      </MainContent>

      <Footer />
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const PageTitleIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.xxl || '2rem'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const SearchSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const LoadingSubtext = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  font-style: italic;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const EmptyResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const EmptyDescription = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  max-width: 500px;
`;

const EmptyTips = styled.div`
  text-align: left;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-width: 500px;

  h4 {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fonts.size.md};
  }

  ul {
    margin: 0;
    padding-left: ${({ theme }) => theme.spacing.lg};
    
    li {
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: ${({ theme }) => theme.fonts.size.sm};
    }
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;