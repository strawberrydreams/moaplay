// src/types.ts
export interface IEvent {
  id: string | number;
  title: string;
  date: string;
  location: string;
  tag: string;
  imageUrl?: string; // 이미지 URL (선택 사항)
  isLiked: boolean;  // 초기 '좋아요' 상태
}