import React from 'react';
import { useForm } from '../../hooks/useForm'; // 👈 제네릭 훅 임포트
import type { LoginPayload } from '../../types/auth';
import { useAuthContext } from '../../contexts/AuthContext';
import * as AuthApi from '../../services/authApi'; // 로그인 API
import {
    FormContainer,
    InputGroup,
    SubmitButton,
    LinksContainer,
    ErrorMessage
} from '../../styles/LoginForm.styles';

// --- 1. 로그인 폼 전용 설정 ---
const initialLoginValues: LoginPayload = { user_id: '', password: '' };

const validateLogin = (values: LoginPayload) => {
  const errors: Partial<LoginPayload> = {};
  if (!values.user_id) errors.user_id = '아이디를 입력해주세요.';
  if (!values.password) errors.password = '비밀번호를 입력해주세요.';
  return errors;
};

interface LoginFormProps {
    onSwitchToSignUp: () => void;
    onCloseModal: () => void;
}

// --- LoginForm 컴포넌트 ---
const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp, onCloseModal }) => {
  const { login } = useAuthContext();
  // 2. useForm 훅 호출 (타입 <LoginPayload> 지정)
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm<LoginPayload>({
    initialValues: initialLoginValues,
    validate: validateLogin,           // 로그인용 유효성 검사 함수 전달
    onSubmit: AuthApi.loginUser,     // 로그인 API 함수 전달
    onSuccess: (response) => {         // 성공 시 실행할 콜백
      console.log('Login successful:', response);
      // (Context 업데이트 로직은 여기서 또는 onSubmit 함수 내부에서 처리)
      // setLoggedInUser(response); 
      login(response);
      onCloseModal();
      window.location.reload(); // 페이지 새로고침
    },
    onError: (error) => {             // 실패 시 실행할 콜백
      console.error('Login error:', error);
      // (에러 메시지 표시는 errors 상태를 활용하거나 별도 상태 사용)
      alert(error.response?.data?.error || '로그인 실패');
    }
  });
    

    return (
        <FormContainer onSubmit={handleSubmit}>
            <InputGroup>
                <label htmlFor="loginId">아이디</label>
                <input
                id="loginId"
                name="user_id" // 👈 name은 T의 key와 일치해야 함
                type="text"
                value={values.user_id} // 👈 values 사용
                onChange={handleChange}
                disabled={isSubmitting}
                />
                {errors.user_id && <ErrorMessage>{errors.user_id}</ErrorMessage>} 
            </InputGroup>
            
            <InputGroup>
                <label htmlFor="loginPw">비밀번호</label>
                <input
                    id="loginPw"
                    name="password" // 👈 name은 T의 key와 일치해야 함
                    type="password"
                    value={values.password} // 👈 values 사용
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputGroup>
        
            <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? '로그인 중...' : '로그인'}
            </SubmitButton>
            
            <LinksContainer>
                <a href="/find-pw">비밀번호 찾기</a> 
                <span onClick={onSwitchToSignUp}>회원가입</span> 
            </LinksContainer>
        </FormContainer>
    );
};

export default LoginForm;
