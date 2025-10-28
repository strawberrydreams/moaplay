/**
 * 찜하기 관련 API 서비스
 * 
 * 찜하기 추가/삭제, 찜 목록 조회 등의 API 호출을 담당합니다.
 * 
 * API 문서: docs/api/Favorite API 문서.md
 * Base URL: /api/favorites
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

import { apiClient } from './core/axios';
import { 
  FavoriteCreateRequest, 
  FavoriteCreateResponse, 
  FavoriteListParams, 
  FavoriteListResponse, 
  FavoriteDeleteResponse 
} from '../types/favorites';

/**
 * 찜하기 서비스 클래스
 * 
 * Favorite API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 모든 메서드는 적절한 에러 처리와 타입 안전성을 보장합니다.
 * 
 * API 명세: docs/api/Favorite API 문서.md
 * Requirements: 2.5
 * 
 * 참고: 백엔드 API 구현 후 실제 연동 필요
 */
export class FavoriteService {
  /**
   * 찜 추가
   * POST /api/favorites/
   * 
   * 행사를 찜 목록에 추가합니다.
   * 
   * 비즈니스 로직:
   * - 로그인한 사용자만 가능
   * - approved 상태의 행사만 찜 가능
   * - 동일 행사 중복 찜 불가
   * - 추가 시 favorites_count 증가
   * 
   * @param data 찜 추가 데이터 (event_id)
   * @returns 추가된 찜 정보
   * @throws {Error} 400 - 필수 필드 누락
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 승인된 행사만 찜할 수 있습니다
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   * @throws {Error} 409 - 이미 찜한 행사입니다
   */
  static async addFavorite(data: FavoriteCreateRequest): Promise<FavoriteCreateResponse> {
    const response = await apiClient.post<FavoriteCreateResponse>('/api/favorites/', data);
    return response.data;
  }

  /**
   * 내 찜 목록 조회
   * GET /api/favorites/
   * 
   * 본인의 찜 목록을 조회합니다.
   * 최신순(created_at DESC)으로 정렬됩니다.
   * 
   * @param params 조회 파라미터 (page, per_page)
   * @returns 찜 목록과 페이지네이션 정보
   * @throws {Error} 401 - 로그인이 필요합니다
   */
  static async getFavorites(params?: FavoriteListParams): Promise<FavoriteListResponse> {
    const response = await apiClient.get<FavoriteListResponse>('/api/favorites/', { params });
    return response.data;
  }

  /**
   * 찜 삭제
   * DELETE /api/favorites/{id}
   * 
   * 찜 목록에서 행사를 제거합니다.
   * 본인의 찜만 삭제 가능하며, 삭제 시 favorites_count가 감소합니다.
   * 
   * @param id 삭제할 찜 ID
   * @returns 삭제 성공 메시지
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 본인의 찜만 삭제할 수 있습니다
   * @throws {Error} 404 - 찜을 찾을 수 없습니다
   */
  static async removeFavorite(id: number): Promise<FavoriteDeleteResponse> {
    const response = await apiClient.delete<FavoriteDeleteResponse>(`/api/favorites/${id}`);
    return response.data;
  }

}

