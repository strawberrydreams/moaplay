/**
 * 사용자 관리 모달 컴포넌트
 * 
 * 관리자가 전체 사용자 목록을 확인하고 관리할 수 있는 모달입니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AdminService, UserInfo } from '../../services/adminService';
import { PaginationInfo } from '../../types';

/**
 * 사용자 관리 모달 Props
 */
interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 사용자 관리 모달 컴포넌트
 */
export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('');

  /**
   * 사용자 목록을 로드합니다.
   */
  const loadUsers = async (page: number = 1, role?: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AdminService.getUsers(page, 10, role);
      
      type UsersResponse = {
        items?: UserInfo[];
        pagination?: PaginationInfo | null;
      };
      
      const data = result as unknown as UsersResponse;
      
      setUsers(data?.items ?? []);
      setPagination(data?.pagination ?? null);
      setCurrentPage(page);
    } catch (err) {
      console.error('사용자 목록 조회 실패:', err);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 사용자 역할 변경
   */
  const handleRoleChange = async (userId: number, currentRole: string) => {
    const newRole = prompt(
      `현재 역할: ${currentRole}\n새로운 역할을 입력하세요 (user/host/admin):`,
      currentRole
    );

    if (!newRole || !['user', 'host', 'admin'].includes(newRole)) {
      alert('유효하지 않은 역할입니다.');
      return;
    }

    if (newRole === currentRole) {
      return;
    }

    try {
      await AdminService.updateUserRole(userId, newRole as 'user' | 'host' | 'admin');
      alert('역할이 변경되었습니다.');
      await loadUsers(currentPage, roleFilter);
    } catch (err) {
      console.error('역할 변경 실패:', err);
      alert('역할 변경에 실패했습니다.');
    }
  };

  /**
   * 사용자 활성화/비활성화 토글
   */
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? '비활성화' : '활성화';
    
    if (!confirm(`이 사용자를 ${action}하시겠습니까?`)) {
      return;
    }

    try {
      await AdminService.toggleUserStatus(userId, !currentStatus);
      alert(`사용자가 ${action}되었습니다.`);
      await loadUsers(currentPage, roleFilter);
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  /**
   * 사용자 삭제
   */
  const handleDeleteUser = async () => {
    alert('사용자 삭제 기능은 현재 제한되어 있습니다.\n대신 "비활성화" 기능을 사용해주세요.');
    return;
  };

  /**
   * 역할 필터 변경
   */
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    loadUsers(1, role || undefined);
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
      loadUsers(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>사용자 관리</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <FilterSection>
          <FilterLabel>역할 필터:</FilterLabel>
          <FilterSelect
            value={roleFilter}
            onChange={e => handleRoleFilterChange(e.target.value)}
          >
            <option value="">전체</option>
            <option value="user">일반 사용자</option>
            <option value="host">주최자</option>
            <option value="admin">관리자</option>
          </FilterSelect>
        </FilterSection>

        <ModalBody>
          {loading && <LoadingMessage>로딩 중...</LoadingMessage>}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!loading && users.length === 0 && (
            <EmptyMessage>사용자가 없습니다.</EmptyMessage>
          )}

          {!loading && users.length > 0 && (
            <UserTable>
              <thead>
                <tr>
                  <th>닉네임</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th>가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.nickname || user.username || '알 수 없음'}</td>
                    <td>{user.email}</td>
                    <td>
                      <RoleBadge role={user.role}>
                        {user.role === 'admin' ? '관리자' : user.role === 'host' ? '주최자' : '일반'}
                      </RoleBadge>
                    </td>
                    <td>
                      <StatusBadge active={user.is_active}>
                        {user.is_active ? '활성' : '비활성'}
                      </StatusBadge>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <ActionButtons>
                        <ActionButton
                          variant="warning"
                          onClick={() => handleRoleChange(user.id, user.role)}
                        >
                          역할 변경
                        </ActionButton>
                        <ActionButton
                          variant="secondary"
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? '비활성화' : '활성화'}
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          onClick={() => handleDeleteUser()}
                        >
                          삭제
                        </ActionButton>
                      </ActionButtons>
                    </td>
                  </tr>
                ))}
              </tbody>
            </UserTable>
          )}

          {pagination && pagination.total_pages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => loadUsers(currentPage - 1, roleFilter)}
                disabled={currentPage === 1}
              >
                이전
              </PaginationButton>

              <PageInfo>
                {currentPage} / {pagination.total_pages}
              </PageInfo>

              <PaginationButton
                onClick={() => loadUsers(currentPage + 1, roleFilter)}
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

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
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

const UserTable = styled.table`
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

const RoleBadge = styled.span<{ role: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;

  ${({ role }) => {
    switch (role) {
      case 'admin':
        return `
          background-color: #dc3545;
          color: white;
        `;
      case 'host':
        return `
          background-color: #ffc107;
          color: #212529;
        `;
      default:
        return `
          background-color: #6c757d;
          color: white;
        `;
    }
  }}
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;

  ${({ active }) =>
    active
      ? `
    background-color: #d4edda;
    color: #155724;
  `
      : `
    background-color: #f8d7da;
    color: #721c24;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{
  variant: 'warning' | 'secondary' | 'danger';
}>`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ variant }) => {
    switch (variant) {
      case 'warning':
        return `
          background-color: #ffc107;
          color: #212529;
          
          &:hover:not(:disabled) {
            background-color: #e0a800;
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
