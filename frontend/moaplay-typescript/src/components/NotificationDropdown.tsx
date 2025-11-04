import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import bellIcon from '../assets/bell.png'; // ✅ 업로드한 아이콘 경로에 맞게 수정
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
  isNew?: boolean;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNew, setHasNew] = useState(true); // ✅ N 뱃지 표시 여부
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 더미 알림
  const dummyNotis: Notification[] = [
    { id: 1, title: '새 댓글 알림', content: '당신의 리뷰에 새 댓글이 달렸어요!', time: '방금 전', isNew: true },
    { id: 2, title: '이벤트 승인', content: '등록하신 행사 “봄 축제”가 승인되었습니다.', time: '1시간 전' },
  ];

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
        await new Promise((r) => setTimeout(r, 700));
        setNotifications(dummyNotis);
        setHasNew(false); // 열면 “N” 제거
      } catch (err) {
        toast.error('알림을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Wrapper ref={dropdownRef}>
      <BellButton onClick={handleToggle}>
        <img src={bellIcon} alt="알림" />
        {hasNew && <NewBadge>N</NewBadge>}
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
            notifications.map((n) => (
              <NotificationItem key={n.id} $new={n.isNew}>
                <Title>{n.title}</Title>
                <Content>{n.content}</Content>
                <Time>{n.time}</Time>
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
  margin-right: 8px;
`;

const BellButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0;

  img {
    width: 22px;
    height: 22px;
    opacity: 0.85;
    transition: opacity 0.2s;
  }

  &:hover img {
    opacity: 1;
  }
`;

const NewBadge = styled.span`
  position: absolute;
  top: 0px;
  right: 8px;
  background: #ff4d4d;
  color: white;
  font-size: 0.5rem;
  font-weight: 700;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
`;

const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  width: 280px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  padding: 10px;
  z-index: 1000;
  animation: ${fadeDown} 0.25s ease;
  font-family: 'Noto Sans KR', sans-serif;
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

const NotificationItem = styled.div<{ $new?: boolean }>`
  padding: 8px 6px;
  border-bottom: 1px solid #f1f1f1;
  background: ${({ $new }) => ($new ? '#f9f4ff' : 'white')};

  &:last-child {
    border-bottom: none;
  }
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
