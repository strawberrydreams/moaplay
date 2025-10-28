// 날짜 관련 유틸리티 함수들의 모음

// 날짜를 한국어 형식으로 변경해서 날짜 문자열을 반환하는 함수
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};

// 시작일과 종료일을 범위 형태로 변경해서 날짜 범위 문자열을 반환하는 함수
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // 같은 날인지 확인
  const isSameDay = start.toDateString() === end.toDateString();
  
  if (isSameDay) {
    return formatDate(start);
  }
  
  // 같은 년도인지 확인
  const isSameYear = start.getFullYear() === end.getFullYear();
  
  if (isSameYear) {
    const startFormatted = start.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    });
    const endFormatted = end.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `${startFormatted} ~ ${endFormatted}`;
  }
  
  // 다른 년도
  const startFormatted = start.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const endFormatted = end.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `${startFormatted} ~ ${endFormatted}`;
};