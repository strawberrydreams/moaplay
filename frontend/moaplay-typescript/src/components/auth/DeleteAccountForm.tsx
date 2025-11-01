// src/components/DeleteAccountForm.tsx
import React, { useState } from 'react';
import * as UserApi from '../../service/usersApi';
import * as S from '../../styles/DeleteAccountForm.styles';

interface DeleteAccountFormProps {
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({ onClose, onDeleted }) => {
  const [password, setPassword] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!confirmDeletion) {
      setError('회원 탈퇴를 확인해주세요.');
      return;
    }
    if (password.trim().length === 0) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await UserApi.deleteUser({ password, confirm: true });
      if (res.success) {
        onDeleted();
      } else {
        setError('탈퇴 처리에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('회원탈퇴 오류:', err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.FormWrapper onSubmit={handleSubmit}>
      <S.Title>정말 탈퇴하시겠습니까?</S.Title>

      <S.Label htmlFor="delete-password">비밀번호</S.Label>
      <S.Input
        id="delete-password"
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <S.SubmitButton type='submit' disabled={isSubmitting}>
        회원 탈퇴
      </S.SubmitButton>

      <S.CancelButton onClick={onClose}>취소</S.CancelButton>
    </S.FormWrapper>
  );
};


export default DeleteAccountForm;
