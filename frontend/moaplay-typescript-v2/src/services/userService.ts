/**
 * 사용자 관련 API 서비스
 * 
 * 사용자 프로필 조회, 수정, 비밀번호 변경, 회원 탈퇴 등
 * 사용자와 관련된 모든 API 호출을 담당합니다.
 * 
 * API 문서: docs/api/User API 문서.md
 * Base URL: /api/users
 */

import { apiClient } from './core/axios';
import { 
  UserMeResponse,
  UserPublicResponse, 
  UserUpdateRequest, 
  UserUpdateResponse, 
  PasswordChangeRequest, 
  PasswordChangeResponse
} from '../types/users';

/**
 * 사용자 서비스 클래스
 * 
 * User API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 모든 메서드는 적절한 에러 처리와 타입 안전성을 보장합니다.
 * 
 * API 명세: docs/api/User API 문서.md
 * Requirements: 2.2
 */
export class UserService {
  /**
   * 내 정보 조회
   * GET /api/users/me
   * 
   * 현재 로그인한 사용자의 상세 정보를 조회합니다.
   * 이메일, 전화번호 등 민감한 정보를 포함합니다.
   * 
   * @returns 현재 사용자의 상세 프로필 정보 (통계 포함)
   * @throws {Error} 401 - 인증이 필요합니다
   */
  static async getMe(): Promise<UserMeResponse> {
    const response = await apiClient.get<UserMeResponse>('/api/users/me');
    return response.data;
  }
  
  /**
   * 사용자 정보 조회
   * GET /api/users/{id}
   * 
   * 특정 사용자의 공개 프로필 정보를 조회합니다.
   * 이메일, 전화번호 등 민감한 정보는 제외됩니다.
   * 
   * @param id 조회할 사용자 ID
   * @returns 사용자의 공개 프로필 정보
   * @throws {Error} 404 - 사용자를 찾을 수 없습니다
   */
  static async getUser(id: number): Promise<UserPublicResponse> {
    const response = await apiClient.get<UserPublicResponse>(`/api/users/${id}`);
    return response.data;
  }
  
  /**
   * 내 정보 수정
   * PUT /api/users/me
   * 
   * 현재 사용자의 프로필 정보를 수정합니다.
   * 모든 필드는 선택적이며, 제공된 필드만 업데이트됩니다.
   * 
   * 주의사항:
   * - user_id는 수정 불가
   * - password는 별도 API 사용 (PUT /api/users/me/password)
   * - role은 관리자만 수정 가능
   * 
   * @param data 수정할 프로필 정보
   * @returns 수정된 사용자 정보
   * @throws {Error} 401 - 인증이 필요합니다
   * @throws {Error} 409 - 중복된 닉네임입니다
   * @throws {Error} 422 - 입력값이 유효하지 않습니다
   */
  static async updateMe(data: UserUpdateRequest): Promise<UserUpdateResponse> {
    const response = await apiClient.put<UserUpdateResponse>('/api/users/me', data);
    return response.data;
  }
  
  /**
   * 비밀번호 변경
   * PUT /api/users/me/password
   * 
   * 현재 사용자의 비밀번호를 변경합니다.
   * 현재 비밀번호 확인이 필요합니다.
   * 
   * @param data 현재 비밀번호와 새 비밀번호
   * @returns 성공 메시지
   * @throws {Error} 400 - 현재 비밀번호가 일치하지 않습니다
   * @throws {Error} 401 - 인증이 필요합니다
   * @throws {Error} 422 - 새 비밀번호는 8자 이상이어야 합니다
   */
  static async updatePassword(data: PasswordChangeRequest): Promise<PasswordChangeResponse> {
    const response = await apiClient.put<PasswordChangeResponse>('/api/users/me/password', data);
    return response.data;
  }
  /**
   * 특정 사용자의 리뷰 목록 조회
   * GET /api/reviews/user/{user_id}
   * 
   * 특정 사용자가 작성한 리뷰 목록을 조회합니다.
   * 
   * @param userId 사용자 ID
   * @param page 페이지 번호
   * @param perPage 페이지당 항목 수
   * @returns 리뷰 목록과 페이지네이션 정보
   * @throws {Error} 404 - 사용자를 찾을 수 없습니다
   */
  static async getUserReviews(
    userId: number,
    page?: number,
    perPage?: number
  ): Promise<{ reviews: any[]; pagination: any }> {
    const response = await apiClient.get(`/api/reviews/user/${userId}`, {
      params: { page, per_page: perPage },
    });
    return response.data;
  }
}