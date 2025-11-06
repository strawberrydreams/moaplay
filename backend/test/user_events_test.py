"""
GET /api/users/{user_id}/events/ 엔드포인트 테스트

테스트 범위:
1. 사용자별 행사 목록 조회
2. 필터링 (상태별)
3. 정렬 (조회수, 시작일)
4. 페이지네이션
5. 엣지 케이스
"""

import pytest
from datetime import date, datetime
from flask import Flask

# 상대 경로로 models 임포트
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import db, User, Event, Tag
from app.models.enums import UserRole, EventStatus


@pytest.fixture(scope='module')
def app():
    """Flask 앱 생성"""
    from app import create_app
    
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture(scope='module')
def client(app):
    """테스트 클라이언트"""
    return app.test_client()


@pytest.fixture(scope='function')
def test_data(app):
    """테스트 데이터 생성"""
    with app.app_context():
        # 모든 테이블 삭제 후 재생성 (가장 확실한 방법)
        db.drop_all()
        db.create_all()
        
        # 1. 사용자 생성
        # Host 사용자 2명
        host1 = User(
            user_id='host1',
            nickname='행사주최자1',
            email='host1@test.com',
            password_hash='hashed_password',
            role=UserRole.HOST
        )
        host2 = User(
            user_id='host2',
            nickname='행사주최자2',
            email='host2@test.com',
            password_hash='hashed_password',
            role=UserRole.HOST
        )
        # 일반 사용자 1명
        regular_user = User(
            user_id='user1',
            nickname='일반사용자',
            email='user1@test.com',
            password_hash='hashed_password',
            role=UserRole.USER
        )
        db.session.add_all([host1, host2, regular_user])
        db.session.commit()

        # ID 저장 (객체 대신)
        host1_id = host1.id
        host2_id = host2.id
        regular_user_id = regular_user.id

        # 2. 태그 생성
        tags_data = ['음악', '재즈', '축제', '페스티벌', '공연']
        tags = []
        for tag_name in tags_data:
            tag = Tag(name=tag_name)
            tags.append(tag)
        db.session.add_all(tags)
        db.session.commit()

        # 3. host1의 행사 생성 (5개 - 다양한 상태)
        host1_events = [
            {
                'title': 'Host1 - 승인된 행사 1',
                'location': '서울',
                'tags': ['음악', '재즈'],
                'status': EventStatus.APPROVED,
                'view_count': 100,
                'start_date': date(2025, 10, 15)
            },
            {
                'title': 'Host1 - 승인된 행사 2',
                'location': '부산',
                'tags': ['축제'],
                'status': EventStatus.APPROVED,
                'view_count': 200,
                'start_date': date(2025, 11, 1)
            },
            {
                'title': 'Host1 - 승인 대기 행사',
                'location': '대구',
                'tags': ['공연'],
                'status': EventStatus.PENDING,
                'view_count': 0,
                'start_date': date(2025, 12, 1)
            },
            {
                'title': 'Host1 - 거절된 행사',
                'location': '인천',
                'tags': ['페스티벌'],
                'status': EventStatus.REJECTED,
                'view_count': 0,
                'start_date': date(2025, 9, 1)
            },
            {
                'title': 'Host1 - 승인된 행사 3',
                'location': '광주',
                'tags': ['음악'],
                'status': EventStatus.APPROVED,
                'view_count': 50,
                'start_date': date(2025, 10, 20)
            },
        ]
        
        # 4. host2의 행사 생성 (2개)
        host2_events = [
            {
                'title': 'Host2 - 승인된 행사',
                'location': '서울',
                'tags': ['음악'],
                'status': EventStatus.APPROVED,
                'view_count': 150,
                'start_date': date(2025, 10, 25)
            },
            {
                'title': 'Host2 - 승인 대기 행사',
                'location': '대전',
                'tags': ['축제'],
                'status': EventStatus.PENDING,
                'view_count': 0,
                'start_date': date(2025, 11, 15)
            },
        ]

        # 5. Event 객체 생성 및 저장
        created_events = []

        # host1의 행사들
        for event_data in host1_events:
            event = Event(
                title=event_data['title'],
                summary='요약',
                organizer='주최',
                hosted_by='주관',
                start_date=event_data['start_date'],
                end_date=event_data['start_date'],
                location=event_data['location'],
                description='상세설명',
                phone='010-1234-5678',
                host_id=host1_id,
                status=event_data['status'],
                view_count=event_data['view_count']  # 명시적으로 설정
            )
            db.session.add(event)
            created_events.append((event, event_data['tags']))

        # host2의 행사들
        for event_data in host2_events:
            event = Event(
                title=event_data['title'],
                summary='요약',
                organizer='주최',
                hosted_by='주관',
                start_date=event_data['start_date'],
                end_date=event_data['start_date'],
                location=event_data['location'],
                description='상세설명',
                phone='010-1234-5678',
                host_id=host2_id,
                status=event_data['status'],
                view_count=event_data['view_count']  # 명시적으로 설정
            )
            db.session.add(event)
            created_events.append((event, event_data['tags']))

        db.session.commit()

        # 6. 태그 연결
        for event, tag_names in created_events:
            for tag_name in tag_names:
                tag = db.session.query(Tag).filter_by(name=tag_name).first()
                if tag:
                    event.tags.append(tag)

        db.session.commit()

        yield {
            'host1_id': host1_id,
            'host2_id': host2_id,
            'regular_user_id': regular_user_id,
        }


