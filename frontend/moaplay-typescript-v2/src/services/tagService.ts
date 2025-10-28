/**
 * 태그 관련 API 서비스
 * 
 * 행사 태그 생성 및 관리 기능 API 호출을 담당합니다.
 * 
 * API 문서: docs/api/Tag API 문서.md
 * Base URL: /api/tags
 * 
 * 현재 상태: 태그는 Event API를 통해 자동으로 생성 및 관리됩니다.
 */

import { apiClient } from './core/axios';
import { 
  TagListParams,
  TagListResponse
} from '../types/tags';

/**
 * 태그 서비스 클래스
 * 
 * Tag API 엔드포인트와 매핑되는 메서드를 제공합니다.
 * 
 * API 명세: docs/api/Tag API 문서.md
 * Requirements: 2.4
 * 
 * 참고: 현재 태그는 Event API를 통해 자동으로 생성됩니다.
 * 독립적인 Tag API는 향후 구현 예정입니다.
 */
export class TagService {
  /**
   * 태그 목록 조회 (향후 구현 예정)
   * GET /api/tags
   * 
   * 태그 목록을 조회합니다.
   * 인기순, 최신순, 이름순으로 정렬 가능합니다.
   * 
   * @param params 조회 파라미터 (page, limit, sort)
   * @returns 태그 목록과 페이지네이션 정보
   */
  static async getTags(params?: TagListParams): Promise<TagListResponse> {
    const response = await apiClient.get<TagListResponse>('/api/tags', { params });
    return response.data;
  }
}
