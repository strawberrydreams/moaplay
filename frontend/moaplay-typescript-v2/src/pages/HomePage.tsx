/**
 * 홈페이지 컴포넌트
 *
 * 메인 페이지로 FullCalendar, 검색창, 행사 그리드를 포함합니다.
 * 로그인 상태에 따라 다른 UI를 제공합니다.
 */

import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import type { EventClickArg } from '@fullcalendar/core';
import { Header } from '../components/common';
import { Footer } from '../components/common';
import { Loading } from '../components/common';
import { SearchBar } from '../components/common';
import { DateDetailPanel } from '../components/common/DateDetailPanel';
import { FullCalendarWrapper } from '../components/calendar';
import { TagFilterBar } from '../components/event';
import { EventGrid } from '../components/event/EventGrid';
import { CalendarProvider } from '../contexts/CalendarContext';
import { useAuth } from '../hooks';
import { useHomePage } from '../hooks/useHomePage';
import { useCalendar } from '../hooks';
import { useAuthModal } from '../contexts';
import { EventService } from '../services/eventService';
import { EventDetailResponse } from '../types/events';
import {
  PageContainer,
  MainContent,
  WelcomeSection,
  WelcomeTitle,
  WelcomeSubtitle,
  SearchSection,
  CalendarSection,
  CalendarWithDetailContainer,
  CalendarContainer,
  DetailPanelContainer,
  TagFilterSection,
  EventsSection,
  SectionTitle,
  SectionHeader,
  EventCount,
  ErrorMessage,
} from '../styles/components';

