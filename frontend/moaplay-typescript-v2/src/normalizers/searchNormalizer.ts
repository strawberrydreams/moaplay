/**
 * 검색 결과 데이터 노멀라이저
 *
 * 백엔드 검색 API 응답을 프론트엔드에서 사용하기 좋은 형태로 변환합니다.
 * 검색 결과, 메타데이터, 필터 정보 등을 UI 친화적인 형태로 정규화합니다.
 */

import { SearchResponse } from '../services/searchService';
import { EventListItem } from '../types/events';
import { EventNormalizer } from './eventNormalizer';

/**
 * 검색 결과 뷰모델
 */
export interface SearchResultViewModel {
  items: ReturnType<typeof EventNormalizer.toCardViewModel>[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  searchInfo: {
    query: string;
    parsedQuery: {
      type: 'text' | 'hashtag' | 'location' | 'mixed';
      text?: string[];
      tags?: string[];
      location?: string;
    };
    totalResults: number;
    searchTime: number;
    isEmpty: boolean;
  };
  filters: {
    appliedFilters: string[];
    availableFilters: {
      regions: string[];
      tags: string[];
      dateRanges: string[];
    };
  };
}
/**
 * 검색 노멀라이저 클래스
 */
export class SearchNormalizer {
  /**
   * 검색 응답을 뷰모델로 변환
   *
   * @param searchResponse 백엔드 검색 API 응답
   * @param appliedFilters 적용된 필터 목록
   * @returns 검색 결과 뷰모델
   */
  static toSearchResultViewModel(
    searchResponse: SearchResponse,
    appliedFilters: string[] = []
  ): SearchResultViewModel {
    const { items, pagination, search_info } = searchResponse;

    return {
      items: items.map(event => EventNormalizer.toCardViewModel(event)),
      pagination: {
        currentPage: pagination.current_page,
        totalPages: pagination.total_pages,
        totalItems: pagination.total_items,
        limit: pagination.limit,
        hasNext: pagination.current_page < pagination.total_pages,
        hasPrev: pagination.current_page > 1,
      },
      searchInfo: {
        query: search_info.query,
        parsedQuery: search_info.parsed_query,
        totalResults: search_info.total_results,
        searchTime: search_info.search_time,
        isEmpty: search_info.total_results === 0,
      },
      filters: {
        appliedFilters,
        availableFilters: {
          regions: this.extractRegionsFromResults(items),
          tags: this.extractTagsFromResults(items),
          dateRanges: this.generateDateRangeOptions(),
        },
      },
    };
  }
  /**
   * 검색 결과에서 지역 목록 추출
   *
   * @param events 행사 목록
   * @returns 지역 목록
   */
  private static extractRegionsFromResults(events: EventListItem[]): string[] {
    const regions = new Set<string>();

    events.forEach(event => {
      if (event.location) {
        // 간단한 지역 추출 로직 (실제로는 더 정교한 로직 필요)
        const locationParts = event.location.split(' ');
        if (locationParts.length > 0) {
          regions.add(locationParts[0]);
        }
      }
    });

    return Array.from(regions).slice(0, 10); // 최대 10개
  }

  /**
   * 검색 결과에서 태그 목록 추출
   *
   * @param events 행사 목록
   * @returns 태그 목록
   */
  private static extractTagsFromResults(events: EventListItem[]): string[] {
    const tagCounts = new Map<string, number>();

    events.forEach(event => {
      event.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // 빈도순으로 정렬하여 상위 10개 반환
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  /**
   * 날짜 범위 옵션 생성
   *
   * @returns 날짜 범위 옵션 목록
   */
  private static generateDateRangeOptions(): string[] {
    return [
      '오늘',
      '이번 주',
      '이번 달',
      '다음 달',
      '3개월 이내',
      '6개월 이내',
    ];
  }
}