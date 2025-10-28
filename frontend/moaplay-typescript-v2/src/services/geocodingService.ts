/**
 * 지오코딩 서비스
 * 
 * 주소를 좌표로 변환하는 지오코딩 기능을 제공합니다.
 * 백엔드 API를 통해 네이버 지오코딩 API를 호출합니다. (현재 백엔드 API 없음)
 * 
 * 중복 호출 방지 및 디바운스 기능 포함
 */

import { apiClient } from './core/axios';

/**
 * 지오코딩 응답 타입
 */
export interface GeocodingAddress {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  x: string; // 경도
  y: string; // 위도
  distance: number;
}

export interface GeocodingResponse {
  status: string;
  meta: {
    totalCount: number;
    page: number;
    count: number;
  };
  addresses: GeocodingAddress[];
  errorMessage?: string;
}

/**
 * 지오코딩 에러 타입
 */
export interface GeocodingError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 지오코딩 서비스 클래스
 */
export class GeocodingService {
  // 진행 중인 요청을 추적하는 Map (중복 호출 방지)
  private static pendingRequests = new Map<string, Promise<GeocodingResponse>>();

  // 캐시 (선택적)
  private static cache = new Map<string, { data: GeocodingResponse; timestamp: number }>();
  private static CACHE_TTL = 1000 * 60 * 60; // 1시간

  /**
   * 주소를 좌표로 변환 (중복 호출 방지)
   * GET /api/geocode
   * 
   * @param address 변환할 주소 (디코딩된 문자열)
   * @returns 지오코딩 결과
   */
  static async geocode(address: string): Promise<GeocodingResponse> {
    // 주소 전처리 (앞뒤 공백 제거)
    const trimmedAddress = address.trim();
    
    if (!trimmedAddress) {
      throw new Error('주소를 입력해주세요.');
    }
    
    // 캐시 확인
    const cached = this.getFromCache(trimmedAddress);
    if (cached) {
      return cached;
    }

    // 이미 진행 중인 요청이 있으면 재사용
    if (this.pendingRequests.has(trimmedAddress)) {
      return this.pendingRequests.get(trimmedAddress)!;
    }
    
    // 새 요청 생성
    const request = this.executeGeocode(trimmedAddress);
    this.pendingRequests.set(trimmedAddress, request);
    
    try {
      const result = await request;
      
      // 캐시에 저장
      this.setToCache(trimmedAddress, result);
      
      return result;
    } finally {
      // 요청 완료 후 Map에서 제거
      this.pendingRequests.delete(trimmedAddress);
    }
  }

  /**
   * 실제 지오코딩 실행
   * 
   * 중요: axios는 params를 자동으로 URL 인코딩하므로
   * 이미 인코딩된 문자열을 넘기면 이중 인코딩됨
   * 따라서 디코딩된 문자열을 넘겨야 함
   */
  private static async executeGeocode(address: string): Promise<GeocodingResponse> {
    try {
      // axios가 자동으로 인코딩하므로 디코딩된 문자열 전달
      const response = await apiClient.get<GeocodingResponse>('/api/geocode', {
        params: { query: address }
      });
      return response.data;
    } catch (error: unknown) {
      // 에러 상태 코드별 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data?: { error?: GeocodingError } } };
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const errorData = axiosError.response.data?.error;
          
          if (status === 404) {
            // 주소를 찾을 수 없음 (정상적인 "없음" 케이스)
            throw new Error(errorData?.message || '해당 주소를 찾을 수 없습니다. 주소를 다시 확인해주세요.');
          } else if (status === 429) {
            // API 호출 한도 초과
            throw new Error(errorData?.message || 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
          } else if (status >= 500) {
            // 서버 오류
            throw new Error(errorData?.message || '지오코딩 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          } else {
            // 기타 오류
            throw new Error(errorData?.message || '주소 검색에 실패했습니다.');
          }
        }
      }
      
      if (error && typeof error === 'object' && 'request' in error) {
        // 네트워크 오류
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 기타 오류
      const errorMessage = error instanceof Error ? error.message : '주소 검색에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }
  /**
   * 주소를 좌표로 변환하고 첫 번째 결과 반환
   * 
   * @param address 변환할 주소
   * @returns 좌표 정보 또는 null
   * @throws 네이버 API 인증 실패 시 에러 발생
   */
  static async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const result = await this.geocode(address);
      
      if (result.status === 'OK' && result.addresses.length > 0) {
        const firstAddress = result.addresses[0];
        return {
          lat: parseFloat(firstAddress.y),
          lng: parseFloat(firstAddress.x)
        };
      }
      
      return null;
    } catch (error: unknown) {
      console.error('Geocoding failed:', error);
      
      // 네이버 API 인증 실패 시 사용자에게 명확한 메시지 표시
      if (error instanceof Error) {
        if (error.message.includes('네이버 API 인증')) {
          throw new Error(
            '지도 서비스를 일시적으로 사용할 수 없습니다. ' +
            '관리자에게 문의해주세요. (네이버 API 키 갱신 필요)'
          );
        }
      }
      
      return null;
    }
  }
  /**
   * 캐시에서 데이터 조회
   */
  private static getFromCache(address: string): GeocodingResponse | null {
    const cached = this.cache.get(address);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      } else {
        // 만료된 캐시 제거
        this.cache.delete(address);
      }
    }
    return null;
  }

  /**
   * 캐시에 데이터 저장
   */
  private static setToCache(address: string, data: GeocodingResponse): void {
    this.cache.set(address, {
      data,
      timestamp: Date.now()
    });
  }
}
