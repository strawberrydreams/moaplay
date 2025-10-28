/**
 * 검색 필터 컴포넌트
 * 
 * 검색 결과 페이지에서 사용되는 필터 컴포넌트입니다.
 * 날짜 범위, 지역, 정렬 옵션을 제공하며, 필터 적용 시 URL을 업데이트합니다.
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { SearchFilters as SearchFiltersType } from '../../types';

/**
 * 검색 필터 컴포넌트 Props
 */
interface SearchFiltersProps {
  /** 현재 적용된 필터 */
  filters: SearchFiltersType;
  /** 필터 변경 콜백 */
  onFiltersChange: (filters: SearchFiltersType) => void;
  /** 필터 초기화 콜백 */
  onFiltersReset: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 지역 옵션 목록
 */
const REGION_OPTIONS = [
  { value: '', label: '전체 지역' },
  { value: '서울', label: '서울' },
  { value: '부산', label: '부산' },
  { value: '대구', label: '대구' },
  { value: '인천', label: '인천' },
  { value: '광주', label: '광주' },
  { value: '대전', label: '대전' },
  { value: '울산', label: '울산' },
  { value: '세종', label: '세종' },
  { value: '경기', label: '경기도' },
  { value: '강원', label: '강원도' },
  { value: '충북', label: '충청북도' },
  { value: '충남', label: '충청남도' },
  { value: '전북', label: '전라북도' },
  { value: '전남', label: '전라남도' },
  { value: '경북', label: '경상북도' },
  { value: '경남', label: '경상남도' },
  { value: '제주', label: '제주도' },
];

/**
 * 정렬 옵션 목록
 */
const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'recommended', label: '추천순' },
];

/**
 * 검색 필터 컴포넌트
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onFiltersReset,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * 지역 필터 변경 처리
   */
  const handleRegionChange = useCallback((region: string) => {
    onFiltersChange({
      ...filters,
      region: region || undefined,
    });
  }, [filters, onFiltersChange]);

  /**
   * 정렬 옵션 변경 처리
   */
  const handleSortChange = useCallback((sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as 'latest' | 'popular' | 'recommended',
    });
  }, [filters, onFiltersChange]);

  /**
   * 날짜 범위 변경 처리
   */
  const handleDateRangeChange = useCallback((start: string, end: string) => {
    if (start && end) {
      onFiltersChange({
        ...filters,
        dateRange: { start, end },
      });
    } else {
      // dateRange를 제외한 나머지 필터만 적용
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dateRange, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  }, [filters, onFiltersChange]);

  /**
   * 태그 필터 변경 처리
   */
  const handleTagsChange = useCallback((tags: string[]) => {
    onFiltersChange({
      ...filters,
      tags: tags.length > 0 ? tags : undefined,
    });
  }, [filters, onFiltersChange]);

  /**
   * 필터 초기화
   */
  const handleReset = useCallback(() => {
    onFiltersReset();
    setIsExpanded(false);
  }, [onFiltersReset]);

  /**
   * 적용된 필터 개수 계산
   */
  const getAppliedFiltersCount = (): number => {
    let count = 0;
    if (filters.region) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dateRange) count++;
    if (filters.sortBy && filters.sortBy !== 'latest') count++;
    return count;
  };

  const appliedFiltersCount = getAppliedFiltersCount();

  return (
    <FiltersContainer>
      {/* 필터 헤더 */}
      <FiltersHeader>
        <FiltersTitle>
          필터
          {appliedFiltersCount > 0 && (
            <FilterCount>({appliedFiltersCount})</FilterCount>
          )}
        </FiltersTitle>
        
        <FiltersActions>
          {appliedFiltersCount > 0 && (
            <ResetButton onClick={handleReset} disabled={isLoading}>
              초기화
            </ResetButton>
          )}
          
          <ExpandButton
            onClick={() => setIsExpanded(!isExpanded)}
            $expanded={isExpanded}
            disabled={isLoading}
          >
            {isExpanded ? '접기' : '펼치기'}
          </ExpandButton>
        </FiltersActions>
      </FiltersHeader>

      {/* 기본 필터 (항상 표시) */}
      <BasicFilters>
        {/* 정렬 옵션 */}
        <FilterGroup>
          <FilterLabel>정렬</FilterLabel>
          <SortButtons>
            {SORT_OPTIONS.map(option => (
              <SortButton
                key={option.value}
                $active={filters.sortBy === option.value}
                onClick={() => handleSortChange(option.value)}
                disabled={isLoading}
              >
                {option.label}
              </SortButton>
            ))}
          </SortButtons>
        </FilterGroup>

        {/* 지역 필터 */}
        <FilterGroup>
          <FilterLabel>지역</FilterLabel>
          <RegionSelect
            value={filters.region || ''}
            onChange={(e) => handleRegionChange(e.target.value)}
            disabled={isLoading}
          >
            {REGION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </RegionSelect>
        </FilterGroup>
      </BasicFilters>

      {/* 고급 필터 (펼치기/접기) */}
      {isExpanded && (
        <AdvancedFilters>
          {/* 날짜 범위 필터 */}
          <FilterGroup>
            <FilterLabel>날짜 범위</FilterLabel>
            <DateRangeInputs>
              <DateInput
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange(
                  e.target.value,
                  filters.dateRange?.end || ''
                )}
                disabled={isLoading}
                placeholder="시작일"
              />
              <DateSeparator>~</DateSeparator>
              <DateInput
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange(
                  filters.dateRange?.start || '',
                  e.target.value
                )}
                disabled={isLoading}
                placeholder="종료일"
              />
            </DateRangeInputs>
          </FilterGroup>

          {/* 태그 필터 */}
          <FilterGroup>
            <FilterLabel>태그</FilterLabel>
            <TagInput
              type="text"
              placeholder="태그를 입력하세요 (쉼표로 구분)"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                handleTagsChange(tags);
              }}
              disabled={isLoading}
            />
            <TagHint>
              예: 음악, 전시, 페스티벌
            </TagHint>
          </FilterGroup>
        </AdvancedFilters>
      )}
    </FiltersContainer>
  );
};

const FiltersContainer = styled.div`
  background: ${({ theme }) => theme.colors.backgroundLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FiltersTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FilterCount = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

const FiltersActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ResetButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.danger};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExpandButton = styled.button<{ $expanded: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BasicFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const AdvancedFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SortButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

const SortButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.border
  };
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary : 'white'
  };
  color: ${({ theme, $active }) => 
    $active ? 'white' : theme.colors.text
  };
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${({ theme, $active }) => 
      $active ? theme.colors.primaryDark : theme.colors.backgroundLight
    };
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RegionSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const DateRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DateInput = styled.input`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  transition: border-color 0.2s ease;
  flex: 1;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const DateSeparator = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const TagInput = styled.input`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const TagHint = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;