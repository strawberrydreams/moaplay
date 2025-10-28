/**
 * 통합 검색창 컴포넌트
 *
 * 행사명, 해시태그, 지역 등을 검색할 수 있는 구글 스타일의 검색창입니다.
 * 검색 히스토리, 자동완성 제안, 디바운싱 등의 고급 기능을 포함합니다.
 *
 * 성능 최적화 적용:
 * - React.memo로 불필요한 리렌더링 방지
 * - useCallback으로 함수 참조 안정화
 * - useMemo로 계산 결과 메모이제이션
 * - 디바운싱으로 API 호출 최적화
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { useSearch } from '../../hooks';
import { useAuth } from '../../hooks';
import { useDebounce } from '../../hooks/usePerformance';
import {
  SearchContainer,
  SearchInputWrapper,
  SearchIcon,
  SearchInput,
  ClearButton,
  SearchButton,
  LoadingSpinner,
  SearchDropdown,
  DropdownSection,
  SectionHeader,
  SectionTitle,
  ClearAllButton,
  SectionDivider,
  DropdownItem,
  ItemIcon,
  ItemText,
  ItemMeta,
  DeleteButton,
  EmptyState,
  EmptyIcon,
  EmptyText,
} from '../../styles/components';

/**
 * SearchBar 컴포넌트 Props
 */
export interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  disabled?: boolean;
  className?: string;
  onSearchExecuted?: (query: string) => void;
}

/**
 * 통합 검색창 컴포넌트
 *
 * 사용자가 행사를 검색할 수 있는 입력창을 제공합니다.
 * Enter 키 또는 검색 버튼 클릭으로 검색을 실행할 수 있습니다.
 * 로그인한 사용자에게는 검색 히스토리와 자동완성 기능을 제공합니다.
 *
 * 성능 최적화가 적용된 컴포넌트입니다.
 */
