/**
 * 행사 데이터 노멀라이저
 * 
 * 백엔드 API 응답을 프론트엔드 UI에서 사용하기 좋은 ViewModel로 변환합니다.
 * 날짜 포맷팅, 상태 색상 매핑, 표시용 텍스트 변환 등을 담당합니다.
 */

import { EventDetailResponse, EventListItem, EventStatsInfo } from '../types/events';
import { UserSummary } from '../types';

/**
 * 행사 상세 페이지용 ViewModel
 */
export interface EventDetailViewModel {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  displayDate: string;
  startDate: string;
  endDate: string;
  location?: string;
  imageUrls: string[];
  phone?: string;
  organizer?: string;
  hostedBy?: string;
  viewCount: number;
  status: string;
  statusColor: string;
  host: UserSummary;
  hostId: number;
  tags: string[];
  statistics: {
    averageRating: number;
    totalReviews: number;
    viewCount: number;
    favoritesCount: number;
    schedulesCount: number;
    displayRating: string;
    displayReviews: string;
    displayViews: string;
  };
  isFavorite: boolean;
  isInSchedule: boolean;
  favoriteId?: number;
  scheduleId?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 행사 카드용 ViewModel
 */
export interface EventCardViewModel {
  id: number;
  title: string;
  summary?: string;
  displayDate: string;
  location: string;
  imageUrl?: string;
  host: UserSummary;
  tags: string[];
  statistics: {
    averageRating: number;
    totalReviews: number;
    viewCount: number;
    favoritesCount: number;
    displayRating: string;
    displayViews: string;
  };
  isFavorite: boolean;
  statusColor: string;
}

/**
 * 행사 데이터 노멀라이저 클래스
 */
export class EventNormalizer {
  /**
   * API 응답을 상세 페이지용 ViewModel로 변환
   * @param apiEvent API 응답 데이터
   * @returns 상세 페이지용 ViewModel
   */
  static toDetailViewModel(apiEvent: EventDetailResponse): EventDetailViewModel {
    const stats = this.normalizeStatistics(apiEvent.stats);
    
    return {
      id: apiEvent.id,
      title: apiEvent.title,
      summary: apiEvent.summary || undefined,
      description: apiEvent.description,
      displayDate: this.formatEventDate(apiEvent.start_date, apiEvent.end_date),
      startDate: apiEvent.start_date,
      endDate: apiEvent.end_date,
      location: apiEvent.location,
      imageUrls: apiEvent.image_urls || [],
      phone: apiEvent.phone,
      organizer: apiEvent.organizer || undefined,
      hostedBy: apiEvent.hosted_by || undefined,
      viewCount: apiEvent.stats.view_count,
      status: apiEvent.status,
      statusColor: this.getStatusColor(apiEvent.status),
      host: {
        id: apiEvent.host.id,
        nickname: apiEvent.host.nickname,
        role: 'user' as const, // EventHostInfo doesn't include role, default to 'user'
      },
      hostId: apiEvent.host.id,
      tags: apiEvent.tags || [],
      statistics: stats,
      isFavorite: false, // 별도 API로 확인 필요
      isInSchedule: false, // 별도 API로 확인 필요
      createdAt: new Date(apiEvent.created_at),
      updatedAt: new Date(apiEvent.updated_at)
    };
  }

  /**
   * API 응답을 카드용 ViewModel로 변환
   * @param apiEvent API 응답 데이터
   * @returns 카드용 ViewModel
   */
  static toCardViewModel(apiEvent: EventListItem): EventCardViewModel {
    const stats = this.normalizeStatistics(apiEvent.stats);
    
    return {
      id: apiEvent.id,
      title: apiEvent.title,
      summary: apiEvent.summary || undefined,
      displayDate: this.formatEventDate(apiEvent.start_date, apiEvent.start_date), // 목록에는 end_date 없음
      location: apiEvent.location || '장소 미정',
      imageUrl: apiEvent.image_urls?.[0],
      host: {
        id: apiEvent.host.id,
        nickname: apiEvent.host.nickname,
        role: 'user' as const, // EventHostInfo doesn't include role, default to 'user'
      },
      tags: apiEvent.tags || [],
      statistics: stats,
      isFavorite: false, // 별도 API로 확인 필요
      statusColor: this.getStatusColor(apiEvent.status)
    };
  }
  /**
   * 행사 통계 정보를 정규화
   * @param stats API 통계 정보
   * @returns 정규화된 통계 정보
   */
  private static normalizeStatistics(stats: EventStatsInfo) {
    return {
      averageRating: stats.average_rating,
      totalReviews: stats.total_reviews,
      viewCount: stats.view_count,
      favoritesCount: stats.favorites_count,
      schedulesCount: stats.schedules_count,
      displayRating: this.formatRating(stats.average_rating, stats.total_reviews),
      displayReviews: this.formatReviewCount(stats.total_reviews),
      displayViews: this.formatViewCount(stats.view_count),
    };
  }

  /**
   * 평점을 표시용 문자열로 포맷팅
   * @param rating 평점
   * @param reviewCount 리뷰 수
   * @returns 포맷팅된 평점 문자열
   */
  private static formatRating(rating: number, reviewCount: number): string {
    if (reviewCount === 0) {
      return '평가 없음';
    }
    return `⭐ ${rating.toFixed(1)} (${reviewCount}개)`;
  }

  /**
   * 리뷰 수를 표시용 문자열로 포맷팅
   * @param count 리뷰 수
   * @returns 포맷팅된 리뷰 수 문자열
   */
  private static formatReviewCount(count: number): string {
    if (count === 0) {
      return '리뷰 없음';
    }
    return `리뷰 ${count.toLocaleString('ko-KR')}개`;
  }

  /**
   * 행사 날짜를 표시용 문자열로 포맷팅
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 포맷팅된 날짜 문자열
   */
  private static formatEventDate(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    };

    // 같은 날인 경우
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('ko-KR', formatOptions);
    }

    // 다른 날인 경우
    const startStr = start.toLocaleDateString('ko-KR', formatOptions);
    const endStr = end.toLocaleDateString('ko-KR', formatOptions);
    return `${startStr} ~ ${endStr}`;
  }

  /**
   * 행사 상태에 따른 색상 반환
   * @param status 행사 상태
   * @returns 상태 색상
   */
  private static getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return '#28a745'; // 승인됨: 초록색
      case 'pending':
        return '#ffc107'; // 대기중: 노란색
      case 'modified':
        return '#fd7e14'; // 수정됨: 주황색
      case 'rejected':
        return '#dc3545'; // 거절됨: 빨간색
      default:
        return '#6c757d'; // 기본: 회색
    }
  }
  /**
   * 조회수를 표시용 문자열로 포맷팅
   * 서버 값과 정확히 일치하도록 숫자 포맷팅만 적용 (1,234 형식)
   * @param viewCount 조회수
   * @returns 포맷팅된 조회수 문자열
   */
  static formatViewCount(viewCount: number): string {
    return viewCount.toLocaleString('ko-KR');
  }
}