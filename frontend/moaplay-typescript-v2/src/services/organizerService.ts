/**
 * 주최자 인증 관련 API 서비스
 * 
 * 주최자 인증 신청, 상태 조회, 관리자 승인/거절 등의 API를 호출합니다.
 */

import { apiClient } from './core/axios';

export interface OrganizerApplicationRequest {
  official_email: string;
  contact_number: string;
  business_number?: string;
  company_name?: string;
  document_urls: string[];
}

export interface OrganizerApplication {
  id: number;
  user_id: number;
  official_email: string;
  contact_number: string;
  business_number?: string;
  company_name?: string;
  document_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    nickname: string;
    email: string;
    role: string;
  };
  reviewer?: {
    id: number;
    nickname: string;
    email: string;
  };
}

export interface ApplicationStatusResponse {
  has_application: boolean;
  application?: OrganizerApplication;
  user_role: string;
  can_apply: boolean;
}

export interface ApplicationListResponse {
  items: OrganizerApplication[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
  };
}

export interface ApplicationReviewRequest {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}
export class OrganizerService {
  /**
   * 주최자 인증을 신청합니다
   * 
   * @param data 신청 데이터
   * @param documents 업로드할 문서 파일 배열 (선택)
   * @returns 신청 결과
   */
  static async applyOrganizer(data: OrganizerApplicationRequest, documents?: File[]) {
    // 문서 파일이 있으면 multipart/form-data로 전송
    if (documents && documents.length > 0) {
      const formData = new FormData();
      
      // 문서 파일 추가
      documents.forEach((doc) => {
        formData.append('documents', doc);
      });
      
      // 나머지 데이터를 JSON 문자열로 추가
      formData.append('data', JSON.stringify(data));
      
      const response = await apiClient.post('/api/organizer/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // 문서가 없으면 일반 JSON으로 전송
    const response = await apiClient.post('/api/organizer/apply', data);
    return response.data;
  }

  /**
   * 내 인증 신청 상태를 조회합니다
   * 
   * @returns 신청 상태 정보
   */
  static async getApplicationStatus(): Promise<{ data: ApplicationStatusResponse }> {
    const response = await apiClient.get('/api/organizer/status');
    return response.data;
  }

  /**
   * 인증 신청 목록을 조회합니다 (관리자)
   * 
   * @param params 조회 파라미터
   * @returns 신청 목록
   */
  static async getApplications(params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    page?: number;
    limit?: number;
  }): Promise<{ data: ApplicationListResponse }> {
    const response = await apiClient.get('/api/organizer/applications', { params });
    return response.data;
  }

  /**
   * 주최자 인증을 승인하거나 거절합니다 (관리자)
   * 
   * @param applicationId 신청 ID
   * @param reviewData 검토 데이터
   * @returns 처리 결과
   */
  static async reviewApplication(
    applicationId: number, 
    reviewData: ApplicationReviewRequest
  ) {
    const response = await apiClient.put(
      `/api/organizer/${applicationId}/review`, 
      reviewData
    );
    return response.data;
  }
  /**
   * 신청을 승인합니다 (관리자)
   * 
   * @param applicationId 신청 ID
   * @returns 승인 결과
   */
  static async approveApplication(applicationId: number) {
    return this.reviewApplication(applicationId, { action: 'approve' });
  }

  /**
   * 신청을 거절합니다 (관리자)
   * 
   * @param applicationId 신청 ID
   * @param reason 거절 사유
   * @returns 거절 결과
   */
  static async rejectApplication(applicationId: number, reason: string) {
    return this.reviewApplication(applicationId, { 
      action: 'reject', 
      rejection_reason: reason 
    });
  }
}