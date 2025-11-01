// src/components/auth/ChangePasswordForm.tsx
import React, { useState } from 'react';
import * as S from '../../styles/FieldEditForm.styles';
import * as UserApi from '../../services/usersApi';

interface ChangePasswordFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onClose, onSuccess }) => {
  const [values, setValues] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 비밀번호 유효성 검사 로직
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!values.current_password) {
      newErrors.current_password = '현재 비밀번호를 입력해주세요.';
    }

    if (!values.new_password) {
      newErrors.new_password = '새 비밀번호를 입력해주세요.';
    } else if (values.new_password.length < 8) {
      newErrors.new_password = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else {
      const complexity = [
        /[a-z]/,           // 소문자
        /[A-Z]/,           // 대문자
        /[0-9]/,           // 숫자
        /[^A-Za-z0-9\s]/,  // 특수문자
      ].filter(regex => regex.test(values.new_password)).length;

      if (complexity < 3) {
        newErrors.new_password = '문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.';
      }
    }

    if (values.new_password !== values.confirm_password) {
      newErrors.confirm_password = '새 비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await UserApi.changePassword({
        password: values.current_password,
        new_password: values.new_password,
      });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrors({
        new_password: err.response?.data?.error || '비밀번호 변경에 실패했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // 입력 시 오류 초기화
  };

  return (
    <S.FormContainer onSubmit={handleSubmit}>
      <S.Title>비밀번호 변경</S.Title>

      <S.InputGroup>
        <label htmlFor="current_password">현재 비밀번호</label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          value={values.current_password}
          onChange={handleChange}
          placeholder="현재 비밀번호 입력"
        />
        {errors.current_password && <S.ErrorText>{errors.current_password}</S.ErrorText>}
      </S.InputGroup>

      <S.InputGroup>
        <label htmlFor="new_password">새 비밀번호</label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          value={values.new_password}
          onChange={handleChange}
          placeholder="새 비밀번호 (문자, 숫자, 특수문자 조합)"
        />
        {errors.new_password && <S.ErrorText>{errors.new_password}</S.ErrorText>}
      </S.InputGroup>

      <S.InputGroup>
        <label htmlFor="confirm_password">새 비밀번호 확인</label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          value={values.confirm_password}
          onChange={handleChange}
          placeholder="새 비밀번호 재입력"
        />
        {errors.confirm_password && <S.ErrorText>{errors.confirm_password}</S.ErrorText>}
      </S.InputGroup>

      <S.ButtonGroup>
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          취소
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '변경 중...' : '변경하기'}
        </button>
      </S.ButtonGroup>
    </S.FormContainer>
  );
};

export default ChangePasswordForm;