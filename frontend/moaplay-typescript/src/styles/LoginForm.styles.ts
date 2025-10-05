import styled from 'styled-components';

export const FormContainer = styled.form.attrs({ noValidate: true })` // 👈 noValidate 속성 추가
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

export const SubmitButton = styled.button`
    background-color: #6a0dad;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #510a8d;
    }
`;

export const LinksContainer = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    margin-top: 5px;
    
    span, a {
        color: #6a0dad;
        text-decoration: none;
        cursor: pointer;
        
        &:hover {
            text-decoration: underline;
        }
    }
`;

// 오류 메시지
export const ErrorMessage = styled.p`
    color: #e53935; /* 빨간색 오류 메시지 */
    font-size: 0.8rem;
    margin-top: 5px;
    margin-bottom: 0;
`;