import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import bellIcon from '../assets/bell.png';
import { ClipLoader } from 'react-spinners';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNotifications } from '../contexts/NotificationsContext';
import { FaInfoCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa'; // ✅ 아이콘 추가

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, reloadNotifications } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
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

  // 🔹 type별 아이콘 지정
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
          ) : notifications.length === 0 ? (
            <EmptyMessage>새로운 알림이 없습니다.</EmptyMessage>
          ) : (
            notifications.map((r) => (
              <NotificationItem
                key={r.id}
                $new={!r.is_read}
                $type={r.notification?.type}
                onClick={() => markAsRead(r.id)}
              >
                <IconWrapper>{renderIcon(r.notification?.type)}</IconWrapper>
                <ContentWrapper>
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
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  padding: 10px;
  z-index: 1000;
  animation: ${fadeDown} 0.25s ease;
  font-family: 'Noto Sans KR', sans-serif;
  max-height: 400px;
  overflow-y: auto;
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

  &:hover {
    background: ${({ $type }) =>
      $type === 'urgent'
        ? '#ffd6d6'
        : $type === 'warning'
        ? '#fff4cc'
        : '#f3ecff'};
  }
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  font-size: 0.8rem;
  margin-top: 7px;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
`;

const Content = styled.div`
  font-size: 0.85rem;
  color: #555;
  margin-top: 2px;
`;

const Time = styled.div`
  font-size: 0.75rem;
  color: #aaa;
  text-align: right;
  margin-top: 4px;
`;
