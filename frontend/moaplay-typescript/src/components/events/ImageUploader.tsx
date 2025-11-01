import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';

// 파일 유틸 함수
const FileUtils = {
  isImageFile(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
  },
};

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxFileSize?: number;
  error?: string;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 5,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [representativeIndex, setRepresentativeIndex] = useState<number | null>(0); // ✅ 대표 이미지 인덱스 추가

  
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      fileArray.forEach((file) => {
        if (!FileUtils.isImageFile(file)) {
          alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`);
          return;
        }
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(`${file.name}의 크기가 너무 큽니다.`);
          return;
        }
        const isDuplicate = images.some(
          (existing) => existing.name === file.name && existing.size === file.size
        );
        if (isDuplicate) {
          alert(`${file.name}은(는) 이미 추가된 파일입니다.`);
          return;
        }
        validFiles.push(file);
      });

      const total = images.length + validFiles.length;
      if (total > maxImages) {
        alert(`최대 ${maxImages}개의 이미지까지 업로드할 수 있습니다.`);
        return;
      }

      onImagesChange([...images, ...validFiles]);
    },
    [images, onImagesChange, maxImages, maxFileSize]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSelectClick = () => fileInputRef.current?.click();

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);

    // ✅ 대표 이미지가 삭제되면 0번으로 초기화
    if (representativeIndex === index) {
      setRepresentativeIndex(updated.length > 0 ? 0 : null);
    }
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onImagesChange(updated);
  };

  // ✅ 이미지 클릭 시 대표 이미지 변경
  const handleSetRepresentative = (index: number) => {
    setRepresentativeIndex(index);
  };

  // 미리보기 동기화
  useEffect(() => {
    const newPreviews = images.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    previews.forEach((p) => URL.revokeObjectURL(p.preview));
    setPreviews(newPreviews);
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [images]);

  // 드래그 기능
  const onDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOverThumbnail = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    handleMoveImage(draggedIndex, index);
    setDraggedIndex(index);
  };
  const onDragEnd = () => setDraggedIndex(null);

  return (
    <UploaderContainer>
      <DropZone
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectClick}
        isDragOver={dragOver}
        hasError={!!error}
      >
        <DropZoneContent>
          <UploadIcon>📷</UploadIcon>
          <DropZoneText>이미지를 드래그하거나 클릭하여 업로드</DropZoneText>
          <DropZoneSubText>
            최대 {maxImages}개, {maxFileSize}MB 이하
          </DropZoneSubText>
        </DropZoneContent>
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
        />
      </DropZone>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {previews.length > 0 && (
        <PreviewContainer>
          <PreviewGrid>
            {previews.map((preview, index) => (
              <PreviewItem
                key={`${preview.file.name}-${index}`}
                draggable
                onDragStart={onDragStart(index)}
                onDragOver={onDragOverThumbnail(index)}
                onDragEnd={onDragEnd}
                onClick={() => handleSetRepresentative(index)} // ✅ 클릭 시 대표 이미지 변경
              >
                <PreviewImage src={preview.preview} alt={preview.file.name} />
                {representativeIndex === index && (
                  <MainImageBadge>대표 이미지</MainImageBadge>
                )}
                <DeleteButton onClick={(e) => { 
                  e.stopPropagation(); 
                  handleRemoveImage(index);
                }}>
                  ✕
                </DeleteButton>
              </PreviewItem>
            ))}
          </PreviewGrid>
          <PreviewHint>
            클릭한 이미지가 대표 이미지로 설정됩니다. 순서를 바꾸려면 드래그하세요.
          </PreviewHint>
        </PreviewContainer>
      )}
    </UploaderContainer>
  );
};

// ==================== 스타일 ====================
const UploaderContainer = styled.div`
  width: 100%;
  color: #333;
`;

const DropZone = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDragOver', 'hasError'].includes(prop),
})<{ isDragOver: boolean; hasError: boolean }>`
  border: 2px dashed ${({ isDragOver, hasError }) =>
    hasError ? '#dc3545' : isDragOver ? '#4c8dff' : '#ced4da'};
  border-radius: 12px;
  padding: 100px 20px;
  text-align: center;
  cursor: pointer;
  background: ${({ isDragOver }) => (isDragOver ? '#f1f8ff' : '#fff')};
  transition: all 0.3s ease;
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const UploadIcon = styled.div`
  font-size: 48px;
  opacity: 0.6;
`;

const DropZoneText = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const DropZoneSubText = styled.div`
  font-size: 14px;
  color: #6c757d;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #dc3545;
`;

const PreviewContainer = styled.div`
  margin-top: 24px;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

const PreviewItem = styled.div`
  height: 180px;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  background: white;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s ease;

  ${PreviewItem}:hover & {
    transform: scale(1.05);
    filter: brightness(0.9);
  }
`;

// 대표 이미지 배지
const MainImageBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: #007bff;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

// X 버튼
const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: rgba(0, 0, 0, 1);
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.15s ease;

  ${PreviewItem}:hover & {
    opacity: 1;
  }

  &:hover {
    transform: scale(1.2);
  }
`;

const PreviewHint = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #6c757d;
  text-align: center;
`;
