/**
 * 페이지네이션 컴포넌트
 * 
 * 검색 결과, 행사 목록 등에서 사용할 수 있는 재사용 가능한 페이지네이션 컴포넌트입니다.
 * 이전/다음 버튼, 페이지 번호, 첫 페이지/마지막 페이지 이동 기능을 제공합니다.
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 페이지네이션 Props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

/**
 * 페이지네이션 컴포넌트
 * 
 * 페이지 번호를 표시하고 페이지 이동 기능을 제공합니다.
 * 현재 페이지 주변의 페이지 번호만 표시하여 UI를 깔끔하게 유지합니다.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  maxVisiblePages = 5,
  className
}) => {
  // 페이지가 1개 이하인 경우 페이지네이션을 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  /**
   * 표시할 페이지 번호 범위 계산
   */
  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // 시작 페이지가 너무 뒤에 있으면 앞으로 당기기
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <PaginationContainer className={className}>
      {/* 페이지 정보 */}
      {showInfo && totalItems && itemsPerPage && (
        <PageInfo>
          {totalItems > 0 ? (
            <>
              <strong>{startItem.toLocaleString()}</strong>-
              <strong>{endItem.toLocaleString()}</strong> / 
              총 <strong>{totalItems.toLocaleString()}</strong>개
            </>
          ) : (
            '결과가 없습니다'
          )}
        </PageInfo>
      )}

      {/* 페이지네이션 버튼들 */}
      <PageButtons>
        {/* 첫 페이지 버튼 */}
        <PageButton
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="첫 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 17L13 12L18 7M11 17L6 12L11 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </PageButton>

        {/* 이전 페이지 버튼 */}
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </PageButton>

        {/* 시작 생략 표시 */}
        {visiblePages[0] > 1 && (
          <>
            <PageNumber
              onClick={() => handlePageChange(1)}
              $active={false}
            >
              1
            </PageNumber>
            {visiblePages[0] > 2 && <Ellipsis>...</Ellipsis>}
          </>
        )}

        {/* 페이지 번호들 */}
        {visiblePages.map(page => (
          <PageNumber
            key={page}
            onClick={() => handlePageChange(page)}
            $active={page === currentPage}
            aria-label={`페이지 ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </PageNumber>
        ))}

        {/* 끝 생략 표시 */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <Ellipsis>...</Ellipsis>
            )}
            <PageNumber
              onClick={() => handlePageChange(totalPages)}
              $active={false}
            >
              {totalPages}
            </PageNumber>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </PageButton>

        {/* 마지막 페이지 버튼 */}
        <PageButton
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="마지막 페이지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 17L11 12L6 7M13 17L18 12L13 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </PageButton>
      </PageButtons>
    </PaginationContainer>
  );
};

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.xl} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const PageInfo = styled.div`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  strong {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }
`;

const PageButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: white;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.backgroundLight};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
  }
`;

const PageNumber = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 ${({ theme }) => theme.spacing.sm};
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
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ $active }) => $active ? '600' : '400'};

  &:hover:not(:disabled) {
    background: ${({ theme, $active }) => 
      $active ? theme.colors.primaryDark : theme.colors.backgroundLight
    };
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme, $active }) => 
      $active ? 'white' : theme.colors.primary
    };
  }
`;

const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  user-select: none;
`;