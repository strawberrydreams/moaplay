/**
 * 검색 관련 API 서비스
 *
 * 통합 검색, 검색 히스토리, 자동완성 등의 검색 기능을 제공합니다.
 * 행사명, 해시태그, 지역 등 다양한 검색 타입을 지원합니다.
 */

import { apiClient } from './core/axios';
import { SearchParams } from '../types';
import { EventListItem } from '../types/events';

/**
 * 검색 결과 응답 타입
 */
export interface SearchResponse {
  items: EventListItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
  };
  search_info: {
    query: string;
    parsed_query: {
      type: 'text' | 'hashtag' | 'location' | 'mixed';
      text?: string[];
      tags?: string[];
      location?: string;
    };
    total_results: number;
    search_time: number;
  };
}

/**
 * 검색 제안 응답 타입
 */
export interface SearchSuggestion {
  text: string;
  type: 'event' | 'tag' | 'location';
  count?: number;
}

/**
 * 검색 히스토리 항목 타입
 */
export interface SearchHistoryItem {
  id: number;
  query: string;
  result_count: number;
  search_type: 'text' | 'hashtag' | 'location' | 'mixed';
  created_at: string;
}
/**
 * 검색 서비스 클래스
 *
 * 모든 검색 관련 API 호출을 담당합니다.
 */
export class SearchService {
  /**
   * 통합 검색 실행
   *
   * @param query 검색어 (행사명, #해시태그, 지역명 혼합 가능)
   * @param params 추가 검색 파라미터 (필터, 정렬, 페이지네이션)
   * @returns 검색 결과와 메타데이터
   */
  static async search(
    query: string,
    params: SearchParams = {}
  ): Promise<SearchResponse> {
    try {
      const response = await apiClient.get('/api/search', {
        params: {
          query: query.trim(),
          ...params,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  /**
   * 검색 자동완성 제안 조회
   *
   * @param query 입력 중인 검색어
   * @param limit 제안 개수 제한 (기본값: 10)
   * @returns 자동완성 제안 목록
   */
  static async getSuggestions(
    query: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      if (query.length < 2) {
        return [];
      }

      const response = await apiClient.get('/api/search/suggestions', {
        params: {
          query: query.trim(),
          limit,
        },
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * 검색 히스토리 조회
   *
   * @param limit 조회할 히스토리 개수 (기본값: 10)
   * @returns 사용자의 검색 히스토리 목록
   */
  static async getSearchHistory(
    limit: number = 10
  ): Promise<SearchHistoryItem[]> {
    try {
      const response = await apiClient.get('/api/search/history', {
        params: { limit },
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * 검색 히스토리에 저장
   *
   * @param query 검색어
   * @param resultCount 검색 결과 개수
   */
  static async saveToHistory(
    query: string,
    resultCount: number = 0
  ): Promise<void> {
    try {
      await apiClient.post('/api/search/history', {
        query: query.trim(),
        result_count: resultCount,
      });
    } catch (error) {
      // 히스토리 저장 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
      console.warn('Failed to save search history:', error);
    }
  }

  /**
   * 검색 히스토리 항목 삭제
   *
   * @param historyId 삭제할 히스토리 항목 ID
   */
  static async deleteHistoryItem(historyId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/search/history/${historyId}`);
    } catch (error) {
      console.error('Failed to delete search history item:', error);
      throw error;
    }
  }

  /**
   * 전체 검색 히스토리 삭제
   */
  static async clearSearchHistory(): Promise<void> {
    try {
      await apiClient.delete('/api/search/history');
    } catch (error) {
      console.error('Failed to clear search history:', error);
      throw error;
    }
  }
  /**
   * 검색어 파싱 유틸리티
   *
   * @param query 원본 검색어
   * @returns 파싱된 검색어 정보
   */
  static parseQuery(query: string): {
    type: 'text' | 'hashtag' | 'location' | 'mixed';
    text: string[];
    tags: string[];
    location: string | null;
  } {
    const trimmedQuery = query.trim();

    // 해시태그 추출 (#태그명)
    const hashtagMatches = trimmedQuery.match(/#[\w가-힣]+/g) || [];
    const tags = hashtagMatches.map(tag => tag.substring(1)); // # 제거

    // 해시태그를 제거한 나머지 텍스트
    const textWithoutHashtags = trimmedQuery.replace(/#[\w가-힣]+/g, '').trim();

    // 지역명 패턴 (간단한 예시 - 실제로는 더 정교한 로직 필요)
    const locationPatterns = [
      /서울/g,
      /부산/g,
      /대구/g,
      /인천/g,
      /광주/g,
      /대전/g,
      /울산/g,
      /세종/g,
      /경기/g,
      /강원/g,
      /충북/g,
      /충남/g,
      /전북/g,
      /전남/g,
      /경북/g,
      /경남/g,
      /제주/g,
      /강남/g,
      /홍대/g,
      /명동/g,
      /이태원/g,
      /압구정/g,
    ];

    let location: string | null = null;
    let textWithoutLocation = textWithoutHashtags;

    for (const pattern of locationPatterns) {
      const matches = textWithoutHashtags.match(pattern);
      if (matches && matches.length > 0) {
        location = matches[0];
        textWithoutLocation = textWithoutHashtags.replace(pattern, '').trim();
        break;
      }
    }

    // 남은 텍스트를 단어로 분리
    const text = textWithoutLocation
      .split(/\s+/)
      .filter(word => word.length > 0);

    // 검색 타입 결정
    let type: 'text' | 'hashtag' | 'location' | 'mixed';
    if (tags.length > 0 && text.length > 0) {
      type = 'mixed';
    } else if (tags.length > 0) {
      type = 'hashtag';
    } else if (location) {
      type = 'location';
    } else {
      type = 'text';
    }

    return {
      type,
      text,
      tags,
      location,
    };
  }
}