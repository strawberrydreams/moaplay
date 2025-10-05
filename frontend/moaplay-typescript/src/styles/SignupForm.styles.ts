import styled from 'styled-components';

export const FormContainer = styled.form.attrs({ noValidate: true })`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

export const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    label {
        font-size: 0.9rem;
        margin-bottom: 5px;
        color: #555;
    }
    input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        /* 자동 완성/포커스 시 색상 변경 방지 */
        background-color: white; 
        color: #333; 
        transition: background-color 5000s ease-in-out 0s; 
        -webkit-text-fill-color: #333 !important;
    }
`;

// 🚀 버튼 컨테이너: 버튼을 가로로 나란히 정렬
export const ButtonRow = styled.div`
    display: flex;
    gap: 10px; /* 버튼 간 간격 */
    margin-top: 10px;
`;

// 공통 버튼 스타일 (SubmitButton과 CancelButton 모두 flex: 1을 가집니다)
export const BaseButton = styled.button`
    flex: 1; /* 컨테이너 내에서 남은 공간을 균등하게 채움 */
    padding: 12px;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
`;

export const SubmitButton = styled(BaseButton)`
    background-color: #6a0dad;
    color: white;
    
    &:hover {
        background-color: #510a8d;
    }
`;

// 🚀 취소 버튼 스타일 추가 (흰색 배경, 보라색 테두리)
export const CancelButton = styled(BaseButton)`
    background-color: white;
    color: #6a0dad;
    border: 1px solid #6a0dad;
    
    &:hover {
        background-color: #f2e6ff; /* 마우스 오버 시 연한 보라색 배경 */
    }
`;

export const LinksContainer = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #333;
    text-decoration: none;

    span {
        color: #6a0dad;
        text-decoration: none;
        
        &:hover {
            text-decoration: underline;
        }
    }
`;

export const ErrorMessage = styled.p`
    color: #e53935; 
    font-size: 0.8rem;
    margin-top: 5px;
    margin-bottom: 0;
`;

export const SuccessMessage = styled.p`
    color: #43a047;
    font-size: 0.8rem;
    margin-top: 5px;
    margin-bottom: 0;
`;