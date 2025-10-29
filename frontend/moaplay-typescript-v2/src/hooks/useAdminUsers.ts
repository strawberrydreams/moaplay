/**
 * 관리자 사용자 관리 커스텀 훅
 * 
 * 사용자 목록 조회, 정보 수정, 강제 탈퇴 등의 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminService, UserInfo, UpdateUserRequest } from '../services/adminService';
import { PaginationInfo } from '../types';

/**
 * 관리자 사용자 관리 훅의 반환 타입
 */
interface UseAdminUsersReturn {
  // 사용자 목록
  users: UserInfo[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  
  // 필터 상태
  currentRole: string | undefined;
  
  // 액션 함수들
  loadUsers: (page?: number, role?: 'user' | 'host' | 'admin') => Promise<void>;
  updateUser: (userId: number, userData: UpdateUserRequest) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
  setRoleFilter: (role: 'user' | 'host' | 'admin' | undefined) => void;
}

// 역할 매핑 헬퍼 (API ↔︎ 프론트 내부 타입)
const mapAdminRoleToUserRole = (r: 'user' | 'organizer' | 'admin'): 'user' | 'host' | 'admin' =>
  r === 'organizer' ? 'host' : r;

const mapUserRoleToAdminRole = (r: 'user' | 'host' | 'admin'): 'user' | 'organizer' | 'admin' =>
  r === 'host' ? 'organizer' : r;

/**
 * 관리자 사용자 관리 커스텀 훅
 *
 * 사용자 목록 조회, 정보 수정, 강제 탈퇴 등의 기능을 제공합니다.
 */
export const useAdminUsers = (): UseAdminUsersReturn => {
  // 사용자 목록 상태
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // 필터 상태
  const [currentRole, setCurrentRole] = useState<'user' | 'host' | 'admin' | undefined>(undefined);

  /**
   * 사용자 목록을 로드합니다.
   *
   * @param page 페이지 번호 (기본값: 1)
   * @param role 역할 필터
   */
  const loadUsers = useCallback(async (page: number = 1, role?: 'user' | 'host' | 'admin') => {
    try {
      setLoading(true);
      setError(null);

      const apiRole = role ? mapUserRoleToAdminRole(role) : undefined;
      const result = await AdminService.getUsers(page, 20, apiRole);
      setUsers(result.items.map((item) => ({
        ...item,
        role: mapAdminRoleToUserRole(item.role as 'user' | 'organizer' | 'admin')
      })));
      setPagination(result.pagination);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 사용자 정보를 수정합니다.
   *
   * @param userId 수정할 사용자 ID
   * @param userData 수정할 사용자 정보
   */
  const updateUser = useCallback(async (userId: number, userData: UpdateUserRequest) => {
    try {
      await AdminService.updateUser(userId, userData);

      // 수정 후 목록 새로고침
      await loadUsers(pagination?.current_page || 1, currentRole);

      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('사용자 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
      throw new Error('사용자 정보 수정에 실패했습니다.');
    }
  }, [loadUsers, pagination?.current_page, currentRole]);

  /**
   * 사용자를 강제 탈퇴시킵니다.
   *
   * @param userId 탈퇴시킬 사용자 ID
   */
  const deleteUser = useCallback(async (userId: number) => {
    try {
      await AdminService.deleteUser(userId);

      // 탈퇴 후 목록 새로고침
      await loadUsers(pagination?.current_page || 1, currentRole);

      // 성공 메시지 (실제 구현에서는 토스트 등으로 표시)
      console.log('사용자가 성공적으로 탈퇴되었습니다.');
    } catch (error) {
      console.error('사용자 강제 탈퇴 실패:', error);
      throw new Error('사용자 강제 탈퇴에 실패했습니다.');
    }
  }, [loadUsers, pagination?.current_page, currentRole]);

  /**
   * 사용자 목록을 새로고침합니다.
   */
  const refreshUsers = useCallback(async () => {
    await loadUsers(pagination?.current_page || 1, currentRole);
  }, [loadUsers, pagination?.current_page, currentRole]);

  /**
   * 역할 필터를 설정합니다.
   *
   * @param role 필터할 역할
   */
  const setRoleFilter = useCallback((role: 'user' | 'host' | 'admin' | undefined) => {
    setCurrentRole(role);
    // 필터 변경 시 첫 페이지로 이동
    loadUsers(1, role);
  }, [loadUsers]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    // 사용자 목록
    users,
    loading,
    error,
    pagination,
    
    // 필터 상태
    currentRole,
    
    // 액션 함수들
    loadUsers,
    updateUser,
    deleteUser,
    refreshUsers,
    setRoleFilter
  };
};