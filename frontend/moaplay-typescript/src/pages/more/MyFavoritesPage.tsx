import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuthContext } from '../../contexts/AuthContext';
import * as F from '../../types/favorites';
import * as FavoriteApi from '../../services/favoritesApi';
import EventCard from '../../components/events/EventCard';
import * as S from '../../styles/pages/MyFavoritePage.styles';

const MyFavoritesPage: React.FC = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<F.Favorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState<number>(1);
    const [totalPages, setTotalPages] = useState(1);

    const perPage = 12; // 한 페이지당 12개 카드

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const resp = await FavoriteApi.getFavorites({ page, per_page: perPage });

                setFavorites(resp.favorites || []);

                // pagination 처리 (API 형태에 따라 조정 가능)
                const pagination = resp.pagination;
                if (pagination) {
                    const total = pagination.total ?? 0;
                    const perPageCount = pagination.per_page ?? perPage;
                    const pages = Math.ceil(total / perPageCount);
                    setTotalPages(pages);
                    setTotal(total);
                } else {
                    setTotalPages(1);
                }
            } catch (error) {
                console.error('찜 목록 로딩 실패', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [user, page]);

    if (!user) return <p>로그인이 필요합니다.</p>;

    return (
        <S.PageContainer>
            {/* 상단 헤더 */}
            <S.PageHeader>
                <S.BackButton onClick={() => navigate('/mypage')} aria-label="마이페이지로 돌아가기">
                    <FaArrowLeft />
                </S.BackButton>
                <S.SectionTitle>찜한 행사 전체 보기</S.SectionTitle>
            </S.PageHeader>

            <p style={{textAlign:'right'}}>{total}개</p>
            {/* 본문 */}
            {isLoading ? (
                <p>로딩 중...</p>
            ) : favorites.length === 0 ? (
                <S.NoResultsWrapper>
                    <S.NoResultsMessage>찜한 행사가 없습니다.</S.NoResultsMessage>
                </S.NoResultsWrapper>
            ) : (
                <>
                    <S.CardGrid>
                        {favorites.map(
                            (fav) => fav.event && <EventCard key={fav.id} event={fav.event} />
                        )}
                    </S.CardGrid>

                    {/* ✅ 페이지네이션 */}
                    <S.Pagination>
                        {page > 1 && (
                            <button onClick={() => setPage(page - 1)}>이전</button>
                        )}
                        <span>
              {page} / {totalPages}
            </span>
                        {page < totalPages && (
                            <button onClick={() => setPage(page + 1)}>다음</button>
                        )}
                    </S.Pagination>
                </>
            )}
        </S.PageContainer>
    );
};

export default MyFavoritesPage;
