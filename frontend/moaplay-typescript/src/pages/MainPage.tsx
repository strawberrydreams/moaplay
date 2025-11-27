import { useState, useCallback } from 'react';
import Calendar from '../components/schedules/Calendar';
import EventSearchPage from '../components/events/EventSearch';
import CalendarEventDetail from '../components/schedules/CalendarEventDetail';
import { useAuthContext } from '../contexts/AuthContext'; // 1. AuthContext 훅
import { useCalendarEvents } from '../hooks/useCalendarEvents'; // 2. 새로 만든 훅 임포트
import type * as E from '../types/events';
import Banner from '../assets/banner.png';

import {
    MainPageContainer,
    CalendarSection,
    CalendarWrapper,
    CalendarDetailWrapper,
    BannerImage,
    BannerWrapper,
} from '../styles/pages/MainPage.styles';
import googleApi from '../services/googleApi';

// --- MainPage 컴포넌트 ---
function MainPage() {
    // 3. AuthContext에서 캘린더 외 필요한 정보 가져오기
    const {
        schedules, // 원본 찜 목록 (자식에게 전달용)
        schedulesLoading,
        fetchSchedules, // 새로고침 함수 (자식에게 전달용)
        isGoogleConnected
    } = useAuthContext();

    // 4. 새로 만든 훅에서 캘린더용 이벤트 목록 가져오기
    const { calendarEvents } = useCalendarEvents();

    // 5. MainPage 내부 상태 (클릭된 이벤트만 관리)
    const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<E.Event | null>(null);

    // 6. 캘린더 클릭 핸들러 (이벤트 선택/해제)
    const handleCalendarEventSelect = useCallback((on: boolean, event?: E.Event) => {
        if (on && event) {
            setSelectedCalendarEvent(event);
        } else {
            setSelectedCalendarEvent(null);
        }
    }, []);

    // 7. 구글 캘린더 연동 + 동기화 핸들러
    const handleSyncToGoogle = useCallback(async () => {
        // 7-1. 우선 구글 연동 여부 체크
        if (!isGoogleConnected) {
            const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            // 연동 안 되어 있으면 OAuth 시작
            window.location.href = `${base}/google/auth`;
            return;
        }

        // 7-2. 연동되어 있으면 바로 일정 동기화 로직 실행
        if (!calendarEvents.length) {
            alert('동기화할 일정이 없습니다.');
            return;
        }

        if (!window.confirm(`${calendarEvents.length}개의 일정을 Google 캘린더에 추가할까요?`)) return;

        let success = 0;
        let fail = 0;

        for (const ev of calendarEvents) {
            try {
                await googleApi.createEvent({
                    localEventId: ev.id,
                    title: ev.title,
                    start: `${ev.start_date}T00:00:00+09:00`,
                    end: `${ev.end_date ?? ev.start_date}T23:59:59+09:00`,
                });
                success++;
            } catch {
                fail++;
            }
        }

        alert(`동기화 완료!\n성공: ${success}개 / 실패: ${fail}개`);
    }, [calendarEvents, isGoogleConnected]);

    // 8. 로딩 상태 (Context의 찜 로딩 상태 사용)
    if (schedulesLoading) {
        return <div>찜한 일정 목록을 불러오는 중...</div>;
    }


    return (
        <MainPageContainer style={{padding: '50px'}}>
            <BannerWrapper>
                <BannerImage src={Banner} alt="배너 이미지" />
            </BannerWrapper>
            <CalendarSection>
                <CalendarWrapper style={{zoom: '1'}}>
                    <Calendar
                        events={calendarEvents} // 👈 훅에서 가져온 값
                        onEventClick={handleCalendarEventSelect}
                        CalendarEvent={selectedCalendarEvent ?? undefined}
                        onSyncClick={handleSyncToGoogle}
                    />
                </CalendarWrapper>
                <CalendarDetailWrapper>
                    <CalendarEventDetail
                        events={calendarEvents} // 👈 훅에서 가져온 값
                        event={selectedCalendarEvent} // 👈 현재 선택된 이벤트
                        schedules={schedules} // 👈 Context에서 가져온 원본 찜 목록
                        onScheduleDeleted={fetchSchedules} // 👈 Context에서 가져온 새로고침 함수
                        onBackToList={() => handleCalendarEventSelect(false)} // 👈 뒤로가기 핸들러
                        onEventClick={handleCalendarEventSelect} // 👈 목록에서 클릭 시 핸들러
                    />
                </CalendarDetailWrapper>
            </CalendarSection>
            <EventSearchPage />
        </MainPageContainer>
    );
}

export default MainPage;