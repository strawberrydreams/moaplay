/**
 * 승인된 행사 모달 컴포넌트
 * 
 * 관리자가 승인된 행사 목록을 확인하고 관리할 수 있는 모달입니다.
 * 최근 승인순으로 정렬되며, 통계 정보와 관리 기능을 제공합니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EventListItem } from '../../types/events';
import { PaginationInfo } from '../../types';
import { AdminService } from '../../services/adminService';
import { ErrorHandler } from '../../utils/error';

/**
 * 승인된 행사 모달 Props
 */
interface ApprovedEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: () => void; // 행사 수정/삭제 후 콜백
}

/**
 * 승인된 행사 모달 컴포넌트
 */
export const ApprovedEventsModal: React.FC<ApprovedEventsModalProps> = ({
  isOpen,
  onClose,
  onEventUpdated
}) => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingEventId, setProcessingEventId] = useState<number | null>(null);

  /**
   * 승인된 행사 목록을 로드합니다.
   */
  const loadEvents = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AdminService.getApprovedEvents(page, 10);

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
      console.error('승인된 행사 조회 실패:', err);
      setError('승인된 행사를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * 행사 상세 페이지로 이동
   */
  const viewEventDetail = (eventId: number) => {
    window.open(`/events/${eventId}`, '_blank');
  };

  /**
   * 행사 수정 페이지로 이동
   */
  const editEvent = (eventId: number) => {
    window.open(`/events/${eventId}/edit`, '_blank');
  };

  /**
   * 행사 삭제 처리
   */
  const handleDeleteEvent = async (eventId: number, eventTitle: string) => {
    if (!confirm(`"${eventTitle}" 행사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setProcessingEventId(eventId);
      await AdminService.deleteEvent(eventId);
      
      // 목록에서 제거
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      // 부모 컴포넌트에 알림
      onEventUpdated?.();
      
      alert('행사가 삭제되었습니다.');
    } catch (err) {
      console.error('행사 삭제 실패:', err);
      ErrorHandler.handle(err);
    } finally {
      setProcessingEventId(null);
    }
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
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>승인된 행사 목록</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading && <LoadingMessage>로딩 중...</LoadingMessage>}
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          {!loading && events.length === 0 && (
            <EmptyMessage>승인된 행사가 없습니다.</EmptyMessage>
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
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
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
                    <td>
                      {event.host?.nickname || '알 수 없음'}
                    </td>
                    <td>
                      <StatsContainer>
                        <StatItem>
                          조회수: {event.stats?.view_count?.toLocaleString('ko-KR') || 0}
                        </StatItem>
                        <StatItem>
                          찜: {event.stats?.favorites_count?.toLocaleString('ko-KR') || 0}
                        </StatItem>
                      </StatsContainer>
                    </td>
                    <td>
                      <ActionButtons>
                        <ActionButton 
                          variant="primary" 
                          onClick={() => viewEventDetail(event.id)}
                          disabled={processingEventId === event.id}
                        >
                          상세보기
                        </ActionButton>
                        <ActionButton 
                          variant="secondary" 
                          onClick={() => editEvent(event.id)}
                          disabled={processingEventId === event.id}
                        >
                          수정
                        </ActionButton>
                        <ActionButton 
                          variant="danger" 
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          disabled={processingEventId === event.id}
                        >
                          {processingEventId === event.id ? '삭제 중...' : '삭제'}
                        </ActionButton>
                      </ActionButtons>
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
  
  th, td {
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
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
      case 'primary':
        return `
          background-color: #007bff;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #0056b3;
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
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
    }
  }}
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