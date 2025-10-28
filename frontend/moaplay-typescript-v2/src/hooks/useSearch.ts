/**
 * 검색 관련 커스텀 훅
 * 
 * 검색 실행, 검색 히스토리 관리, 자동완성 등의 검색 기능을 제공합니다.
 * 디바운싱을 통한 API 호출 최적화와 로딩 상태 관리를 포함합니다.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SearchService, 
  SearchResponse, 
  SearchSuggestion, 
  SearchHistoryItem 
} from '../services/searchService';
import { SearchParams } from '../types';
import { useAuth } from './useAuth';

/**
 * 검색 상태 인터페이스
 */
interface SearchState {
  query: string;
  results: SearchResponse | null;
  suggestions: SearchSuggestion[];
  history: SearchHistoryItem[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
}

/**
 * useSearch 훅의 반환 타입
 */
interface UseSearchReturn {
  // 상태
  searchState: SearchState;
  
  // 검색 실행
  executeSearch: (query: string, params?: SearchParams) => Promise<void>;
  
  // 검색어 관리
  setQuery: (query: string) => void;
  clearQuery: () => void;
  
  // 자동완성
  getSuggestions: (query: string) => Promise<void>;
  clearSuggestions: () => void;
  
  // 검색 히스토리
  loadHistory: () => Promise<void>;
  deleteHistoryItem: (historyId: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  
  // 유틸리티
  navigateToSearch: (query: string, params?: SearchParams) => void;
  parseQuery: (query: string) => ReturnType<typeof SearchService.parseQuery>;
}

/**
 * 검색 기능을 위한 커스텀 훅
 * 
 * @param initialQuery 초기 검색어
 * @param autoLoadHistory 히스토리 자동 로드 여부 (기본값: true)
 * @returns 검색 관련 상태와 함수들
 */
export const useSearch = (
  initialQuery: string = '',
  autoLoadHistory: boolean = true
): UseSearchReturn => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 디바운싱을 위한 타이머 ref
  const suggestionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 검색 상태
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    results: null,
    suggestions: [],
    history: [],
    isLoading: false,
    isLoadingSuggestions: false,
    error: null,
  });

  /**
   * 검색 히스토리 로드
   */
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const history = await SearchService.getSearchHistory();
      
      setSearchState(prev => ({
        ...prev,
        history,
      }));
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, [isAuthenticated]);

  /**
   * 검색 실행
   * 
   * @param query 검색어
   * @param params 추가 검색 파라미터
   */
  const executeSearch = useCallback(async (query: string, params: SearchParams = {}) => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await SearchService.search(trimmedQuery, params);
      
      setSearchState(prev => ({
        ...prev,
        results: response,
        query: trimmedQuery,
        isLoading: false,
      }));

      // 검색 히스토리에 저장 (로그인한 사용자만)
      if (isAuthenticated) {
        await SearchService.saveToHistory(trimmedQuery, response.search_info.total_results);
        // 히스토리 다시 로드
        await loadHistory();
      }
    } catch (error) {
      console.error('Search execution failed:', error);
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.',
      }));
    }
  }, [isAuthenticated, loadHistory]);

  /**
   * 검색어 설정
   * 
   * @param query 새로운 검색어
   */
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
    }));
  }, []);

  /**
   * 검색어 초기화
   */
  const clearQuery = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: null,
      suggestions: [],
      error: null,
    }));
  }, []);

  /**
   * 자동완성 제안 조회 (디바운싱 적용)
   * 
   * @param query 입력 중인 검색어
   */
  const getSuggestions = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    // 이전 타이머 취소
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }

    if (trimmedQuery.length < 2) {
      setSearchState(prev => ({
        ...prev,
        suggestions: [],
      }));
      return;
    }

    // 300ms 디바운싱
    suggestionTimerRef.current = setTimeout(async () => {
      setSearchState(prev => ({
        ...prev,
        isLoadingSuggestions: true,
      }));

      try {
        const suggestions = await SearchService.getSuggestions(trimmedQuery);
        
        setSearchState(prev => ({
          ...prev,
          suggestions,
          isLoadingSuggestions: false,
        }));
      } catch (error) {
        console.error('Failed to get suggestions:', error);
        setSearchState(prev => ({
          ...prev,
          suggestions: [],
          isLoadingSuggestions: false,
        }));
      }
    }, 300);
  }, []);

  /**
   * 자동완성 제안 초기화
   */
  const clearSuggestions = useCallback(() => {
    if (suggestionTimerRef.current) {
      clearTimeout(suggestionTimerRef.current);
    }
    
    setSearchState(prev => ({
      ...prev,
      suggestions: [],
      isLoadingSuggestions: false,
    }));
  }, []);

  /**
   * 검색 히스토리 항목 삭제
   * 
   * @param historyId 삭제할 히스토리 항목 ID
   */
  const deleteHistoryItem = useCallback(async (historyId: number) => {
    try {
      await SearchService.deleteHistoryItem(historyId);
      
      // 로컬 상태에서도 제거
      setSearchState(prev => ({
        ...prev,
        history: prev.history.filter(item => item.id !== historyId),
      }));
    } catch (error) {
      console.error('Failed to delete history item:', error);
      throw error;
    }
  }, []);

  /**
   * 전체 검색 히스토리 삭제
   */
  const clearHistory = useCallback(async () => {
    try {
      await SearchService.clearSearchHistory();
      
      setSearchState(prev => ({
        ...prev,
        history: [],
      }));
    } catch (error) {
      console.error('Failed to clear search history:', error);
      throw error;
    }
  }, []);

  /**
   * 검색 결과 페이지로 이동
   * 
   * @param query 검색어
   * @param params 추가 검색 파라미터
   */
  const navigateToSearch = useCallback((query: string, params: SearchParams = {}) => {
    const searchParams = new URLSearchParams();
    
    if (query.trim()) {
      searchParams.set('q', query.trim());
    }
    
    if (params.region) {
      searchParams.set('region', params.region);
    }
    
    if (params.tags && params.tags.length > 0) {
      searchParams.set('tags', params.tags.join(','));
    }
    
    if (params.dateRange) {
      searchParams.set('start_date', params.dateRange.start);
      searchParams.set('end_date', params.dateRange.end);
    }
    
    if (params.sortBy) {
      searchParams.set('sort', params.sortBy);
    }
    
    if (params.page) {
      searchParams.set('page', params.page.toString());
    }

    // 검색 결과 페이지로 이동
    navigate(`/search?${searchParams.toString()}`);
  }, [navigate]);

  /**
   * 검색어 파싱 유틸리티
   */
  const parseQuery = useCallback((query: string) => {
    return SearchService.parseQuery(query);
  }, []);

  // 컴포넌트 마운트 시 히스토리 로드
  useEffect(() => {
    if (autoLoadHistory && isAuthenticated) {
      loadHistory();
    }
  }, [autoLoadHistory, isAuthenticated, loadHistory]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
      }
    };
  }, []);

  return {
    searchState,
    executeSearch,
    setQuery,
    clearQuery,
    getSuggestions,
    clearSuggestions,
    loadHistory,
    deleteHistoryItem,
    clearHistory,
    navigateToSearch,
    parseQuery,
  };
};