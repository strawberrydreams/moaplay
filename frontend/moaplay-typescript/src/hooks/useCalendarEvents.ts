import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import type * as E from '../types/events';

// --- localStorage 색상 관리 로직 ---
// (MainPage에서 이곳으로 이동)
const getRandomColor = (): string => {
    const colors = ['#4286f4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#FF6D00'];
    return colors[Math.floor(Math.random() * colors.length)];
};

const EVENT_COLORS_KEY = 'moaplay_event_colors_main';

const getPersistentEventColors = (events: E.Event[]): Map<string | number, string> => {
    const savedColors = localStorage.getItem(EVENT_COLORS_KEY);
    let colorMap: Map<string | number, string>;

    if (savedColors) {
        try {
            colorMap = new Map(JSON.parse(savedColors));
        } catch (e) {
            console.error("저장된 색상 파싱 오류:", e);
            colorMap = new Map();
            localStorage.removeItem(EVENT_COLORS_KEY);
        }
    } else {
        colorMap = new Map();
    }

    let updated = false;
    events.forEach(event => {
        if (!colorMap.has(event.id)) {
            colorMap.set(event.id, getRandomColor());
            updated = true;
        }
    });

    if (updated) {
        try {
            localStorage.setItem(EVENT_COLORS_KEY, JSON.stringify(Array.from(colorMap.entries())));
        } catch (e) { console.error("localStorage 색상 저장 오류:", e); }
    }

    return colorMap;
};
// --- 색상 관리 로직 끝 ---


/**
 * AuthContext의 찜 목록(schedules)을 가져와
 * 캘린더에 표시할 이벤트 배열(color 포함)로 변환하는 커스텀 훅
 */
export function useCalendarEvents() {
    // 1. AuthContext에서 원본 찜 목록(schedules)을 가져옵니다.
    const { schedules } = useAuthContext();

    // 2. 찜 목록이 변경될 때마다 캘린더용 이벤트 배열을 재생성합니다.
    // (MainPage의 useMemo 로직을 그대로 사용)
    const calendarEvents: E.Event[] = useMemo(() => {
        const eventsFromSchedules: E.Event[] = schedules
            .map((schedule) => schedule.event)
            .filter((event): event is E.Event => !!event); // null/undefined 제거

        if (eventsFromSchedules.length > 0) {
            const colorMap = getPersistentEventColors(eventsFromSchedules);
            return eventsFromSchedules.map(event => ({
                ...event,
                color: colorMap.get(event.id) || getRandomColor(),
            }));
        }
        return [];
    }, [schedules]); // Context의 schedules가 바뀔 때만 재계산

    // 3. 변환된 캘린더 이벤트 목록을 반환합니다.
    return { calendarEvents };
}
