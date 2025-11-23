// src/pages/MyEventsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import * as E from '../../types/events';
import * as EventApi from '../../services/eventsApi';
import EventCard from '../../components/events/EventCard';
import * as S from '../../styles/pages/MyEventsPage.styles';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MyEventsPage: React.FC = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [events, setEvents] = useState<E.Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(1);
    const [perPage] = useState<number>(12);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const resp = await EventApi.getEvents({ host_id: user?.id, page, per_page: perPage });
                setEvents(resp.events || []);
                setTotal(resp.pagination.total);
            } catch (error) {
                console.error('내가 작성한 행사 로딩 실패', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) {
            load();
        }
    }, [user, page, perPage]);

    if (!user) {
        return <p>로그인이 필요합니다.</p>;
    }

    return (
        <S.PageContainer>

            <S.PageHeader>
                <S.BackButton onClick={() => navigate('/mypage')} aria-label="마이페이지로 돌아가기">
                    <FaArrowLeft />
                </S.BackButton>
                <S.SectionTitle>작성한 행사 전체 보기</S.SectionTitle>
            </S.PageHeader>
            <p style={{textAlign:'right'}}>{total}개</p>
            {isLoading ? (
                <p>로딩 중...</p>
            ) : events.length === 0 ? (
                <S.NoResultsWrapper>
                    <S.NoResultsMessage>작성한 행사가 없습니다.</S.NoResultsMessage>
                </S.NoResultsWrapper>
            ) : (
                <S.CardGrid>
                    {events.map(ev => (
                        <EventCard key={ev.id} event={ev} />
                    ))}
                </S.CardGrid>
            )}
            <S.Pagination>
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button>
                <span>{page}</span>
                <button onClick={() => setPage(page + 1)}>다음</button>
            </S.Pagination>
        </S.PageContainer>
    );
};

export default MyEventsPage;
