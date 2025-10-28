// UI sort 값을 API sort 값으로 매핑하는 함수
export function mapSortToApi(
  sort: 'latest' | 'popular' | 'recommended' | string
): 'created_at' | 'view_count' | 'average_rating' | string {
  const sortMap: Record<string, string> = {
    latest: 'created_at',
    popular: 'view_count',
    recommended: 'average_rating',
  };
  return sortMap[sort] || sort;
}

// API sort 값을 UI sort 값으로 매핑하는 함수
export function mapSortFromApi(
  sort: 'created_at' | 'view_count' | 'average_rating' | string
): 'latest' | 'popular' | 'recommended' | string {
  const sortMap: Record<string, string> = {
    created_at: 'latest',
    view_count: 'popular',
    average_rating: 'recommended',
  };
  return sortMap[sort] || sort;
}
