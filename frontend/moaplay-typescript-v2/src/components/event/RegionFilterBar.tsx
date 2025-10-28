import React from 'react';
import styled from 'styled-components';

/**
 * 지역 필터 바 컴포넌트
 * 지역별 페이지에서 특정 지역의 행사를 필터링하는 기능 제공
 */
interface RegionFilterBarProps {
  regions: Region[];
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
  showAllOption?: boolean;
}

interface Region {
  code: string;
  name: string;
  eventCount?: number;
}

const RegionFilterBar: React.FC<RegionFilterBarProps> = ({
  regions,
  selectedRegion,
  onRegionSelect,
  showAllOption = true
}) => {
  /**
   * 지역 선택 핸들러
   * 이미 선택된 지역을 다시 클릭하면 선택 해제
   */
  const handleRegionClick = (regionCode: string) => {
    if (selectedRegion === regionCode) {
      onRegionSelect(null); // 선택 해제
    } else {
      onRegionSelect(regionCode);
    }
  };

  /**
   * 전체 지역 선택 핸들러
   */
  const handleAllRegionsClick = () => {
    onRegionSelect(null);
  };

  return (
    <FilterContainer>
      <FilterTitle>지역별 행사</FilterTitle>
      
      <FilterButtons>
        {/* 전체 보기 옵션 */}
        {showAllOption && (
          <FilterButton
            active={selectedRegion === null}
            onClick={handleAllRegionsClick}
            aria-pressed={selectedRegion === null}
          >
            전체
          </FilterButton>
        )}

        {/* 지역별 필터 버튼 */}
        {regions.map((region) => (
          <FilterButton
            key={region.code}
            active={selectedRegion === region.code}
            onClick={() => handleRegionClick(region.code)}
            aria-pressed={selectedRegion === region.code}
          >
            {region.name}
            {region.eventCount !== undefined && (
              <EventCount>({region.eventCount})</EventCount>
            )}
          </FilterButton>
        ))}
      </FilterButtons>

      {/* 선택된 지역 표시 */}
      {selectedRegion && (
        <SelectedRegion>
          <SelectedLabel>선택된 지역:</SelectedLabel>
          <SelectedValue>
            {regions.find(r => r.code === selectedRegion)?.name || selectedRegion}
          </SelectedValue>
          <ClearButton 
            onClick={() => onRegionSelect(null)}
            aria-label="지역 선택 해제"
          >
            ✕
          </ClearButton>
        </SelectedRegion>
      )}
    </FilterContainer>
  );
};

// Styled Components
const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.large};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.light};
  border-radius: 24px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : 'white'};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.dark};
  font-size: ${({ theme }) => theme.fonts.size.medium};
  font-weight: ${({ active }) => active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ active, theme }) => 
      active ? theme.colors.primary : theme.colors.light};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EventCount = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.small};
  opacity: 0.8;
`;

const SelectedRegion = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.light};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const SelectedLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.small};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
`;

const SelectedValue = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.medium};
  color: ${({ theme }) => theme.colors.dark};
  font-weight: 600;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  font-size: 12px;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export { RegionFilterBar };
export type { Region };