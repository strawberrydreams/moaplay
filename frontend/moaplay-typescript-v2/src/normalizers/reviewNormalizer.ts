/**
 * 리뷰 데이터 노멀라이저
 * 
 * 백엔드 API 응답을 UI에서 사용하기 좋은 ViewModel로 변환합니다.
 */

/**
 * 리뷰 ViewModel 인터페이스
 */
export interface ReviewViewModel {
  id: number;
  title: string;
  content: string;
  rating: number;
  ratingStars: string;
  ratingText: string;
  imageUrls: string[];
  user: {
    id: number;
    nickname: string;
    profileImage: string | null;
  };
  event: {
    id: number;
    title: string;
  };
  displayDate: string;
  relativeTime: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}
/**
 * 리뷰 데이터 노멀라이저 클래스
 */
export class ReviewNormalizer {
  /**
   * 날짜를 상대적 시간으로 포맷팅
   * @param dateString 날짜 문자열
   * @returns 상대적 시간 문자열
   */
  static formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}주 전`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}년 전`;
  }
}