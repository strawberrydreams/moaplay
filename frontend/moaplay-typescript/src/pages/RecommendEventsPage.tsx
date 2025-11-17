import React, { useEffect, useState, useCallback } from 'react';
import * as EventApi from '../services/eventsApi';
import * as UserApi from '../services/usersApi';
import type * as E from '../types/events';
import EventCard from '../components/events/EventCard';
import styled from 'styled-components';
import { useAuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import LoginForm from '../components/auth/LoginForm';
import { useModal } from '../hooks/useModal';

const PageContainer = styled.div`
    max-width: 1200px;
    margin: 3rem auto;
    padding: 0 1rem;
    color: #333;
    font-family: 'Pretendard', sans-serif;
`;

const HeaderText = styled.h2`
    font-size: 1.7rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 0.8rem;
`;

const SubLink = styled.div`
    text-align: center;
    margin-bottom: 2rem;
    font-size: 0.95rem;
    color: #666;

    a {
        color: #9E77ED;
        text-decoration: none;
        font-weight: 500;
        margin-left: 4px;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const EventGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const FallbackNotice = styled.div`
    text-align: center;
    color: #777;
    margin: 300px 300px;
    font-size: 1.3rem;
`;


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MoreButton = styled.button`
    display: block;
    margin: 0 auto;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 25px;
    background: #f0f0f0;
    color: #333;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #e0e0e0;
    }

    &:focus { outline : none; }
`;

const RecommendedEventsPage: React.FC = () => {
    const { user } = useAuthContext();
    const [events, setEvents] = useState<E.Event[]>([]);
    const [preferredTags, setPreferredTags] = useState<string[]>([]);
    const [usedFallback, setUsedFallback] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isLoginModalOpen, closeAllModals, loginToSignUp, openLoginModal } = useModal();

    // ✅ 사용자 선호 태그 가져오기
    const fetchPreferredTags = useCallback(async () => {
        if (!user) return setLoading(false);
        try {
            const me = await UserApi.getMe();
            const tags = me.preferred_tags || [];
            setPreferredTags(tags);
        } catch (err) {
            console.error('선호 태그 로딩 실패', err);
            setPreferredTags([]);
        }
    }, [user]);

    // ✅ 태그 기반 행사 로드
    const fetchRecommendedEvents = useCallback(async (tags: string[]) => {
        try {
            setLoading(true);
            setUsedFallback(false);

            let response = { events: [] as E.Event[] };
            if (tags.length > 0) {
                response = await EventApi.getEvents({
                    page: 1,
                    per_page: 12,
                    status: 'approved',
                    tags: tags.join(','),
                    sort: 'start_date',
                    order: 'desc',
                });
            }

            let eventList = response.events || [];
            if (eventList.length === 0) {
                console.warn('태그 일치 없음 → 인기순으로 대체');
                setUsedFallback(true);
                const fallback = await EventApi.getEvents({
                    page: 1,
                    per_page: 12,
                    status: 'approved',
                    sort: 'likes',
                    order: 'desc',
                });
                eventList = fallback.events || [];
            }

            setEvents(eventList);
        } catch (err) {
            console.error('행사 로드 실패', err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreferredTags();
    }, [fetchPreferredTags]);

    useEffect(() => {
        if (preferredTags.length > 0) fetchRecommendedEvents(preferredTags);
        else setLoading(false);
    }, [preferredTags, fetchRecommendedEvents]);

    if (loading) return <PageContainer>행사 불러오는 중...</PageContainer>;

    return (
        <PageContainer>
            <HeaderText>
                {user?.nickname
                    ? (
                        <>
                            {user.nickname}님이 좋아하실만한 행사들입니다.
                            <SubLink>
                                혹시 원하신 결과가 아닌가요?
                                <Link to="/mypage">선호태그 설정하러 가기 →</Link>
                            </SubLink>
                        </>
                    ) : (
                        <>
                            추천 행사 페이지입니다.
                            <SubLink>
                                행사를 추천받으려면 로그인 해야합니다.
                                <a onClick={()=>{openLoginModal()}}>로그인하러 가기 →</a>
                            </SubLink>
                        </>
                    )}
            </HeaderText>



            {usedFallback && (
                <FallbackNotice>
                    💡 <strong>{preferredTags.join(', ')}</strong>에 맞는 행사가 없어
                    인기 많은 행사를 대신 보여드려요.
                </FallbackNotice>
            )}

            {events.length === 0 ? (
                <FallbackNotice>표시할 행사가 없습니다.</FallbackNotice>
            ) : (
                <EventGrid>
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </EventGrid>
            )}

            {/* <MoreButton>더 많은 여행지 보러가기 &gt;</MoreButton> */}

            <Modal
                isOpen={isLoginModalOpen}
                onClose={closeAllModals} // 닫기 함수 연결
                title="로그인"
            >
                {/* 6. LoginForm의 onCloseModal prop 수정 */}
                <LoginForm onSwitchToSignUp={loginToSignUp} onCloseModal={closeAllModals} />
            </Modal>
        </PageContainer>
    );
};

export default RecommendedEventsPage;
