"""
태그 검색 기능 통합 테스트

pytest를 사용하여 테스트 데이터 생성부터 API 테스트까지 자동화
"""

import pytest
from datetime import date, datetime
from app import create_app
from app.models import db, User, Event, Tag, EventTag
from app.models.enums import UserRole, EventStatus


@pytest.fixture(scope='module')
def app():
    """Flask 앱 생성"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # 메모리 DB 사용
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='module')
def client(app):
    """테스트 클라이언트"""
    return app.test_client()


@pytest.fixture(scope='module')
def test_data(app):
    """테스트 데이터 생성"""
    with app.app_context():
        # 1. Host 사용자 생성
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
        db.session.add_all([host1, host2])
        db.session.commit()
        
        # 2. 태그 생성
        tags_data = [
            '음악', '재즈', '클래식', '축제', '페스티벌',
            '공연', '전시', '문화', '예술', 'K-POP'
        ]
        tags = []
        for tag_name in tags_data:
            tag = Tag(name=tag_name)
            tags.append(tag)
        db.session.add_all(tags)
        db.session.commit()
        
        # 3. 행사 생성
        events_data = [
            {
                'title': '서울 재즈 페스티벌 2025',
                'location': '서울',
                'tags': ['음악', '재즈', '페스티벌'],
                'host': host1,
                'view_count': 100
            },
            {
                'title': '부산 클래식 음악회',
                'location': '부산',
                'tags': ['음악', '클래식', '공연'],
                'host': host1,
                'view_count': 50
            },
            {
                'title': '대구 문화 축제',
                'location': '대구',
                'tags': ['축제', '문화', '예술'],
                'host': host2,
                'view_count': 75
            },
            {
                'title': '서울 K-POP 페스티벌',
                'location': '서울',
                'tags': ['음악', 'K-POP', '페스티벌'],
                'host': host2,
                'view_count': 200
            },
            {
                'title': '인천 전시회',
                'location': '인천',
                'tags': ['전시', '문화', '예술'],
                'host': host1,
                'view_count': 30
            },
            {
                'title': '광주 재즈의 밤',
                'location': '광주',
                'tags': ['음악', '재즈', '공연'],
                'host': host2,
                'view_count': 60
            },
        ]
        
        events = []
        for event_data in events_data:
            event = Event(
                title=event_data['title'],
                summary=f"{event_data['title']} 요약",
                organizer='주최기관',
                hosted_by='주관기관',
                start_date=date(2025, 10, 15),
                end_date=date(2025, 10, 17),
                location=event_data['location'],
                description=f"{event_data['title']} 상세설명",
                phone='02-1234-5678',
                host_id=event_data['host'].id,
                status=EventStatus.APPROVED,
                view_count=event_data['view_count']
            )
            db.session.add(event)
            db.session.flush()  # ID 생성
            
            # 태그 연결
            for tag_name in event_data['tags']:
                tag = Tag.query.filter_by(name=tag_name).first()
                event_tag = EventTag(event_id=event.id, tag_id=tag.id)
                db.session.add(event_tag)
            
            events.append(event)
        
        db.session.commit()
        
        return {
            'hosts': [host1, host2],
            'tags': tags,
            'events': events
        }


class TestTagSearch:
    """태그 검색 기능 테스트 클래스"""
    
    def test_search_by_single_tag(self, client, test_data):
        """단일 태그로 검색"""
        response = client.get('/api/events/?tag=음악')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # '음악' 태그가 있는 행사는 4개
        assert data['pagination']['total'] == 4
        assert len(data['events']) == 4
        
        # 모든 행사에 '음악' 태그가 포함되어 있는지 확인
        for event in data['events']:
            assert '음악' in event['tags']
    
    def test_search_by_tag_jazz(self, client, test_data):
        """'재즈' 태그 검색"""
        response = client.get('/api/events/?tag=재즈')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # '재즈' 태그가 있는 행사는 2개
        assert data['pagination']['total'] == 2
        
        # 제목 확인
        titles = [event['title'] for event in data['events']]
        assert '서울 재즈 페스티벌 2025' in titles
        assert '광주 재즈의 밤' in titles
    
    def test_search_by_tag_partial_match(self, client, test_data):
        """태그 부분 검색 (K-P로 검색)"""
        response = client.get('/api/events/?tag=K-P')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 'K-POP' 태그를 가진 행사가 검색되어야 함
        assert data['pagination']['total'] >= 1
        
        # K-POP이 포함된 태그가 있는지 확인
        found_kpop = False
        for event in data['events']:
            if 'K-POP' in event['tags']:
                found_kpop = True
                break
        assert found_kpop
    
    def test_search_by_title_and_tag(self, client, test_data):
        """제목 + 태그 동시 검색 (AND 조건)"""
        response = client.get('/api/events/?title=페스티벌&tag=음악')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 제목에 '페스티벌'이 있고 태그에 '음악'이 있는 행사
        assert data['pagination']['total'] == 2
        
        for event in data['events']:
            assert '페스티벌' in event['title']
            assert '음악' in event['tags']
    
    def test_search_by_location_and_tag(self, client, test_data):
        """지역 + 태그 검색"""
        response = client.get('/api/events/?location=서울&tag=음악')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 서울에서 열리는 음악 관련 행사
        assert data['pagination']['total'] == 2
        
        for event in data['events']:
            assert '서울' in event['location']
            assert '음악' in event['tags']
    
    def test_search_nonexistent_tag(self, client, test_data):
        """존재하지 않는 태그 검색"""
        response = client.get('/api/events/?tag=존재하지않는태그')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 결과가 없어야 함
        assert data['pagination']['total'] == 0
        assert len(data['events']) == 0
    
    def test_tag_search_with_sorting(self, client, test_data):
        """태그 검색 + 정렬 (조회수 내림차순)"""
        response = client.get('/api/events/?tag=음악&sort=view_count&order=desc')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 조회수가 높은 순으로 정렬되어 있는지 확인
        view_counts = [event['stats']['view_count'] for event in data['events']]
        assert view_counts == sorted(view_counts, reverse=True)
        
        # 첫 번째 행사가 가장 높은 조회수를 가져야 함
        assert data['events'][0]['title'] == '서울 K-POP 페스티벌'
        assert data['events'][0]['stats']['view_count'] == 200
    
    def test_tag_search_with_pagination(self, client, test_data):
        """태그 검색 + 페이징"""
        # 첫 번째 페이지 (2개씩)
        response = client.get('/api/events/?tag=음악&page=1&per_page=2')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 2
        assert len(data['events']) == 2
        assert data['pagination']['total'] == 4
        assert data['pagination']['pages'] == 2
        
        # 두 번째 페이지
        response = client.get('/api/events/?tag=음악&page=2&per_page=2')
        data = response.get_json()
        
        assert data['pagination']['page'] == 2
        assert len(data['events']) == 2
    
    def test_multiple_tags_festival(self, client, test_data):
        """'페스티벌' 태그 검색"""
        response = client.get('/api/events/?tag=페스티벌')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # '페스티벌' 태그가 있는 행사는 2개
        assert data['pagination']['total'] == 2
        
        for event in data['events']:
            assert '페스티벌' in event['tags']
    
    def test_tag_with_title_partial_match(self, client, test_data):
        """제목 부분 검색 + 태그"""
        response = client.get('/api/events/?title=서울&tag=페스티벌')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 서울에서 열리는 페스티벌
        for event in data['events']:
            assert '서울' in event['title']
            assert '페스티벌' in event['tags']
    
    def test_tag_search_case_insensitive(self, client, test_data):
        """태그 검색 대소문자 구분 (한글은 영향 없음)"""
        # 한글 태그 검색
        response = client.get('/api/events/?tag=음악')
        data1 = response.get_json()
        
        # 같은 결과가 나와야 함
        assert response.status_code == 200
        assert data1['pagination']['total'] == 4


class TestTagSearchEdgeCases:
    """태그 검색 엣지 케이스 테스트"""
    
    def test_empty_tag_parameter(self, client, test_data):
        """빈 태그 파라미터"""
        response = client.get('/api/events/?tag=')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # tag 파라미터가 빈 문자열이면 필터링 안 함
        assert data['pagination']['total'] == 6  # 모든 행사
    
    def test_tag_with_special_characters(self, client, test_data):
        """특수문자가 포함된 태그"""
        response = client.get('/api/events/?tag=K-POP')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['pagination']['total'] == 1
        assert 'K-POP' in data['events'][0]['tags']
    
    def test_tag_search_all_filters_combined(self, client, test_data):
        """모든 필터 조합 (location + title + tag + sort)"""
        response = client.get(
            '/api/events/?'
            'location=서울&'
            'title=페스티벌&'
            'tag=음악&'
            'sort=view_count&'
            'order=desc'
        )
        
        assert response.status_code == 200
        data = response.get_json()
        
        # 모든 조건을 만족하는 행사만 반환
        for event in data['events']:
            assert '서울' in event['location']
            assert '페스티벌' in event['title']
            assert '음악' in event['tags']


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])