/**
 * 홈페이지 컴포넌트
 *
 * 애플리케이션의 메인 페이지입니다.
 * FullCalendar + 상세정보 + SearchBar + 행사그리드를 포함합니다.
 * 로그인 상태별 조건부 렌더링을 제공합니다.
 * 관리자 계정 로그인 시 대시보드로 자동 리다이렉트됩니다.
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const {
    // 상태
    isLoading,
    error,
    popularTags,
    selectedTags,
    filteredEvents,

    // 핸들러
    handleSearch,
    handleTagSelect,
    handleTagClear,
    handleFavoriteToggle,
  } = useHomePage();

  const {
    // 캘린더 상태
    selectedDate,
    selectedDateSchedules,
    calendarEvents,
    scheduleEventIds,

    // 캘린더 핸들러
    handleDateSelect,
    handleEventClick,
    handleViewChange,
    handleDatesSet,
    togglePersonalSchedule,
    removeFromPersonalSchedule,
    showLoginModal,
    refreshCalendar,
  } = useCalendar();

  // 선택된 이벤트 상태 관리
  const [selectedEvent, setSelectedEvent] = React.useState<EventDetailResponse | null>(null);
  const [isEventLoading, setIsEventLoading] = React.useState(false);

  /**
   * 로그인 페이지로 이동
   */
  const handleLoginClick = () => {
    navigate('/login');
  };

  /**
   * 일정 추가 처리
   */
  const handleAddSchedule = () => {
    // 전체 검색 결과 페이지로 이동
    navigate('/search');
  };

  /**
   * 일정 제거 처리
   */
  const handleRemoveSchedule = async (scheduleId: number) => {
    try {
      await removeFromPersonalSchedule(scheduleId);
    } catch (error) {
      console.error('Failed to remove schedule:', error);
      // TODO: 에러 토스트 표시
    }
  };

  /**
   * 캘린더 날짜 선택 처리
   * DateDetailPanel에 선택된 날짜의 일정을 표시합니다
   */
  const handleCalendarDateSelect = React.useCallback(
    async (selectInfo: { start: Date; end: Date }) => {
      // 이벤트 상세 패널 닫기
      setSelectedEvent(null);
      
      // 날짜 선택 처리 (useCalendar 훅에서 처리)
      handleDateSelect(selectInfo);
    },
    [handleDateSelect]
  );

  /**
   * 캘린더 이벤트 클릭 처리
   * DateDetailPanel에 이벤트 상세 정보를 표시합니다
   */
  const handleCalendarEventClick = React.useCallback(
    async (clickInfo: EventClickArg) => {
      // EventClickInfo 타입으로 변환하여 handleEventClick 호출
      const eventClickInfo = {
        event: {
          id: clickInfo.event.id,
          extendedProps: clickInfo.event.extendedProps || {},
        },
      };

      const eventId = handleEventClick(eventClickInfo);

      if (eventId === null) {
        return; // 로그인 모달이 표시되거나 유효하지 않은 이벤트
      }

      // 이벤트 상세 정보 로드
      setIsEventLoading(true);
      try {
        const eventDetail = await EventService.getEventDetail(eventId);
        setSelectedEvent(eventDetail);
      } catch (error) {
        console.error('Failed to load event details:', error);
        setSelectedEvent(null);
        // TODO: 에러 토스트 표시
      } finally {
        setIsEventLoading(false);
      }
    },
    [handleEventClick]
  );

  /**
   * 이벤트 상세에서 찜하기 토글
   */
  const handleEventFavoriteToggle = React.useCallback(
    async (eventId: number) => {
      // 현재 찜 상태를 확인 (EventListItem에는 is_favorite이 없으므로 false로 가정)
      const currentFavoriteState = false;

      await handleFavoriteToggle(eventId, currentFavoriteState);

      // 선택된 이벤트 정보 업데이트
      if (selectedEvent && selectedEvent.id === eventId) {
        try {
          const updatedEvent = await EventService.getEventDetail(eventId);
          setSelectedEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to refresh event details:', error);
        }
      }

      // 캘린더 새로고침
      await refreshCalendar();
    },
    [handleFavoriteToggle, selectedEvent, refreshCalendar]
  );

  /**
   * 이벤트 상세 닫기
   */
  const handleCloseEvent = React.useCallback(() => {
    setSelectedEvent(null);
  }, []);

  /**
   * URL 파라미터나 location state를 확인하여 로그인 모달 자동 표시
   */
  React.useEffect(() => {
    console.log('[HomePage] Login modal check:', {
      pathname: location.pathname,
      authLoading,
      isAuthenticated,
      showLoginModal: searchParams.get('showLoginModal'),
      state: location.state,
    });

    // 🔑 홈페이지가 아닌 경우 스킵 (가장 먼저 체크!)
    if (location.pathname !== '/') {
      console.log('[HomePage] Not on home page, skipping');
      return;
    }

    // 인증 로딩 중인 경우 대기
    if (authLoading) {
      console.log('[HomePage] Waiting for auth to load...');
      return;
    }

    // 이미 로그인된 경우 스킵
    if (isAuthenticated) {
      console.log('[HomePage] Already authenticated, skipping login modal');
      return;
    }

    // URL 파라미터에서 showLoginModal 확인
    const showLoginFromParams = searchParams.get('showLoginModal') === 'true';

    if (showLoginFromParams) {
      console.log('[HomePage] Opening login modal from URL params');
      // 로그인 모달 표시
      openLoginModal();

      // URL 파라미터 제거 (깔끔한 URL 유지)
      searchParams.delete('showLoginModal');
      setSearchParams(searchParams, { replace: true });
    }

    // location.state는 AuthModalContext에서 처리하므로 여기서는 제거
  }, [
    authLoading,
    isAuthenticated,
    searchParams,
    setSearchParams,
    location,
    navigate,
    openLoginModal,
  ]);

  /**
   * 관리자 계정 로그인 직후에만 대시보드로 리다이렉트
   * (로그인 후 첫 방문 시에만 적용, 이후에는 홈페이지 접근 허용)
   */
  React.useEffect(() => {
    // location.state에 fromLogin 플래그가 있는 경우에만 리다이렉트
    const fromLogin = (location.state as any)?.fromLogin;
    
    if (!authLoading && isAuthenticated && user?.role === 'admin' && fromLogin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate, location.state]);

  /**
   * 로딩 상태
   */
  if (isLoading || authLoading) {
    return <Loading fullScreen message="페이지를 불러오는 중..." />;
  }

  return (
    <CalendarProvider>
      <PageContainer>
        <Header />

        <MainContent id="main-content">
          {/* 웰컴 섹션 */}
          <WelcomeSection>
            <WelcomeTitle>다양한 행사를 한눈에</WelcomeTitle>
            <WelcomeSubtitle>
              원하는 행사를 쉽게 찾고, 일정을 관리하며, 신뢰할 수 있는 정보를
              공유하세요.
            </WelcomeSubtitle>
          </WelcomeSection>

          {/* 검색창 섹션 */}
          <SearchSection>
            <SearchBar
              placeholder="행사명, #해시태그, 지역으로 검색하세요"
              showHistory={isAuthenticated}
              showSuggestions={true}
              onSearchExecuted={handleSearch}
            />
          </SearchSection>

          {/* 캘린더 + 상세 정보 섹션 */}
          <CalendarSection>
            <SectionTitle>
              {isAuthenticated ? '내 일정 및 행사 달력' : '행사 달력'}
            </SectionTitle>

            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

            <CalendarWithDetailContainer>
              <CalendarContainer>
                <FullCalendarWrapper
                  events={calendarEvents}
                  isAuthenticated={isAuthenticated}
                  onDateSelect={handleCalendarDateSelect}
                  onEventClick={handleCalendarEventClick}
                  onViewChange={handleViewChange}
                  onDatesSet={handleDatesSet}
                  onRefresh={refreshCalendar}
                  height="600px"
                />
              </CalendarContainer>

              <DetailPanelContainer>
                <DateDetailPanel
                  selectedDate={selectedDate}
                  isAuthenticated={isAuthenticated}
                  personalSchedules={selectedDateSchedules}
                  selectedEvent={selectedEvent}
                  isEventLoading={isEventLoading}
                  onLoginClick={handleLoginClick}
                  onAddSchedule={handleAddSchedule}
                  onRemoveSchedule={handleRemoveSchedule}
                  onViewEventDetail={(eventId) => navigate(`/events/${eventId}`)}
                  onFavoriteToggle={isAuthenticated ? handleEventFavoriteToggle : undefined}
                  onCloseEvent={handleCloseEvent}
                />
              </DetailPanelContainer>
            </CalendarWithDetailContainer>
          </CalendarSection>

          {/* 태그 필터 섹션 */}
          <TagFilterSection>
            <TagFilterBar
              tags={popularTags}
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
              onClearAll={handleTagClear}
            />
          </TagFilterSection>

          {/* 행사 그리드 섹션 */}
          <EventsSection>
            <SectionHeader>
              <SectionTitle>
                {selectedTags.length > 0
                  ? `'${selectedTags.join(', ')}' 태그 행사`
                  : '최신 행사'}
              </SectionTitle>
              <EventCount>{filteredEvents.length}개의 행사</EventCount>
            </SectionHeader>

            <EventGrid
              events={filteredEvents}
              isLoading={isLoading}
              showViewCount={true}
              showFavoriteButton={isAuthenticated}
              showScheduleButton={isAuthenticated}
              isAuthenticated={isAuthenticated}
              scheduleEventIds={scheduleEventIds}
              onFavoriteToggle={handleFavoriteToggle}
              onScheduleToggle={togglePersonalSchedule}
              onShowLogin={showLoginModal}
              emptyMessage={
                selectedTags.length > 0
                  ? '선택한 태그에 해당하는 행사가 없습니다'
                  : '표시할 행사가 없습니다'
              }
              emptyDescription={
                selectedTags.length > 0
                  ? '다른 태그를 선택하거나 태그를 해제해보세요.'
                  : '잠시 후 다시 시도해보세요.'
              }
            />
          </EventsSection>
        </MainContent>

        <Footer />
      </PageContainer>
    </CalendarProvider>
  );
};
