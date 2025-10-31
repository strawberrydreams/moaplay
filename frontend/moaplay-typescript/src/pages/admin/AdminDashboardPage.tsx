import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAdminDashboard} from "../../hooks/useAdminDashboard";
import {ApprovedEventsModal} from "../../components/admin/ApprovedEventsModal";
import {PendingEventsModal} from "../../components/admin/PendingEventsModal";
import {UsersManagementModal} from "../../components/admin/UsersManagementModal";
import { getApprovedEvents, getPendingEvents } from "../../service/adminApi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {MenuItem} from "../../styles/ProfileDropdown.styles";
import { useAuthContext } from "../../context/AuthContext";
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
    RetryButton
} from "../../styles/AdminDashboardPage.styles";

// 관리자 대시보드 페이지 컴포넌트
export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [approvedCount, setApprovedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    // TODO: 추후 전체 사용자 목록 받아오는 부분 업데이트
    const { logout, user:currentUser } = useAuthContext();
    const {
        stats,
        statsError,
        refreshStats,
        approveEvent,
        rejectEvent
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

    useEffect(() => {
        const hasStoredUser = !!localStorage.getItem('user');
        if (!currentUser && !hasStoredUser) return; // 아직 토큰/유저 미하이드레이트 상태이면 대기

        let cancelled = false;
        (async () => {
            try {
                const [approvedRes, pendingRes] = await Promise.all([
                    getApprovedEvents({ page: 1, limit: 1 }),
                    getPendingEvents({ page: 1, limit: 1 }),
                ]);

                if (!cancelled) {
                    setApprovedCount(pickTotal(approvedRes));
                    setPendingCount(pickTotal(pendingRes));
                }
            } catch (error) {
                console.log(error)
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
        await approveEvent(eventId);
        // 통계 새로고침
        await refreshStats();
    };

    // 행사 거절
    const handleRejectEvent = async (eventId: number, reason: string) => {
        await rejectEvent(eventId, reason);
        // 통계 새로고침
        await refreshStats();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (statsError) {
        return (
            <PageContainer>
                <Header onLoginClick={function(): void {
                    throw new Error("Function not implemented.");
                }}/>
                <MainContent>
                    <ErrorMessage>
                        <h2>오류가 발생했습니다</h2>
                        <p>{statsError}</p>
                        <RetryButton onClick={refreshStats}>다시 시도</RetryButton>
                    </ErrorMessage>
                </MainContent>
                <Footer />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <MainContent>
                <DashboardHeader>
                    <DashboardTitle>관리자 대시보드</DashboardTitle>
                    <RefreshButton onClick={refreshStats}>새로고침</RefreshButton>
                </DashboardHeader>
                {stats && (
                    <StatsList>
                        <StatItem onClick={() => handleStatCardClick('approved-events')}>
                            <StatTitle>전체 승인 행사</StatTitle>
                            <StatValue>{approvedCount.toLocaleString()}</StatValue>
                        </StatItem>

                        <StatItem onClick={() => handleStatCardClick('pending-events')}>
                            <StatTitle>요청된 행사</StatTitle>
                            <StatValue>{pendingCount.toLocaleString()}</StatValue>
                        </StatItem>

                        <StatItem onClick={() => handleStatCardClick('users')}>
                            <StatTitle>회원 수</StatTitle>
                            <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
                            {/* TODO: 전체 회원 수 받아와서 출력하는 부분 추가 */}
                        </StatItem>
                    </StatsList>
                )}

                {/* 하단 바 + 로그아웃 버튼 */}
                <MenuItem onClick={handleLogout}>
                    로그아웃
                </MenuItem>

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

                {/* 사용자 관리 모달 */}
                {activeModal === 'users' && (
                    <UsersManagementModal
                        isOpen={true}
                        onClose={handleCloseModal}
                    />
                )}
            </MainContent>

            <Footer />
        </PageContainer>
    );
};