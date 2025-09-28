import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// Minimal global type so TS understands the Kakao Maps object.
declare global {
  interface Window {
    kakao?: any;
  }
}

type MapComponentProps = {
  address?: string;
};

const MapContainerDiv = styled.div`
  width: 100%;
  height: 100%;
`;

const MapComponent: React.FC<MapComponentProps> = ({ address }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !window.kakao ||
      !window.kakao.maps
    ) {
      console.error('Kakao Maps API is not loaded.');
      return;
    }

    const { maps } = window.kakao;
    const container = mapRef.current;
    if (!container) return;

    const options = {
      // 서울 시청 기준 좌표
      center: new maps.LatLng(37.566826, 126.9786567),
      level: 3,
    };

    const map = new maps.Map(container, options);
    setMapLoaded(true);

    const geocoder = new maps.services.Geocoder();

    let idleHandler: (() => void) | null = null;

    if (address) {
      geocoder.addressSearch(
        address,
        (result: Array<{ x: string; y: string }>, status: string) => {
          if (status === maps.services.Status.OK) {
            const coords = new maps.LatLng(
              parseFloat(result[0].y),
              parseFloat(result[0].x)
            );

            // 마커 표시
            new maps.Marker({
              map,
              position: coords,
            });

            // 지도 중심 이동
            map.setCenter(coords);

            // 확대/이동 후에도 중심 유지 (원본 동작 유지)
            idleHandler = () => {
              map.setCenter(coords);
            };
            maps.event.addListener(map, 'idle', idleHandler);
          } else {
            console.error('Geocoding failed for address:', address);
          }
        }
      );
    }

    // 정리(cleanup)
    return () => {
      if (idleHandler) {
        try {
          // kakao.event.removeListener가 없는 버전 대비 안전 호출
          (maps.event as any).removeListener?.(map, 'idle', idleHandler);
        } catch {
          // ignore
        }
      }
    };
  }, [address]);

  return (
    <MapContainerDiv ref={mapRef}>
      {!mapLoaded && <div>지도 로딩 중...</div>}
    </MapContainerDiv>
  );
};

export default MapComponent;