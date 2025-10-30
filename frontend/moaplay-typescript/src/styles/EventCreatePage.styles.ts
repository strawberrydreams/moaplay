import styled from "styled-components";

export const PageContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
`;

export const MainContent = styled.main`
    flex: 1;
    padding: 40px 20px;
`;

export const FormContainer = styled.div`
    max-width: 1760px;
    width: 100%;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

export const FormHeader = styled.div`
    padding: 40px 40px 20px;
`;

export const FormTitle = styled.h1`
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: #333;
`;

export const FormSubtitle = styled.p`
    margin: 0;
    font-size: 16px;
    color: #6c757d;
`;

export const ErrorAlert = styled.div`
    margin: 20px 40px;
    padding: 16px;
    background: #f8d7da;
    color: #721c24;
    border-radius: 8px;
    font-size: 14px;
`;

export const Form = styled.form`
    padding: 20px 40px 40px;
`;

export const TwoColumn = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 40px;
    flex-wrap: nowrap;

    @media (max-width: 1720px) {
        flex-direction: column;
        align-items: center;
        flex-wrap: wrap;
    }
`;

export const LeftCol = styled.aside`
    flex: 0 0 800px;
    max-width: 800px;
    width: 100%;
`;

export const RightCol = styled.section`
    flex: 0 0 800px;
    max-width: 800px;
    width: 100%;
`;

export const FormSection = styled.div`
    margin-bottom: 40px;

    &:last-child {
        margin-bottom: 0;
    }
`;

export const SectionTitle = styled.h2`
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
`;

export const SectionDescription = styled.p`
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #6c757d;
`;

export const InputGroup = styled.div`
    margin-bottom: 24px;

    &:last-child {
        margin-bottom: 0;
    }
`;

export const InputLabel = styled.label`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
`;

export const RequiredMark = styled.span`
    color: #dc3545;
`;

export const TextInput = styled.input.withConfig({
    shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid ${props => props.hasError ? '#dc3545' : '#e9ecef'};
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

export const TextArea = styled.textarea.withConfig({
    shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
    width: 100%;
    padding: 12px 16px;
    border: 2px solid ${props => props.hasError ? '#dc3545' : '#e9ecef'};
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
    }

    &::placeholder {
        color: #adb5bd;
    }
`;

export const ErrorMessage = styled.div`
    margin-top: 8px;
    font-size: 14px;
    color: #dc3545;
`;

export const CharacterCount = styled.div`
    margin-top: 4px;
    font-size: 12px;
    color: #6c757d;
    text-align: right;
`;

export const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 40px;
    padding-top: 20px;
`;

export const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const CancelButton = styled(Button)`
    background: #6c757d;
    color: white;

    &:hover:not(:disabled) {
        background: #5a6268;
    }
`;

export const SubmitButton = styled(Button)`
    background: #007bff;
    color: white;

    &:hover:not(:disabled) {
        background: #0056b3;
    }
`;