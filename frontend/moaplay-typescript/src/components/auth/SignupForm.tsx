import React, { useState, useCallback, type FocusEvent } from 'react'; // 1. FocusEvent 임포트
import { useForm } from '../../hooks/useForm'; // 👈 제네릭 훅 임포트
import * as UserApi from '../../service/usersApi'; // 회원가입 API
import type { RegisterPayload, DuplicateCheckPayload } from '../../types/users';
import { useAuthContext } from '../../context/AuthContext';

import {
    FormContainer,
    InputGroup,
    ButtonRow,
    SubmitButton,
    ErrorMessage,
    LinksContainer,
    SuccessMessage
} from '../../styles/SignupForm.styles';

// --- 회원가입 폼 전용 타입 정의 ---
interface SignupFormData extends Omit<RegisterPayload, 'password'> { // Omit password if RegisterPayload has it
    user_id: string;
    password: string;
    confirmPassword?: string;
    email: string;
    nickname: string;
    // phone?: string;
}

// --- 초기 폼 값 설정 ---
const initialSignupValues: SignupFormData = {
    user_id: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
    // phone: '',
};

// --- 컴포넌트 Props 타입 ---
interface SignupFormProps {
    onSwitchToLogin: () => void;
    onGoTags: (data: RegisterPayload) => void; // 다음 단계로 데이터 전달 함수
}

// --- 유효성 검사 함수 ---
const validateSignup = (values: SignupFormData): Partial<SignupFormData> => {
    const errors: Partial<SignupFormData> = {};

    // 아이디 검사
    if (!values.user_id) {
        errors.user_id = '아이디를 입력해주세요.';
    } else if (values.user_id.length < 6 || values.user_id.length > 20) {
        errors.user_id = '아이디는 6~20자 사이여야 합니다.';
    } else if (!/^[a-z0-9]+$/.test(values.user_id)) {
        errors.user_id = '아이디는 영문 소문자와 숫자만 가능합니다.';
    }
    // (여기서 API 중복 확인 결과를 errors 객체에 반영할 수도 있습니다)

    // 비밀번호 검사
    if (!values.password) {
        errors.password = '비밀번호를 입력해주세요.';
    } else if (values.password.length < 8) {
        errors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else {
        const complexity = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9\s]/]
                           .filter(regex => values.password && regex.test(values.password)).length;
        if (complexity < 3) {
            errors.password = '문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.';
        }
    }


    // 비밀번호 확인 검사
    if (values.password !== values.confirmPassword) {
        errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 이메일 검사
    if (!values.email) {
        errors.email = '이메일을 입력해주세요.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) {
        errors.email = '유효한 이메일 형식이 아닙니다.';
    }

    // 닉네임 검사
    if (!values.nickname) {
        errors.nickname = '닉네임을 입력해주세요.';
    } else if (values.nickname.length < 2 || values.nickname.length > 10) {
        errors.nickname = '닉네임은 2~10자여야 합니다.';
    } else if (!/^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/.test(values.nickname)) {
        errors.nickname = '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
    }

    return errors;
};

// --- SignupForm 컴포넌트 ---
const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onGoTags }) => {

    // 2. 중복 확인/성공 메시지 상태 추가 (useForm과 별개로 관리)
    const [isDuplicate, setIsDuplicate] = useState({ user_id: false, nickname: false, email: false });
    const [successMessage, setSuccessMessage] = useState({ user_id: '', nickname: '', email: '' , password: '', confirmPassword: '', phone: ''});

    const { login } = useAuthContext();

    // 4. useForm 훅 호출 (validate 함수에 isDuplicate를 반영한 새 함수 전달)
    const { values, errors, isSubmitting, handleChange: handleFormChange, handleSubmit } = useForm<SignupFormData>({
        initialValues: initialSignupValues,
        validate: validateSignup, // 👈 isDuplicate 상태가 반영된 유효성 함수 사용
        onSubmit: UserApi.registerUser,
        onSuccess: (response) => {
            login(values);
            onGoTags(response as RegisterPayload);
        },
        onError: (error) => { 
            console.error('Signup error:', error);
            alert(error.response?.data?.error || '회원가입에 실패했습니다.');
        }
    });

    // 5. handleBlur (중복 확인) 함수 정의
    const handleBlur = useCallback(async (e: FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // 빈 값이거나 중복 확인 대상 필드가 아니면 종료
        if (!value || !['user_id', 'nickname', 'email'].includes(name)) return;

        // 기존 에러/성공 메시지 초기화
        setSuccessMessage(prev => ({ ...prev, [name]: '' }));
        // errors 상태는 useForm이 관리하므로 직접 건드리지 않음
        // setErrors(prev => ({ ...prev, [name]: undefined }));

        try {
            const payload: DuplicateCheckPayload = { [name]: value };
            const response = await UserApi.checkDuplicate(payload); // API 이름 확인!

            if (response.available) {
                setIsDuplicate(prev => ({ ...prev, [name]: false }));
                setSuccessMessage(prev => ({ ...prev, [name]: `사용 가능한 ${name === 'user_id' ? '아이디' : name}입니다.` }));
            } else {
                setIsDuplicate(prev => ({ ...prev, [name]: true }));
                // 에러 상태는 validateSignup 함수가 isDuplicate를 보고 설정하므로 여기서 직접 설정 안 함
            }
        } catch (error) {
            setIsDuplicate(prev => ({ ...prev, [name]: false }));
            // 에러 상태는 validateSignup 함수가 처리하도록 유도 (예: 서버 에러 필드 추가)
            // setErrors(prev => ({ ...prev, [name]: '중복 확인 실패' }));
            console.error('중복 확인 실패:', error);
            alert('중복 확인 중 서버 오류가 발생했습니다.');
        }
    }, []); // 의존성 없음

    // 커스텀 handleChange
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFormChange(e); // useForm의 기본 handleChange 호출

        // 추가로 중복/성공 상태 초기화
        const { name } = e.target as { name: keyof typeof isDuplicate };
        if (name === 'user_id' || name === 'nickname' || name === 'email') {
            setIsDuplicate(prev => ({ ...prev, [name]: false }));
            setSuccessMessage(prev => ({ ...prev, [name]: '' }));
        }
    };

