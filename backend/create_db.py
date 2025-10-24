"""
테스트 데이터 생성 스크립트
- 일반 사용자 10명
- Host 3명
- Admin 1명
- 행사 10개
"""

from app import create_app, db
from app.models.user import User
from app.models.event import Event
from app.models.tag import Tag
from app.models.event_tag import EventTag
from app.models.enums import UserRole, EventStatus
from datetime import date, datetime

def create_users():
    """사용자 생성"""
    users_data = [
        # 일반 사용자 10명
        {"user_id": "user001", "nickname": "김민준", "email": "minjun@example.com", "phone": "010-1111-1111", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user002", "nickname": "이서윤", "email": "seoyun@example.com", "phone": "010-2222-2222", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user003", "nickname": "박지우", "email": "jiwoo@example.com", "phone": "010-3333-3333", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user004", "nickname": "최하준", "email": "hajun@example.com", "phone": "010-4444-4444", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user005", "nickname": "정서준", "email": "seojun@example.com", "phone": "010-5555-5555", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user006", "nickname": "강예은", "email": "yeeun@example.com", "phone": "010-6666-6666", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user007", "nickname": "조시우", "email": "siwoo@example.com", "phone": "010-7777-7777", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user008", "nickname": "윤지안", "email": "jian@example.com", "phone": "010-8888-8888", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user009", "nickname": "임도윤", "email": "doyun@example.com", "phone": "010-9999-9999", "role": UserRole.USER, "password": "password123!"},
        {"user_id": "user010", "nickname": "한서연", "email": "seoyeon@example.com", "phone": "010-1010-1010", "role": UserRole.USER, "password": "password123!"},
        
        # Host 3명
        {"user_id": "host001", "nickname": "서울문화재단", "email": "seoul_culture@example.com", "phone": "02-1111-1111", "role": UserRole.HOST, "password": "password123!"},
        {"user_id": "host002", "nickname": "부산축제기획", "email": "busan_festival@example.com", "phone": "051-2222-2222", "role": UserRole.HOST, "password": "password123!"},
        {"user_id": "host003", "nickname": "제주이벤트", "email": "jeju_event@example.com", "phone": "064-3333-3333", "role": UserRole.HOST, "password": "password123!"},
        
        # Admin 1명
        {"user_id": "admin", "nickname": "관리자", "email": "admin@example.com", "phone": "02-9999-9999", "role": UserRole.ADMIN, "password": "admin123!"},
    ]
    
    users = []
    for data in users_data:
        user = User(
            user_id=data["user_id"],
            nickname=data["nickname"],
            email=data["email"],
            phone=data["phone"],
            role=data["role"]
        )
        user.set_password(data["password"])
        users.append(user)
        db.session.add(user)
    
    db.session.commit()
    print(f"✅ {len(users)}명의 사용자 생성 완료")
    return users


def create_tags():
    """태그 생성"""
    tag_names = [
        # 기본
        "행사", "이벤트", "온라인", "오프라인", "가볼만한곳", "주말에뭐하지",
        
        # 행사 종류별 - 문화예술
        "전시회", "콘서트", "페스티벌", "공연", "팬미팅", "영화",
        
        # 행사 종류별 - 상업/마켓
        "팝업스토어", "플리마켓", "박람회", "세일",
        
        # 행사 종류별 - 학습
        "세미나", "컨퍼런스", "강연", "워크숍", "클래스",
        
        # 행사 종류별 - 소셜
        "네트워킹", "파티", "소모임", "정모",
        
        # 행사 종류별 - 활동
        "원데이클래스", "스포츠", "게임", "여행", "봉사활동",
        
        # 행사 분위기별
        "힐링", "감성", "신나는", "액티비티", "조용한", "로맨틱", 
        "핫플", "힙스터", "이색체험", "인생샷",
        
        # 행사 참여 대상
        "누구나", "가족나들이", "아이와함께", "커플추천", "친구랑", 
        "혼자서도좋아", "직장인", "대학생", "반려동물동반"
    ]
    
    tags = []
    for name in tag_names:
        tag = Tag(name=name)
        tags.append(tag)
        db.session.add(tag)
    
    db.session.commit()
    print(f"✅ {len(tags)}개의 태그 생성 완료")
    return tags


