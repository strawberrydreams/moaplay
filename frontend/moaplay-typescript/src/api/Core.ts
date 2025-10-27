import axios from 'axios';

// 💡 Flask 서버 주소를 기본 URL로 설정합니다.
// 이제 /reviews 처럼 경로만 사용해도 자동으로 127.0.0.1:5000으로 요청이 전송됩니다.
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5000', 
    timeout: 10000, // 요청 제한 시간 10초 설정
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 쿠키를 포함한 요청을 위해 설정
});

export default axiosInstance;
