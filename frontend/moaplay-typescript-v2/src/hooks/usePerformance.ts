/**
 * 성능 최적화 관련 커스텀 훅들
 * 
 * 디바운싱, 스로틀링, 메모이제이션 등 성능 최적화를 위한
 * 재사용 가능한 훅들을 제공합니다.
 */

import { useEffect, useState } from 'react';

/**
 * 디바운스 훅
 * 
 * 지정된 지연 시간 동안 값이 변경되지 않을 때만 업데이트된 값을 반환합니다.
 * 검색 입력, API 호출 등에서 불필요한 요청을 줄이는 데 사용됩니다.
 * 
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 값
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};