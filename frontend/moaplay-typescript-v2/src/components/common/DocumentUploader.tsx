/**
 * 문서 업로더 컴포넌트
 * 
 * 문서 파일 전용 업로드 컴포넌트입니다.
 * PDF, Word, Excel, PowerPoint 등의 문서 파일을 지원합니다.
 * 
 * 주요 기능:
 * - 문서 파일 전용 업로드
 * - 파일 타입별 아이콘 표시
 * - 드래그 앤 드롭 지원
 * - 업로드 진행률 표시
 * - 파일 검증 및 에러 처리
 */

import React from 'react';
import { FileUploader, UploadedFile } from './FileUploader';

/**
 * 문서 업로더 Props
 */
interface DocumentUploaderProps {
  /** 현재 문서 목록 */
  documents: UploadedFile[];
  /** 문서 변경 핸들러 */
  onDocumentsChange: (documents: UploadedFile[]) => void;
  /** 최대 문서 개수 */
  maxDocuments?: number;
  /** 최대 파일 크기 (바이트) */
  maxFileSize?: number;
  /** 허용된 문서 확장자 */
  acceptedExtensions?: string[];
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
  /** 업로드 완료 콜백 */
  onUploadComplete?: (documents: UploadedFile[]) => void;
  /** 업로드 에러 콜백 */
  onUploadError?: (error: string, file: File) => void;
  /** 컴팩트 모드 */
  compact?: boolean;
  /** 즉시 업로드 여부 */
  autoUpload?: boolean;
}

/**
 * 기본 문서 확장자
 */
const DEFAULT_DOCUMENT_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp'
];

/**
 * 문서 업로더 컴포넌트
 */
export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onDocumentsChange,
  maxDocuments = 5,
  maxFileSize = 16 * 1024 * 1024, // 16MB
  acceptedExtensions = DEFAULT_DOCUMENT_EXTENSIONS,
  disabled = false,
  className,
  onUploadComplete,
  onUploadError,
  compact = false,
  autoUpload = true
}) => {
  return (
    <FileUploader
      files={documents}
      onFilesChange={onDocumentsChange}
      fileType="document"
      maxFiles={maxDocuments}
      maxFileSize={maxFileSize}
      acceptedExtensions={acceptedExtensions}
      disabled={disabled}
      className={className}
      onUploadComplete={onUploadComplete}
      onUploadError={onUploadError}
      compact={compact}
      autoUpload={autoUpload}
      showPreview={false} // 문서는 미리보기 대신 아이콘 표시
    />
  );
};