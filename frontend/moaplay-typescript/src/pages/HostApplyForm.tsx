import React, { useState } from 'react';
import * as S from '../styles/HostApplyForm.styles';
import Modal from '../components/common/Modal';

interface HostApplyFormValues {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
}

const initialValues: HostApplyFormValues = {
  companyName: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  description: '',
};

interface HostApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HostApplyForm: React.FC<HostApplyModalProps> = ({isOpen, onClose}) => {
  const [values, setValues] = useState<HostApplyFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<HostApplyFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): Partial<HostApplyFormValues> => {
    const errs: Partial<HostApplyFormValues> = {};
    if (!values.companyName.trim()) errs.companyName = '회사명/단체명을 입력해주세요.';
    if (!values.contactPerson.trim()) errs.contactPerson = '담당자를 입력해주세요.';
    if (!values.contactEmail.trim()) {
      errs.contactEmail = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
      errs.contactEmail = '유효한 이메일 주소를 입력해주세요.';
    }
    if (!values.contactPhone.trim()) errs.contactPhone = '전화번호를 입력해주세요.';
    if (!values.description.trim()) errs.description = '단체 소개 또는 신청 사유를 입력해주세요.';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // TODO: 실제 API 호출
      // await HostApi.apply({ ...values });
      await new Promise(resolve => setTimeout(resolve, 1000)); // 더미 대기
      setSuccess(true);
      setValues(initialValues);
    } catch (error) {
      console.error('주최자 신청 실패:', error);
      setErrors({ description: '신청 중 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
    <S.PageContainer>
      <S.Heading>행사 주최자 신청하기</S.Heading>
      {success ? (
        <S.SuccessMessage>
          신청이 완료되었습니다. 검토 후 연락드리겠습니다.
        </S.SuccessMessage>
      ) : (
        <S.Form onSubmit={handleSubmit}>
          <S.InputGroup>
            <S.Label htmlFor="companyName">회사명 / 단체명</S.Label>
            <S.Input
              id="companyName"
              name="companyName"
              type="text"
              value={values.companyName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.companyName && <S.ErrorText>{errors.companyName}</S.ErrorText>}
          </S.InputGroup>

          <S.InputGroup>
            <S.Label htmlFor="contactPerson">담당자명</S.Label>
            <S.Input
              id="contactPerson"
              name="contactPerson"
              type="text"
              value={values.contactPerson}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.contactPerson && <S.ErrorText>{errors.contactPerson}</S.ErrorText>}
          </S.InputGroup>

          <S.InputGroup>
            <S.Label htmlFor="contactEmail">담당자 이메일</S.Label>
            <S.Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={values.contactEmail}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.contactEmail && <S.ErrorText>{errors.contactEmail}</S.ErrorText>}
          </S.InputGroup>

          <S.InputGroup>
            <S.Label htmlFor="contactPhone">담당자 전화번호</S.Label>
            <S.Input
              id="contactPhone"
              name="contactPhone"
              type="text"
              value={values.contactPhone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.contactPhone && <S.ErrorText>{errors.contactPhone}</S.ErrorText>}
          </S.InputGroup>

          <S.InputGroup>
            <S.Label htmlFor="description">단체 소개 및 신청 사유</S.Label>
            <S.Textarea
              id="description"
              name="description"
              value={values.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.description && <S.ErrorText>{errors.description}</S.ErrorText>}
          </S.InputGroup>

          <S.SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? '신청 중...' : '신청하기'}
          </S.SubmitButton>
        </S.Form>
      )}
    </S.PageContainer>
    </Modal>
  );
};

export default HostApplyForm;
