import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { UserPagination } from '../../types/admin';
import type { Users } from '../../types/users';
import { getUsers, updateUserRole, deleteUser } from '../../services/adminApi';

// 사용자 모달 관리 Props
interface UsersManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// 사용자 모달 관리 컴포넌트
export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({
                                                                              isOpen,
                                                                              onClose,
                                                                          }) => {
    const [users, setUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<UserPagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [searchUserId, setSearchUserId] = useState<string>('');

    // 사용자 목록 로딩
    const loadUsers = async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                per_page: 10,
                role: roleFilter || undefined,
                user_id: searchUserId.trim() || undefined,
            };

            const result = await getUsers(params);
            setUsers(result.users || []);
            users.map((user)=>{console.log(user.role)});
            setPagination(result.pagination || null);
            setCurrentPage(page);
        } catch (err) {
            console.error('사용자 목록 조회 실패:', err);
            setError('사용자 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 사용자 역할 변경
    const handleRoleChange = async (userId: number, currentRole: string) => {
        const newRole = prompt(
            `현재 역할: ${currentRole}\n새로운 역할을 입력하세요 (user/host/admin):`,
            currentRole
        );

        if (!newRole || !['user', 'host', 'admin'].includes(newRole)) {
            alert('유효하지 않은 역할입니다.');
            return;
        }

        if (newRole === currentRole) return;

        try {
            await updateUserRole(userId, newRole);
            alert('역할이 변경되었습니다.');
            await loadUsers(currentPage);
        } catch (err) {
            console.error('역할 변경 실패:', err);
            alert('역할 변경에 실패했습니다.');
        }
    };

    // 사용자 삭제
    const handleDeleteUser = async (userId: number) => {
        const ok = window.confirm('정말 이 사용자를 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
        if (!ok) return;

        try {
            await deleteUser(userId);
            alert('사용자가 삭제되었습니다.');
            await loadUsers(currentPage);
        } catch (err) {
            console.error('사용자 삭제 실패:', err);
            alert('사용자 삭제에 실패했습니다.');
        }
    };

    // 역할 필터 변경
    const handleRoleFilterChange = (role: string) => {
        setRoleFilter(role);
    };

    // 날짜 포매터
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // 검색 버튼 클릭 시 실행
    const handleSearch = async () => {
        await loadUsers(1);
    };

    // 모달이 열릴 때 데이터 로드
    useEffect(() => {
        if (isOpen) loadUsers(1);
    }, [isOpen, roleFilter]);

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2>사용자 관리</h2>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </ModalHeader>

                {/* 필터 영역 */}
                <FilterSection>
                    <FilterLabel>역할 필터:</FilterLabel>
                    <FilterSelect
                        value={roleFilter}
                        onChange={e => handleRoleFilterChange(e.target.value)}
                    >
                        <option value="">전체</option>
                        <option value="user">일반 사용자</option>
                        <option value="host">주최자</option>
                        <option value="">관리자</option>
                    </FilterSelect>

                    <SearchContainer>
                        <SearchInput
                            type="text" // 여기 text로 변경
                            placeholder="User ID 검색"
                            value={searchUserId}
                            onChange={e => setSearchUserId(e.target.value)}
                        />
                        <SearchButton onClick={handleSearch}>검색</SearchButton>
                    </SearchContainer>
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
                                <th>ID</th>
                                <th>닉네임</th>
                                <th>아이디</th>
                                <th>이메일</th>
                                <th>역할</th>
                                <th>가입일</th>
                                <th>관리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.nickname || '알 수 없음'}</td>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <RoleBadge role={user.role || 'user'}>
                                            {user.role === 'admin'
                                                ? '관리자'
                                                : user.role === 'host'
                                                    ? '주최자'
                                                    : '일반'}
                                        </RoleBadge>
                                    </td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        <ActionButtons>
                                            <ActionButton
                                                variant="warning"
                                                onClick={() => handleRoleChange(user.id, user.role || '')}
                                            >
                                                역할 변경
                                            </ActionButton>
                                            <ActionButton
                                                variant="danger"
                                                onClick={() => handleDeleteUser(user.id)}
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
                    {!loading && pagination && pagination.pages > 1 && (
                        <Pagination>
                            <PaginationButton
                                onClick={() => loadUsers(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                이전
                            </PaginationButton>

                            <PageInfo>
                                페이지 {currentPage} / {pagination.page} ({pagination.total}명)
                            </PageInfo>

                            <PaginationButton
                                onClick={() => loadUsers(currentPage + 1)}
                                disabled={currentPage === pagination.pages}
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

// ================= 스타일 컴포넌트들 =================

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    color: #333;
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
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
`;

const FilterSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    flex-wrap: wrap;
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
`;

const SearchContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;


const SearchInput = styled.input`
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.875rem;
    width: 160px;
`;

const SearchButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
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
    }
`;

const RoleBadge = styled.span<{ role: string }>`
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;

    ${({ role }) => {
        switch (role.toUpperCase()) {
            case 'ADMIN':
                return `background-color: #dc3545; color: white;`;
            case 'HOST':
                return `background-color: #ffc107; color: #212529;`;
            default:
                return `background-color: #6c757d; color: white;`;
        }
    }}
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant: 'warning' | 'danger' }>`
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;

    ${({ variant }) =>
            variant === 'warning'
                    ? `background-color: #ffc107; color: #212529;`
                    : `background-color: #dc3545; color: white;`}
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const PaginationButton = styled.button`
    color: #333;
    padding: 0.5rem 1rem;
    border: 1px solid #ced4da;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;

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
