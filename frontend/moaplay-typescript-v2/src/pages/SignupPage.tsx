/**
 * 회원가입 페이지 컴포넌트
 * 
 * 2단계 회원가입 프로세스를 제공합니다:
 * 1단계: 기본 정보 입력 (실명, 휴대전화, 이메일, 아이디, 비밀번호, 비밀번호 재입력)
 * 2단계: 선호 태그 선택 (최소 3개)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks';
import { useAuthModal } from '../contexts';
import { FormInput } from '../components/common';
import { Button } from '../components/common';
import { AuthService } from '../services/authService';
import { TagService } from '../services/tagService';
import { 
  validateSignupForm, 
  validateUsername, 
  validatePreferredTags 
} from '../utils/validation';
import { FieldError } from '../types';

/**
 * 회원가입 폼 데이터 타입
 */
interface SignupFormData {
  realName: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * 태그 정보 타입
 */
interface Tag {
  id: number;
  name: string;
  description?: string;
}

/**
 * 회원가입 페이지 컴포넌트
 * 
 * 2단계로 구성된 회원가입 프로세스를 제공합니다.
 * 아이디 중복 확인, 폼 유효성 검사, 선호 태그 선택 기능을 포함합니다.
 */
export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { closeModal, openLoginModal } = useAuthModal();
  
  // 단계 관리 (1: 기본정보, 2: 선호태그)
  const [step, setStep] = useState<1 | 2>(1);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState<SignupFormData>({
    realName: '',
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  // 선호 태그 상태
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // UI 상태
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: ''
  });

  /**
   * 컴포넌트 마운트 시 태그 목록 로드
   */
  useEffect(() => {
    loadAvailableTags();
  }, []);

  /**
   * 사용 가능한 태그 목록 로드
   * 백엔드 API에서 실제 태그 목록을 가져옵니다.
   */
  const loadAvailableTags = async () => {
    try {
      // 백엔드 API에서 태그 목록 조회
      const response = await TagService.getTags({
        limit: 100, // 충분한 수의 태그를 가져옴
        sort: 'popular' // 인기순으로 정렬
      });
      
      // API 응답을 Tag 인터페이스 형식으로 변환
      const tags: Tag[] = response.tags.map(item => ({
        id: item.id,
        name: item.name,
        description: `행사 수: ${item.event_count}개` // event_count를 description으로 활용
      }));
      
      setAvailableTags(tags);
    } catch (error: unknown) {
      console.error('태그 로드 실패:', error);
      
      // API 호출 실패 시 사용자에게 알림
      setGeneralError('태그 목록을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
    }
  };

  /**
   * 폼 필드 값 변경 처리
   */
  const handleFieldChange = (field: keyof SignupFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // 아이디 필드 변경 시 중복 확인 상태 초기화
    if (field === 'username') {
      setUsernameCheckStatus({
        isChecking: false,
        isAvailable: null,
        message: ''
      });
    }
    
    // 일반 에러 메시지 제거
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * 아이디 중복 확인
   */
  const handleUsernameCheck = async () => {
    const usernameValidation = validateUsername(formData.username);
    
    if (!usernameValidation.isValid) {
      setErrors(prev => ({
        ...prev,
        username: usernameValidation.errors[0].message
      }));
      return;
    }
    
    setUsernameCheckStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const result = await AuthService.checkUsername(formData.username);
      
      setUsernameCheckStatus({
        isChecking: false,
        isAvailable: result.available,
        message: result.available 
          ? '사용 가능한 아이디입니다.' 
          : '이미 사용 중인 아이디입니다.'
      });
    } catch (error: unknown) {
      console.error('아이디 중복 확인 실패:', error);
      setUsernameCheckStatus({
        isChecking: false,
        isAvailable: null,
        message: '아이디 중복 확인에 실패했습니다.'
      });
    }
  };

  /**
   * 1단계 폼 유효성 검사
   */
  const validateStep1 = (): boolean => {
    const validation = validateSignupForm(formData);
    
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error: FieldError) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return false;
    }
    
    // 아이디 중복 확인 여부 체크
    if (usernameCheckStatus.isAvailable !== true) {
      setErrors(prev => ({
        ...prev,
        username: '아이디 중복 확인을 완료해주세요.'
      }));
      return false;
    }
    
