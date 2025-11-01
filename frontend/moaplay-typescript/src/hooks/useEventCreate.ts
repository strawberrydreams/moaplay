import { useState, useCallback, useRef } from 'react';
import * as E from '../types/events'; // 임포트 이름 바꿔서 DOM Event 충돌 회피 (Event 이름이 여러 곳에서 겹침)
import { uploadImages } from '../services/uploadApi';
import { createEvent as createEventApi, updateEvent as updateEventApi } from '../services/eventsApi';

// 행사 생성 후크 타입
interface UseEventCreateReturn {
    createEvent: (
        eventData: E.CreateEventPayload,
        images: File[],
        tags: string[]
    ) => Promise<E.Event>;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;
}

// 이미지 유효성 검사 (백엔드 명세에 맞춰 5개/5MB, 확장자를 JPEG, PNG, GIF, WEBP로 제한)
// 유효하지 않으면 에러 메시지를 반환, 유효하면 null 반환
function validateImages(images: File[]): string | null {
    if (images.length === 0) return null; // 이미지는 선택 사항
    if (images.length > 5) return '최대 5개의 이미지만 업로드할 수 있습니다.';
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const image of images) {
        if (image.size > maxSize) return '이미지 크기는 5MB를 초과할 수 없습니다.';
        if (!allowedTypes.includes(image.type)) return 'JPEG, PNG, GIF, WebP 파일만 업로드 가능합니다.';
    }
    return null;
}

// 태그 처리 (별도 태그 API가 없으므로 프론트엔드 부분 정제만 수행)
// TODO: 태그 API가 추가되면 API에서 받아오도록 수정
const processTags = async (tags: string[]): Promise<string[]> => {
    return tags.map(t => t.trim()).filter(Boolean);
};

// 행사 생성 후크
export const useEventCreate = (): UseEventCreateReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const isCreatingRef = useRef(false); // 중복 실행 방지

    const createEvent = useCallback(async (
        eventData: E.CreateEventPayload,
        images: File[],
        tags: string[]
    ): Promise<E.Event> => {
        if (isCreatingRef.current) {
            throw new Error('행사 등록이 이미 진행 중입니다.');
        }

        isCreatingRef.current = true;
        setIsLoading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // 1. 이미지 검증 (10%)
            const validationMsg = validateImages(images);
            if (validationMsg) throw new Error(validationMsg);
            setUploadProgress(10);

            // 2. 이미지 업로드 (20% → 60%)
            let imageUrls: string[] = [];
            if (images.length > 0) {
                setUploadProgress(20);
                // 현재 uploadApi는 진행률 콜백을 받지 않으므로 구간 진행률만 반영
                const { urls } = await uploadImages(images);
                imageUrls = urls;
                setUploadProgress(60);
            }

            // 3. 태그 정제 (70%) — 별도 API 없음
            const cleanedTags = await processTags(tags);
            setUploadProgress(70);

            // 안전 장치 설정 (hosted_by가 문자열이 아니라서 500 오류 터지는 거 방지)
            const toStr = (v: any): string | undefined => {
              if (v == null) return undefined;
              if (Array.isArray(v)) return v.filter(Boolean).map(String).join(', ');
              if (typeof v === 'string') return v.trim();
              return String(v);
            };
            const toYMD = (v: any): string | undefined => {
              if (!v) return undefined;
              if (typeof v === 'string') return v.slice(0, 10); // assume 'YYYY-MM-DD' or ISO
              if (v instanceof Date) {
                const y = v.getFullYear();
                const m = String(v.getMonth() + 1).padStart(2, '0');
                const d = String(v.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
              }
              return undefined;
            };

            // 4. 행사 생성 API 호출 (이미지 URL 포함)
            const {
                title, summary, organizer, hosted_by,
                start_date, end_date, location, description, phone,
            } = eventData as any;
            const createRequest: E.CreateEventPayload = {
              title: toStr(title)!,
              summary: toStr(summary),
              organizer: toStr(organizer),
              hosted_by: toStr(hosted_by ?? (eventData as any).hostedBy ?? (eventData as any).host),
              start_date: toYMD(start_date ?? (eventData as any).startDate)!,
              end_date: toYMD(end_date ?? (eventData as any).endDate)!,
              location: toStr(location)!,
              description: toStr(description)!,
              phone: toStr(phone ?? (eventData as any).phoneNumber)!,
              image_urls: imageUrls,
              tag_names: cleanedTags,
            };

            // quick client-side guard for required fields
            if (!createRequest.title || !createRequest.start_date || !createRequest.end_date || !createRequest.location || !createRequest.description || !createRequest.phone) {
              throw new Error('필수 항목이 비었습니다. 제목, 시작일, 종료일, 장소, 설명, 연락처를 다시 확인해줘.');
            }

            setUploadProgress(80);
            const createdEvent = await createEventApi(createRequest) as unknown as E.Event;
            // 5. 행사 생성 API 요청까지 보냈다면 100%
            setUploadProgress(100);

            return createdEvent;
        } catch (err: unknown) {
            console.error('Event creation failed:', err);
            let errorMessage = '행사 등록에 실패했습니다.';

            if (err && typeof err === 'object' && 'response' in err) {
                const responseError = err as { response?: { data?: { error?: { message?: string } } } };
                if (responseError.response?.data?.error?.message) {
                    errorMessage = responseError.response.data.error.message;
                }
            } else if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
            isCreatingRef.current = false;
        }
    }, []);

    return {
        createEvent,
        isLoading,
        error,
        uploadProgress,
    };
};

// 행사 수정 후크
// TODO: 행사 삭제 API...
export const useEventUpdate = (eventId: number) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateEvent = useCallback(async (
        eventData: Partial<E.CreateEventPayload>,
        newImages?: File[],
        removedImageUrls?: string[]
    ): Promise<E.Event> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. 새 이미지 검증
            if (newImages && newImages.length > 0) {
                const msg = validateImages(newImages);
                if (msg) throw new Error(msg);
            }

            // 2. 새 이미지 업로드
            let newImageUrls: string[] = [];
            if (newImages && newImages.length > 0) {
                const { urls } = await uploadImages(newImages);
                newImageUrls = urls;
            }

            // 3. 기존 이미지 URL 처리 (제거할 이미지 필터링)
            const currentImageUrls = eventData.image_urls || [];
            const filteredImageUrls = currentImageUrls.filter((url: string) => !removedImageUrls?.includes(url));

            // 4. 최종 이미지 URL 배열
            const finalImageUrls = [...filteredImageUrls, ...newImageUrls];

            // 5. 행사 수정 API 호출 (이미지 URL 포함)
            const updateRequest: Partial<E.CreateEventPayload> = {
                ...eventData,
                image_urls: finalImageUrls,
            };

            const updatedEvent = await updateEventApi(eventId, updateRequest);

            // TODO: 이미지 삭제 API는 추후 구현 (DB에서 이미지 URL 지우는 거)

            return updatedEvent as unknown as E.Event;
        } catch (err: unknown) {
            console.error('Event update failed:', err);
            let errorMessage = '행사 수정에 실패했습니다.';
            if (err && typeof err === 'object' && 'response' in err) {
                const responseError = err as { response?: { data?: { error?: { message?: string } } } };
                if (responseError.response?.data?.error?.message) {
                    errorMessage = responseError.response.data.error.message;
                }
            } else if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    return {
        updateEvent,
        isLoading,
        error,
    };
};