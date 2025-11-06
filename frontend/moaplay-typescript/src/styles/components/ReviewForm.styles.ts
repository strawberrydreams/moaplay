// src/styles/ReviewForm.styles.ts (새 파일)
import styled from 'styled-components';

// --- 기본 폼 컨테이너 (제공된 CSS 적용) ---
export const FormContainer = styled.form`
  box-sizing: border-box;

  /* 오토레이아웃 */
  display: flex;
  flex-direction: column;
  align-items: stretch; /* 전체 너비 사용하도록 변경 */
  padding: 24px;
  gap: 24px; /* 요소 간 간격 */

  background: #FFFFFF;
  /* border, border-radius 등은 Modal에서 적용 가능하므로 제거하거나 유지 (선택) */
  /* border: 1px solid #D9D9D9; */
  /* border-radius: 11.3591px; */
`;

// --- 입력 그룹 (라벨 + 입력 필드) ---
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 라벨과 입력 필드 사이 간격 */
`;

// --- 라벨 스타일 ---
export const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`;

// --- 기본 Input 스타일 ---
export const Input = styled.input`
    background-color: #FFFFFF;
    color: #131313;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: #9E77ED; /* 포커스 시 테두리 색상 */
    box-shadow: 0 0 0 2px rgba(158, 119, 237, 0.2);
  }
`;

// --- Textarea 스타일 ---
export const Textarea = styled.textarea`
    background-color: #FFFFFF;
    color: #131313;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  height: 120px;
  resize: none;
  &:focus {
    outline: none;
    border-color: #9E77ED;
    box-shadow: 0 0 0 2px rgba(158, 119, 237, 0.2);
  }
`;

// --- 별점 그룹 ---
export const RatingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StarsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

// --- 별 버튼 ---
export const StarButton = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: 1.8rem; /* 별 크기 */
  color: ${props => props.$isActive ? '#FFC107' : '#e0e0e0'}; /* 활성/비활성 색상 */
  transition: color 0.2s ease;

  &:hover {
    /* 호버 시 색상 변경 (선택 사항) */
  }
`;

// --- 이미지 업로드 그룹 ---
export const ImageUploadGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ImagePreviewContainer = styled.div`
  display: flex;
  gap: 16px; /* 이미지 간 간격 */
  align-items: center;
`;

// --- 이미지 플레이스홀더 ---
export const ImagePlaceholder = styled.div`
  width: 80px;
  height: 80px;
  background-color: #f0f0f0;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  font-size: 2rem; /* 아이콘 크기 */
  cursor: pointer;
  position: relative; /* 이미지 미리보기 용 */

  img { /* 실제 이미지 미리보기 스타일 */
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

// --- 제출 버튼 ---
export const SubmitButton = styled.button`
  background-color: #9E77ED;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 8px; /* 위 요소와의 간격 */

  &:hover {
    background-color: #865dd1;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;