    setErrors({});
    return true;
  };

  /**
   * 다음 단계로 이동
   */
  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  /**
   * 이전 단계로 이동
   */
  const handlePrevStep = () => {
    setStep(1);
  };

  /**
   * 태그 선택/해제 처리
   */
  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  /**
   * 회원가입 완료 처리
   */
  const handleSignupComplete = async () => {
    // 선호 태그 유효성 검사
    const tagValidation = validatePreferredTags(selectedTags);
    
    if (!tagValidation.isValid) {
      setGeneralError(tagValidation.errors[0].message);
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      await signup({
        user_id: formData.username,
        password: formData.password,
        nickname: formData.realName, // 임시로 실명을 닉네임으로 사용
        email: formData.email,
        real_name: formData.realName,
        phone_number: formData.phoneNumber,
        preferred_tags: selectedTags
      });
      
      closeModal(); // 모달 닫기
      navigate('/'); // 회원가입 성공 시 메인 페이지로 이동
    } catch (error: unknown) {
      console.error('회원가입 실패:', error);
      
      // API 에러 응답 처리
      type ApiError = {
        response?: {
          data?: {
            error?: { message?: string };
            message?: string;
          };
          status?: number;
          statusText?: string;
        };
        message?: string;
      };

      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error?.message
        ?? apiError.response?.data?.message
        ?? apiError.message
        ?? (error instanceof Error ? error.message : undefined)
        ?? '회원가입에 실패했습니다. 다시 시도해주세요.';
      
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 1단계: 기본 정보 입력
  if (step === 1) {
    return (
      <PageContainer>
        <SignupContainer>
          <SignupTitle>회원가입</SignupTitle>
          <StepIndicator>
            <StepDot $active />
            <StepLine />
            <StepDot />
          </StepIndicator>
          <StepText>1단계: 기본 정보 입력</StepText>
          
          <SignupForm>
            <FormInput
              label="실명"
              type="text"
              placeholder="실명을 입력하세요"
              value={formData.realName}
              onChange={handleFieldChange('realName')}
              error={errors.realName}
              required
            />
            
            <FormInput
              label="휴대전화 번호"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phoneNumber}
              onChange={handleFieldChange('phoneNumber')}
              error={errors.phoneNumber}
              required
            />
            
            <FormInput
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleFieldChange('email')}
              error={errors.email}
              autoComplete="email"
              required
            />
            
            <UsernameField>
              <FormInput
                label="아이디"
                type="text"
                placeholder="6~20자 사이의 영문 소문자와 숫자"
                value={formData.username}
                onChange={handleFieldChange('username')}
                error={errors.username}
                autoComplete="username"
                required
              />
              <UsernameCheckButton
                type="button"
                onClick={handleUsernameCheck}
                disabled={!formData.username || usernameCheckStatus.isChecking}
                loading={usernameCheckStatus.isChecking}
              >
                중복 확인
              </UsernameCheckButton>
            </UsernameField>
            
            {usernameCheckStatus.message && (
              <UsernameCheckMessage $available={usernameCheckStatus.isAvailable}>
                {usernameCheckStatus.message}
              </UsernameCheckMessage>
            )}
            
            <FormInput
              label="비밀번호"
              type="password"
              placeholder="8자 이상, 문자/숫자/특수문자 중 3가지 이상"
              value={formData.password}
              onChange={handleFieldChange('password')}
              error={errors.password}
              autoComplete="new-password"
              required
            />
            
            <FormInput
              label="비밀번호 재입력"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleFieldChange('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
            
            {generalError && (
              <ErrorMessage role="alert">
                {generalError}
              </ErrorMessage>
            )}
            
            <ButtonGroup>
              <Button
                variant="outline"
                size="lg"
                onClick={openLoginModal}
              >
                로그인으로 돌아가기
              </Button>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
              >
                다음
              </Button>
            </ButtonGroup>
          </SignupForm>
        </SignupContainer>
      </PageContainer>
    );
  }

  // 2단계: 선호 태그 선택
  return (
    <PageContainer>
      <SignupContainer>
        <SignupTitle>회원가입</SignupTitle>
        <StepIndicator>
          <StepDot />
          <StepLine />
          <StepDot $active />
        </StepIndicator>
        <StepText>2단계: 관심 태그 선택</StepText>
        
        <TagSelectionContainer>
          <TagSelectionDescription>
            관심 있는 태그를 선택해주세요 (최소 3개)
          </TagSelectionDescription>
          
          <SelectedCount>
            선택된 태그: {selectedTags.length}개
          </SelectedCount>
          
          <TagGrid>
            {availableTags.map(tag => (
              <TagButton
                key={tag.id}
                $selected={selectedTags.includes(tag.name)}
                onClick={() => handleTagToggle(tag.name)}
                title={tag.description}
              >
                {tag.name}
              </TagButton>
            ))}
          </TagGrid>
          
          {generalError && (
            <ErrorMessage role="alert">
              {generalError}
            </ErrorMessage>
          )}
          
          <ButtonGroup>
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevStep}
              disabled={isLoading}
            >
              이전
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleSignupComplete}
              disabled={selectedTags.length < 3 || isLoading}
              loading={isLoading}
            >
              회원가입 완료
            </Button>
          </ButtonGroup>
        </TagSelectionContainer>
      </SignupContainer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SignupContainer = styled.div`
  background: white;
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  width: 100%;
  max-width: 500px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xl};
    margin: ${({ theme }) => theme.spacing.md};
    max-width: none;
  }
`;

const SignupTitle = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fonts.size.xlarge};
  font-weight: 600;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StepDot = styled.div<{ $active?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.border};
  transition: background-color 0.2s ease;
`;

const StepLine = styled.div`
  width: 40px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;

const StepText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SignupForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const UsernameField = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;
  
  > div:first-child {
    flex: 1;
  }
`;

const UsernameCheckButton = styled(Button)`
  min-width: 100px;
  white-space: nowrap;
`;

const UsernameCheckMessage = styled.div<{ $available: boolean | null }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme, $available }) => {
    if ($available === true) return theme.colors.success;
    if ($available === false) return theme.colors.danger;
    return theme.colors.textSecondary;
  }};
  margin-top: -${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &::before {
    content: ${({ $available }) => {
      if ($available === true) return "'✓'";
      if ($available === false) return "'✗'";
      return "''";
    }};
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.dangerLight};
  color: ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  > button {
    flex: 1;
  }
`;

const TagSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const TagSelectionDescription = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.md};
  margin: 0;
`;

const SelectedCount = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 300px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const TagButton = styled.button<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $selected }) => 
    $selected ? theme.colors.primaryLight : 'white'};
  color: ${({ theme, $selected }) => 
    $selected ? theme.colors.primary : theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ $selected }) => $selected ? '500' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme, $selected }) => 
      $selected ? theme.colors.primary : theme.colors.primaryLight};
    color: ${({ theme, $selected }) => 
      $selected ? 'white' : theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;