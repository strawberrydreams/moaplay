/**
 * 적용된 필터 표시 컴포넌트
 * 
 * 현재 적용된 검색 필터를 시각적으로 표시하고,
 * 개별 필터를 제거할 수 있는 기능을 제공합니다.
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { SearchFilters } from '../../types';

/**
 * 적용된 필터 표시 컴포넌트 Props
 */
interface AppliedFiltersProps {
  /** 현재 적용된 필터 */
  filters: SearchFilters;
  /** 필터 제거 콜백 */
  onFilterRemove: (filterType: keyof SearchFilters, value?: string) => void;
  /** 전체 필터 초기화 콜백 */
  onFiltersReset: () => void;
  /** 검색어 (필터와 함께 표시) */
  searchQuery?: string;
}

/**
 * 필터 항목 인터페이스
 */
interface FilterItem {
  type: keyof SearchFilters;
  label: string;
  value?: string;
  removable: boolean;
}

/**
 * 적용된 필터 표시 컴포넌트
 */
export const AppliedFilters: React.FC<AppliedFiltersProps> = ({
  filters,
  onFilterRemove,
  onFiltersReset,
  searchQuery,
}) => {
  /**
   * 적용된 필터 목록 생성
   */
  const getAppliedFilters = useCallback((): FilterItem[] => {
    const appliedFilters: FilterItem[] = [];

    // 지역 필터
    if (filters.region) {
      appliedFilters.push({
        type: 'region',
        label: `지역: ${filters.region}`,
        value: filters.region,
        removable: true,
      });
    }

    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        appliedFilters.push({
          type: 'tags',
          label: `태그: ${tag}`,
          value: tag,
          removable: true,
        });
      });
    }

    // 날짜 범위 필터
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start).toLocaleDateString('ko-KR');
      const endDate = new Date(filters.dateRange.end).toLocaleDateString('ko-KR');
      appliedFilters.push({
        type: 'dateRange',
        label: `날짜: ${startDate} ~ ${endDate}`,
        removable: true,
      });
    }

    // 정렬 필터 (기본값이 아닌 경우만)
    if (filters.sortBy && filters.sortBy !== 'latest') {
      const sortLabels = {
        popular: '인기순',
        recommended: '추천순',
      };
      appliedFilters.push({
        type: 'sortBy',
        label: `정렬: ${sortLabels[filters.sortBy as keyof typeof sortLabels]}`,
        removable: true,
      });
    }

    return appliedFilters;
  }, [filters]);

  /**
   * 개별 필터 제거 처리
   */
  const handleFilterRemove = useCallback((filterItem: FilterItem) => {
    if (filterItem.type === 'tags' && filterItem.value) {
      // 태그 필터의 경우 특정 태그만 제거
      onFilterRemove('tags', filterItem.value);
    } else {
      // 다른 필터의 경우 전체 제거
      onFilterRemove(filterItem.type);
    }
  }, [onFilterRemove]);

  const appliedFilters = getAppliedFilters();
  const hasFilters = appliedFilters.length > 0;

  // 필터가 없으면 렌더링하지 않음
  if (!hasFilters && !searchQuery) {
    return null;
  }

  return (
    <AppliedFiltersContainer>
      <FiltersHeader>
        <FiltersTitle>
          {searchQuery && (
            <SearchQueryDisplay>
              '<SearchQuery>{searchQuery}</SearchQuery>' 검색 결과
            </SearchQueryDisplay>
          )}
          {hasFilters && (
            <FiltersCount>
              {appliedFilters.length}개 필터 적용됨
            </FiltersCount>
          )}
        </FiltersTitle>

        {hasFilters && (
          <ClearAllButton onClick={onFiltersReset}>
            전체 초기화
          </ClearAllButton>
        )}
      </FiltersHeader>

      {hasFilters && (
        <FiltersList>
          {appliedFilters.map((filterItem, index) => (
            <FilterTag key={`${filterItem.type}-${filterItem.value || index}`}>
              <FilterLabel>{filterItem.label}</FilterLabel>
              {filterItem.removable && (
                <RemoveButton
                  onClick={() => handleFilterRemove(filterItem)}
                  aria-label={`${filterItem.label} 필터 제거`}
                >
                  ×
                </RemoveButton>
              )}
            </FilterTag>
          ))}
        </FiltersList>
      )}
    </AppliedFiltersContainer>
  );
};

const AppliedFiltersContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FiltersTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SearchQueryDisplay = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: 1.3;
`;

const SearchQuery = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const FiltersCount = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const ClearAllButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: white;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.danger}33;
  }
`;

const FiltersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: 500;
  gap: ${({ theme }) => theme.spacing.xs};
  max-width: 100%;
`;

const FilterLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.4);
  }
`;