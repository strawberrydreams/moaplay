import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            // "/api"로 시작하는 모든 요청을 지정된 target으로 전달
      '/api': {
        target: 'http://localhost:5000', // 실제 백엔드 API 서버 주소
        changeOrigin: true, // true로 설정하면 타겟 서버에 새로운 Host 헤더를 보냄
        }
        },
    },
})
