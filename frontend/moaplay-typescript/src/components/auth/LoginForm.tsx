import React, { useState } from 'react';
import {
    FormContainer,
    InputGroup,
    SubmitButton,
    LinksContainer,
    ErrorMessage
} from '../../styles/LoginForm.styles';

interface Errors {
    id: string;
    password: string;
}

// prop 타입 정의
interface LoginFormProps {
    onSwitchToSignUp: () => void;
    onCloseModal: () => void; 
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp, onCloseModal }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Errors>({ id: '', password: '' }); 

    // ----------------------------------------------------
    // 🚀 유효성 검사 로직 (onChange에서 호출되지 않도록 변경)
    // ----------------------------------------------------
    const validateField = (name: 'id' | 'password', value: string): string => {
        let error = '';

        if (name === 'id') {
            if (value.length === 0) { 
                error = '아이디 또는 이메일을 입력해주세요.';
            } else if (value.length < 6 || value.length > 20) {
                error = '아이디/이메일은 6~20자 사이여야 합니다.';
            } else if (!/^[a-z0-9@._]+$/.test(value)) {
                error = '형식이 올바르지 않습니다.';
            }
        } else if (name === 'password') {
            if (value.length === 0) { 
                error = '비밀번호를 입력해주세요.';
            } else if (value.length < 8) {
                error = '비밀번호는 최소 8자 이상이어야 합니다.';
            } else {
                const complexity = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9\s]/].filter(regex => regex.test(value)).length;
                if (complexity < 2) {
                    error = '문자, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다.';
                }
            }
        }
        return error;
    };

    const validateForm = (): boolean => {
        const idError = validateField('id', id);
        const passwordError = validateField('password', password);

        // 오류 상태 업데이트 (로그인 버튼 클릭 시만 실행)
        setErrors({
            id: idError,
            password: passwordError,
        });

        // 상태 초기화
        setId('');
        setPassword('');

        // 두 필드 모두 오류가 없어야 true 반환
        return !idError && !passwordError;
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        
        // 🚀 수정: 입력 값만 업데이트하고, 오류 상태는 건드리지 않습니다.
        if (id === 'loginId') {
            setId(value);
        } else if (id === 'loginPw') {
            setPassword(value);
        }

        // 입력이 변경될 때 오류 메시지를 지워주는 것이 더 좋은 UX입니다.
        setErrors(prev => ({
            ...prev,
            ['string']: '', // 입력이 시작되면 오류 메시지 숨김
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 🚀 로그인 버튼 클릭 시 최종 유효성 검사 실행
        if (validateForm()) {
        console.log('로그인 시도:', { id, password });
        //alert(`${nickname}님 환영합니다.`);
        onCloseModal(); // 로그인 성공 시 모달 닫기
        } else {
            console.error('유효성 검사 실패');
            // validateForm() 내부에서 오류 메시지가 화면에 업데이트됩니다.
        }
    };
    

    return (
        <FormContainer onSubmit={handleSubmit}>
            <InputGroup>
                <label htmlFor="loginId">아이디 또는 이메일</label>
                <input
                    id="loginId"
                    type="text"
                    value={id}
                    onChange={handleInputChange}
                    //required
                />
                {errors.id && <ErrorMessage>{errors.id}</ErrorMessage>}
            </InputGroup>
            
            <InputGroup>
                <label htmlFor="loginPw">비밀번호</label>
                <input
                    id="loginPw"
                    type="password"
                    value={password}
                    onChange={handleInputChange}
                    //required
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputGroup>
        
            {/* Submit 버튼은 항상 활성화하여 클릭을 유도합니다. (유효성 검사는 handleSubmit에서 처리) */}
            <SubmitButton type="submit">로그인</SubmitButton>
            
            <LinksContainer>
                <a href="/find-pw">비밀번호 찾기</a> 
                <span onClick={onSwitchToSignUp}>회원가입</span> 
            </LinksContainer>
        </FormContainer>
    );
};

export default LoginForm;
