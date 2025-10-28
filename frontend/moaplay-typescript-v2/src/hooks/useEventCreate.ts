/**
 * 행사 생성 커스텀 훅
 * 
 * 행사 생성과 관련된 비즈니스 로직을 처리합니다.
 * 이미지 업로드, 태그 처리, 폼 검증 등을 포함합니다.
 */

import { useState, useCallback, useRef } from 'react';
import { EventService, CreateEventRequest } from '../services/eventService';
import { EventDetailResponse } from '../types/events';

/**
 * 행사 생성 훅 반환 타입
 */
interface UseEventCreateReturn {
  createEvent: (
    eventData: CreateEventRequest, 
    images: File[], 
    tags: string[]
  ) => Promise<EventDetailResponse>;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

/**
 * 행사 생성 커스텀 훅
 */
export const useEventCreate = (): UseEventCreateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 중복 실행 방지 플래그
  const isCreatingRef = useRef(false);

  /**
   * 이미지 검증 처리
   */
  const validateImages = (images: File[]): void => {
    if (images.length === 0) return;

    // 이미지 개수 검증
    if (images.length > 10) {
      throw new Error('이미지는 최대 10개까지 업로드할 수 있습니다.');
    }

    // 각 이미지 파일 검증
    images.forEach((image, index) => {
      // 파일 크기 검증 (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (image.size > maxSize) {
        throw new Error(`이미지 ${index + 1}의 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.`);
      }

      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        throw new Error(`이미지 ${index + 1}은(는) 지원하지 않는 형식입니다. JPEG, PNG, GIF, WebP 파일만 업로드 가능합니다.`);
      }
    });
  };

  /**
   * 태그 처리 (향후 태그 API 연동 시 사용)
   */
  const processTags = async (tags: string[]): Promise<string[]> => {
    // 현재는 단순히 태그 배열을 반환
    // 향후 태그 API가 구현되면 여기서 태그 생성/조회 로직 추가
    return tags.filter(tag => tag.trim().length > 0);
  };

  /**
   * 행사 생성 메인 함수
   */
  const createEvent = useCallback(async (
    eventData: CreateEventRequest,
    images: File[],
    tags: string[]
  ): Promise<EventDetailResponse> => {
    // 이미 실행 중이면 중단
    if (isCreatingRef.current) {
      throw new Error('행사 등록이 이미 진행 중입니다.');
    }
    
    isCreatingRef.current = true;
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. 이미지 검증 (10% 진행률)
      validateImages(images);
      setUploadProgress(10);

      // 2. 이미지 업로드 (별도 API 사용)
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadProgress(20);
        const { UploadService } = await import('../services/uploadService');
        const uploadResult = await UploadService.uploadMultipleImages(images, (progress) => {
          // 20% ~ 60% 범위로 진행률 매핑
          setUploadProgress(20 + (progress * 0.4));
        });
        imageUrls = uploadResult.urls;
        setUploadProgress(60);
      }

      // 3. 태그 처리 (70% 진행률)
      await processTags(tags);
      setUploadProgress(70);

      // 4. 행사 생성 API 호출 (이미지 URL 포함)
      const createRequest: CreateEventRequest = {
        ...eventData,
        image_urls: imageUrls
      };
      setUploadProgress(80);
      const createdEvent = await EventService.createEvent(createRequest);
      setUploadProgress(90);

      // 5. 태그 연결 (향후 구현 예정)
      // TODO: 행사-태그 연결 API 호출
      setUploadProgress(95);

      // 6. 완료 (100% 진행률)
      setUploadProgress(100);

      return createdEvent;
    } catch (error: unknown) {
      console.error('Event creation failed:', error);
      
      // 에러 메시지 처리
      let errorMessage = '행사 등록에 실패했습니다.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { error?: { message?: string } } } };
        if (responseError.response?.data?.error?.message) {
          errorMessage = responseError.response.data.error.message;
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      isCreatingRef.current = false; // 플래그 해제
    }
  }, []);

  return {
    createEvent,
    isLoading,
    error,
    uploadProgress
  };
};

/**
 * 행사 수정 커스텀 훅 (향후 구현 예정)
 */
export const useEventUpdate = (eventId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEvent = useCallback(async (
    eventData: Partial<CreateEventRequest>,
    newImages?: File[],
    removedImageUrls?: string[]
  ): Promise<EventDetailResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 새 이미지 검증
      if (newImages && newImages.length > 0) {
        validateImages(newImages);
      }

      // 2. 새 이미지 업로드 (별도 API 사용)
      let newImageUrls: string[] = [];
      if (newImages && newImages.length > 0) {
        const { UploadService } = await import('../services/uploadService');
        const uploadResult = await UploadService.uploadMultipleImages(newImages);
        newImageUrls = uploadResult.urls;
      }

      // 3. 기존 이미지 URL 처리 (제거할 이미지 필터링)
      const currentImageUrls = eventData.image_urls || [];
      const filteredImageUrls = currentImageUrls.filter(
        url => !removedImageUrls?.includes(url)
      );

      // 4. 최종 이미지 URL 배열 (기존 + 새로 업로드)
      const finalImageUrls = [...filteredImageUrls, ...newImageUrls];

      // 5. 행사 수정 API 호출 (이미지 URL 포함)
      const updateRequest: Partial<CreateEventRequest> = {
        ...eventData,
        image_urls: finalImageUrls
      };

      const updatedEvent = await EventService.updateEvent(eventId, updateRequest);

      // 6. 제거된 이미지 삭제 (선택적)
      if (removedImageUrls && removedImageUrls.length > 0) {
        const { UploadService } = await import('../services/uploadService');
        for (const url of removedImageUrls) {
          try {
            await UploadService.deleteImage(url);
          } catch (error) {
            console.warn('Failed to delete image:', url, error);
          }
        }
      }

      // 7. 태그 업데이트 (향후 구현 예정)
      // TODO: 행사-태그 업데이트 API 호출

      return updatedEvent;
    } catch (error: unknown) {
      console.error('Event update failed:', error);
      
      let errorMessage = '행사 수정에 실패했습니다.';
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { error?: { message?: string } } } };
        if (responseError.response?.data?.error?.message) {
          errorMessage = responseError.response.data.error.message;
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  return {
    updateEvent,
    isLoading,
    error
  };
};

/**
 * 이미지 유효성 검사
 */
function validateImages(images: File[]): string | null {
  if (images.length === 0) {
    return '최소 1개의 이미지를 업로드해야 합니다.';
  }
  if (images.length > 5) {
    return '최대 5개의 이미지만 업로드할 수 있습니다.';
  }
  for (const image of images) {
    if (image.size > 5 * 1024 * 1024) {
      return '이미지 크기는 5MB를 초과할 수 없습니다.';
    }
  }
  return null;
}