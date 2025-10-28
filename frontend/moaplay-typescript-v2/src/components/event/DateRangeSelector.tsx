/**
 * 날짜 범위 선택 컴포넌트
 * 
 * 행사의 시작일과 종료일을 선택할 수 있는 컴포넌트입니다.
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 날짜 범위 선택기 Props
 */
interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  startDateError?: string;
  endDateError?: string;
  minDate?: string;
  maxDate?: string;
}

/**
 * 날짜 범위 선택 컴포넌트
 */
export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onChange,
  startDateError,
  endDateError,
  minDate,
  maxDate
}) => {
  /**
   * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
   */
  const getTodayString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  /**
   * 시작일 변경 처리
   */
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    
    // 종료일이 시작일보다 이전이면 종료일을 시작일과 같게 설정
    let newEndDate = endDate;
    if (endDate && newStartDate > endDate) {
      newEndDate = newStartDate;
    }
    
    onChange(newStartDate, newEndDate);
  };

  /**
   * 종료일 변경 처리
   */
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    onChange(startDate, newEndDate);
  };

  /**
   * 날짜 형식을 한국어로 변환
   */
  const formatDateToKorean = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  /**
   * 날짜 차이 계산 (일 단위)
   */
  const calculateDateDifference = (): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // 시작일 포함
  };

  const defaultMinDate = minDate || getTodayString();
  const dateDifference = calculateDateDifference();

  return (
    <DateRangeContainer>
      <DateRangeHeader>
        <SectionTitle>행사 일정</SectionTitle>
        {startDate && endDate && (
          <DateSummary>
            {dateDifference === 1 ? '당일 행사' : `${dateDifference}일간 진행`}
          </DateSummary>
        )}
      </DateRangeHeader>

      <DateInputsContainer>
        {/* 시작일 */}
        <DateInputGroup>
          <DateLabel htmlFor="startDate">
            시작일 <RequiredMark>*</RequiredMark>
          </DateLabel>
          <DateInput
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={defaultMinDate}
            max={maxDate}
            hasError={!!startDateError}
          />
          {startDateError && (
            <ErrorMessage>{startDateError}</ErrorMessage>
          )}
          {startDate && (
            <DateDisplay>{formatDateToKorean(startDate)}</DateDisplay>
          )}
        </DateInputGroup>

        {/* 날짜 연결선 */}
        <DateConnector>
          <ConnectorLine />
          <ConnectorText>~</ConnectorText>
          <ConnectorLine />
        </DateConnector>

        {/* 종료일 */}
        <DateInputGroup>
          <DateLabel htmlFor="endDate">
            종료일 <RequiredMark>*</RequiredMark>
          </DateLabel>
          <DateInput
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || defaultMinDate}
            max={maxDate}
            hasError={!!endDateError}
          />
          {endDateError && (
            <ErrorMessage>{endDateError}</ErrorMessage>
          )}
          {endDate && (
            <DateDisplay>{formatDateToKorean(endDate)}</DateDisplay>
          )}
        </DateInputGroup>
      </DateInputsContainer>

      {/* 빠른 선택 버튼들 */}
      <QuickSelectContainer>
        <QuickSelectTitle>빠른 선택</QuickSelectTitle>
        <QuickSelectButtons>
          <QuickSelectButton
            type="button"
            onClick={() => {
              const today = getTodayString();
              onChange(today, today);
            }}
          >
            오늘
          </QuickSelectButton>
          
          <QuickSelectButton
            type="button"
            onClick={() => {
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              const tomorrowString = tomorrow.toISOString().split('T')[0];
              onChange(tomorrowString, tomorrowString);
            }}
          >
            내일
          </QuickSelectButton>
          
          <QuickSelectButton
            type="button"
            onClick={() => {
              const today = new Date();
              const nextWeek = new Date(today);
              nextWeek.setDate(today.getDate() + 7);
              const nextWeekString = nextWeek.toISOString().split('T')[0];
              onChange(nextWeekString, nextWeekString);
            }}
          >
            다음 주
          </QuickSelectButton>
          
          <QuickSelectButton
            type="button"
            onClick={() => {
              const today = new Date();
              const weekend = new Date(today);
              // 다음 토요일 찾기
              const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
              weekend.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
              
              const sunday = new Date(weekend);
              sunday.setDate(weekend.getDate() + 1);
              
              const saturdayString = weekend.toISOString().split('T')[0];
              const sundayString = sunday.toISOString().split('T')[0];
              
              onChange(saturdayString, sundayString);
            }}
          >
            주말 (토-일)
          </QuickSelectButton>
        </QuickSelectButtons>
      </QuickSelectContainer>

      {/* 도움말 */}
      <DateHelp>
        💡 행사가 하루 종일 진행되는 경우 시작일과 종료일을 같게 설정하세요.
      </DateHelp>
    </DateRangeContainer>
  );
};

// 스타일 컴포넌트들
const DateRangeContainer = styled.div`
  margin-bottom: 24px;
`;

const DateRangeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const DateSummary = styled.div`
  font-size: 14px;
  color: #007bff;
  font-weight: 500;
`;

const DateInputsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DateInputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateLabel = styled.label`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #dc3545;
`;

const DateInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError'
})<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e9ecef'};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#007bff'};
  }
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #dc3545;
`;

const DateDisplay = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
`;

const DateConnector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  
  @media (max-width: 768px) {
    margin-top: 0;
    transform: rotate(90deg);
  }
`;

const ConnectorLine = styled.div`
  width: 20px;
  height: 2px;
  background: #dee2e6;
  
  @media (max-width: 768px) {
    width: 2px;
    height: 20px;
  }
`;

const ConnectorText = styled.div`
  margin: 0 8px;
  font-size: 18px;
  font-weight: bold;
  color: #6c757d;
`;

const QuickSelectContainer = styled.div`
  margin-bottom: 16px;
`;

const QuickSelectTitle = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const QuickSelectButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const QuickSelectButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  background: white;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
    background: #f8f9fa;
  }
  
  &:active {
    background: #e9ecef;
  }
`;

const DateHelp = styled.div`
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #6c757d;
  border-left: 4px solid #007bff;
`;