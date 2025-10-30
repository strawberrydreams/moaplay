// =================================================================
// == Response (응답) 타입들
// =================================================================

// Image Upload 응답 데이터
// API: POST /api/upload/image
export interface ImageUploadResponse {
    url: string;
}

// 다중 업로드 응답 타입(서버 스키마에 맞춰 필요시 수정)
// API: 단일 이미지와 API 엔드포인트는 동일함 (POST /api/upload/image)
export type ImagesUploadResponse = {
    urls: string[];
    count?: number;
};

// ===============================================================
// == Request (요청) 타입들
// ===============================================================

// 이미지 업로드 요청 Body (multipart/form-data)의 타입 정의
// TypeScript에서는 일반적으로 File 객체를 사용하지만, API 문서에는 form-data의 필드 이름만 명시되어 있으므로 참고용으로 작성
export interface ImageUploadRequest {
    image: File | Blob;
}
