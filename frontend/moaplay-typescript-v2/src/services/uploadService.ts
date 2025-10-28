/**
 * 파일 업로드 관련 API 서비스
 * 
 * 이미지 업로드 기능을 제공합니다.
 * Backend의 upload.py API와 매핑됩니다.
 * 
 * API 엔드포인트: POST /api/upload/image
 */

import { apiClient } from './core/axios';

/**
 * 업로드 진행률 콜백 타입
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 파일 업로드 서비스 클래스
 * 
 * Upload API 엔드포인트와 매핑되는 메서드를 제공합니다.
 */
export class UploadService {
  /**
   * 단일 이미지 업로드
   * POST /api/upload/image
   * 
   * @param file 업로드할 이미지 파일
   * @param onProgress 진행률 콜백 함수
   * @returns 업로드된 이미지 URL
   */
  static async uploadImage(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ url: string }>('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * 다중 이미지 업로드
   * POST /api/upload/image (여러 파일을 'images' 필드로 전송)
   * 
   * @param files 업로드할 이미지 파일 배열
   * @param onProgress 진행률 콜백 함수
   * @returns 업로드된 이미지 URL 배열
   */
  static async uploadMultipleImages(
    files: File[],
    onProgress?: UploadProgressCallback
  ): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<{ urls: string[]; count: number }>('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return { urls: response.data.urls };
  }

  /**
   * 이미지 삭제
   * DELETE /api/upload/image
   * 
   * @param url 삭제할 이미지 URL
   */
  static async deleteImage(url: string): Promise<void> {
    await apiClient.delete('/api/upload/image', {
      data: { url },
    });
  }
  /**
   * 이미지 업로드 (진행률 포함) - 별칭
   * 
   * @param file 업로드할 이미지 파일
   * @param onProgress 진행률 콜백 함수
   * @returns 업로드된 이미지 URL
   */
  static async uploadImageWithProgress(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<{ url: string }> {
    return this.uploadImage(file, onProgress);
  }

  /**
   * 파일 크기 포맷팅
   * 
   * @param bytes 바이트 크기
   * @returns 포맷된 문자열 (예: "1.5 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
