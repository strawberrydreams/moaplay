/**
 * 승인 대기 행사 모달 컴포넌트
 *
 * 관리자가 승인 대기 중인 행사 목록을 확인하고 승인/거절할 수 있는 모달입니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EventListItem } from '../../types/events';
import { PaginationInfo } from '../../types';
import { AdminService } from '../../services/adminService';

/**
 * 승인 대기 행사 모달 Props
 */
interface PendingEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (eventId: number) => Promise<void>;
  onReject: (eventId: number, reason: string) => Promise<void>;
}

/**
 * 승인 대기 행사 모달 컴포넌트
 */
export const PendingEventsModal: React.FC<PendingEventsModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 거절 사유 입력 상태
  const [rejectingEventId, setRejectingEventId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  /**
   * 승인 대기 행사 목록을 로드합니다.
   */
  const loadEvents = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AdminService.getPendingEvents(page, 10);

      // Narrow unknown → known structure
      type PendingEventsResp = {
        items?: EventListItem[];
        events?: EventListItem[];
        pagination?: PaginationInfo | null;
      };

      const data = result as unknown as PendingEventsResp;
      const list: EventListItem[] = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.events)
          ? data.events
          : [];

      setEvents(list);
      setPagination(data.pagination ?? null);
      setCurrentPage(page);
    } catch (err) {
      console.error('승인 대기 행사 조회 실패:', err);
      setError('승인 대기 행사를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 행사 승인 처리
   */
  const handleApprove = async (eventId: number) => {
    try {
      await onApprove(eventId);
      await loadEvents(currentPage); // 목록 새로고침
    } catch (err) {
      console.error('행사 승인 실패:', err);
      setError('행사 승인에 실패했습니다.');
    }
  };

  /**
   * 행사 거절 처리
   */
  const handleReject = async () => {
    if (!rejectingEventId || !rejectReason.trim()) {
      setError('거절 사유를 입력해주세요.');
      return;
    }

    try {
      await onReject(rejectingEventId, rejectReason.trim());
      setRejectingEventId(null);
      setRejectReason('');
      await loadEvents(currentPage); // 목록 새로고침
    } catch (err) {
      console.error('행사 거절 실패:', err);
      setError('행사 거절에 실패했습니다.');
    }
  };

  /**
   * 거절 모드 시작
   */
  const startReject = (eventId: number) => {
    setRejectingEventId(eventId);
    setRejectReason('');
    setError(null);
  };

  /**
   * 거절 모드 취소
   */
  const cancelReject = () => {
    setRejectingEventId(null);
    setRejectReason('');
    setError(null);
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadEvents(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>승인 대기 행사 목록</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading && <LoadingMessage>로딩 중...</LoadingMessage>}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!loading && events.length === 0 && (
            <EmptyMessage>승인 대기 중인 행사가 없습니다.</EmptyMessage>
          )}

          {!loading && events.length > 0 && (
            <EventTable>
              <thead>
                <tr>
                  <th>행사 제목</th>
                  <th>시작일</th>
                  <th>종료일</th>
                  <th>개최 주소</th>
                  <th>주최자</th>
                  <th>통계</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>
                      <EventTitle>{event.title}</EventTitle>
                      {event.summary && (
                        <EventSummary>{event.summary}</EventSummary>
                      )}
                    </td>
                    <td>{formatDate(event.start_date)}</td>
                    <td>-</td>
                    <td>
                      <Location>{event.location || '장소 미정'}</Location>
                    </td>
                    <td>{event.host?.nickname || '알 수 없음'}</td>
                    <td>
                      <StatsContainer>
                        <StatItem>
                          조회수:{' '}
                          {event.stats?.view_count?.toLocaleString('ko-KR') ||
                            0}
                        </StatItem>
                        <StatItem>
                          찜:{' '}
                          {event.stats?.favorites_count?.toLocaleString(
                            'ko-KR'
                          ) || 0}
                        </StatItem>
                      </StatsContainer>
                    </td>
                    <td>
                      <StatusBadge status={event.status}>
                        {event.status === 'pending' ? '승인 대기' : '수정됨'}
                      </StatusBadge>
                    </td>
                    <td>
                      {rejectingEventId === event.id ? (
                        <RejectForm>
                          <RejectInput
                            type="text"
                            placeholder="거절 사유를 입력하세요"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                          />
                          <ActionButton
                            variant="danger"
                            onClick={handleReject}
                            disabled={!rejectReason.trim()}
                          >
                            거절
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            onClick={cancelReject}
                          >
                            취소
                          </ActionButton>
                        </RejectForm>
                      ) : (
                        <ActionButtons>
                          <ActionButton
                            variant="success"
                            onClick={() => handleApprove(event.id)}
                          >
                            승인
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => startReject(event.id)}
                          >
                            거절
                          </ActionButton>
                        </ActionButtons>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </EventTable>
          )}

          {pagination && pagination.total_pages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => loadEvents(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </PaginationButton>

              <PageInfo>
                {currentPage} / {pagination.total_pages}
              </PageInfo>

              <PaginationButton
                onClick={() => loadEvents(currentPage + 1)}
                disabled={currentPage === pagination.total_pages}
              >
                다음
              </PaginationButton>
            </Pagination>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// 스타일 컴포넌트들
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;

  h2 {
    margin: 0;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const EventTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
`;

const EventTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const EventSummary = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;

  ${({ status }) => {
    switch (status) {
      case 'pending':
        return `
          background-color: #fff3cd;
          color: #856404;
        `;
      case 'modified':
        return `
          background-color: #d1ecf1;
          color: #0c5460;
        `;
      default:
        return `
          background-color: #f8f9fa;
          color: #6c757d;
        `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{
  variant: 'success' | 'danger' | 'secondary';
}>`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return `
          background-color: #28a745;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #218838;
          }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #5a6268;
          }
        `;
    }
  }}
`;

const RejectForm = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RejectInput = styled.input`
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 200px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-size: 0.875rem;
`;

const Location = styled.div`
  font-size: 0.875rem;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatItem = styled.div`
  font-size: 0.75rem;
  color: #666;
`;
