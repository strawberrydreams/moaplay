// src/components/FieldEditForm.tsx
import React, { useState } from 'react';
import * as S from '../../styles/components/FieldEditForm.styles';

interface FieldEditFormProps {
    field: string;
    initialValue: string;
    onCancel: () => void;
    onSave: (value: string) => void;
}

const fieldLabels: Record<string, string> = {
    nickname: '닉네임',
    email: '이메일',
    phone: '전화번호',
};

const FieldEditForm: React.FC<FieldEditFormProps> = ({ field, initialValue, onCancel, onSave }) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!value.trim()) {
            setError('값을 입력해주세요.');
            return;
        }
        try {
            setIsSubmitting(true);
            await onSave(value);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <S.Label htmlFor="edit-input">{fieldLabels[field]}</S.Label>
            <S.Input
                id="edit-input"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
            <S.ButtonGroup>
                <button type="button" onClick={onCancel} disabled={isSubmitting}>취소</button>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? '저장 중…' : '저장'}</button>
            </S.ButtonGroup>
        </form>
    );
};

export default FieldEditForm;