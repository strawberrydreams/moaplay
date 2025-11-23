# test/test_all_apis_v2.py
import pytest
from app import create_app, db
from app.models.user import User
from app.models.event import Event
from app.models.review import Review
from app.models.schedule import Schedule
from app.models.favorite import Favorite
from app.models.tag import Tag
from app.models.event_tag import EventTag
from app.models.user_tag import UserTag
from app.models.enums import UserRole, EventStatus
from datetime import datetime, date

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
def sample_users(app):
    # 샘플 사용자 생성 및 ID 반환
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
        
        # ID만 저장해서 반환
        return {
            'user_id': user.id,
            'host_id': host.id,
            'admin_id': admin.id
        }


# ==================== Users API 테스트 ====================

class TestUsersAPI:
    # Users API 테스트
    
    # 회원가입 성공
    def test_create_user_success(self, client):
        response = client.post('/api/users/', json={
            'user_id': 'newuser',
            'nickname': '새유저',
            'email': 'new@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['user_id'] == 'newuser'
        assert data['nickname'] == '새유저'
        assert data['email'] == 'new@example.com'
    
    # 내 정보 조회 성공
    def test_get_me_success(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.get('/api/users/me')
        assert response.status_code == 200
        data = response.get_json()
        assert data['user_id'] == 'testuser'
        assert data['email'] == 'test@example.com'
    
    # 다른 사용자 정보 조회 (공개 정보만)
    def test_get_user_public_info(self, client, sample_users):
        user_id = sample_users['user_id']
        response = client.get(f'/api/users/{user_id}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user_id'] == 'testuser'
        assert data['nickname'] == '테스트유저'
        assert 'email' not in data
    
    # 내 정보 수정 성공
    def test_update_me_success(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.put('/api/users/me', json={
            'nickname': '수정된닉네임'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['nickname'] == '수정된닉네임'
    
    # 선호 태그 수정
    def test_update_preferred_tags(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.put('/api/users/me', json={
            'preferred_tags': ['음악', '페스티벌', '공연']
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'preferred_tags' in data
        assert '음악' in data['preferred_tags']
        assert '페스티벌' in data['preferred_tags']


# ==================== Events API 테스트 ====================

class TestEventsAPI:
    # Events API 테스트
    
    # 행사 생성 성공 (HOST)
    def test_create_event_success(self, client, sample_users):
        # HOST로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testhost',
            'password': 'password123'
        })
        
        response = client.post('/api/events/', json={
            'title': '테스트 페스티벌',
            'summary': '멋진 행사',
            'start_date': '2025-12-01',
            'end_date': '2025-12-03',
            'location': '서울 올림픽공원',
            'description': '상세 설명입니다.',
            'phone': '02-1234-5678',
            'organizer': '서울시',
            'hosted_by': '문화재단',
            'tag_names': ['음악', '페스티벌']
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['title'] == '테스트 페스티벌'
        assert data['status'] == 'pending'
    
    # 행사 생성 실패 - USER 권한
    def test_create_event_permission_denied(self, client, sample_users):
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
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
    
    # 행사 목록 조회
    def test_get_events_list(self, client, sample_users, app):
        # 행사 생성
        with app.app_context():
            event = Event(
                title='승인된 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.commit()
        
        response = client.get('/api/events/?status=approved')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['events']) > 0
    
    # 행사 제목 검색
    def test_search_events_by_title(self, client, sample_users, app):
        # 행사 생성
        with app.app_context():
            event = Event(
                title='재즈 페스티벌',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='재즈 음악 축제',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.commit()
        
        # 제목으로 검색
        response = client.get('/api/events/?title=재즈')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['events']) > 0
        assert '재즈' in data['events'][0]['title']


# ==================== Reviews API 테스트 ====================

class TestReviewsAPI:
    # Reviews API 테스트
    
    # 리뷰 작성 성공
    def test_create_review_success(self, client, sample_users, app):
        # 행사 생성
        with app.app_context():
            event = Event(
                title='리뷰 대상 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.commit()
            event_id = event.id
        
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.post('/api/reviews/', json={
            'event_id': event_id,
            'title': '훌륭한 행사였습니다',
            'content': '정말 재미있었어요!',
            'rating': 5
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['title'] == '훌륭한 행사였습니다'
        assert data['rating'] == 5
    
    # 내가 쓴 리뷰 조회
    def test_get_my_reviews(self, client, sample_users, app):
        # 행사 및 리뷰 생성
        with app.app_context():
            event = Event(
                title='테스트 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.flush()
            
            review = Review(
                title='내 리뷰',
                content='좋았어요',
                rating=4,
                user_id=sample_users['user_id'],
                event_id=event.id
            )
            db.session.add(review)
            db.session.commit()
        
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 내가 쓴 리뷰 조회
        response = client.get('/api/reviews/me')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['reviews']) > 0
        assert data['reviews'][0]['title'] == '내 리뷰'


# ==================== Schedules API 테스트 ====================

class TestSchedulesAPI:
    # Schedules API 테스트
    
    # 일정 추가 성공
    def test_create_schedule_success(self, client, sample_users, app):
        # 행사 생성
        with app.app_context():
            event = Event(
                title='일정 추가할 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.commit()
            event_id = event.id
        
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.post('/api/schedules/', json={
            'event_id': event_id
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['event']['title'] == '일정 추가할 행사'
    
    # 일정 목록 조회
    def test_get_schedules_list(self, client, sample_users, app):
        # 행사 및 일정 생성
        with app.app_context():
            event = Event(
                title='내 일정 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.flush()
            
            schedule = Schedule(
                user_id=sample_users['user_id'],
                event_id=event.id
            )
            db.session.add(schedule)
            db.session.commit()
        
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.get('/api/schedules/')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['schedules']) > 0


# ==================== Favorites API 테스트 ====================

class TestFavoritesAPI:
    # Favorites API 테스트
    
    # 찜 추가 성공
    def test_create_favorite_success(self, client, sample_users, app):
        # 행사 생성
        with app.app_context():
            event = Event(
                title='찜할 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.commit()
            event_id = event.id
        
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.post('/api/favorites/', json={
            'event_id': event_id
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['event']['title'] == '찜할 행사'
    
    # 찜 목록 조회
    def test_get_favorites_list(self, client, sample_users, app):
        # 행사 및 찜 생성
        with app.app_context():
            event = Event(
                title='찜한 행사',
                start_date=date(2025, 12, 1),
                end_date=date(2025, 12, 3),
                location='서울',
                description='설명',
                phone='010-1234-5678',
                host_id=sample_users['host_id'],
                status=EventStatus.APPROVED
            )
            db.session.add(event)
            db.session.flush()
            
            favorite = Favorite(
                user_id=sample_users['user_id'],
                event_id=event.id
            )
            db.session.add(favorite)
            db.session.commit()
        
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.get('/api/favorites/')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['favorites']) > 0


# ==================== Admin API 테스트 ====================

class TestAdminAPI:
    # Admin API 테스트
    
    # 대시보드 조회 성공 (관리자)
    def test_get_dashboard_success(self, client, sample_users):
        # ADMIN으로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testadmin',
            'password': 'password123'
        })
        
        response = client.get('/api/admin/dashboard')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'statistics' in data
    
    # 대시보드 조회 실패 - 권한 없음
    def test_get_dashboard_permission_denied(self, client, sample_users):
        # USER로 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.get('/api/admin/dashboard')
        
        assert response.status_code == 403
        assert response.get_json()['error_code'] == 'PERMISSION_DENIED'


# ==================== Tag API 테스트 ====================

class TestTagAPI:
    # Tag API 테스트
    
    # 태그 생성 성공
    def test_create_tag_success(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        response = client.post('/api/tags/', json={
            'name': '음악'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['name'] == '음악'
    
    # 태그 생성 실패 - 중복
    def test_create_tag_duplicate(self, client, sample_users, app):
        # 태그 미리 생성
        with app.app_context():
            tag = Tag(name='음악')
            db.session.add(tag)
            db.session.commit()
        
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 중복 태그 생성 시도
        response = client.post('/api/tags/', json={
            'name': '음악'
        })
        
        assert response.status_code == 409
        assert response.get_json()['error_code'] == 'DUPLICATE_TAG'
    
    # 태그 목록 조회
    def test_get_tags_list(self, client, app):
        # 태그 생성
        with app.app_context():
            tags = [Tag(name=name) for name in ['음악', '페스티벌', '공연', '전시']]
            db.session.add_all(tags)
            db.session.commit()
        
        response = client.get('/api/tags/')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['tags']) >= 4
        assert 'pagination' in data
    
    # 태그 검색
    def test_search_tags(self, client, app):
        # 태그 생성
        with app.app_context():
            tags = [Tag(name=name) for name in ['재즈페스티벌', '록페스티벌', '클래식공연']]
            db.session.add_all(tags)
            db.session.commit()
        
        # '페스티벌' 검색
        response = client.get('/api/tags/?search=페스티벌')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['tags']) == 2
        for tag in data['tags']:
            assert '페스티벌' in tag['name']
    
    # 태그 정렬 (이름순)
    def test_sort_tags_by_name(self, client, app):
        # 태그 생성
        with app.app_context():
            tags = [Tag(name=name) for name in ['전시', '공연', '음악']]
            db.session.add_all(tags)
            db.session.commit()
        
        # 이름순 정렬 (오름차순)
        response = client.get('/api/tags/?sort=name&order=asc')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['tags']) == 3
        assert data['tags'][0]['name'] == '공연'
        assert data['tags'][1]['name'] == '음악'
        assert data['tags'][2]['name'] == '전시'
    
    # 태그 삭제 성공
    def test_delete_tag_success(self, client, sample_users, app):
        # 태그 생성
        with app.app_context():
            tag = Tag(name='삭제할태그')
            db.session.add(tag)
            db.session.commit()
            tag_id = tag.id
        
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 태그 삭제
        response = client.delete(f'/api/tags/{tag_id}')
        
        assert response.status_code == 200
        assert response.get_json()['message'] == '태그가 삭제되었습니다.'
    
    # 태그 삭제 실패 - 존재하지 않음
    def test_delete_tag_not_found(self, client, sample_users):
        # 로그인
        client.post('/api/auth/login', json={
            'user_id': 'testuser',
            'password': 'password123'
        })
        
        # 존재하지 않는 태그 삭제 시도
        response = client.delete('/api/tags/99999')
        
        assert response.status_code == 404
        assert response.get_json()['error_code'] == 'TAG_NOT_FOUND'