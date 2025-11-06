# test/login_test.py
import pytest
from app import create_app, db
from app.models.user import User
from app.models.enums import UserRole
from flask import session

@pytest.fixture
def app():
    # 테스트용 Flask 앱 생성
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    # 테스트 클라이언트
    return app.test_client()

@pytest.fixture
def runner(app):
    # CLI 러너
    return app.test_cli_runner()

@pytest.fixture
def sample_users(app):
    # 샘플 사용자 생성
    with app.app_context():
        # 일반 사용자
        user = User(
            user_id='testuser',
            nickname='테스트유저',
            email='test@example.com'
        )
        user.set_password('password123')
        
        # Host 사용자
        host = User(
            user_id='testhost',
            nickname='테스트호스트',
            email='host@example.com',
            role=UserRole.HOST
        )
        host.set_password('password123')
        
        # Admin 사용자
        admin = User(
            user_id='testadmin',
            nickname='테스트관리자',
            email='admin@example.com',
            role=UserRole.ADMIN
        )
        admin.set_password('password123')
        
        db.session.add_all([user, host, admin])
        db.session.commit()
        
        return {
            'user': user,
            'host': host,
            'admin': admin
        }


class TestFlaskLoginIntegration:
    # Flask-Login 통합 테스트
    
    # 로그인 시 쿠키가 설정되는지 확인
    def test_login_sets_cookie(self, client, sample_users):
        response = client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        assert response.status_code == 200
        # Flask-Login이 쿠키를 설정하는지 확인 (session 또는 remember_token)
        set_cookie_header = response.headers.get('Set-Cookie', '')
        assert 'session' in set_cookie_header or 'remember_token' in set_cookie_header
        
        data = response.get_json()
        assert data['user_id'] == 'testuser'
    
    # 로그아웃 시 세션이 지워지는지 확인
    def test_logout_clears_session(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 로그아웃
        response = client.post('/api/auth/logout')
        assert response.status_code == 200
        assert response.get_json()['message'] == '로그아웃 되었습니다.'
    
    # @login_required 데코레이터 동작 확인
    def test_login_required_decorator(self, client, sample_users):
        # 로그인 없이 내 정보 조회
        response = client.get('/api/users/me')
        assert response.status_code == 401
        
        # 로그인 후 내 정보 조회
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.get('/api/users/me')
        assert response.status_code == 200
        assert response.get_json()['user_id'] == 'testuser'
    
    # current_user가 올바르게 동작하는지 확인
    def test_current_user_works(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 내 정보 조회 (current_user 사용)
        response = client.get('/api/users/me')
        data = response.get_json()
        
        assert data['user_id'] == 'testuser'
        assert data['nickname'] == '테스트유저'
        assert data['email'] == 'test@example.com'
    
    # 일반 사용자 권한 체크
    def test_role_required_user(self, client, sample_users):
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # HOST 권한 필요한 API 접근 시도 (행사 생성)
        response = client.post('/api/events/', json={
            'title': '테스트 행사',
            'start_date': '2025-12-01',
            'end_date': '2025-12-03',
            'location': '서울',
            'description': '설명',
            'phone': '010-1234-5678'
        })
        
        assert response.status_code == 403
        assert response.get_json()['error_code'] == 'PERMISSION_DENIED'
    
    # Host 권한 체크
    def test_role_required_host(self, client, sample_users):
        # HOST로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testhost',
            'password': 'password123'
        })
        
        # 행사 생성 (HOST 권한 필요)
        response = client.post('/api/events/', json={
            'title': '테스트 행사',
            'start_date': '2025-12-01',
            'end_date': '2025-12-03',
            'location': '서울',
            'description': '설명',
            'phone': '010-1234-5678'
        })
        
        assert response.status_code == 201
        assert response.get_json()['title'] == '테스트 행사'
    
    # Admin 권한 체크
    def test_role_required_admin(self, client, sample_users):
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # Admin 권한 필요한 API 접근 시도
        response = client.get('/api/admin/dashboard')
        assert response.status_code == 403
        
        # 로그아웃
        client.post('/api/auth/logout')
        
        # ADMIN으로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testadmin',
            'password': 'password123'
        })
        
        # Admin API 접근 성공
        response = client.get('/api/admin/dashboard')
        assert response.status_code == 200
    
    # 세션이 여러 요청에 걸쳐 유지되는지 확인
    def test_session_persistence(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 첫 번째 요청
        response1 = client.get('/api/users/me')
        assert response1.status_code == 200
        
        # 두 번째 요청 (세션 유지 확인)
        response2 = client.get('/api/users/me')
        assert response2.status_code == 200
        
        # 같은 사용자 정보 반환
        assert response1.get_json()['id'] == response2.get_json()['id']
    
    # 잘못된 로그인 시도
    def test_invalid_login(self, client, sample_users):
        response = client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert response.get_json()['code'] == 'INVALID_CREDENTIALS'
    
    # 로그인 테스트 엔드포인트 동작 확인
    def test_login_test_endpoint(self, client, sample_users):
        # 로그인 전
        response = client.get('/api/auth/login_test')
        assert response.get_json()['message'] == '로그인 되어있지 않습니다.'
        
        # 로그인
        login_response = client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        user_id = login_response.get_json()['id']
        
        # 로그인 후
        response = client.get('/api/auth/login_test')
        assert response.get_json()['id'] == user_id