import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 번들 분석기 (빌드 시에만 실행)
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/styles': resolve(__dirname, 'src/styles'),
    },
  },
  build: {
    // 번들 크기 최적화
    rollupOptions: {
      output: {
        // 청크 분할 전략
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // FullCalendar 관련 라이브러리를 별도 청크로 분리
          'calendar-vendor': [
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
          ],
          // 스타일 관련 라이브러리를 별도 청크로 분리
          'style-vendor': ['styled-components'],
          // HTTP 클라이언트를 별도 청크로 분리
          'http-vendor': ['axios'],
          // OAuth 관련 라이브러리를 별도 청크로 분리
          'auth-vendor': ['@react-oauth/google'],
        },
      },
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000,
    // 소스맵 생성 (프로덕션에서는 false로 설정 가능)
    sourcemap: false,
    // 압축 최적화
    minify: 'terser',
  },
  // 개발 서버 최적화
  server: {
    host: '0.0.0.0', // 외부 접속 허용
    port: 5173,
    hmr: {
      overlay: false, // HMR 오버레이 비활성화로 성능 향상
    },
    proxy: {
      // API 프록시 설정
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      // 업로드된 이미지 프록시 설정
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
  // 최적화 설정
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      'styled-components',
      'axios',
    ],
  },
});
