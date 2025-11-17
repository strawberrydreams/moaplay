import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import bellIcon from '../../assets/bell.png';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNotifications } from '../../contexts/NotificationsContext';
import { deleteNotification } from '../../services/notificationsApi';
import { FaInfoCircle, FaExclamationTriangle, FaExclamationCircle, FaTrashAlt } from 'react-icons/fa';

export const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, reloadNotifications } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<any | null>(null); // 상세 보기용

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSelected(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = async () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            setIsLoading(true);
            try {
                await reloadNotifications();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('이 알림을 삭제하시겠습니까?')) return;
        try {
            await deleteNotification(id);
            toast.success('🗑️ 알림이 삭제되었습니다.');
            await reloadNotifications();
        } catch (err: any) {
            toast.error('삭제 실패: ' + (err.response?.data?.message || '서버 오류'));
        }
    };

    const renderIcon = (type?: string) => {
        switch (type) {
            case 'warning':
                return <FaExclamationTriangle color="#f5a623" />;
            case 'urgent':
                return <FaExclamationCircle color="#ff4d4d" />;
            default:
                return <FaInfoCircle color="#9e77ed" />;
        }
    };

    return (
        <Wrapper ref={dropdownRef}>
            <BellButton onClick={handleToggle}>
                <img src={bellIcon} alt="알림" />
                {unreadCount > 0 && <NewBadge>{unreadCount}</NewBadge>}
            </BellButton>

            {isOpen && (
                <Dropdown>
                    {isLoading ? (
                        <LoaderWrapper>
                            <ClipLoader size={20} color="#9E77ED" />
                        </LoaderWrapper>
                    ) : selected ? (
                        <DetailView>
                            <BackButton onClick={() => setSelected(null)}>←</BackButton>
                            <h4>{selected.notification?.title}</h4>
                            <p>{selected.notification?.message}</p>
                            <small>
                                {new Date(selected.created_at).toLocaleString('ko-KR')}
                            </small>
                        </DetailView>
                    ) : notifications.length === 0 ? (
                        <EmptyMessage>새로운 알림이 없습니다.</EmptyMessage>
                    ) : (
                        notifications.map((r) => (
                            <NotificationItem
                                key={r.id}
                                $new={!r.is_read}
                                $type={r.notification?.type}
                            >
                                <IconWrapper>{renderIcon(r.notification?.type)}</IconWrapper>
                                <ContentWrapper onClick={() => setSelected(r)}>
                                    <Title>{r.notification?.title}</Title>
                                    <Content>{r.notification?.message}</Content>
                                    <Time>
                                        {new Date(r.created_at).toLocaleString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Time>
                                </ContentWrapper>
                                <DeleteBtn onClick={() => handleDelete(r.notification?.id)}>
                                    <FaTrashAlt />
                                </DeleteBtn>
                            </NotificationItem>
                        ))
                    )}
                </Dropdown>
            )}

            <ToastContainer position="bottom-center" hideProgressBar />
        </Wrapper>
    );
};

//
// ================= 스타일 =================
//
const Wrapper = styled.div`
    position: relative;
    display: inline-block;
    margin-right: -15px;
`;

const BellButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    padding: 0;

    img {
        width: 25px;
        height: 25px;
        opacity: 0.75;
        transition: opacity 0.2s;
    }

    &:hover img {
        opacity: 1;
    }
`;

const NewBadge = styled.span`
    position: absolute;
    top: -3px;
    right: -2px;
    background: #ff4d4d;
    color: white;
    font-size: 0.55rem;
    font-weight: 700;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
`;

const fadeDown = keyframes`
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Dropdown = styled.div`
    position: absolute;
    top: 120%;
    right: 0;
    width: 380px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    padding: 10px;
    z-index: 1000;
    animation: ${fadeDown} 0.25s ease;
    font-family: 'Noto Sans KR', sans-serif;
    max-height: 400px;

    overflow-y: auto;
    overflow-x: hidden; /* 가로 스크롤 완전 차단 */

    /* 스크롤바 디자인 (크롬/엣지/사파리) */
    &::-webkit-scrollbar {
        width: 8px; /* 얇게 */
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #d2c3f9, #b79df7);
        border-radius: 10px;
        transition: background 0.3s;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #b79df7, #9e77ed);
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 10px;
    }

    scrollbar-width: thin;
    scrollbar-color: #c7b0f8 transparent;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
`;

const EmptyMessage = styled.p`
    text-align: center;
    color: #888;
    font-size: 0.9rem;
    margin: 10px 0;
`;

const NotificationItem = styled.div<{ $new?: boolean; $type?: string }>`
    display: flex;
    align-items: flex-start;
    padding: 10px 8px;
    border-bottom: 1px solid #f1f1f1;
    cursor: pointer;
    transition: background 0.2s ease;
    position: relative;

    ${({ $new }) =>
            $new &&
            css`
                background: #f9f4ff;
            `}

    ${({ $type }) =>
            $type === 'warning' &&
            css`
                border-left: 4px solid #f5a623;
                background: #fff9e6;
            `}

    ${({ $type }) =>
            $type === 'urgent' &&
            css`
                border-left: 4px solid #ff4d4d;
                background: #ffecec;
            `}
`;

const IconWrapper = styled.div`
    flex-shrink: 0;
    font-size: 0.8rem;
    margin-top: 7px;
`;

const ContentWrapper = styled.div`
    flex: 1;
    margin-left: 8px;
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 280px;
`;

const Content = styled.div`
    font-size: 0.85rem;
    color: #555;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 270px;
`;

const Time = styled.div`
    font-size: 0.75rem;
    color: #aaa;
    text-align: right;
    margin-top: 4px;
`;

const DeleteBtn = styled.button`
    position: absolute;
    background: none;
    border: none;
    cursor: pointer;
    color: #bbb;
    transition: color 0.2s;
    font-size: 0.8rem;
    right: 0;

    &:hover {
        color: #ff4d4d;
    }
`;

const DetailView = styled.div`
    padding: 10px;
    max-height: 300px; /* 너무 길면 스크롤 생기게 (원하면 조절 가능) */
    overflow-y: auto;
    overflow-x: hidden;

    h4 {
        margin-top: 15px;
        color: #333;
        font-size: 1rem;
        word-wrap: break-word;
        white-space: normal;
        line-height: 1.4;
    }

    p {
        margin: 10px 0;
        color: #555;
        white-space: pre-wrap;
        word-break: break-word;
        line-height: 1.5;
    }

    small {
        color: #aaa;
    }

    /* ✅ 세로 스크롤 이쁘게 */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #c5b4ef;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #a88bef;
    }
`;

const BackButton = styled.button`
    position: absolute;
    right: 30px;
    width: 20px;
    background: none;
    color: #333;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.2rem;

    &:hover {
        color: #888;
    }
`;