def create_events(users, tags):
    """행사 생성"""
    # Host 사용자만 필터링
    hosts = [u for u in users if u.role == UserRole.HOST]
    
    events_data = [
        {
            "title": "서울 재즈 페스티벌 2025",
            "summary": "도심 속에서 즐기는 세계적인 재즈 공연",
            "organizer": "서울시",
            "hosted_by": "서울문화재단",
            "start_date": date(2025, 5, 15),
            "end_date": date(2025, 5, 17),
            "location": "올림픽공원",
            "description": "국내외 유명 재즈 뮤지션들이 한자리에 모이는 아시아 최대 규모의 재즈 페스티벌입니다. 3일간 펼쳐지는 화려한 공연과 함께 재즈의 매력에 빠져보세요.",
            "phone": "02-1234-5678",
            "image_urls": ["https://example.com/jazz1.jpg", "https://example.com/jazz2.jpg"],
            "host_index": 0,
            "status": EventStatus.APPROVED,
            "tags": ["행사", "오프라인", "페스티벌", "콘서트", "신나는", "핫플", "친구랑", "누구나"],
            "view_count": 1542
        },
        {
            "title": "부산 국제 영화제",
            "summary": "아시아를 대표하는 영화 축제",
            "organizer": "부산광역시",
            "hosted_by": "부산국제영화제 조직위원회",
            "start_date": date(2025, 10, 2),
            "end_date": date(2025, 10, 11),
            "location": "부산 영화의전당",
            "description": "세계 각국의 우수한 영화를 만날 수 있는 아시아 최대 영화 축제입니다.",
            "phone": "051-1234-5678",
            "image_urls": ["https://example.com/biff1.jpg"],
            "host_index": 1,
            "status": EventStatus.APPROVED,
            "tags": ["행사", "오프라인", "영화", "페스티벌", "감성", "친구랑", "커플추천", "대학생"],
            "view_count": 2341
        },
        {
            "title": "제주 감귤 축제",
            "summary": "제주의 맛과 향을 느끼는 특별한 시간",
            "organizer": "제주특별자치도",
            "hosted_by": "제주관광공사",
            "start_date": date(2025, 11, 1),
            "end_date": date(2025, 11, 3),
            "location": "제주시 탑동광장",
            "description": "제주의 대표 특산물인 감귤을 주제로 한 축제입니다. 감귤 따기 체험, 감귤 요리 시연 등 다양한 프로그램이 준비되어 있습니다.",
            "phone": "064-1234-5678",
            "image_urls": ["https://example.com/jeju1.jpg", "https://example.com/jeju2.jpg"],
            "host_index": 2,
            "status": EventStatus.APPROVED,
            "tags": ["이벤트", "오프라인", "가볼만한곳", "여행", "가족나들이", "아이와함께", "힐링"],
            "view_count": 892
        },
        {
            "title": "서울 빛초롱 축제",
            "summary": "화려한 등불이 수놓는 겨울 밤",
            "organizer": "서울시",
            "hosted_by": "서울문화재단",
            "start_date": date(2025, 12, 15),
            "end_date": date(2026, 1, 15),
            "location": "청계천 일대",
            "description": "형형색색의 아름다운 등불로 꾸며진 청계천에서 특별한 겨울 추억을 만들어보세요.",
            "phone": "02-2345-6789",
            "image_urls": ["https://example.com/light1.jpg"],
            "host_index": 0,
            "status": EventStatus.APPROVED,
            "tags": ["행사", "오프라인", "페스티벌", "전시회", "감성", "로맨틱", "인생샷", "커플추천", "가족나들이"],
            "view_count": 3421
        },
        {
            "title": "부산 바다 축제",
            "summary": "여름 바다에서 즐기는 신나는 축제",
            "organizer": "부산광역시",
            "hosted_by": "부산관광공사",
            "start_date": date(2025, 7, 25),
            "end_date": date(2025, 7, 28),
            "location": "해운대 해수욕장",
            "description": "시원한 바다와 함께하는 여름 축제! 수상 스포츠, 비치 파티, 불꽃놀이 등 다채로운 이벤트가 펼쳐집니다.",
            "phone": "051-2345-6789",
            "image_urls": ["https://example.com/sea1.jpg", "https://example.com/sea2.jpg"],
            "host_index": 1,
            "status": EventStatus.APPROVED,
            "tags": ["이벤트", "오프라인", "페스티벌", "스포츠", "신나는", "액티비티", "친구랑", "가족나들이"],
            "view_count": 2156
        },
        {
            "title": "서울 클래식 음악회",
            "summary": "세계적인 오케스트라의 감동적인 연주",
            "organizer": "서울시립교향악단",
            "hosted_by": "서울문화재단",
            "start_date": date(2025, 9, 20),
            "end_date": date(2025, 9, 22),
            "location": "예술의전당 콘서트홀",
            "description": "베토벤, 모차르트 등 클래식의 명곡들을 세계적인 오케스트라의 연주로 만나보세요.",
            "phone": "02-3456-7890",
            "image_urls": ["https://example.com/classic1.jpg"],
            "host_index": 0,
            "status": EventStatus.PENDING,
            "tags": ["행사", "오프라인", "콘서트", "공연", "감성", "조용한", "커플추천", "직장인"],
            "view_count": 0
        },
        {
            "title": "제주 현대미술 전시회",
            "summary": "제주의 자연을 담은 현대미술",
            "organizer": "제주도립미술관",
            "hosted_by": "제주이벤트",
            "start_date": date(2025, 8, 1),
            "end_date": date(2025, 8, 31),
            "location": "제주도립미술관",
            "description": "제주의 아름다운 자연을 현대적인 시각으로 재해석한 작품들을 만나보실 수 있습니다.",
            "phone": "064-2345-6789",
            "image_urls": ["https://example.com/art1.jpg", "https://example.com/art2.jpg"],
            "host_index": 2,
            "status": EventStatus.APPROVED,
            "tags": ["이벤트", "오프라인", "전시회", "가볼만한곳", "감성", "힙스터", "인생샷", "혼자서도좋아"],
            "view_count": 674
        },
        {
            "title": "부산 푸드 마켓",
            "summary": "전국 맛집이 모인 미식 천국",
            "organizer": "부산광역시",
            "hosted_by": "부산축제기획",
            "start_date": date(2025, 6, 10),
            "end_date": date(2025, 6, 12),
            "location": "부산 벡스코",
            "description": "전국의 유명 맛집과 셰프들이 한자리에! 다양한 음식을 맛보고 요리 시연도 관람할 수 있습니다.",
            "phone": "051-3456-7890",
            "image_urls": ["https://example.com/food1.jpg"],
            "host_index": 1,
            "status": EventStatus.APPROVED,
            "tags": ["이벤트", "오프라인", "플리마켓", "가볼만한곳", "신나는", "핫플", "친구랑", "가족나들이"],
            "view_count": 1893
        },
        {
            "title": "서울 전통공예 박람회",
            "summary": "우리의 아름다운 전통 공예를 만나다",
            "organizer": "문화체육관광부",
            "hosted_by": "한국공예디자인문화진흥원",
            "start_date": date(2025, 4, 5),
            "end_date": date(2025, 4, 7),
            "location": "코엑스",
            "description": "도자기, 자수, 목공예 등 전통 공예 작품 전시 및 체험 프로그램을 운영합니다.",
            "phone": "02-4567-8901",
            "image_urls": ["https://example.com/craft1.jpg", "https://example.com/craft2.jpg"],
            "host_index": 0,
            "status": EventStatus.PENDING,
            "tags": ["행사", "오프라인", "박람회", "전시회", "이색체험", "원데이클래스", "누구나", "가족나들이"],
            "view_count": 0
        },
        {
            "title": "제주 힐링 음악회",
            "summary": "자연 속에서 듣는 힐링 멜로디",
            "organizer": "제주특별자치도",
            "hosted_by": "제주이벤트",
            "start_date": date(2025, 10, 20),
            "end_date": date(2025, 10, 20),
            "location": "제주 애월 해변",
            "description": "제주의 아름다운 해변을 배경으로 펼쳐지는 특별한 음악회입니다. 일몰과 함께하는 힐링 콘서트를 즐겨보세요.",
            "phone": "064-3456-7890",
            "image_urls": ["https://example.com/healing1.jpg"],
            "host_index": 2,
            "status": EventStatus.REJECTED,
            "rejection_reason": "행사 장소에 대한 허가가 필요합니다. 관련 서류를 보완하여 다시 신청해주세요.",
            "tags": ["이벤트", "오프라인", "콘서트", "힐링", "감성", "로맨틱"],
            "view_count": 0
        }
    ]
    
    events = []
    tag_dict = {tag.name: tag for tag in tags}
    
    for data in events_data:
        event = Event(
            title=data["title"],
            summary=data["summary"],
            organizer=data["organizer"],
            hosted_by=data["hosted_by"],
            start_date=data["start_date"],
            end_date=data["end_date"],
            location=data["location"],
            description=data["description"],
            phone=data["phone"],
            image_urls=data["image_urls"],
            host_id=hosts[data["host_index"]].id,
            status=data["status"],
            view_count=data["view_count"]
        )
        
        if data["status"] == EventStatus.REJECTED and "rejection_reason" in data:
            event.rejection_reason = data["rejection_reason"]
        
        events.append(event)
        db.session.add(event)
        db.session.flush()  # ID 할당을 위해 flush
        
        # 태그 연결
        for tag_name in data["tags"]:
            if tag_name in tag_dict:
                event_tag = EventTag(
                    event_id=event.id,
                    tag_id=tag_dict[tag_name].id
                )
                db.session.add(event_tag)
    
    db.session.commit()
    print(f"✅ {len(events)}개의 행사 생성 완료")
    return events


