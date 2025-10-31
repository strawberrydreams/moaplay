// src/consts/schema.ts
import * as yup from 'yup';
import { REGEX } from './regex';

export const searchFormSchema = yup.object({
  search: yup.string().optional(),
  location: yup.string().required(),
  date_from: yup.date().nullable().optional(),
  date_to: yup
    .date()
    .nullable()
    .optional()
    .when('date_from', {
      is: (val: Date | null) => !!val,
      then: (schema) =>
        schema.min(yup.ref('date_from'), '종료일은 시작일 이후여야 합니다'),
    }),
  sort: yup.string().oneOf(['start_date', 'view_count']).required(),
  order: yup.string().oneOf(['asc', 'desc']).required(),
});

  // 예시로 로그인/회원가입용 스키마도 함께 가능
export const loginFormSchema = yup.object({
  email: yup
    .string()
    .required('이메일을 입력해주세요')
    .matches(REGEX.email, '유효한 이메일 형식이 아닙니다'),
  password: yup
    .string()
    .required('비밀번호를 입력해주세요')
    .matches(REGEX.password, '비밀번호는 최소 8자 이상이며, 문자 + 숫자 조합이어야 합니다'),
  phone: yup
    .string()
    .required('전화번호를 입력해주세요')
    .matches(REGEX.phone, '전화번호 형식이 유효하지 않습니다'),
}).required();