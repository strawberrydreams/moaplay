// 이미지 URL 관련 유틸 함수들의 모음

// 이미지 URL을 전체 URL로 변환하는 함수
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '/default-image.png'; // 기본 이미지
  }

  // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // 상대 경로인 경우 API 베이스 URL과 결합
  const API_BASE = import.meta.env.VITE_API_URL || '';
  
  // /uploads/로 시작하는 경우
  if (imageUrl.startsWith('/uploads/')) {
    // Vite 프록시를 사용하는 경우 (개발 환경)
    if (!API_BASE) {
      return imageUrl; // 프록시가 자동으로 처리
    }
    // 직접 API URL을 사용하는 경우 (프로덕션)
    return `${API_BASE}${imageUrl}`;
  }

  // 그 외의 경우 그대로 반환
  return imageUrl;
};

// 이미지 로딩 에러를 처리하는 함수
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackUrl: string = '/default-image.png'
): void => {
  const target = event.currentTarget;
  
  // 이미 대체 이미지를 시도한 경우 무한 루프 방지
  if (target.src === fallbackUrl) {
    return;
  }

  target.src = fallbackUrl;
};