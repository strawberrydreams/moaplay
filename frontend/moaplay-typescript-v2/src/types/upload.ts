// 파일 업로드 관련 타입 정의
export interface UploadResponse {
  data: {
    url: string;
    urls?: string[];
  };
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}