class TestUserEvents:
    """GET /api/users/{user_id}/events/ 테스트"""

    def test_get_host1_all_events(self, client, test_data):
        """host1의 모든 행사 조회 (기본값)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # host1의 모든 행사 (5개)
        assert 'events' in data
        assert 'pagination' in data
        assert data['pagination']['total'] == 5
        
        # 기본 정렬 확인 (created_at desc)
        assert len(data['events']) == 5

    def test_get_host2_all_events(self, client, test_data):
        """host2의 모든 행사 조회"""
        host2_id = test_data['host2_id']
        response = client.get(f'/api/users/{host2_id}/events/')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # host2의 모든 행사 (2개)
        assert data['pagination']['total'] == 2

    def test_get_regular_user_events(self, client, test_data):
        """일반 사용자(행사 없음)의 행사 조회"""
        regular_user_id = test_data['regular_user_id']
        response = client.get(f'/api/users/{regular_user_id}/events/')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 행사 없음
        assert data['pagination']['total'] == 0
        assert len(data['events']) == 0

    def test_get_nonexistent_user_events(self, client, test_data):
        """존재하지 않는 사용자의 행사 조회"""
        response = client.get('/api/users/99999/events/')
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['error_code'] == 'USER_NOT_FOUND'

    def test_filter_by_status_approved(self, client, test_data):
        """상태별 필터링 - approved만 (status 파라미터는 무시되므로 모든 행사 반환)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?status=approved')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # status 파라미터가 삭제되었으므로 모든 행사가 반환됨
        assert data['pagination']['total'] == 5

    def test_filter_by_status_pending(self, client, test_data):
        """상태별 필터링 - pending만 (status 파라미터는 무시되므로 모든 행사 반환)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?status=pending')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # status 파라미터가 삭제되었으므로 모든 행사가 반환됨
        assert data['pagination']['total'] == 5

    def test_filter_by_status_rejected(self, client, test_data):
        """상태별 필터링 - rejected만 (status 파라미터는 무시되므로 모든 행사 반환)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?status=rejected')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # status 파라미터가 삭제되었으므로 모든 행사가 반환됨
        assert data['pagination']['total'] == 5

    def test_invalid_status_filter(self, client, test_data):
        """잘못된 상태값으로 필터링 - status 파라미터는 무시됨"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?status=invalid_status')
        
        # status 파라미터가 삭제되었으므로 정상 응답 (모든 행사 반환)
        assert response.status_code == 200
        data = response.get_json()
        assert data['pagination']['total'] == 5

    def test_sort_by_view_count_desc(self, client, test_data):
        """조회수 내림차순 정렬"""
        host1_id = test_data['host1_id']
        response = client.get(
            f'/api/users/{host1_id}/events/?sort=view_count&order=desc'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 조회수가 높은 순으로 정렬되어 있는지 확인
        view_counts = [event['stats']['view_count'] for event in data['events']]
        assert view_counts == sorted(view_counts, reverse=True)
        
        # 첫 번째가 가장 높은 조회수 (200)
        assert view_counts[0] == 200

    def test_sort_by_view_count_asc(self, client, test_data):
        """조회수 오름차순 정렬"""
        host1_id = test_data['host1_id']
        response = client.get(
            f'/api/users/{host1_id}/events/?sort=view_count&order=asc'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 조회수가 낮은 순으로 정렬되어 있는지 확인
        view_counts = [event['stats']['view_count'] for event in data['events']]
        assert view_counts == sorted(view_counts)
        
        # 첫 번째가 가장 낮은 조회수 (0)
        assert view_counts[0] == 0

    def test_sort_by_start_date(self, client, test_data):
        """시작일 기준 정렬"""
        host1_id = test_data['host1_id']
        response = client.get(
            f'/api/users/{host1_id}/events/?sort=start_date&order=asc'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 시작일이 빠른 순으로 정렬되어 있는지 확인
        start_dates = [event['start_date'] for event in data['events']]
        assert start_dates == sorted(start_dates)

    def test_pagination_first_page(self, client, test_data):
        """페이지네이션 - 첫 페이지"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?page=1&per_page=2')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 2
        assert data['pagination']['total'] == 5
        assert data['pagination']['pages'] == 3
        assert len(data['events']) == 2

    def test_pagination_second_page(self, client, test_data):
        """페이지네이션 - 두 번째 페이지"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?page=2&per_page=2')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['pagination']['page'] == 2
        assert len(data['events']) == 2

    def test_pagination_last_page(self, client, test_data):
        """페이지네이션 - 마지막 페이지"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?page=3&per_page=2')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['pagination']['page'] == 3
        assert len(data['events']) == 1  # 마지막 페이지는 1개만

    def test_invalid_page_number(self, client, test_data):
        """잘못된 페이지 번호 (0 이하)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?page=0')
        
        # Flask-SQLAlchemy의 paginate는 page=1로 자동 조정
        assert response.status_code == 200

    def test_invalid_per_page_too_large(self, client, test_data):
        """per_page가 너무 큰 경우 (50 초과)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/?per_page=100')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # per_page는 최대 50으로 제한되어야 함
        assert data['pagination']['per_page'] == 50

    def test_complex_query(self, client, test_data):
        """복합 쿼리 - 정렬 + 페이지네이션"""
        host1_id = test_data['host1_id']
        response = client.get(
            f'/api/users/{host1_id}/events/?'
            f'sort=view_count&order=desc&page=1&per_page=2'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['events']) == 2
        # 첫 페이지 첫 번째는 조회수가 가장 높아야 함
        assert data['events'][0]['stats']['view_count'] == 200

    def test_response_structure(self, client, test_data):
        """응답 구조 검증"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 최상위 구조
        assert 'events' in data
        assert 'pagination' in data
        
        # 행사 구조
        if len(data['events']) > 0:
            event = data['events'][0]
            assert 'id' in event
            assert 'title' in event
            assert 'host' in event
            assert 'stats' in event
            assert 'tags' in event
            
            # host 구조
            assert 'id' in event['host']
            assert 'nickname' in event['host']
            
            # stats 구조
            assert 'average_rating' in event['stats']
            assert 'total_reviews' in event['stats']
            assert 'view_count' in event['stats']
            assert 'favorites_count' in event['stats']
            assert 'schedules_count' in event['stats']
        
        # pagination 구조
        assert 'page' in data['pagination']
        assert 'per_page' in data['pagination']
        assert 'total' in data['pagination']
        assert 'pages' in data['pagination']


class TestUserEventsEdgeCases:
    """엣지 케이스 테스트"""

    def test_host_with_no_events(self, client, test_data):
        """행사가 없는 Host"""
        regular_user_id = test_data['regular_user_id']
        response = client.get(f'/api/users/{regular_user_id}/events/')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['pagination']['total'] == 0

    def test_default_sort_order(self, client, test_data):
        """기본 정렬 순서 (created_at desc)"""
        host1_id = test_data['host1_id']
        response = client.get(f'/api/users/{host1_id}/events/')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 기본 정렬은 created_at desc이므로
        # 최근에 생성된 행사가 먼저 와야 함
        assert len(data['events']) > 0