return (
        <FormContainer onSubmit={handleSubmit}>
            {/* 아이디 */}
            <InputGroup>
                <label htmlFor="signupuser_id">아이디</label>
                <input
                    id="signupuser_id"
                    name="user_id"
                    type="text"
                    value={values.user_id}
                    onChange={handleChange} 
                    onBlur={handleBlur}     
                    disabled={isSubmitting}
                />
                {errors.user_id && <ErrorMessage>{errors.user_id}</ErrorMessage>}
                {successMessage.user_id && !errors.user_id && <SuccessMessage>{successMessage.user_id}</SuccessMessage>}
            </InputGroup>

            {/* 비밀번호 */}
            <InputGroup>
                <label htmlFor="signuppassword">비밀번호</label>
                <input
                    id="signuppassword"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange} 
                    onBlur={handleBlur}    
                    disabled={isSubmitting}
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                {successMessage.password && !errors.password && <SuccessMessage>{successMessage.password}</SuccessMessage>}
            </InputGroup>

            {/* 비밀번호 확인 */}
            <InputGroup>
                <label htmlFor="signupconfirmPassword">비밀번호 확인</label>
                <input
                    id="signupconfirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange} 
                    onBlur={handleBlur}     
                    disabled={isSubmitting}
                />
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
                {successMessage.confirmPassword && !errors.confirmPassword && <SuccessMessage>{successMessage.confirmPassword}</SuccessMessage>}
            </InputGroup>


            {/* 이메일 */}
            <InputGroup>
                <label htmlFor="signupemail">이메일</label>
                <input
                    id="signupemail"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange} // 👈 수정된 handleChange 사용
                    onBlur={handleBlur}     // 👈 onBlur 연결
                    disabled={isSubmitting}
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                {successMessage.email && !errors.email && <SuccessMessage>{successMessage.email}</SuccessMessage>}
            </InputGroup>

            {/* 닉네임 */}
            <InputGroup>
                <label htmlFor="signupnickname">닉네임</label>
                <input
                    id="signupnickname"
                    name="nickname"
                    type="text"
                    value={values.nickname}
                    onChange={handleChange} // 👈 수정된 handleChange 사용
                    onBlur={handleBlur}     // 👈 onBlur 연결
                    disabled={isSubmitting}
                />
                {errors.nickname && <ErrorMessage>{errors.nickname}</ErrorMessage>}
                {successMessage.nickname && !errors.nickname && <SuccessMessage>{successMessage.nickname}</SuccessMessage>}
            </InputGroup>

            {/* 전화번호 */}
            {/* <InputGroup>
                <label htmlFor="signupphone">전화번호</label>
                <input
                    id="signupphone"
                    name="phone"
                    type="tel"
                    value={values.phone}
                    onChange={handleChange} // 👈 수정된 handleChange 사용
                    onBlur={handleBlur}     // 👈 onBlur 연결
                    disabled={isSubmitting}
                />
                {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                {successMessage.phone && !errors.phone && <SuccessMessage>{successMessage.phone}</SuccessMessage>}
            </InputGroup> */}


            
            {/* 버튼 */}
            <ButtonRow>
                <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '로딩 중...' : '회원가입'}
                </SubmitButton>
            </ButtonRow>

            {/* 로그인으로 돌아가기 */}
            <LinksContainer>
                계정이 이미 있나요?
                <span onClick={onSwitchToLogin}>로그인으로 돌아가기</span>
            </LinksContainer>
        </FormContainer>
    );
};

export default SignupForm;
