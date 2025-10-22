// src/types.ts
export interface IEvent {
  id: string | number;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  tag: string[];
  imageUrl?: string; // 이미지 URL (선택 사항)
  isLiked: boolean;  // 초기 '좋아요' 상태
  description: string; // 행사 설명
  host?: string;        // 추가: 주최자
  contact?: string;     // 추가: 연락처
  color?: string;       // 추가: 이벤트 색상
}