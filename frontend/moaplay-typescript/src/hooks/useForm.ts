import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';

// --- 타입 정의 ---
// 1. 폼 데이터 타입 (제네릭 T)
type FormData<T> = T;
// 2. 에러 타입 (T의 모든 키를 optional string으로)
type FormErrors<T> = Partial<Record<keyof T, string>>;
// 3. 유효성 검사 함수 타입
type ValidateFunction<T> = (values: FormData<T>) => FormErrors<T>;
// 4. 제출 함수 타입
type SubmitFunction<T> = (values: FormData<T>) => Promise<any>; // 비동기 API 호출

// --- 훅 옵션 타입 ---
interface UseFormOptions<T> {
  initialValues: FormData<T>;       // 폼 초기값
  validate: ValidateFunction<T>;    // 유효성 검사 함수
  onSubmit: SubmitFunction<T>;      // 실제 제출 로직 (API 호출 등)
  onSuccess?: (response: any) => void; // 제출 성공 콜백 (옵션)
  onError?: (error: any) => void;    // 제출 실패 콜백 (옵션)
}

// --- 제네릭 useForm 훅 ---
export function useForm<T>({
  initialValues,
  validate,
  onSubmit,
  onSuccess,
  onError,
}: UseFormOptions<T>) {
  
  // 상태: 폼 데이터, 에러, 제출 중 여부
  const [values, setValues] = useState<FormData<T>>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력 변경 핸들러
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as unknown as { name: keyof T; value: any };
    setValues(prev => ({ ...prev, [name]: value }));
    // 입력 시작 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // 이전 에러 초기화

    // 1. 유효성 검사 실행 (인수로 받은 함수 사용)
    const validationErrors = validate(values);
    setErrors(validationErrors);

    // 2. 에러가 없으면 제출 로직 실행
    if (Object.keys(validationErrors).length === 0) {
      try {
        // 3. 인수로 받은 onSubmit 함수 호출
        const response = await onSubmit(values);
        onSuccess?.(response); // 성공 콜백
        // setValues(initialValues); // 성공 시 폼 초기화 (선택 사항)
      } catch (error: any) {
        console.error("Form submission error:", error);
        onError?.(error); // 실패 콜백
        // 서버 에러 메시지를 errors 상태에 설정할 수도 있음
        // setErrors({ _server: error.message || '제출 중 오류 발생' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false); // 유효성 검사 실패 시 로딩 해제
    }
  }, [values, validate, onSubmit, onSuccess, onError, initialValues]);

  // 훅 반환 값
  return {
    values,       // 현재 폼 값들 (input value에 연결)
    errors,       // 현재 에러 상태 (ErrorMessage에 연결)
    isSubmitting, // 로딩 상태
    handleChange, // input onChange에 연결
    handleSubmit  // form onSubmit에 연결
  };
}