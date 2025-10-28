/**
 * 네이버 지도 API 컴포넌트
 * 
 * 행사 상세 페이지에서 행사 위치를 네이버 지도로 표시합니다.
 * 주소를 좌표로 변환하고 마커를 표시하는 기능을 제공합니다.
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { MapInitError } from '../../types/naver-maps';
import { loadNaverMapsScript } from '../../utils/naverMapsLoader';

/**
 * 네이버 지도 컴포넌트 Props
 */
interface NaverMapProps {
  /** 표시할 주소 */
  location?: string;
  /** 행사 제목 (마커 툴팁용) */
  eventTitle: string;
  /** 지도 높이 */
  height?: string;
  /** 지도 너비 */
  width?: string;
  /** 줌 레벨 */
  zoom?: number;
  /** 클래스명 */
  className?: string;
}

/**
 * 네이버 지도 타입 정의는 src/types/naver-maps.d.ts 참조
 */

/**
 * 네이버 지도 컴포넌트
 * 
 * 행사 위치를 네이버 지도에 표시하고 마커를 추가합니다.
 * 주소가 없는 경우 기본 위치(서울시청)를 표시합니다.
 * API 키가 설정되지 않은 경우 안내 배너를 표시합니다.
 */
export const NaverMap: React.FC<NaverMapProps> = ({
  location,
  eventTitle,
  height = '300px',
  width = '100%',
  zoom = 15,
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<MapInitError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // 네이버 지도 API 스크립트 로드
    loadNaverMapsScript()
      .then(() => {
        setScriptLoaded(true);
      })
      .catch((error) => {
        console.error('네이버 지도 API 로드 실패:', error);
        setMapError({
          type: 'API_NOT_LOADED',
          message: error.message || '네이버 지도 API를 불러올 수 없습니다.'
        });
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // 스크립트가 로드되지 않은 경우 대기
    if (!scriptLoaded) {
      return;
    }

    // 네이버 지도 API가 로드되지 않은 경우
    if (!window.naver || !window.naver.maps) {
      setMapError({
        type: 'API_NOT_LOADED',
        message: '네이버 지도 API를 불러올 수 없습니다.'
      });
      setIsLoading(false);
      return;
    }

    // 지도 컨테이너가 없는 경우
    if (!mapRef.current) {
      setMapError({
        type: 'CONTAINER_NOT_FOUND',
        message: '지도 컨테이너를 찾을 수 없습니다.'
      });
      setIsLoading(false);
      return;
    }

    /**
     * 지도를 초기화하고 마커를 표시합니다
     */
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        if (location && location.trim()) {
          // 주소가 있는 경우 지오코딩으로 좌표 변환
          await geocodeAndShowMap(location.trim());
        } else {
          // 주소가 없는 경우 기본 위치 표시
          showDefaultMap();
        }
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        setMapError({
          type: 'UNKNOWN',
          message: '지도를 불러오는데 실패했습니다.',
          originalError: error instanceof Error ? error : undefined
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [scriptLoaded, location, eventTitle, zoom]);

  /**
   * 주소를 좌표로 변환하고 지도에 표시합니다
   * 백엔드 API를 통해 네이버 지오코딩 API를 호출합니다
   * @param address 변환할 주소
   */
  const geocodeAndShowMap = async (address: string): Promise<void> => {
    try {
      // 백엔드 API를 통해 지오코딩 수행
      const { GeocodingService } = await import('../../services/geocodingService');
      const coordinates = await GeocodingService.getCoordinates(address);

      if (coordinates) {
        const coords = new window.naver.maps.LatLng(coordinates.lat, coordinates.lng);
        createMap(coords, address);
      } else {
        console.warn('주소 검색 결과가 없습니다:', address);
        showDefaultMap();
      }
    } catch (error) {
      console.error('지오코딩 실패:', error);
      showDefaultMap();
    }
  };

  /**
   * 기본 위치(서울시청)로 지도를 표시합니다
   */
  const showDefaultMap = () => {
    // 서울시청 좌표
    const defaultCoords = new window.naver.maps.LatLng(37.5666805, 126.9784147);
    createMap(defaultCoords, '위치 정보 없음');
  };

  /**
   * 지도를 생성하고 마커를 추가합니다
   * @param coords 지도 중심 좌표
   * @param markerTitle 마커 제목
   */
  const createMap = (coords: LatLng, markerTitle: string) => {
    if (!mapRef.current) return;

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, {
      center: coords,
      zoom: zoom,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.naver.maps.MapTypeControlStyle.BUTTON,
        position: window.naver.maps.Position.TOP_RIGHT
      },
      zoomControl: true,
      zoomControlOptions: {
        style: window.naver.maps.ZoomControlStyle.SMALL,
        position: window.naver.maps.Position.TOP_RIGHT
      }
    });

    // 마커 생성
    const marker = new window.naver.maps.Marker({
      position: coords,
      map: map,
      title: `${eventTitle} - ${markerTitle}`,
      icon: {
        content: `
          <div style="
            background: #007bff;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            position: relative;
          ">
            ${eventTitle}
            <div style="
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid #007bff;
            "></div>
          </div>
        `,
        size: new window.naver.maps.Size(22, 35),
        anchor: new window.naver.maps.Point(11, 35)
      }
    });

    // 마커 클릭 시 정보창 표시
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${eventTitle}</h4>
          <p style="margin: 0; color: #666; font-size: 14px;">${markerTitle}</p>
        </div>
      `
    });

    // 마커 클릭 이벤트
    window.naver.maps.Event.addListener(marker, 'click', () => {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
    });
  };

  if (mapError) {
    return (
      <MapErrorContainer className={className}>
        <ErrorIcon>📍</ErrorIcon>
        <ErrorMessage>{mapError.message}</ErrorMessage>
        {mapError.type === 'API_NOT_LOADED' && mapError.message.includes('API 키') && (
          <ErrorHelpText>
            네이버 클라우드 플랫폼에서 Maps API 키를 발급받아 .env 파일의 VITE_NAVER_MAPS_CLIENT_ID에 설정해주세요.
            <br />
            <ErrorLink href="https://www.ncloud.com/product/applicationService/maps" target="_blank" rel="noopener noreferrer">
              네이버 Maps API 신청하기 →
            </ErrorLink>
          </ErrorHelpText>
        )}
        {location && (
          <LocationTextFallback>
            <LocationIcon>📍</LocationIcon>
            <span>위치: {location}</span>
          </LocationTextFallback>
        )}
      </MapErrorContainer>
    );
  }

  return (
    <MapContainer className={className}>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>지도를 불러오는 중...</LoadingText>
        </LoadingOverlay>
      )}
      <MapElement
        ref={mapRef}
        style={{ width, height }}
        aria-label={`${eventTitle} 위치 지도`}
      />
      {location && (
        <LocationInfo>
          <LocationIcon>📍</LocationIcon>
          <LocationText>{location}</LocationText>
        </LocationInfo>
      )}
    </MapContainer>
  );
};

// 스타일 컴포넌트들
const MapContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f8f9fa;
`;

const MapElement = styled.div`
  width: 100%;
  height: 100%;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
`;

const LocationInfo = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: calc(100% - 24px);
`;

const LocationIcon = styled.span`
  font-size: 14px;
`;

const LocationText = styled.span`
  font-size: 13px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MapErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  color: #6c757d;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.p`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: #dc3545;
`;

const ErrorHelpText = styled.p`
  margin: 12px 0;
  font-size: 14px;
  text-align: center;
  color: #6c757d;
  line-height: 1.6;
  max-width: 500px;
`;

const ErrorLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const LocationTextFallback = styled.div`
  margin-top: 16px;
  padding: 12px 20px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;