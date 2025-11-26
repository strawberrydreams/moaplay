// src/components/Calendar.tsx
import React, {useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DayCellContentArg, EventClickArg, EventMountArg, EventHoveringArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction';
import { StyledCalendarWrapper } from '../../styles/components/Calendar.styles';
import type * as E from '../../types/events'; // Event 타입 임포트

interface ICalendarProps {
    events?: E.Event[];
    onEventClick: (on:boolean, event?: E.Event) => void;
    CalendarEvent?: E.Event;
    onSyncClick?: () => void;
}

const Calendar: React.FC<ICalendarProps> = ({ 
    events = [], 
    onEventClick, 
    CalendarEvent, 
    onSyncClick, 
}) => {
    // console.log('CalendarEventDetail 렌더링, event prop:', events);
    const [clickedEventId, setClickedEventId] = useState<string | null>(null);
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    const handleDayCellContent = (arg: DayCellContentArg) => {
        return arg.dayNumberText.replace("일", "");
    };

    // 이제 'events' 배열 (E.Event[])을 직접 사용합니다.
    const formattedEvents = events.map(event => {
        // event 객체에서 직접 end_date 사용 (schedule.event 제거)
        const endDate = new Date(event.end_date);
        endDate.setDate(endDate.getDate() + 1);
        const newEndDateStr = endDate.toISOString().split('T')[0];

        return {
            id: String(event.id), // event.id 사용
            title: event.title, // event.title 사용
            start: event.start_date, // event.start_date 사용
            end: newEndDateStr,
            allDay: true,
            extendedProps: {
                originalData: event, // 원본 event 객체 전달
                color: event.color // event.color 사용
            }
        };
    });

    const handleEventMouseEnter = (mouseEnterInfo: EventHoveringArg) => {
        setHoveredEventId(mouseEnterInfo.event.id);
    };

    const handleEventMouseLeave = () => {
        setHoveredEventId(null);
    };


    const handleCalendarClick = (clickInfo: EventClickArg) => {
        const id = clickInfo.event.id;
        setClickedEventId(id); // 상태 업데이트는 하되

        const originalEvent = events.find(e => String(e.id) === id); // 지역 변수 사용

        if (!CalendarEvent) {
            onEventClick(true, originalEvent);
        } else {
            onEventClick(false, originalEvent);
            setClickedEventId(null);
        }
    };

    const handleEventMount = (mountInfo: EventMountArg) => {
        const color = mountInfo.event.extendedProps.color;
        // ... (기존 색상 적용 로직)
        if (color) {
            // 2. 배경/테두리 색상 적용 (투명도 추가)
            mountInfo.el.style.backgroundColor = color + '33';
            mountInfo.el.style.borderColor = color + '33';

            // 3. 텍스트 색상 적용
            mountInfo.el.style.color = color;
            const titleEl = mountInfo.el.querySelector('.fc-event-title');
            if (titleEl) {
                (titleEl as HTMLElement).style.color = color;
            }
        }

    };

    const handleEventClassNames = (arg: { event: any; }) => {
        const classNames = [];
        if (arg.event.id === clickedEventId) {
            classNames.push('event-clicked');

        }
        if (arg.event.id === hoveredEventId) {
            classNames.push('event-hovered');
        }
        return classNames;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDateClick = (arg: DateClickArg) => {
        // console.log('빈 날짜 클릭됨:', arg.dateStr);
        const originalEvent = events.find(e => String(e.id) === clickedEventId);

        onEventClick(false, originalEvent);
        setClickedEventId(null);
    };

    return (
        <StyledCalendarWrapper  className="calendar-wrapper">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={formattedEvents}
                eventClick={handleCalendarClick}
                eventDidMount={handleEventMount}
                eventMouseEnter={handleEventMouseEnter}
                eventMouseLeave={handleEventMouseLeave}
                eventClassNames={handleEventClassNames}
                dayCellContent={handleDayCellContent}
                dateClick={handleDateClick}
                customButtons={{
                    googleSync: {
                        text: 'Google 캘린더로 동기화',
                        click: () => {
                            if (onSyncClick) onSyncClick();
                        },
                    },
                }}
                headerToolbar={{
                    left: 'title',
                    right: 'googleSync prev next'
                }}
                locale="ko"
                height="auto"
            />
        </StyledCalendarWrapper>
    );
};

export default Calendar;