import React from 'react';
import styled from 'styled-components';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { SearchBar } from '../components/common';
import { ImageCarousel } from '../components/common';
import { TagFilterBar } from '../components/event';
import { EventGrid } from '../components/event/EventGrid';
import { Loading } from '../components/common';
import { useRecommendPage } from '../hooks';
import { useAuth } from '../hooks';
import { useNavigate } from 'react-router-dom';

/**
 * 추천 행사 페이지 컴포넌트
 * 사용자 선호 태그 기반 개인화된 추천 알고리즘과 태그 필터링 기능 제공
 */
const RecommendPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    recommendedEvents,
    featuredImages,
    userPreferredTags,
    availableTags,
    selectedTags,
    loading,
    pagination,
    addTag,
    clearAllTags,
    loadMore,
    updatePreferredTags,
  } = useRecommendPage();

  /**
   * 검색 실행 핸들러
   * 선택된 태그와 함께 검색 실행
   */
  const handleSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    if (selectedTags.length > 0) {
      searchParams.set('tags', selectedTags.join(','));
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

  /**
   * 선호 태그 업데이트 핸들러
   */
  const handleUpdatePreferredTags = async () => {
    if (!isAuthenticated || selectedTags.length === 0) return;

    try {
      await updatePreferredTags(selectedTags);
      // 성공 메시지 표시 (토스트 등)
    } catch (err) {
      // 에러 메시지 표시
      console.error('Failed to update preferred tags:', err);
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
            placeholder="관심 있는 행사를 검색하세요"
            onSearchExecuted={handleSearch}
          />
        </SearchSection>

        {/* 하단: 태그 필터 + 행사 그리드 */}
        <ContentSection>
          {/* 로그인 상태별 안내 메시지 */}
          {!isAuthenticated && (
            <LoginPrompt>
              <LoginPromptText>
                로그인하시면 개인 맞춤 추천을 받을 수 있습니다
              </LoginPromptText>
              <LoginButton onClick={() => navigate('/login')}>
                로그인하기
              </LoginButton>
            </LoginPrompt>
          )}

          {/* 사용자 선호 태그 표시 (로그인 시) */}
          {isAuthenticated && userPreferredTags.length > 0 && (
            <PreferredTagsSection>
              <PreferredTagsTitle>내 관심 태그</PreferredTagsTitle>
              <PreferredTagsList>
                {userPreferredTags.map(tag => (
                  <PreferredTag key={tag}>#{tag}</PreferredTag>
                ))}
              </PreferredTagsList>
            </PreferredTagsSection>
          )}

          {/* 태그 필터 */}
          <FilterSection>
            <TagFilterBar
              tags={availableTags.map(tag => tag.name)}
              selectedTags={selectedTags}
              onTagSelect={addTag}
              onClearAll={clearAllTags}
            />

            {/* 선호 태그로 저장 버튼 (로그인 시) */}
            {isAuthenticated && selectedTags.length > 0 && (
              <SavePreferredButton onClick={handleUpdatePreferredTags}>
                선택한 태그를 내 관심 태그로 저장
              </SavePreferredButton>
            )}
          </FilterSection>

          <EventsSection>
            {/* 페이지 헤더 */}
            <SectionHeader>
              <SectionTitle>
                {isAuthenticated
                  ? selectedTags.length > 0
                    ? `선택한 태그 기반 추천 행사`
                    : `맞춤 추천 행사`
                  : '인기 행사'}
              </SectionTitle>
              <EventCount>
                총 {pagination.totalItems.toLocaleString()}개의 행사
              </EventCount>
            </SectionHeader>

            {/* 에러 상태는 useRecommendPage 내부에서 처리 */}

            {/* 로딩 상태 */}
            {loading && recommendedEvents.length === 0 && (
              <LoadingContainer>
                <Loading />
              </LoadingContainer>
            )}

            {/* 행사 그리드 */}
            <EventGrid
              events={recommendedEvents}
              isLoading={loading && recommendedEvents.length === 0}
              showViewCount={true}
              showFavoriteButton={true}
              showScheduleButton={true}
              isAuthenticated={isAuthenticated}
              emptyMessage={
                selectedTags.length > 0
                  ? '선택한 태그와 관련된 행사가 없습니다.'
                  : isAuthenticated
                    ? '추천할 행사가 없습니다.'
                    : '등록된 행사가 없습니다.'
              }
              emptyDescription={
                selectedTags.length > 0
                  ? '다른 태그를 선택해보세요.'
                  : isAuthenticated
                    ? '관심 태그를 설정해보세요.'
                    : ''
              }
            />

            {/* 더보기 버튼 */}
            {pagination.currentPage < pagination.totalPages && (
              <LoadMoreSection>
                <LoadMoreButton onClick={handleLoadMore} disabled={loading}>
                  {loading ? '로딩 중...' : '더보기'}
                </LoadMoreButton>
              </LoadMoreSection>
            )}

            {/* 페이지네이션 정보 */}
            {recommendedEvents.length > 0 && (
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

const LoginPrompt = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.info}15
  );
  border: 2px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LoginPromptText = styled.p`
  color: ${({ theme }) => theme.colors.dark};
  font-size: ${({ theme }) => theme.fonts.size.medium};
  font-weight: 500;
  margin: 0;
`;

const LoginButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fonts.size.medium};
  font-weight: 600;
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

const PreferredTagsSection = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.light};
  border-radius: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.success};
`;

const PreferredTagsTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.medium};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const PreferredTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PreferredTag = styled.span`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border-radius: 12px;
  font-size: ${({ theme }) => theme.fonts.size.small};
  font-weight: 500;
`;

const FilterSection = styled.div`
  width: 100%;
`;

const SavePreferredButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fonts.size.medium};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.success}dd;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.success};
    outline-offset: 2px;
  }
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

export default RecommendPage;
