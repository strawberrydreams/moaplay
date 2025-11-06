import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaBell } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendNotification } from '../services/notificationsApi';
import { useNotifications } from '../contexts/NotificationsContext'; // ✅ Context 가져오기

interface NotificationFormDropdownProps {
  eventId: number; // 행사 ID
  position?: 'left' | 'right';
}

export const NotificationFormDropdown: React.FC<NotificationFormDropdownProps> = ({
  eventId,
  position = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Context에서 reload 함수 불러오기
  const { reloadNotifications } = useNotifications();

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔹 알림 전송 함수
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.warning('제목과 내용을 입력해주세요.', { autoClose: 1500 });
      return;
    }

    try {
      setIsLoading(true);

      await sendNotification({
        event_id: eventId,
        title,
        message: content,
        type,
      });

      toast.success('✅ 알림이 전송되었습니다!', { autoClose: 2000 });

      // ✅ 전송 후 Context 새로고침
      await reloadNotifications();

      setTitle('');
      setContent('');
      setType('info');
      setIsOpen(false);
    } catch (error) {
      console.error('알림 전송 실패:', error);
      toast.error('❌ 알림 전송에 실패했습니다.', { autoClose: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper ref={dropdownRef}>
      <BellButton onClick={() => setIsOpen((prev) => !prev)}>
        <FaBell size={18} />
        알림 보내기
      </BellButton>

      {isOpen && (
        <Dropdown position={position}>
          <Input
            type="text"
            placeholder="제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="내용 입력"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="info">일반</option>
            <option value="warning">주의</option>
            <option value="urgent">긴급</option>
          </Select>

          <SendButton type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <ClipLoader size={16} color="#fff" /> : '전송'}
          </SendButton>
        </Dropdown>
      )}

      <ToastContainer position="bottom-center" hideProgressBar />
    </Wrapper>
  );
};

//
// ================== 스타일 ==================
//
const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  z-index: 50;
  color: #333;
`;

const BellButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #4c8dff;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  transition: all 0.2s ease !important;
  z-index: 51;

  &:hover {
    transform: scale(1.05) !important;
  }
  &:focus {
    outline: none;
  }
`;

const fadeDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Dropdown = styled.div<{ position: 'left' | 'right' }>`
  font-family: 'Noto Sans KR', sans-serif;
  position: absolute;
  top: 120%;
  ${({ position }) => (position === 'left' ? 'right: 0;' : 'left: 0;')}
  width: 260px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  animation: ${fadeDown} 0.2s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  color: #333;
  background: #fff;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const Textarea = styled.textarea`
  font-family: 'Noto Sans KR', sans-serif;
  width: 100%;
  height: 90px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #ccc;
  color: #333;
  border-radius: 4px;
  resize: none;
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  color: #333;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const SendButton = styled.button`
  width: 100%;
  background: #9e77ed !important;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease !important;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  z-index: 2;

  &:hover {
    background: #875bdaff !important;
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;
