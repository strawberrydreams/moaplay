import React, { useState, useEffect, useRef } from 'react';
import Modal from './common/Modal'; // 1. 기존 Modal 컴포넌트 임포트
import * as S from '../styles/ProfileUploadModal.styles'; // 2. 스타일 임포트
import { useAuthContext } from '../context/AuthContext'; // 3. AuthContext 임포트
// 👇 4. UserApi 대신 (또는 추가로) ImageApi 임포트
import * as UploadApi from '../service/uploadApi'; 
import defaultProfile from '../assets/default-profile.png'; // 기본 이미지
import { FaCamera } from 'react-icons/fa';
import * as UserApi from '../service/usersApi';
import { normalizeImageUrl } from '../utils/image';



interface ProfileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string | null; // 현재 프로필 이미지 URL
}

export const ProfileUploadModal: React.FC<ProfileUploadModalProps> = ({ isOpen, onClose, currentImageUrl }) => {
  // 5. AuthContext에서 checkAuthStatus 함수 가져오기 (상태 새로고침용)
  const { checkAuthStatus } = useAuthContext(); 
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
    
      setPreviewUrl(currentImageUrl || defaultProfile); // 현재 이미지로 미리보기 설정
      setSelectedFile(null); // 새 파일 선택 초기화
      setIsSubmitting(false);
    }
  }, [isOpen, currentImageUrl]);

  // 파일 선택 시 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // FileReader를 사용해 선택한 파일의 로컬 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 클릭 시 숨겨진 input[type=file] 트리거
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // "변경하기" 버튼 클릭 시 핸들러
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("새로운 이미지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    // --- 👇 FormData 생성 로직 제거 ---
    // const formData = new FormData();
    // formData.append('profile_image', selectedFile); 
    // --- 👆 ---

    try {
      // --- 👇 6. ImageApi.uploadImage 함수 호출 (selectedFile 전달) ---
      const response = await UploadApi.uploadImage(selectedFile); 
      console.log("업로드 응답:", response);
      // --- 👆 ---
      UserApi.updateMe({ profile_image: response.url })
      
      alert("프로필 이미지가 성공적으로 변경되었습니다.");
      
      // 7. AuthContext의 checkAuthStatus 호출하여
      //    Header와 MyPage의 사용자 정보를 새로고침
      await checkAuthStatus(); 
      
      onClose(); // 모달 닫기
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      alert("업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="프로필 이미지 변경">
      <S.Container>
        {/* 이미지 미리보기 영역 */}
        <S.PreviewCircle onClick={triggerFileInput}>
          <S.PreviewImage src={previewUrl || defaultProfile} alt="프로필 미리보기" />
          <S.UploadIcon>
            <FaCamera />
          </S.UploadIcon>
        </S.PreviewCircle>

        <S.HiddenInput 
          ref={fileInputRef} 
          accept="image/*" // 이미지 파일만 
          onChange={handleFileSelect} 
        />
        
        {/* 버튼 그룹 */}
        <S.ButtonContainer>
          <S.CancelButton onClick={onClose} disabled={isSubmitting}>
            취소
          </S.CancelButton>
          <S.UploadButton 
            onClick={handleSubmit} 
            disabled={!selectedFile || isSubmitting} // 새 파일 선택 시에만 활성화
          >
            {isSubmitting ? '업로드 중...' : '변경하기'}
          </S.UploadButton>
        </S.ButtonContainer>
      </S.Container>
    </Modal>
  );
};