const SearchBarComponent: React.FC<SearchBarProps> = ({
  placeholder = '행사명, #해시태그, 지역으로 검색하세요',
  initialValue = '',
  showHistory = true,
  showSuggestions = true,
  disabled = false,
  className,
  onSearchExecuted,
}) => {
  const { isAuthenticated } = useAuth();
  const {
    searchState,
    setQuery,
    clearQuery,
    getSuggestions,
    clearSuggestions,
    deleteHistoryItem,
    clearHistory,
    navigateToSearch,
  } = useSearch(initialValue);

  // 드롭다운 표시 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // 컴포넌트 참조
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 디바운스된 검색어 (자동완성 요청 최적화)
  const debouncedQuery = useDebounce(searchState.query, 300);

  /**
   * 검색 실행 처리
   */
  const handleSearch = useCallback(() => {
    const trimmedQuery = searchState.query.trim();
    if (!trimmedQuery) {
      // 빈 검색어 경고
      alert('검색어를 입력해주세요.');
      return;
    }

    navigateToSearch(trimmedQuery);
    setShowDropdown(false);
    if (onSearchExecuted) {
      onSearchExecuted(trimmedQuery);
    }
  }, [searchState.query, navigateToSearch, onSearchExecuted]);

  /**
   * 검색어 초기화 처리
   */
  const handleClear = useCallback(() => {
    clearQuery();
    clearSuggestions();
    setShowDropdown(false);
    inputRef.current?.focus();
  }, [clearQuery, clearSuggestions]);

  /**
   * 입력값 변경 처리 (useCallback으로 최적화)
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
    },
    [setQuery]
  );

  // 디바운스된 검색어로 자동완성 요청 (useEffect로 분리하여 최적화)
  useEffect(() => {
    if (showSuggestions && debouncedQuery.trim().length >= 2) {
      getSuggestions(debouncedQuery);
    } else {
      clearSuggestions();
    }
  }, [debouncedQuery, showSuggestions, getSuggestions, clearSuggestions]);

  /**
   * 포커스 처리
   */
  const handleFocus = useCallback(() => {
    if (showHistory || showSuggestions) {
      setShowDropdown(true);
      setFocusedIndex(-1);
    }
  }, [showHistory, showSuggestions]);

  /**
   * 키보드 이벤트 처리
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const dropdownItems = [
        ...searchState.history,
        ...searchState.suggestions,
      ];

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && dropdownItems[focusedIndex]) {
            const item = dropdownItems[focusedIndex];
            const query = 'query' in item ? item.query : item.text;
            setQuery(query);
            navigateToSearch(query);
            setShowDropdown(false);
          } else {
            handleSearch();
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev =>
            prev < dropdownItems.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev > -1 ? prev - 1 : -1));
          break;

        case 'Escape':
          setShowDropdown(false);
          setFocusedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [
      focusedIndex,
      searchState.history,
      searchState.suggestions,
      setQuery,
      navigateToSearch,
      handleSearch,
    ]
  );

  /**
   * 드롭다운 항목 클릭 처리
   */
  const handleDropdownItemClick = useCallback(
    (query: string) => {
      setQuery(query);
      navigateToSearch(query);
      setShowDropdown(false);
      if (onSearchExecuted) {
        onSearchExecuted(query);
      }
    },
    [setQuery, navigateToSearch, onSearchExecuted]
  );

  /**
   * 히스토리 항목 삭제 처리
   */
  const handleDeleteHistory = useCallback(
    async (e: React.MouseEvent, historyId: number) => {
      e.stopPropagation();
      try {
        await deleteHistoryItem(historyId);
      } catch (error) {
        console.error('Failed to delete history item:', error);
      }
    },
    [deleteHistoryItem]
  );

  /**
   * 전체 히스토리 삭제 처리
   */
  const handleClearAllHistory = useCallback(async () => {
    try {
      await clearHistory();
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, [clearHistory]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 드롭다운에 표시할 항목들 (useMemo로 최적화)
  const dropdownItems = useMemo(
    () => [
      ...searchState.history.map(item => ({
        ...item,
        type: 'history' as const,
      })),
      ...searchState.suggestions.map(item => ({
        ...item,
        type: 'suggestion' as const,
      })),
    ],
    [searchState.history, searchState.suggestions]
  );

  // 검색 버튼 비활성화 상태 (useMemo로 최적화)
  const isSearchDisabled = useMemo(
    () => disabled || !searchState.query.trim() || searchState.isLoading,
    [disabled, searchState.query, searchState.isLoading]
  );

  // 드롭다운 표시 여부 (useMemo로 최적화)
  const shouldShowDropdown = useMemo(
    () =>
      showDropdown && (isAuthenticated || searchState.suggestions.length > 0),
    [showDropdown, isAuthenticated, searchState.suggestions.length]
  );

  return (
    <SearchContainer ref={containerRef} className={className}>
      <SearchInputWrapper>
        <SearchIcon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SearchIcon>

        <SearchInput
          ref={inputRef}
          type="text"
          value={searchState.query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label="행사 검색"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />

        {searchState.query && (
          <ClearButton
            onClick={handleClear}
            disabled={disabled}
            aria-label="검색어 지우기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ClearButton>
        )}

        <SearchButton
          onClick={handleSearch}
          disabled={isSearchDisabled}
          aria-label="검색 실행"
        >
          {searchState.isLoading ? <LoadingSpinner /> : '검색'}
        </SearchButton>
      </SearchInputWrapper>

      {/* 검색 드롭다운 */}
      {shouldShowDropdown && (
        <SearchDropdown role="listbox">
          {/* 검색 히스토리 섹션 */}
          {isAuthenticated && showHistory && searchState.history.length > 0 && (
            <DropdownSection>
              <SectionHeader>
                <SectionTitle>최근 검색어</SectionTitle>
                <ClearAllButton onClick={handleClearAllHistory}>
                  전체 삭제
                </ClearAllButton>
              </SectionHeader>
              {searchState.history.map((item, index) => (
                <DropdownItem
                  key={`history-${item.id}`}
                  onClick={() => handleDropdownItemClick(item.query)}
                  data-focused={focusedIndex === index}
                  role="option"
                  aria-selected={focusedIndex === index}
                >
                  <ItemIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 8V12L16 16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </ItemIcon>
                  <ItemText>{item.query}</ItemText>
                  <ItemMeta>{item.result_count}개 결과</ItemMeta>
                  <DeleteButton
                    onClick={e => handleDeleteHistory(e, item.id)}
                    aria-label="검색 기록 삭제"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </DeleteButton>
                </DropdownItem>
              ))}
            </DropdownSection>
          )}

          {/* 자동완성 제안 섹션 */}
          {showSuggestions && searchState.suggestions.length > 0 && (
            <DropdownSection>
              {searchState.history.length > 0 && <SectionDivider />}
              <SectionHeader>
                <SectionTitle>검색 제안</SectionTitle>
                {searchState.isLoadingSuggestions && <LoadingSpinner />}
              </SectionHeader>
              {searchState.suggestions.map((item, index) => {
                const adjustedIndex = searchState.history.length + index;
                return (
                  <DropdownItem
                    key={`suggestion-${index}`}
                    onClick={() => handleDropdownItemClick(item.text)}
                    data-focused={focusedIndex === adjustedIndex}
                    role="option"
                    aria-selected={focusedIndex === adjustedIndex}
                  >
                    <ItemIcon>
                      {item.type === 'tag' ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20.59 13.41L13.42 20.58C13.2343 20.766 12.9949 20.8709 12.745 20.8709C12.4951 20.8709 12.2557 20.766 12.07 20.58L2.29 10.8C2.19896 10.7094 2.12759 10.6008 2.08 10.48L0.32 4.69C0.266315 4.53551 0.248374 4.37068 0.267253 4.20805C0.286131 4.04542 0.341421 3.88952 0.429 3.75C0.516579 3.61048 0.634137 3.49364 0.773 3.40781C0.911863 3.32198 1.06799 3.26932 1.23 3.25H7C7.26522 3.25 7.51957 3.35536 7.707 3.543L17.5 13.336C17.6863 13.5223 17.7912 13.7617 17.7912 14.0115C17.7912 14.2614 17.6863 14.5008 17.5 14.687L20.59 13.41Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : item.type === 'location' ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </ItemIcon>
                    <ItemText>{item.text}</ItemText>
                    {item.count && <ItemMeta>{item.count}개</ItemMeta>}
                  </DropdownItem>
                );
              })}
            </DropdownSection>
          )}

          {/* 빈 상태 */}
          {dropdownItems.length === 0 && (
            <EmptyState>
              <EmptyIcon>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </EmptyIcon>
              <EmptyText>검색어를 입력해보세요</EmptyText>
            </EmptyState>
          )}
        </SearchDropdown>
      )}
    </SearchContainer>
  );
};

/**
 * React.memo로 감싸서 props가 변경되지 않으면 리렌더링을 방지
 * 검색창은 자주 사용되는 컴포넌트이므로 성능 최적화가 중요합니다.
 */
export const SearchBar = React.memo(SearchBarComponent);
