/**
 * 행사 목록 페이지
 * 
 * 전체 행사 목록을 표시하고, 검색 및 필터링 기능을 제공합니다.
 * 왼쪽 사이드바에 필터 옵션을 배치하고, 오른쪽에 행사 목록을 표시합니다.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks';
import { useEventList } from '../hooks';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { SearchBar } from '../components/common';
import { EventGrid } from '../components/event/EventGrid';
import { EventFilters } from '../components/event';
import { Button } from '../components/common';
import { Loading } from '../components/common';
import { FloatingActionButton } from '../components/common';

/**
 * 행사 목록 페이지 컴포넌트
 * 
 * 전체 행사 목록을 최신순으로 표시하고, 다양한 필터링 옵션을 제공합니다.
 * 검색 기능은 별도 페이지 없이 필터링으로 구현됩니다.
 */
export const EventListPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL 파라미터에서 초기 검색 조건 추출
  const sortParam = searchParams.get('sort') || 'latest';
  const sortMapping: Record<string, 'created_at' | 'view_count' | 'average_rating'> = {
    latest: 'created_at',
    popular: 'view_count',
    recommended: 'average_rating'
  };
  
  const initialParams = {
    q: searchParams.get('q') || undefined,
    region: searchParams.get('region') || undefined,
    tags: searchParams.get('tags') || undefined,
    sort: sortMapping[sortParam] || 'created_at'
  };

  // 행사 목록 관리 훅
  const {
    events,
    loading,
    error,
    pagination,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    loadEvents,
    goToPage,
    resetFilters
  } = useEventList(initialParams);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * 검색 실행 처리
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // URL 파라미터 업데이트
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };
  /**
   * 필터 변경 처리
   */
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
    
    // URL 파라미터 업데이트
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (key === 'tags' && Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, String(value));
        }
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  /**
   * 필터 초기화 처리
   */
  const handleResetFilters = () => {
    resetFilters();
    setSearchParams({});
  };

  /**
   * 찜하기 토글 처리
   */
  const handleFavoriteToggle = async (eventId: number, isFavorite: boolean) => {
    if (!isAuthenticated) {
      // 로그인 모달 표시 (추후 구현)
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 찜하기 API 호출 (추후 구현)
      console.log('찜하기 토글:', eventId, isFavorite);
      
      // 목록 새로고침
      await loadEvents();
    } catch (error) {
      console.error('찜하기 처리 실패:', error);
      throw error;
    }
  };

  /**
   * 페이지 변경 처리
   */
  const handlePageChange = (page: number) => {
    goToPage(page);
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <Header />
      
      <MainContent>
        {/* 모바일 필터 토글 버튼 */}
        <MobileFilterToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
          필터 {sidebarOpen ? '닫기' : '열기'}
        </MobileFilterToggle>

        <ContentWrapper>
          {/* 왼쪽 사이드바 - 필터 */}
          <Sidebar $open={sidebarOpen}>
            <EventFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </Sidebar>

          {/* 오른쪽 메인 콘텐츠 */}
          <MainArea>
            {/* 페이지 헤더 */}
            <PageHeader>
              <HeaderLeft>
                <h1>전체 행사</h1>
                {pagination && (
                  <ResultCount>
                    총 {pagination.total_items.toLocaleString()}개의 행사
                  </ResultCount>
                )}
              </HeaderLeft>
              
              {/* 행사 작성 버튼 (주최자만) */}
              {isAuthenticated && user && (user.role === 'host' || user.role === 'admin') && (
                <CreateEventButton
                  as={Link}
                  to="/events/new"
                  variant="primary"
                >
                  행사 게시물 신규 작성
                </CreateEventButton>
              )}
            </PageHeader>

            {/* 검색창 */}
            <SearchSection>
              <SearchBar
                initialValue={searchQuery}
                onSearchExecuted={handleSearch}
                placeholder="행사명, #해시태그, 지역으로 검색하세요"
              />
            </SearchSection>

            {/* 행사 목록 */}
            <EventsSection>
              {loading && <Loading />}
              
              {error && (
                <ErrorMessage>
                  {error}
                  <RetryButton onClick={loadEvents}>
                    다시 시도
                  </RetryButton>
                </ErrorMessage>
              )}

              {!loading && !error && events.length === 0 && (
                <EmptyMessage>
                  {searchQuery || filters.region || (filters.tags && filters.tags.length > 0) ? (
                    <>
                      검색 조건에 맞는 행사가 없습니다.
                      <ClearFiltersButton onClick={handleResetFilters}>
                        필터 초기화
                      </ClearFiltersButton>
                    </>
                  ) : (
                    '등록된 행사가 없습니다.'
                  )}
                </EmptyMessage>
              )}

              {!loading && !error && events.length > 0 && (
                <>
                  <EventGrid
                    events={events}
                    isLoading={false}
                    showViewCount={true}
                    showFavoriteButton={isAuthenticated}
                    showScheduleButton={isAuthenticated}
                    isAuthenticated={isAuthenticated}
                    onFavoriteToggle={handleFavoriteToggle}
                  />

                  {/* 페이지네이션 */}
                  {pagination && pagination.total_pages > 1 && (
                    <PaginationContainer>
                      <PaginationButton
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1}
                      >
                        이전
                      </PaginationButton>
                      
                      <PageNumbers>
                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                          const startPage = Math.max(1, pagination.current_page - 2);
                          const pageNum = startPage + i;
                          
                          if (pageNum > pagination.total_pages) return null;
                          
                          return (
                            <PageNumber
                              key={pageNum}
                              $active={pageNum === pagination.current_page}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </PageNumber>
                          );
                        })}
                      </PageNumbers>
                      
                      <PaginationButton
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.total_pages}
                      >
                        다음
                      </PaginationButton>
                    </PaginationContainer>
                  )}
                </>
              )}
            </EventsSection>
          </MainArea>
        </ContentWrapper>
      </MainContent>
      
      <Footer />
      
      {/* 모바일 FAB (Floating Action Button) - 주최자만 표시 */}
      {isAuthenticated && user && (user.role === 'host' || user.role === 'admin') && (
        <FloatingActionButton
          onClick={() => navigate('/events/new')}
          ariaLabel="새 행사 작성"
        >
          + 새 행사
        </FloatingActionButton>
      )}
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
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const MobileFilterToggle = styled.button`
  display: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  width: 280px;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    display: ${({ $open }) => $open ? 'block' : 'none'};
  }
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  h1 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    font-size: ${({ theme }) => theme.fonts.size.xxl};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ResultCount = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CreateEventButton = styled(Button)`
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
  }
`;

const SearchSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const EventsSection = styled.div`
  /* 행사 목록 섹션 스타일 */
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const RetryButton = styled.button`
  display: block;
  margin: ${({ theme }) => theme.spacing.md} auto 0;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ClearFiltersButton = styled.button`
  display: block;
  margin: ${({ theme }) => theme.spacing.md} auto 0;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.backgroundHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PageNumber = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => 
    $active ? theme.colors.primary : 'white'};
  color: ${({ $active, theme }) => 
    $active ? 'white' : theme.colors.text};
  border: 1px solid ${({ $active, theme }) => 
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;

  &:hover {
    background: ${({ $active, theme }) => 
      $active ? theme.colors.primaryDark : theme.colors.backgroundHover};
  }
`;