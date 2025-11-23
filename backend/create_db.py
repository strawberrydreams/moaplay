"""
데이터베이스 초기화 및 샘플 데이터 생성 스크립트
- 기존 DB 삭제 후 재생성
- Admin, Host, User 생성
- Event, Tag, Review, Schedule, Favorite 생성
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import sys
import os

# Flask 앱 경로 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.user import User
from app.models.event import Event
from app.models.tag import Tag
from app.models.event_tag import EventTag
from app.models.review import Review
from app.models.schedule import Schedule
from app.models.favorite import Favorite
from app.models.enums import UserRole, EventStatus


# 지역 리스트
REGIONS = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]

# 지역 영어 매핑
REGION_ENGLISH = {
    '서울': 'seoul',
    '부산': 'busan',
    '대구': 'daegu',
    '인천': 'incheon',
    '광주': 'gwangju',
    '대전': 'daejeon',
    '울산': 'ulsan',
    '세종': 'sejong',
    '경기': 'gyeonggi',
    '강원': 'gangwon',
    '충북': 'chungbuk',
    '충남': 'chungnam',
    '전북': 'jeonbuk',
    '전남': 'jeonnam',
    '경북': 'gyeongbuk',
    '경남': 'gyeongnam',
    '제주': 'jeju',
    '기타': 'etc'
}

# 샘플 리뷰 내용
SAMPLE_REVIEWS = [
    "정말 좋은 행사였어요! 다음에도 참여하고 싶습니다.",
    "가족들과 함께 즐거운 시간 보냈습니다. 추천해요!",
    "기대 이상이었습니다. 특히 프로그램 구성이 알찼어요.",
    "아이들이 정말 좋아했어요. 체험 프로그램이 다양했습니다.",
    "날씨도 좋고 분위기도 좋았어요. 만족스러운 하루였습니다.",
    "주차 공간이 협소했지만 행사 자체는 훌륭했습니다.",
    "친구들과 함께 갔는데 모두 만족했어요!",
    "음식도 맛있고 볼거리도 많았어요.",
    "생각보다 규모가 커서 놀랐습니다. 잘 구경했어요.",
    "다음 시즌에도 꼭 다시 방문하고 싶네요.",
    "사진 찍기 좋은 곳이 많았어요. 인스타 감성 가득!",
    "교통편이 편리해서 접근성이 좋았습니다.",
    "프로그램이 다채로워서 지루할 틈이 없었어요.",
    "직원분들이 친절하셨습니다. 감사합니다!",
    "기대했던 것보다는 조금 아쉬웠지만 괜찮았어요.",
]


class DatabaseSeeder:
    """DB 초기화 및 샘플 데이터 생성 클래스"""
    
    def __init__(self, app, json_file='festivals_data.json'):
        self.app = app
        self.json_file = json_file
        self.users = {}  # role별 사용자 저장
        self.region_hosts = {}  # 지역별 Host 저장
        self.events_by_host = {}  # Host별 이벤트 저장
        self.all_events = []
    
    def run(self):
        """전체 시딩 실행"""
        with self.app.app_context():
            print("\n" + "=" * 60)
            print("데이터베이스 초기화 시작")
            print("=" * 60)
            
            # 1. DB 초기화
            self.drop_and_create_db()
            
            # 2. User 생성
            self.create_users()
            
            # 3. JSON 데이터 로드
            events_data = self.load_json_data()
            
            # 4. Tag 생성
            self.create_tags(events_data)
            
            # 5. Event 생성
            self.create_events(events_data)
            
            # 6. Review 생성
            self.create_reviews()
            
            # 7. Schedule 생성
            self.create_schedules()
            
            # 8. Favorite 생성
            self.create_favorites()
            
            print("\n" + "=" * 60)
            print("✓ 데이터베이스 초기화 완료!")
            print("=" * 60)
            self.print_summary()
    
    def drop_and_create_db(self):
        """기존 DB 삭제 후 재생성"""
        print("\n1. 데이터베이스 초기화 중...")
        
        # 모든 테이블 삭제
        db.drop_all()
        print("  ✓ 기존 테이블 삭제 완료")
        
        # 테이블 생성
        db.create_all()
        print("  ✓ 새 테이블 생성 완료")
    
    def create_users(self):
        """Admin, Host, User 생성"""
        print("\n2. 사용자 생성 중...")
        
        # Admin 1명
        admin = User(
            user_id='admin',
            nickname='관리자',
            email='admin@festival.com',
            role=UserRole.ADMIN
        )
        admin.set_password('password123')
        db.session.add(admin)
        self.users['admin'] = admin
        print("  ✓ Admin 생성: admin")
        
        # Host 18명 (17개 지역 + 기타)
        for region in REGIONS:
            region_eng = REGION_ENGLISH[region]
            host = User(
                user_id=f'host_{region_eng}',
                nickname=f'{region}호스트',
                email=f'host_{region_eng}@festival.com',
                role=UserRole.HOST
            )
            host.set_password('password123')
            db.session.add(host)
            self.region_hosts[region] = host
            self.events_by_host[host.id] = []
        
        # 기타 Host
        host_etc = User(
            user_id='host_etc',
            nickname='기타호스트',
            email='host_etc@festival.com',
            role=UserRole.HOST
        )
        host_etc.set_password('password123')
        db.session.add(host_etc)
        self.region_hosts['기타'] = host_etc
        self.events_by_host[host_etc.id] = []
        
        print(f"  ✓ Host 생성: {len(REGIONS) + 1}명")
        
        # 일반 User 20명
        for i in range(1, 21):
            user = User(
                user_id=f'user{i:02d}',
                nickname=f'사용자{i:02d}',
                email=f'user{i:02d}@example.com',
                role=UserRole.USER
            )
            user.set_password('password123')
            db.session.add(user)
        
        print("  ✓ 일반 User 생성: 20명")
        
        db.session.commit()
        print(f"  ✓ 총 {1 + len(REGIONS) + 1 + 20}명 생성 완료")
        print(f"  📝 모든 계정 비밀번호: password123")
    
    def load_json_data(self) -> List[Dict]:
        """JSON 파일에서 이벤트 데이터 로드"""
        print("\n3. JSON 데이터 로드 중...")
        
        try:
            with open(self.json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"  ✓ {len(data)}개 이벤트 데이터 로드 완료")
            return data
        except FileNotFoundError:
            print(f"  ✗ 파일을 찾을 수 없습니다: {self.json_file}")
            return []
        except json.JSONDecodeError as e:
            print(f"  ✗ JSON 파싱 오류: {e}")
            return []
    
    def match_region(self, location: str) -> str:
        """location 문자열에서 지역 매칭"""
        if not location:
            return '기타'
        
        # 우선순위: 광역시/특별시 → 도
        location_lower = location.lower()
        
        # 특별시/광역시 먼저 확인
        if '서울특별시' in location or '서울' in location:
            return '서울'
        if '부산광역시' in location or '부산' in location:
            return '부산'
        if '대구광역시' in location or '대구' in location:
            return '대구'
        if '인천광역시' in location or '인천' in location:
            return '인천'
        if '대전광역시' in location or '대전' in location:
            return '대전'
        if '울산광역시' in location or '울산' in location:
            return '울산'
        if '세종특별자치시' in location or '세종' in location:
            return '세종'
        
        # 도 확인 (광주는 경기도 광주시와 구분)
        if '경기도' in location:
            return '경기'
        if '광주광역시' in location:
            return '광주'
        if '강원특별자치도' in location or '강원도' in location or '강원' in location:
            return '강원'
        if '충청북도' in location or '충북' in location:
            return '충북'
        if '충청남도' in location or '충남' in location:
            return '충남'
        if '전북특별자치도' in location or '전라북도' in location or '전북' in location:
            return '전북'
        if '전라남도' in location or '전남' in location:
            return '전남'
        if '경상북도' in location or '경북' in location:
            return '경북'
        if '경상남도' in location or '경남' in location:
            return '경남'
        if '제주특별자치도' in location or '제주도' in location or '제주' in location:
            return '제주'
        
        return '기타'
    
    def create_tags(self, events_data: List[Dict]):
        """태그 생성"""
        print("\n4. 태그 생성 중...")
        
        tag_set = set()
        for event_data in events_data:
            tags = event_data.get('tags', [])
            tag_set.update(tags)
        
        tag_objects = {}
        for tag_name in tag_set:
            if tag_name and len(tag_name) <= 50:
                tag = Tag(name=tag_name)
                db.session.add(tag)
                tag_objects[tag_name] = tag
        
        db.session.commit()
        print(f"  ✓ {len(tag_objects)}개 태그 생성 완료")
        
        # 나중에 사용하기 위해 저장
        self.tag_objects = tag_objects
    
    def create_events(self, events_data: List[Dict]):
        """이벤트 생성"""
        print("\n5. 이벤트 생성 중...")
        
        for idx, event_data in enumerate(events_data, 1):
            # 지역 매칭
            region = self.match_region(event_data.get('location', ''))
            host = self.region_hosts.get(region, self.region_hosts['기타'])
            
            # 날짜 파싱
            start_date = self._parse_date(event_data.get('start_date'))
            end_date = self._parse_date(event_data.get('end_date'))
            
            # Event 생성
            event = Event(
                title=event_data.get('title', '제목 없음')[:255],
                summary=event_data.get('summary'),
                organizer=event_data.get('organizer'),
                hosted_by=event_data.get('hosted_by'),
                start_date=start_date,
                end_date=end_date,
                location=event_data.get('location', '미정')[:255],
                description=event_data.get('description') or '상세 설명이 준비중입니다.',
                phone=event_data.get('phone'),
                image_urls=event_data.get('image_urls', []),
                host_id=host.id,
                status=EventStatus.APPROVED  # 일단 모두 승인
            )
            
            db.session.add(event)
            db.session.flush()  # ID 생성
            
            # Host별 이벤트 기록
            if host.id not in self.events_by_host:
                self.events_by_host[host.id] = []
            self.events_by_host[host.id].append(event)
            self.all_events.append(event)
            
            # 태그 연결
            tags = event_data.get('tags', [])
            for tag_name in tags:
                tag = self.tag_objects.get(tag_name)
                if tag:
                    event_tag = EventTag(
                        event_id=event.id,
                        tag_id=tag.id
                    )
                    db.session.add(event_tag)
            
            if idx % 10 == 0:
                print(f"  - {idx}/{len(events_data)} 처리 중...")
        
        db.session.commit()
        print(f"  ✓ {len(events_data)}개 이벤트 생성 완료")
        
        # 각 Host별로 1개씩 PENDING 설정
        self.set_pending_events()
    
    def set_pending_events(self):
        """각 Host별로 1개 이벤트를 PENDING 상태로 변경"""
        print("\n  - 각 Host별 1개 이벤트를 PENDING으로 설정 중...")
        
        pending_count = 0
        for host_id, events in self.events_by_host.items():
            if events:
                # 랜덤으로 1개 선택
                pending_event = random.choice(events)
                pending_event.status = EventStatus.PENDING
                pending_count += 1
        
        db.session.commit()
        print(f"  ✓ {pending_count}개 이벤트 PENDING 설정 완료")
    
    def create_reviews(self):
        """리뷰 생성"""
        print("\n6. 리뷰 생성 중...")
        
        # 일반 User만 가져오기
        users = User.query.filter_by(role=UserRole.USER).all()
        
        total_reviews = 0
        for user in users:
            # 유저당 2~5개 랜덤
            num_reviews = random.randint(2, 5)
            
            # 랜덤 이벤트 선택 (중복 없이)
            selected_events = random.sample(self.all_events, min(num_reviews, len(self.all_events)))
            
            for event in selected_events:
                review = Review(
                    title=f"{event.title} 후기",
                    content=random.choice(SAMPLE_REVIEWS),
                    rating=random.randint(3, 5),  # 3~5점
                    user_id=user.id,
                    event_id=event.id
                )
                db.session.add(review)
                total_reviews += 1
        
        db.session.commit()
        print(f"  ✓ {total_reviews}개 리뷰 생성 완료")
    
    def create_schedules(self):
        """일정 생성"""
        print("\n7. 일정 생성 중...")
        
        users = User.query.filter_by(role=UserRole.USER).all()
        
        total_schedules = 0
        for user in users:
            # 유저당 3~8개 랜덤
            num_schedules = random.randint(3, 8)
            
            # 랜덤 이벤트 선택 (중복 없이)
            selected_events = random.sample(self.all_events, min(num_schedules, len(self.all_events)))
            
            for event in selected_events:
                schedule = Schedule(
                    user_id=user.id,
                    event_id=event.id
                )
                db.session.add(schedule)
                total_schedules += 1
        
        db.session.commit()
        print(f"  ✓ {total_schedules}개 일정 생성 완료")
    
    def create_favorites(self):
        """찜 생성"""
        print("\n8. 찜 생성 중...")
        
        users = User.query.filter_by(role=UserRole.USER).all()
        
        total_favorites = 0
        for user in users:
            # 유저당 3~7개 랜덤
            num_favorites = random.randint(3, 7)
            
            # 랜덤 이벤트 선택 (중복 없이)
            selected_events = random.sample(self.all_events, min(num_favorites, len(self.all_events)))
            
            for event in selected_events:
                favorite = Favorite(
                    user_id=user.id,
                    event_id=event.id
                )
                db.session.add(favorite)
                total_favorites += 1
        
        db.session.commit()
        print(f"  ✓ {total_favorites}개 찜 생성 완료")
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """날짜 문자열을 date 객체로 변환"""
        if not date_str:
            return None
        
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return None
    
    def print_summary(self):
        """생성 결과 요약 출력"""
        print("\n📊 생성 결과 요약:")
        print("-" * 60)
        
        # User 통계
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        host_count = User.query.filter_by(role=UserRole.HOST).count()
        user_count = User.query.filter_by(role=UserRole.USER).count()
        
        print(f"👤 사용자:")
        print(f"   - Admin: {admin_count}명")
        print(f"   - Host: {host_count}명")
        print(f"   - User: {user_count}명")
        print(f"   - 총계: {admin_count + host_count + user_count}명")
        
        # Event 통계
        approved_count = Event.query.filter_by(status=EventStatus.APPROVED).count()
        pending_count = Event.query.filter_by(status=EventStatus.PENDING).count()
        
        print(f"\n🎪 이벤트:")
        print(f"   - APPROVED: {approved_count}개")
        print(f"   - PENDING: {pending_count}개")
        print(f"   - 총계: {approved_count + pending_count}개")
        
        # Tag 통계
        tag_count = Tag.query.count()
        print(f"\n🏷️  태그: {tag_count}개")
        
        # Review 통계
        review_count = Review.query.count()
        avg_rating = db.session.query(db.func.avg(Review.rating)).scalar()
        print(f"\n⭐ 리뷰: {review_count}개")
        if avg_rating:
            print(f"   - 평균 평점: {avg_rating:.1f}점")
        
        # Schedule 통계
        schedule_count = Schedule.query.count()
        print(f"\n📅 일정: {schedule_count}개")
        
        # Favorite 통계
        favorite_count = Favorite.query.count()
        print(f"\n❤️  찜: {favorite_count}개")
        
        print("-" * 60)


def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description='데이터베이스 초기화 및 샘플 데이터 생성')
    parser.add_argument('--file', '-f', default='festivals_data.json',
                        help='이벤트 JSON 파일 경로 (기본: festivals_data.json)')
    parser.add_argument('--yes', '-y', action='store_true',
                        help='확인 없이 바로 실행')
    
    args = parser.parse_args()
    
    # 경고 메시지
    if not args.yes:
        print("\n⚠️  경고: 이 스크립트는 기존 데이터베이스를 완전히 삭제합니다!")
        print("모든 테이블과 데이터가 제거되고 새로 생성됩니다.")
        response = input("\n계속하시겠습니까? (yes 입력): ")
        if response.lower() != 'yes':
            print("취소되었습니다.")
            return
    
    # 앱 생성 및 시딩 실행
    app = create_app()
    seeder = DatabaseSeeder(app, json_file=args.file)
    seeder.run()
    
    print("\n✅ 완료! 이제 애플리케이션을 시작할 수 있습니다.")


if __name__ == '__main__':
    main()