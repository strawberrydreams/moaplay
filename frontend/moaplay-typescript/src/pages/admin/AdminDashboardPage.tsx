import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { ApprovedEventsModal } from "../../components/admin/ApprovedEventsModal";
import { PendingEventsModal } from "../../components/admin/PendingEventsModal";
import { UsersManagementModal } from "../../components/admin/UsersManagementModal";
import { CrawlingEventsModal } from "../../components/admin/CrawlingEventsModal";
import { getApprovedEvents, getPendingEvents } from "../../services/adminApi";
import { updateEventStatus } from "../../services/eventsApi";
import { useAuthContext } from "../../contexts/AuthContext";
import { FaCheckCircle, FaClock, FaUsers, FaAngleRight, FaGlobe } from 'react-icons/fa';
import {
    PageContainer,
    MainContent,
    DashboardHeader,
    DashboardTitle,
    RefreshButton,
    StatsList,
    StatItem,
    StatTitle,
    StatValue,
    ErrorMessage,
    RetryButton,
    CardIconWrapper
} from "../../styles/pages/AdminDashboardPage.styles";

// 관리자 대시보드 페이지 컴포넌트
export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [approvedCount, setApprovedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const { logout, user:currentUser } = useAuthContext();
    const {
        stats,
        statsError,
        refreshStats
    } = useAdminDashboard();

    const [hasBootRefreshed, setHasBootRefreshed] = useState(false);
    useEffect(() => {
        const hasStoredUser = !!localStorage.getItem('user');
        if (!hasBootRefreshed && (currentUser || hasStoredUser)) {
            refreshStats().finally(() => setHasBootRefreshed(true));
        }
    }, [currentUser, hasBootRefreshed, refreshStats]);

    useEffect(() => {
        // localStorage에 유저가 있으면, AuthProvider가 하이드레이션할 시간을 준다
        const hasStoredUser = !!localStorage.getItem('user');
        if (!hasStoredUser && !currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    // 응답에서 robust하게 총 개수를 추출하는 헬퍼
    const pickTotal = (resp: any): number => {
        const p = resp?.pagination ?? resp?.data?.pagination;
        if (p) {
            const n = p.total_items ?? p.total ?? p.totalCount;
            if (typeof n === 'number') return n;
            const parsed = Number(n);
            if (!Number.isNaN(parsed)) return parsed;
        }
        // 최후 fallback: 현재 페이지 길이
        const list = resp?.events ?? resp?.approvedEvents ?? resp?.pendingEvents ?? resp?.items ?? resp?.data?.events;
        return Array.isArray(list) ? list.length : 0;
    };

    // 승인/대기 카운트 로드
    const loadCounts = async () => {
        const [approvedRes, pendingRes] = await Promise.all([
            getApprovedEvents({ page: 1, limit: 1 }),
            getPendingEvents({ page: 1, limit: 1 }),
        ]);
        setApprovedCount(pickTotal(approvedRes));
        setPendingCount(pickTotal(pendingRes));
    };

    // 통계 + 카운트를 모두 새로고침
    const refreshAll = async () => {
        try {
            await Promise.all([refreshStats(), loadCounts()]);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const hasStoredUser = !!localStorage.getItem('user');
        if (!currentUser && !hasStoredUser) return; // 아직 토큰/유저 미하이드레이트 상태이면 대기

        let cancelled = false;
        (async () => {
            try {
                if (!cancelled) {
                    await loadCounts();
                }
            } catch (error) {
                console.log(error);
            }
        })();

        return () => { cancelled = true; };
    }, [currentUser]);

    // 모달 상태 관리
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // 통계 카드 클릭 시
    const handleStatCardClick = (modalType: string) => {
        setActiveModal(modalType);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setActiveModal(null);
    };

    // 행사 승인
    const handleApproveEvent = async (eventId: number) => {
        try {
            await updateEventStatus(eventId, { status: 'approved' });
            await refreshAll();
        } catch (error) {
            console.error(error);
        }
    };

    // 행사 거절
    const handleRejectEvent = async (eventId: number, reason: string) => {
        try {
            await updateEventStatus(eventId, { status: 'rejected', message: reason });
            await refreshAll();
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (statsError) {
        return (
            <PageContainer>
                <MainContent>
                    <ErrorMessage>
                        <h2>오류가 발생했습니다</h2>
                        <p>{statsError}</p>
                        <RetryButton onClick={refreshStats}>다시 시도</RetryButton>
                    </ErrorMessage>
                </MainContent>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <MainContent>
                <DashboardHeader>
                    <DashboardTitle>관리자 대시보드</DashboardTitle>
                    <RefreshButton onClick={refreshAll}>새로고침</RefreshButton>
                </DashboardHeader>
                {stats && (
                    <StatsList>
                        <StatItem onClick={() => handleStatCardClick('approved-events')}>
                            <CardIconWrapper color="#4C8DFF">
                                <FaCheckCircle size={28} />
                            </CardIconWrapper>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <StatTitle>전체 승인 행사</StatTitle>
                                <StatValue>{approvedCount.toLocaleString()}</StatValue>
                            </div>

                            <FaAngleRight size={28} color="#757575" style={{ marginLeft: 'auto' }} />
                        </StatItem>

                        <StatItem onClick={() => handleStatCardClick('pending-events')}>
                            <CardIconWrapper color="#FFA726">
                                <FaClock size={28} />
                            </CardIconWrapper>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <StatTitle>요청된 행사</StatTitle>
                                <StatValue>{pendingCount.toLocaleString()}</StatValue>
                            </div>

                            <FaAngleRight size={28} color="#757575" style={{ marginLeft: 'auto' }} />
                        </StatItem>

                        <StatItem onClick={() => handleStatCardClick('crawling-events')}>
                            <CardIconWrapper color="#8E44AD">
                                <FaGlobe size={28} />
                            </CardIconWrapper>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <StatTitle>행사 데이터 크롤링</StatTitle>
                                <StatValue>시작하기</StatValue>
                            </div>

                            <FaAngleRight size={28} color="#757575" style={{ marginLeft: 'auto' }} />
                        </StatItem>

                        <StatItem onClick={() => handleStatCardClick('users')}>
                            <CardIconWrapper color="#2AC1BC">
                                <FaUsers size={28} />
                            </CardIconWrapper>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <StatTitle>회원 수</StatTitle>
                                <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
                            </div>

                            <FaAngleRight size={28} color="#757575" style={{ marginLeft: 'auto' }} />
                        </StatItem>
                    </StatsList>
                )}
                <hr style={{margin: '20px 0px', border :'2px solid #e5e7eb'}}/>
                {/* 하단 바 + 로그아웃 버튼 */}
                <span onClick={handleLogout} style={{color: '#333'}}>
                    로그아웃
                </span>

                {/* 모달들 */}
                <ApprovedEventsModal
                    isOpen={activeModal === 'approved-events'}
                    onClose={handleCloseModal}
                    onEventUpdated={refreshStats}
                />

                <PendingEventsModal
                    isOpen={activeModal === 'pending-events'}
                    onClose={handleCloseModal}
                    onApprove={handleApproveEvent}
                    onReject={handleRejectEvent}
                />

                <CrawlingEventsModal
                    isOpen={activeModal === 'crawling-events'}
                    onClose={handleCloseModal}
                    onCrawlingCompleted={refreshAll}
                />

                {/* 사용자 관리 모달 */}
                {activeModal === 'users' && (
                    <UsersManagementModal
                        isOpen={true}
                        onClose={handleCloseModal}
                    />
                )}
            </MainContent>
        </PageContainer>
    );
};