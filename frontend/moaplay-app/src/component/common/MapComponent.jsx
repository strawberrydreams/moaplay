import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const MapContainerDiv = styled.div`
    width: 100%;
    height: 100%; /* 부모 요소의 높이를 따르도록 100% 설정 */
`;

const MapComponent = ({ address }) => {
    // 지도가 렌더링될 DOM 요소를 참조
    const mapRef = useRef(null); 
    // 지도 객체가 로드되었는지 확인하는 상태
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        // 카카오 지도가 전역 객체(window.kakao.maps)로 로드되었는지 확인
        if (!window.kakao || !window.kakao.maps) {
            // API 스크립트가 아직 로드되지 않았다면 기다립니다. (재시도 로직은 생략)
            console.error("Kakao Maps API is not loaded.");
            return;
        }
        
        const container = mapRef.current;
        const options = {
            // 초기 지도의 중심 좌표 (서울 시청 임시 설정)
            center: new window.kakao.maps.LatLng(37.566826, 126.9786567), 
            level: 3, // 지도 확대 레벨
        };
        
        // 지도 객체를 생성
        const map = new window.kakao.maps.Map(container, options);
        setMapLoaded(true);

        // Geocoder를 사용하여 주소를 좌표로 변환
        const geocoder = new window.kakao.maps.services.Geocoder();

        if (address) {
            geocoder.addressSearch(address, function(result, status) {
                if (status === window.kakao.maps.services.Status.OK) {
                    const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                    
                    // 마커를 지도에 표시
                    const marker = new window.kakao.maps.Marker({
                        map: map,
                        position: coords
                    });

                    // 지도의 중심을 결과 좌표로 이동
                    map.setCenter(coords);
                    
                    // 지도를 확대/축소했을 때 마커가 중앙에 있도록 이벤트 리스너 추가
                    window.kakao.maps.event.addListener(map, 'idle', function() {
                        map.setCenter(coords);
                    });

                } else {
                    console.error("Geocoding failed for address:", address);
                }
            });
        }
        
    }, [address]); // address가 변경될 때마다 지도를 다시 로드합니다.

    return (
        <MapContainerDiv ref={mapRef}>
            {!mapLoaded && <div>지도 로딩 중...</div>}
        </MapContainerDiv>
    );
};

export default MapComponent;