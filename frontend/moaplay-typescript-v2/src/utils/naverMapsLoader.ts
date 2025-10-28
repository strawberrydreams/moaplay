// 환경 변수에서 API 키를 읽어 네이버 지도 스크립트를 동적 로딩하는 함수들의 모음
// 네이버 지도 기능은 현재 사용 불가

let isLoading = false;
let isLoaded = false;
let loadError: Error | null = null;

// 네이버 지도 API 스크립트를 동적으로 로딩해오는 함수
export const loadNaverMapsScript = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (isLoaded && window.naver && window.naver.maps) {
      resolve(true);
      return;
    }

    // 로드 중인 경우
    if (isLoading) {
      // 로드 완료를 기다림
      const checkInterval = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (loadError) {
          clearInterval(checkInterval);
          reject(loadError);
        }
      }, 100);
      return;
    }

    // 환경 변수에서 API 키 가져오기
    const clientId = import.meta.env.VITE_NAVER_MAPS_CLIENT_ID;

    // API 키가 없는 경우
    if (!clientId || clientId === 'your-naver-maps-client-id' || clientId === 'your-naver-maps-client-id-here') {
      const error = new Error('네이버 지도 API 키가 설정되지 않았습니다. .env 파일에 VITE_NAVER_MAPS_CLIENT_ID를 설정해주세요.');
      loadError = error;
      reject(error);
      return;
    }

    isLoading = true;

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
    script.async = true;

    // 로드 성공 핸들러
    script.onload = () => {
      isLoading = false;
      isLoaded = true;
      resolve(true);
    };

    // 로드 실패 핸들러
    script.onerror = () => {
      isLoading = false;
      const error = new Error('네이버 지도 API 스크립트를 로드하는데 실패했습니다.');
      loadError = error;
      reject(error);
    };

    // 스크립트를 head에 추가
    document.head.appendChild(script);
  });
};