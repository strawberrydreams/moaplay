/**
 * 리뷰 관련 API 서비스
 * 
 * 리뷰 CRUD, 행사별 리뷰 조회, 평점 통계 등의 API 호출을 담당합니다.
 * 
 * API 문서: docs/api/Review API 문서.md
 * Base URL: /api/reviews
 * 인증 방식: 세션 기반 인증 (Session-based Authentication)
 */

import { apiClient } from './core/axios';
import { 
  ReviewCreateRequest, 
  ReviewCreateResponse, 
  ReviewUpdateRequest, 
  ReviewUpdateResponse, 
  ReviewListParams,
  ReviewListResponse, 
  ReviewDeleteResponse 
} from '../types/reviews';

/**
 * 리뷰 관련 API 서비스 클래스
 *
 * Review API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 모든 메서드는 적절한 에러 처리와 타입 안전성을 보장합니다.
 * 
 * API 명세: docs/api/Review API 문서.md
 * Requirements: 2.6
 * 
 * 참고: 백엔드 API 구현 후 실제 연동 필요
 */
export class ReviewService {
  /**
   * 행사별 리뷰 목록 조회
   * GET /api/reviews
   *
   * 특정 행사의 리뷰 목록을 조회합니다.
   * 최신순(created_at DESC)으로 정렬됩니다.
   *
   * @param params 조회 파라미터 (event_id 필수)
   * @returns 리뷰 목록과 페이지네이션 정보
   * @throws {Error} 400 - event_id 파라미터가 필요합니다
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   */
  static async getReviews(
    params: ReviewListParams
  ): Promise<ReviewListResponse> {
    const response = await apiClient.get<ReviewListResponse>('/api/reviews', {
      params,
    });
    return response.data;
  }

  /**
   * 리뷰 작성
   * POST /api/reviews/
   *
   * 새로운 리뷰를 작성합니다.
   *
   * 비즈니스 로직:
   * - 로그인한 사용자만 가능
   * - approved 상태의 행사만 작성 가능
   * - 리뷰 작성 시 average_rating 자동 업데이트
   * - 평점은 1-5 정수만 허용
   *
   * @param data 리뷰 작성 데이터
   * @returns 생성된 리뷰 정보
   * @throws {Error} 400 - 필수 필드 누락 또는 평점 유효성 오류
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 승인된 행사에만 리뷰를 작성할 수 있습니다
   * @throws {Error} 404 - 행사를 찾을 수 없습니다
   */
  static async createReview(
    data: ReviewCreateRequest
  ): Promise<ReviewCreateResponse> {
    const response = await apiClient.post<ReviewCreateResponse>(
      '/api/reviews/',
      data
    );
    return response.data;
  }
  /**
   * 리뷰 수정
   * PUT /api/reviews/{id}
   *
   * 리뷰를 수정합니다.
   * 본인이 작성한 리뷰만 수정 가능하며, 평점 변경 시 average_rating이 자동으로 재계산됩니다.
   * 모든 필드는 선택적입니다.
   *
   * @param id 리뷰 ID
   * @param data 수정할 데이터
   * @returns 수정된 리뷰 정보
   * @throws {Error} 400 - 평점 유효성 오류
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 리뷰를 수정할 권한이 없습니다
   * @throws {Error} 404 - 리뷰를 찾을 수 없습니다
   */
  static async updateReview(
    id: number,
    data: ReviewUpdateRequest
  ): Promise<ReviewUpdateResponse> {
    const response = await apiClient.put<ReviewUpdateResponse>(
      `/api/reviews/${id}`,
      data
    );
    return response.data;
  }

  /**
   * 리뷰 삭제
   * DELETE /api/reviews/{id}
   *
   * 리뷰를 삭제합니다.
   * 본인이 작성한 리뷰 또는 관리자만 삭제 가능하며, 삭제 시 average_rating이 자동으로 재계산됩니다.
   *
   * @param id 리뷰 ID
   * @returns 삭제 성공 메시지
   * @throws {Error} 401 - 로그인이 필요합니다
   * @throws {Error} 403 - 리뷰를 삭제할 권한이 없습니다
   * @throws {Error} 404 - 리뷰를 찾을 수 없습니다
   */
  static async deleteReview(id: number): Promise<ReviewDeleteResponse> {
    const response = await apiClient.delete<ReviewDeleteResponse>(
      `/api/reviews/${id}`
    );
    return response.data;
  }
  /**
   * 내 작성 리뷰 목록 조회
   * GET /api/reviews/me
   *
   * 현재 사용자가 작성한 리뷰 목록을 조회합니다.
   *
   * @param _userId 사용자 ID (사용되지 않음, 세션 기반)
   * @param page 페이지 번호
   * @param perPage 페이지당 항목 수
   * @returns 리뷰 목록과 페이지네이션 정보
   */
  static async getMyReviews(
    _userId?: number,
    page?: number,
    perPage?: number
  ): Promise<ReviewListResponse> {
    const response = await apiClient.get<ReviewListResponse>(
      '/api/reviews/me',
      {
        params: { page, per_page: perPage },
      }
    );
    return response.data;
  }
}