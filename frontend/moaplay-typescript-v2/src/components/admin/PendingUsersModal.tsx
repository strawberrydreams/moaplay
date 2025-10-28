/**
 * 주최자 인증 대기 모달 컴포넌트
 * 
 * 관리자가 주최자 인증 신청 목록을 확인하고 승인/거절할 수 있는 모달입니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AdminService } from '../../services/adminService';
import { OrganizerApplication } from '../../types/admin';
import { PaginationInfo } from '../../types';

/**
 * 주최자 인증 대기 모달 Props
 */
interface PendingUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 주최자 인증 대기 모달 컴포넌트
 */
export const PendingUsersModal: React.FC<PendingUsersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 거절 사유 입력 상태
  const [rejectingAppId, setRejectingAppId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  /**
   * 주최자 인증 신청 목록을 로드합니다.
   */
  const loadApplications = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AdminService.getOrganizerApplications(page, 10);
      
      setApplications(result.items || []);
      setPagination(result.pagination || null);
      setCurrentPage(page);
    } catch (err) {
      console.error('주최자 인증 신청 조회 실패:', err);
      setError('주최자 인증 신청을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 주최자 인증 승인 처리
   */
  const handleApprove = async (applicationId: number) => {
    if (!confirm('이 주최자 인증 신청을 승인하시겠습니까?')) {
      return;
    }

    try {
      await AdminService.approveOrganizerApplication(applicationId);
      alert('주최자 인증이 승인되었습니다.');
      await loadApplications(currentPage);
    } catch (err) {
      console.error('주최자 인증 승인 실패:', err);
      alert('주최자 인증 승인에 실패했습니다.');
    }
  };

  /**
   * 주최자 인증 거절 처리
   */
  const handleReject = async () => {
    if (!rejectingAppId || !rejectReason.trim()) {
      setError('거절 사유를 입력해주세요.');
      return;
    }

    try {
      await AdminService.rejectOrganizerApplication(rejectingAppId, {
        admin_comment: rejectReason.trim(),
      });
      alert('주최자 인증이 거절되었습니다.');
      setRejectingAppId(null);
      setRejectReason('');
      await loadApplications(currentPage);
    } catch (err) {
      console.error('주최자 인증 거절 실패:', err);
      alert('주최자 인증 거절에 실패했습니다.');
    }
  };

  /**
   * 거절 모드 시작
   */
  const startReject = (applicationId: number) => {
    setRejectingAppId(applicationId);
    setRejectReason('');
    setError(null);
  };

  /**
   * 거절 모드 취소
   */
  const cancelReject = () => {
    setRejectingAppId(null);
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
      loadApplications(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>주최자 인증 대기 목록</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading && <LoadingMessage>로딩 중...</LoadingMessage>}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!loading && applications.length === 0 && (
            <EmptyMessage>주최자 인증 대기 중인 신청이 없습니다.</EmptyMessage>
          )}

          {!loading && applications.length > 0 && (
            <ApplicationTable>
              <thead>
                <tr>
                  <th>신청자</th>
                  <th>회사명/단체명</th>
                  <th>공식 이메일</th>
                  <th>연락처</th>
                  <th>사업자등록번호</th>
                  <th>신청일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.user?.nickname || '알 수 없음'}</td>
                    <td>{app.company_name}</td>
                    <td>{app.official_email}</td>
                    <td>{app.contact_number}</td>
                    <td>{app.business_number}</td>
                    <td>{formatDate(app.created_at)}</td>
                    <td>
                      {rejectingAppId === app.id ? (
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
                            onClick={() => handleApprove(app.id)}
                          >
                            승인
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => startReject(app.id)}
                          >
                            거절
                          </ActionButton>
                        </ActionButtons>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ApplicationTable>
          )}

          {pagination && pagination.total_pages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => loadApplications(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </PaginationButton>

              <PageInfo>
                {currentPage} / {pagination.total_pages}
              </PageInfo>

              <PaginationButton
                onClick={() => loadApplications(currentPage + 1)}
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

const ApplicationTable = styled.table`
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
    font-size: 0.875rem;
  }

  td {
    font-size: 0.875rem;
  }
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