def seed_database():
    """전체 시드 데이터 생성"""
    app = create_app()
    
    with app.app_context():
        # 기존 데이터 삭제 (개발 환경에서만!)
        print("⚠️  기존 데이터 삭제 중...")
        db.drop_all()
        db.create_all()
        print("✅ 테이블 재생성 완료")
        
        # 데이터 생성
        print("\n📝 테스트 데이터 생성 시작...")
        users = create_users()
        tags = create_tags()
        events = create_events(users, tags)
        
        print("\n" + "="*50)
        print("✅ 모든 테스트 데이터 생성 완료!")
        print("="*50)
        print(f"\n📊 생성된 데이터:")
        print(f"  - 사용자: {len(users)}명")
        print(f"    • 일반 사용자(USER): 10명")
        print(f"    • 행사 주최자(HOST): 3명")
        print(f"    • 관리자(ADMIN): 1명")
        print(f"  - 행사: {len(events)}개")
        print(f"    • 승인됨(APPROVED): {sum(1 for e in events if e.status == EventStatus.APPROVED)}개")
        print(f"    • 대기중(PENDING): {sum(1 for e in events if e.status == EventStatus.PENDING)}개")
        print(f"    • 거절됨(REJECTED): {sum(1 for e in events if e.status == EventStatus.REJECTED)}개")
        print(f"  - 태그: {len(tags)}개")
        print("\n🔐 테스트 계정 정보:")
        print("  일반 사용자: user001 ~ user010 / password123!")
        print("  Host: host001 ~ host003 / password123!")
        print("  Admin: admin / admin123!")


if __name__ == '__main__':
    seed_database()
