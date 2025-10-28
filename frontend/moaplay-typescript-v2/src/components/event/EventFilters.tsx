/**
 * 행사 필터 컴포넌트
 * 
 * 지역, 태그, 날짜 범위, 정렬 옵션 등의 필터를 제공합니다.
 */

import React from 'react';
import styled from 'styled-components';
import { EventFilters as EventFiltersType } from '../../hooks/useEventList';

/**
 * EventFilters 컴포넌트 Props
 */
export interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: Partial<EventFiltersType>) => void;
  onReset: () => void;
  className?: string;
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
  { value: '경기', label: '경기' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' }
];

/**
 * 정렬 옵션 목록
 */
const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'recommended', label: '추천순' }
];

/**
 * 인기 태그 목록 (실제로는 API에서 가져와야 함)
 */
const POPULAR_TAGS = [
  '음악', '전시', '페스티벌', '공연', '워크샵', 
  '세미나', '컨퍼런스', '스포츠', '문화', '예술'
];

/**
 * 행사 필터 컴포넌트
 * 
 * 사용자가 행사를 필터링할 수 있는 다양한 옵션을 제공합니다.
 */
export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  className
}) => {
  /**
   * 지역 변경 처리
   */
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ region: e.target.value || undefined });
  };

  /**
   * 정렬 옵션 변경 처리
   */
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ sort: e.target.value as 'latest' | 'popular' | 'recommended' });
  };

  /**
   * 태그 토글 처리
   */
  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const isSelected = currentTags.includes(tag);
    
    if (isSelected) {
      onFiltersChange({ 
        tags: currentTags.filter(t => t !== tag) 
      });
    } else {
      onFiltersChange({ 
        tags: [...currentTags, tag] 
      });
    }
  };

  /**
   * 시작 날짜 변경 처리
   */
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ startDate: e.target.value || undefined });
  };

  /**
   * 종료 날짜 변경 처리
   */
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ endDate: e.target.value || undefined });
  };

  return (
    <FiltersContainer className={className}>
      <FiltersHeader>
        <h3>필터</h3>
        <ResetButton onClick={onReset}>
          초기화
        </ResetButton>
      </FiltersHeader>

      {/* 정렬 옵션 */}
      <FilterSection>
        <FilterLabel>정렬</FilterLabel>
        <Select value={filters.sort} onChange={handleSortChange}>
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FilterSection>

      {/* 지역 필터 */}
      <FilterSection>
        <FilterLabel>지역</FilterLabel>
        <Select value={filters.region || ''} onChange={handleRegionChange}>
          {REGION_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FilterSection>

      {/* 날짜 범위 필터 */}
      <FilterSection>
        <FilterLabel>날짜 범위</FilterLabel>
        <DateInputContainer>
          <DateInput
            type="date"
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
            placeholder="시작일"
          />
          <DateSeparator>~</DateSeparator>
          <DateInput
            type="date"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
            placeholder="종료일"
          />
        </DateInputContainer>
      </FilterSection>

      {/* 태그 필터 */}
      <FilterSection>
        <FilterLabel>태그</FilterLabel>
        <TagContainer>
          {POPULAR_TAGS.map(tag => (
            <TagButton
              key={tag}
              $selected={filters.tags?.includes(tag) || false}
              onClick={() => handleTagToggle(tag)}
            >
              #{tag}
            </TagButton>
          ))}
        </TagContainer>
      </FilterSection>
    </FiltersContainer>
  );
};

const FiltersContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  h3 {
    margin: 0;
    font-size: ${({ theme }) => theme.fonts.size.lg};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const FilterSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text};
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DateInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DateInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DateSeparator = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TagButton = styled.button<{ $selected: boolean }>`
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : theme.colors.backgroundLight};
  color: ${({ $selected, theme }) => 
    $selected ? 'white' : theme.colors.primary};
  border: 1px solid ${({ $selected, theme }) => 
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $selected, theme }) => 
      $selected ? theme.colors.primaryDark : theme.colors.backgroundHover};
  }
`;