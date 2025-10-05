import React, { useState} from 'react';
// import * as AuthApi from '../../service/authApi.ts'; // Auth API 임포트 (중복 확인, 등록)

import {
    FormContainer,
    InputGroup,
    ButtonRow,
    SubmitButton,
    ErrorMessage,
    LinksContainer,
    SuccessMessage
} from '../../styles/SignupForm.styles';

interface FormData {
    user_id: string;
    password: string;
    confirmPassword: string;
    email: string;
    nickname: string;
}

interface Errors {
    user_id: string;
    password: string;
    confirmPassword: string;
    email: string;
    nickname: string;
}

interface SignupFormProps {
    onSwitchToLogin: () => void;
    onCloseModal: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onCloseModal }) => {
    const [formData, setFormData] = useState<FormData>({
        user_id: '',
        password: '',
        confirmPassword: '',
        email: '',
        nickname: '',
    });
    const [errors, setErrors] = useState<Errors>({
        user_id: '',
        password: '',
        confirmPassword: '',
        email: '',
        nickname: '',
    });
    // 중복 확인 상태
    // const [isDuplicate, setIsDuplicate] = useState({ user_id: false, nickname: false, email: false });
    // 성공 메시지 상태
    const [successMessage, setSuccessMessage] = useState({ user_id: '', nickname: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ----------------------------------------------------
    // 유효성 검사 로직 (Validation)
    // ----------------------------------------------------

    const validateField = (name: keyof FormData, value: string, currentData: FormData): string => {
        let error = '';
        
        switch (name) {
            case 'user_id':
                if (value.length < 6 || value.length > 20) {
                    error = '아이디는 6~20자 사이의 영문 소문자와 숫자만 사용 가능합니다.';
                } else if (!/^[a-z0-9]+$/.test(value)) {
                    error = '아이디는 영문 소문자와 숫자만 가능합니다.';
                }
                break;
            case 'password':
                if (value.length < 8) {
                    error = '비밀번호는 최소 8자 이상이어야 합니다.';
                } else {
                    // 복잡성: 문자, 숫자, 특수문자 중 3가지 이상 포함
                    const complexity = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9\s]/].filter(regex => regex.test(value)).length;
                    if (complexity < 3) {
                        error = '문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.';
                    }
                }
                break;
            case 'confirmPassword':
                if (value !== currentData.password) {
                    error = '비밀번호가 일치하지 않습니다.';
                }
                break;
            case 'email':
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    error = '유효한 이메일 형식이 아닙니다.';
                }
                break;
            case 'nickname':
                if (value.length < 2 || value.length > 10) {
                    error = '닉네임은 2~10자여야 합니다.';
                } else if (!/^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/.test(value)) {
                    error = '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
                }
                break;
        }
        return error;
    };

    const validateForm = (data: FormData): boolean => {
        let isValid = true;
        let newErrors: Errors = { user_id: '', password: '', confirmPassword: '', email: '', nickname: '' };

        (Object.keys(data) as (keyof FormData)[]).forEach(key => {
            const error = validateField(key, data[key], data);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });
        
        // // 중복 확인 상태 최종 체크
        // if (isDuplicate.user_id) {
        //     newErrors.user_id = '이미 사용 중인 아이디입니다.';
        //     isValid = false;
        // }
        // if (isDuplicate.nickname) {
        //     newErrors.nickname = '이미 사용 중인 닉네임입니다.';
        //     isValid = false;
        // }
        // if (isDuplicate.email) {
        //     newErrors.email = '이미 등록된 이메일입니다.';
        //     isValid = false;
        // }


        setErrors(newErrors);
        return isValid;
    };
    
    // ----------------------------------------------------
    // 🚀 API 호출 로직: 중복 확인 (onBlur)
    // ----------------------------------------------------
    
//  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
//         const { id, value } = e.target;
//         // 'signupUserId' -> 'UserId' -> 'userId' 형태로 필드 이름 추출
//         const name = id.replace('signup', '') as keyof typeof isDuplicate; 

//         if (!value || !(name === 'user_id' || name === 'nickname' || name === 'email')) return;
        
//         // // 1. 클라이언트 유효성 먼저 검사
//         // const clientError = validateField(name, value, formData);
//         // if (clientError) {
//         //     setErrors(prev => ({ ...prev, [name]: clientError }));
//         //     setSuccessMessage(prev => ({ ...prev, [name]: '' }));
//         //     return;
//         // }
        
//         // 2. 중복 확인 API 호출
//         try {
//             const payload = {
//                 field: name,
//                 value: value,
//             };
//             // 💡 await를 사용하여 API 응답을 기다립니다.
//             const response = await AuthApi.checkDuplicate(payload);
            
