// API 응답의 배열 정규화를 지원하는 함수
export function normalizeToArray<T>(response: T[] | { items: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'items' in response) {
    return response.items;
  }
  return [];
}

// 페이지네이션 응답 정규화를 지원하는 함수
export function normalizePaginatedResponse<T>(
  response: T[] | { items: T[]; pagination?: any }
): { items: T[]; pagination?: any } {
  if (Array.isArray(response)) {
    return { items: response };
  }
  return response;
}