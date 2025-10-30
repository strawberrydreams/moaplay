import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

// 파일 유틸 함수 (이미지 확장자와 크기)
const FileUtils = {
    isImageFile(file: File): boolean {
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        return imageTypes.includes(file.type);
    },

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// 이미지 업로드 Props
interface ImageUploaderProps {
    images: File[];
    onImagesChange: (images: File[]) => void;
    maxImages?: number;
    maxFileSize?: number; // MB 단위
    error?: string;
}

// 이미지 미리보기 타입
interface ImagePreview {
    file: File;
    preview: string;
    uploading?: boolean;
    error?: string;
}

// 이미지 업로드 컴포넌트
export const ImageUploader: React.FC<ImageUploaderProps> = ({
                                                                images,
                                                                onImagesChange,
                                                                maxImages = 5,
                                                                maxFileSize = 5,
                                                                error
                                                            }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [previews, setPreviews] = useState<ImagePreview[]>([]);

    // 파일 선택하기
    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);
        const validFiles: File[] = [];
        const newPreviews: ImagePreview[] = [];

        fileArray.forEach(file => {
            // 파일 타입 검증 (JPEG, PNG, GIF, WEBP)
            if (!FileUtils.isImageFile(file)) {
                alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP 파일만 업로드 가능합니다.`);
                return;
            }

            // 파일 크기 검증 (5MB까지)
            if (file.size > maxFileSize * 1024 * 1024) {
                alert(`${file.name}의 크기가 너무 큽니다. ${maxFileSize}MB 이하의 파일만 업로드 가능합니다.`);
                return;
            }

            // 중복 파일인지 검증
            const isDuplicate = images.some(existingFile =>
                existingFile.name === file.name && existingFile.size === file.size
            );

            if (isDuplicate) {
                alert(`${file.name}은(는) 이미 추가된 파일입니다.`);
                return;
            }

            validFiles.push(file);

            // 미리보기 생성
            const preview = URL.createObjectURL(file);
            newPreviews.push({
                file,
                preview
            });
        });

        // 최대 개수 검증 (5개까지)
        const totalFiles = images.length + validFiles.length;
        if (totalFiles > maxImages) {
            alert(`이미지는 최대 ${maxImages}개까지 업로드할 수 있습니다.`);
            return;
        }

        // 상태 업데이트
        const updatedImages = [...images, ...validFiles];
        onImagesChange(updatedImages);

        // 미리보기 업데이트
        setPreviews(prev => [...prev, ...newPreviews]);
    }, [images, onImagesChange, maxImages, maxFileSize]);

    // 파일 입력 변경
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
        // 입력 초기화 (같은 파일 재선택 가능하도록)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 마우스 드래그 오버 처리
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    // 마우스 드래그 리브 처리
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

// 마우스 드롭 처리
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // 파일 선택 버튼 클릭 시
    const handleSelectClick = () => {
        fileInputRef.current?.click();
    };

    // 이미지 제거하기
    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        onImagesChange(updatedImages);

        // 미리보기 제거 및 메모리 해제
        setPreviews(prev => {
            const newPreviews = prev.filter((_, i) => i !== index);
            // 제거되는 미리보기의 URL 해제
            if (prev[index]) {
                URL.revokeObjectURL(prev[index].preview);
            }
            return newPreviews;
        });
    };

    // 이미지 순서 변경하기
    const handleMoveImage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= images.length) return;

        const updatedImages = [...images];
        const [movedImage] = updatedImages.splice(fromIndex, 1);
        updatedImages.splice(toIndex, 0, movedImage);
        onImagesChange(updatedImages);

        const updatedPreviews = [...previews];
        const [movedPreview] = updatedPreviews.splice(fromIndex, 1);
        updatedPreviews.splice(toIndex, 0, movedPreview);
        setPreviews(updatedPreviews);
    };

    // 컴포넌트 언마운트 시 미리보기 URL 해제
    React.useEffect(() => {
        return () => {
            previews.forEach(preview => {
                URL.revokeObjectURL(preview.preview);
            });
        };
    }, [previews]);

    return (
        <UploaderContainer>
            {/* 파일 선택 영역 */}
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
                    <DropZoneText>
                        이미지를 드래그하여 놓거나 클릭하여 선택하세요
                    </DropZoneText>
                    <DropZoneSubText>
                        JPEG, PNG, GIF, WebP 형식 지원 (최대 {maxFileSize}MB, {maxImages}개)
                    </DropZoneSubText>
                </DropZoneContent>

                <HiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleInputChange}
                />
            </DropZone>

            {/* 에러 메시지 */}
            {error && (
                <ErrorMessage>{error}</ErrorMessage>
            )}

            {/* 이미지 미리보기 목록 */}
            {previews.length > 0 && (
                <PreviewContainer>
                    <PreviewTitle>
                        업로드된 이미지 ({previews.length}/{maxImages})
                    </PreviewTitle>

                    <PreviewGrid>
                        {previews.map((preview, index) => (
                            <PreviewItem key={`${preview.file.name}-${index}`}>
                                <PreviewImage
                                    src={preview.preview}
                                    alt={preview.file.name}
                                />

                                <PreviewOverlay>
                                    <PreviewActions>
                                        {/* 순서 변경 버튼 */}
                                        {index > 0 && (
                                            <ActionButton
                                                onClick={() => handleMoveImage(index, index - 1)}
                                                title="앞으로 이동"
                                            >
                                                ←
                                            </ActionButton>
                                        )}

                                        {index < previews.length - 1 && (
                                            <ActionButton
                                                onClick={() => handleMoveImage(index, index + 1)}
                                                title="뒤로 이동"
                                            >
                                                →
                                            </ActionButton>
                                        )}

                                        {/* 삭제 버튼 */}
                                        <ActionButton
                                            onClick={() => handleRemoveImage(index)}
                                            title="삭제"
                                            variant="danger"
                                        >
                                            ✕
                                        </ActionButton>
                                    </PreviewActions>
                                </PreviewOverlay>

                                <PreviewInfo>
                                    <FileName>{preview.file.name}</FileName>
                                    <FileSize>
                                        {FileUtils.formatFileSize(preview.file.size)}
                                    </FileSize>
                                    {index === 0 && (
                                        <MainImageBadge>대표 이미지</MainImageBadge>
                                    )}
                                </PreviewInfo>
                            </PreviewItem>
                        ))}
                    </PreviewGrid>

                    <PreviewHint>
                        첫 번째 이미지가 대표 이미지로 사용됩니다. 순서를 변경하려면 화살표 버튼을 클릭하세요.
                    </PreviewHint>
                </PreviewContainer>
            )}
        </UploaderContainer>
    );
};

// 스타일 컴포넌트들
const UploaderContainer = styled.div`
    width: 100%;
`;

const DropZone = styled.div.withConfig({
    shouldForwardProp: (prop) => !['isDragOver', 'hasError'].includes(prop)
})<{ isDragOver: boolean; hasError: boolean }>`
    border: 2px dashed ${props =>
            props.hasError ? '#dc3545' :
                    props.isDragOver ? '#007bff' : '#dee2e6'
    };
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.isDragOver ? '#f8f9fa' : 'white'};

    &:hover {
        border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
        background: #f8f9fa;
    }
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
    color: #333;
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

const PreviewTitle = styled.h3`
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

const PreviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
`;

const PreviewItem = styled.div`
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e9ecef;
    background: white;
`;

const PreviewImage = styled.img`
    width: 100%;
    height: 150px;
    object-fit: cover;
`;

const PreviewOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;

    ${PreviewItem}:hover & {
        opacity: 1;
    }
`;

const PreviewActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'danger' }>`
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    background: ${props => props.variant === 'danger' ? '#dc3545' : '#007bff'};
    color: white;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background: ${props => props.variant === 'danger' ? '#c82333' : '#0056b3'};
    }
`;

const PreviewInfo = styled.div`
    padding: 12px;
`;

const FileName = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    word-break: break-all;
`;

const FileSize = styled.div`
    font-size: 12px;
    color: #6c757d;
`;

const MainImageBadge = styled.div`
    display: inline-block;
    margin-top: 8px;
    padding: 4px 8px;
    background: #007bff;
    color: white;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
`;

const PreviewHint = styled.div`
    margin-top: 12px;
    font-size: 14px;
    color: #6c757d;
    text-align: center;
`;