//             // isAvailable이 false면 중복됨
//             if (!response.isAvailable) {
//                 setIsDuplicate(prev => ({ ...prev, [name]: true }));
//                 setSuccessMessage(prev => ({ ...prev, [name]: '' }));
//             } else {
//                 // 중복 없음: 성공 메시지 표시
//                 setIsDuplicate(prev => ({ ...prev, [name]: false }));
//                 setSuccessMessage(prev => ({ ...prev, [name]: `${name === 'user_id' ? '사용 가능한 아이디' : name === 'email' ? '사용 가능한 이메일' : '사용 가능한 닉네임'}입니다.` }));
//             }

//         } catch (error) {
//             // 서버 오류 발생 시 (예: 500 에러)
//             setErrors(prev => ({ ...prev, [name]: '서버 오류로 중복 확인에 실패했습니다.' }));
//             setIsDuplicate(prev => ({ ...prev, [name]: false }));
//             setSuccessMessage(prev => ({ ...prev, [name]: '' }));
//         }
//     };

    // ----------------------------------------------------
    // 입력 변경 핸들러
    // ----------------------------------------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const name = id.replace('signup', '') as keyof FormData;
        
        // 폼 데이터 업데이트
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // // 입력 직후에는 에러 메시지와 성공 메시지 모두 초기화
        setErrors(prev => ({ ...prev, [name]: '' }));
        setSuccessMessage(prev => ({ ...prev, [name]: '' }));
        // setIsDuplicate(prev => ({ ...prev, [name]: false }));
    };

    // ----------------------------------------------------
    // 🚀 최종 제출 로직 (handleSubmit)
    // ----------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 1. 클라이언트 측 최종 유효성 검사
        if (!validateForm(formData)) {
            setIsSubmitting(false);
            return;
        }

        // // 2. 최종 회원가입 API 호출
        // try {
        //     const payload = {
        //         user_id: formData.user_id,
        //         password: formData.password,
        //         email: formData.email,
        //         nickname: formData.nickname,
        //         // 관심사, 지역 등 추가 정보 필요 시 여기에 포함
        //     };
            
        //     const response = await AuthApi.registerUser(payload);
            
        //     if (response.success) {
        //         alert("회원가입에 성공했습니다! 로그인 페이지로 이동합니다.");
        //         onCloseModal(); // 모달 닫기
        //         onSwitchToLogin(); // 로그인 모달로 전환
        //     } else {
        //         alert("회원가입에 실패했습니다. 다시 시도해 주세요.");
        //     }
        // } catch (error) {
        //     alert("서버와의 통신 중 오류가 발생했습니다.");
        // } finally {
        //     setIsSubmitting(false);
        // }
    };
    

    return (
        <FormContainer onSubmit={handleSubmit}>
            {/* 1. 아이디 */}
            <InputGroup>
                <label htmlFor="signupuser_id">아이디</label>
                <input
                    id="signupuser_id"
                    type="text"
                    value={formData.user_id}
                    onChange={handleChange}
                    // onBlur={handleBlur} // 포커스 잃을 때 중복 검사
                    disabled={isSubmitting}
                />
                {errors.user_id && <ErrorMessage>{errors.user_id}</ErrorMessage>}
                {successMessage.user_id && <SuccessMessage>{successMessage.user_id}</SuccessMessage>}
            </InputGroup>

            {/* 2. 비밀번호 */}
            <InputGroup>
                <label htmlFor="signuppassword">비밀번호</label>
                <input
                    id="signuppassword"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </InputGroup>

            {/* 3. 비밀번호 확인 */}
            <InputGroup>
                <label htmlFor="signupconfirmPassword">비밀번호 확인</label>
                <input
                    id="signupconfirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </InputGroup>
            
            {/* 4. 이메일 */}
            <InputGroup>
                <label htmlFor="signupemail">이메일</label>
                <input
                    id="signupemail"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    // onBlur={handleBlur} // 포커스 잃을 때 중복 검사
                    disabled={isSubmitting}
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                {successMessage.email && <SuccessMessage>{successMessage.email}</SuccessMessage>}
            </InputGroup>
            
            {/* 5. 닉네임 */}
            <InputGroup>
                <label htmlFor="signupnickname">닉네임</label>
                <input
                    id="signupnickname"
                    type="text"
                    value={formData.nickname}
                    onChange={handleChange}
                    // onBlur={handleBlur} // 포커스 잃을 때 중복 검사
                    disabled={isSubmitting}
                />
                {errors.nickname && <ErrorMessage>{errors.nickname}</ErrorMessage>}
                {successMessage.nickname && <SuccessMessage>{successMessage.nickname}</SuccessMessage>}
            </InputGroup>

            {/* 버튼 */}
            <ButtonRow>
                <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '등록 중...' : '회원가입'}
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
