/**
 * 사용자 데이터 노멀라이저
 * 
 * 백엔드 User API 응답을 프론트엔드 UI에서 사용하기 좋은 ViewModel로 변환합니다.
 * 사용자 정보, 통계 정보, 프로필 이미지 등을 UI 친화적인 형태로 정규화합니다.
 */

import { 
  UserMeResponse, 
  UserStatistics,
  UserRole
} from '../types/users';

/**
 * 내 프로필 ViewModel
 * 본인 정보 조회 시 사용 (민감한 정보 포함)
 */
export interface MyProfileViewModel {
  id: number;
  userId: string;
  nickname: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  role: UserRole;
  roleDisplayName: string;
  isVerifiedHost: boolean;
  createdAt: Date;
  updatedAt: Date;
  displayCreatedAt: string;
  statistics: {
    eventsCount: number;
    favoritesCount: number;
    reviewsCount: number;
    totalActivities: number;
  };
}
/**
 * 사용자 데이터 노멀라이저 클래스
 */
export class UserNormalizer {
  /**
   * 내 정보 API 응답을 ViewModel로 변환
   * @param apiUser API 응답 데이터
   * @returns 내 프로필 ViewModel
   */
  static toMyProfileViewModel(apiUser: UserMeResponse): MyProfileViewModel {
    return {
      id: apiUser.id,
      userId: apiUser.user_id,
      nickname: apiUser.nickname,
      email: apiUser.email,
      phone: apiUser.phone,
      profileImage: apiUser.profile_image,
      role: apiUser.role,
      roleDisplayName: this.getRoleDisplayName(apiUser.role),
      isVerifiedHost: apiUser.role === 'host',
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at),
      displayCreatedAt: this.formatDisplayDate(apiUser.created_at),
      statistics: this.normalizeStatistics(apiUser.statistics),
    };
  }
  /**
   * 사용자 통계 정보를 정규화 (본인 조회 시)
   * @param statistics API 통계 정보
   * @returns 정규화된 통계 정보
   */
  private static normalizeStatistics(statistics: UserStatistics) {
    return {
      eventsCount: statistics.events_count,
      favoritesCount: statistics.favorites,
      reviewsCount: statistics.reviews,
      totalActivities: statistics.events_count + statistics.favorites + statistics.reviews,
    };
  }
  /**
   * 사용자 역할을 표시용 문자열로 변환
   * @param role 사용자 역할
   * @returns 표시용 역할 이름
   */
  private static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'host':
        return '인증된 주최자';
      case 'user':
      default:
        return '일반 사용자';
    }
  }
  /**
   * 날짜를 표시용 형식으로 포맷팅
   * @param dateString 날짜 문자열
   * @returns 포맷팅된 날짜
   */
  private static formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}