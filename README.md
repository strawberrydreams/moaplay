# Moaplay - 행사 정보 커뮤니티 플랫폼

![로고](images/logo.png)

Moaplay는 대한민국의 다양한 행사 정보를 한 곳에서 확인하고 관리할 수 있는 커뮤니티 플랫폼입니다. FullCalendar 기반의 직관적인 달력 인터페이스와 강력한 검색 기능을 통해 원하는 행사를 쉽게 찾을 수 있습니다.

이 리포지토리는 원래 비공개 프로젝트를 기반으로 포크된 것입니다.\n
보안 및 프라이버시 설정으로 인해 원본 리포지토리는 현재 공개되어 있지 않습니다.

## 🌟 주요 기능

- **📅 달력 기반 일정 관리**: FullCalendar를 활용한 직관적인 행사 및 개인 일정 관리
- **🔍 통합 검색 시스템**: 행사명, 해시태그, 지역별 다중 검색 지원
- **⭐ 리뷰 및 평점 시스템**: 신뢰할 수 있는 행사 후기 및 평점 제공
- **❤️ 찜하기 및 개인화**: 관심 행사 저장 및 선호 태그 기반 맞춤 추천
- **👥 사용자 인증**: 세션/쿠키 기반 로그인 지원
- **🏢 주최자 인증**: 공식 행사 주최자 인증 시스템
- **🛡️ 관리자 기능**: 행사 승인, 사용자 관리, 통계 대시보드

## 🏗️ 기술 스택

### Dependencies Update
2025.12.09 기준 react / react-dom을 최신 안정 버전(19.2.1)으로 업데이트했습니다.
최근 React 특정 버전의 RSC 역직렬화 취약점(CVE-2025-55182) 관련 보안 개선 사항이 포함되어 있습니다.

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **styled-components** (CSS-in-JS)
- **FullCalendar** (달력 라이브러리)
- **Naver Maps API** (지도 서비스)
- **Axios** (HTTP 클라이언트)

### Backend
- **Flask** + **Python 3+**
- **SQLAlchemy** (ORM)
- **MySQL 8+** (데이터베이스)
- **Session** + **Cookie** (인증)

### DevOps & Tools (도입 예정)
- **Docker 28+** + **Docker Compose** (컨테이너)
- **Nginx** (리버스 프록시)
- **GitHub Actions** (CI/CD)
- **Prometheus** + **Grafana** (모니터링)

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 20 이상
- Python 3 이상
- MySQL 8 이상
- Docker 28 이상 (선택)

### 1. 저장소 클론
```bash
git clone https://github.com/your-org/moaplay-community.git
cd moaplay-community
```

### 2. 환경 설정
```bash
# 환경 변수 파일 생성
cp .env.example .env
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env

# 환경 변수 편집 (데이터베이스, OAuth 키 등)
nano .env
```

### 3. Docker로 실행 (권장)
```bash
# 전체 스택 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4. 로컬 개발 환경 실행

#### 방법 A: 자동 스크립트 (HTTPS, 권장)
```bash
# 모든 설정 자동 확인 및 HTTPS 서버 시작
./start-https-dev.sh

# 서버 중지
./stop-dev.sh
```

#### 방법 B: 수동 실행 (HTTPS)
```bash
# 백엔드 실행
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
./generate_certs.sh  # SSL 인증서 생성
flask db upgrade
python app.py

# 프론트엔드 실행 (별도 터미널)
cd frontend
npm install
npm run dev
```

#### 방법 C: HTTP로 실행 (HTTPS 없이)
```bash
# backend/.env에서 USE_HTTPS=false 설정
# frontend/.env에서 VITE_API_URL=http://localhost:8000 설정
# 위 방법 B와 동일하게 실행
```

### 5. 접속
- **프론트엔드**: https://localhost:5173 (또는 http://localhost:5173)
- **백엔드 API**: https://localhost:5000 (또는 http://localhost:5000)

⚠️ **HTTPS 사용 시**: 브라우저에서 자체 서명 인증서 경고가 표시됩니다. mkcert 등 별도 SSL 인증서를 설치하여 사용하세요.

📖 **HTTPS 설정 가이드**: 자세한 내용은 [HTTPS_SETUP_GUIDE.md](HTTPS_SETUP_GUIDE.md)를 참조하세요.

## 🧪 테스트

### 프론트엔드 테스트
```bash
cd frontend
npm run test          # 단위 테스트 실행
npm run test:coverage # 커버리지 포함 테스트
npm run test:ui       # UI 테스트 실행
```

### 백엔드 테스트
```bash
cd backend
pytest                    # 전체 테스트 실행
pytest --cov=app         # 커버리지 포함 테스트
```

### 통합 테스트
```bash
# Docker 환경에서 전체 테스트
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🏗️ 프로젝트 구조

```
moaplay/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── assets/            # 에셋 파일
│   │   ├── components/      # 재사용 가능 컴포넌트
│   │   ├── contexts/        # 인증 관련 컨텍스트
│   │   ├── hooks/            # 커스텀 후크
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   ├── styles/            # styled-components
│   │   ├── test/                # 테스트 파일
│   │   └── types/            # TypeScript 타입
│   └── public/
├── backend/                     # Flask 백엔드
│   ├── app/
│   │   ├── routes/            # API 라우트
│   │   ├── models/          # 데이터 모델
│   │   ├── services/        # 비즈니스 서비스
│   │   ├── instance/        # 인스턴스 DB
│   │   └── uploads/        # 이미지 업로드 시 저장 디렉터리
│   └── tests/              # 테스트 파일
└── docs/                     # 문서
 
```

## 🔧 개발 워크플로우

1. **이슈 생성**: GitHub Issues에서 작업 내용 정의
2. **브랜치 생성**: `feature/기능명` 또는 `fix/버그명` 형식
3. **개발**: 로컬 환경에서 개발 및 테스트
4. **커밋**: Conventional Commits 규칙 준수
5. **Pull Request**: 코드 리뷰 및 CI/CD 파이프라인 통과
6. **배포**: 승인 후 배포


## 🚀 배포 (도입 예정)

### 스테이징 환경
```bash
# 스테이징 배포
git push origin develop
# GitHub Actions가 자동으로 스테이징 환경에 배포
```

### 프로덕션 환경
```bash
# 프로덕션 배포
git push origin main
# GitHub Actions가 자동으로 프로덕션 환경에 배포
```

### 수동 배포
```bash
# Blue-Green 배포 스크립트 실행
./deploy.sh production

# 롤백 (필요시)
./scripts/rollback.sh
```

## 📊 모니터링 (도입 예정)

- **애플리케이션 로그**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **성능 모니터링**: Prometheus + Grafana
- **에러 추적**: 내장 에러 추적 시스템
- **헬스체크**: `/api/health` 엔드포인트

### 모니터링 대시보드 접속
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090

## 🤝 기여하기
1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- 코드 스타일: ESLint (Frontend), Black + Flake8 (Backend)
- 테스트: 새로운 기능에 대한 테스트 작성 필수
- 문서: 주요 변경사항에 대한 문서 업데이트
- 리뷰: 모든 PR은 최소 1명의 리뷰어 승인 필요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [React](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [FullCalendar](https://fullcalendar.io/)
- [styled-components](https://styled-components.com/)

---
