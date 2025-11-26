import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
from typing import Dict, Any, List, Tuple, Optional
from xml.etree import ElementTree as ET
from urllib.parse import urlparse, parse_qs
import os
import mimetypes
from . import Tag, EventTag
import re
import json

from . import db, Event

# VISITKOREA 전용 크롤러 (다른 사이트 크롤링 시 해당 사이트의 robots.txt에 맞게 수정하기)
VISIT_KOREA_BASE = 'https://korean.visitkorea.or.kr'
EVENTS_SITEMAP_URL = f'{VISIT_KOREA_BASE}/performances_events_sitemap.xml'

# 업로드 경로 및 베이스 URL 설정
# 현재 파일 위치가 backend/app/models/crawler.py 라는 가정 하에,
# 세 단계 상위 디렉터리를 backend/ 루트로 사용한다.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # backend/ 디렉터리
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')  # backend/uploads
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Flask 쪽 업로드 라우트와 맞춰야 하는 베이스 URL
# 예: http://localhost:5000/api/upload/63.jpg
UPLOAD_BASE_URL = 'http://localhost:5000/api/upload'

class Crawler:
    def __init__(self, db_instance=db, event_model=Event):
        self.db = db_instance
        self.Event = event_model

    def run_crawling_and_create_events(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        크롤링 전체 플로우:
        1) events_sitemap.xml에서 공개 이벤트 URL 목록 수집
        2) page, limit 기반으로 일부만 선택
        3) 상세 페이지 파싱
        4) 정제 후 Event 로 DB 저장
        """
        provider = options.get('provider')
        page = int(options.get('page', 1))
        limit = int(options.get('limit', 10))

        # 1. Sitemap에서 공개 이벤트 목록 읽기
        sitemap_items = self.fetch_events_from_sitemap(
            date_from=options.get('date_from'),
            date_to=options.get('date_to'),
        )

        # 2. page, limit 기반 슬라이싱
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        target_items = sitemap_items[start_idx:end_idx]

        created_count = 0

        # 3. 상세 페이지 파싱 + 4. DB 저장
        for item in target_items:
            detail_url = item['loc']

            raw_event = self.fetch_and_parse_event_detail(detail_url)
            if not raw_event:
                continue

            event = self.normalize_and_save_event(raw_event, provider)
            if event:
                created_count += 1

        return {
            'provider': provider,
            'created_count': created_count,
        }


    # ------------------------------------------------------------------------
    # 1) Sitemap 파싱 관련 함수
    # ------------------------------------------------------------------------

    def fetch_events_from_sitemap(
            self,
            date_from: Optional[str] = None,
            date_to: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        events_sitemap.xml 에서 <url><loc>, <lastmod>를 읽어서 리스트로 반환.
        필요하면 lastmod를 date_from~date_to 범위로 필터링.
        """
        xml_text = self.fetch_text(EVENTS_SITEMAP_URL)
        if not xml_text:
            return []

        root = ET.fromstring(xml_text)

        # 실제 sitemap 구조:
        # <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        #   <url>
        #     <loc>...</loc>
        #     <lastmod>2025-04-16T02:01:00+09:00</lastmod>
        #   </url>
        # </urlset>
        SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"

        items: List[Dict[str, Any]] = []

        for url_el in root.findall(f'{{{SITEMAP_NS}}}url'):
            loc_el = url_el.find(f'{{{SITEMAP_NS}}}loc')
            lastmod_el = url_el.find(f'{{{SITEMAP_NS}}}lastmod')

            if loc_el is None or not loc_el.text:
                continue

            loc = loc_el.text.strip()
            lastmod = lastmod_el.text.strip() if lastmod_el is not None and lastmod_el.text else None

            # "2025-04-16T02:01:00+09:00" -> "2025-04-16"
            lastmod_date = lastmod[:10] if lastmod and len(lastmod) >= 10 else None

            items.append({
                'loc': loc,
                'lastmod': lastmod_date,
            })

        print(f'[crawler] sitemap parsed items={len(items)}')

        # 날짜 범위 필터링 (시연용: lastmod 기준)
        filtered = self.filter_by_date_range(items, date_from, date_to)

        # 최신 것부터 정렬 (원하면)
        filtered.sort(key=lambda x: x.get('lastmod') or '', reverse=True)

        print(f'[crawler] sitemap filtered items={len(filtered)} '
              f'(date_from={date_from}, date_to={date_to})')

        return filtered


    def fetch_text(self, url: str) -> Optional[str]:
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (compatible; YourFlaskAppBot/1.0)',
            }
            resp = requests.get(url, headers=headers, timeout=10)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            print('[fetch_text] error:', e)
            return None


    def filter_by_date_range(
            self,
            items: List[Dict[str, Any]],
            date_from: Optional[str],
            date_to: Optional[str],
    ) -> List[Dict[str, Any]]:
        """lastmod(YYYY-MM-DD)가 date_from~date_to 사이인 것만 필터링."""
        if not date_from and not date_to:
            return items

        def in_range(d: Optional[str]) -> bool:
            if not d:
                return True  # lastmod 없으면 필터하지 않음 (시연용)
            if date_from and d < date_from:
                return False
            if date_to and d > date_to:
                return False
            return True

        return [item for item in items if in_range(item.get('lastmod'))]


    # ------------------------------------------------------------------------
    # 2) 개별 이벤트 상세 페이지 파싱
    # ------------------------------------------------------------------------

    def fetch_and_parse_event_detail(self, detail_url: str) -> Optional[Dict[str, Any]]:
        # 1) detail_url에서 cotId 추출
        try:
            parsed = urlparse(detail_url)
            qs = parse_qs(parsed.query)
            cotid = qs.get('cotid', [None])[0]
        except Exception:
            return None
        if not cotid:
            return None

        # 2) API 호출
        api_url = f'{VISIT_KOREA_BASE}/call'
        payload = {
            'cmd': 'FESTIVAL_CONTENT_BODY_DETAIL',
            'cotId': cotid,
            'locationx': '0', 'locationy': '0',
        }
        headers = {'User-Agent': 'Mozilla/5.0'}

        try:
            resp = requests.post(api_url, data=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return None

        body = data.get('body') or {}
        detail = body.get('detail') or {}
        sub_articles = body.get('subArticle') or []

        # 제목
        title = detail.get('title') or '제목 미정 행사'

        # 요약(summary)
        summary = detail.get('catchtitle')

        # 상세설명: subArticle 중 title 이 "행사소개" 인 항목
        description = None
        for art in sub_articles:
            if art.get('title') == '행사소개' and art.get('notice'):
                description = art.get('notice')
                break
        if not description:
            description = summary or "상세 설명은 행사 페이지를 참고해 주세요."

        # 날짜
        start_raw = detail.get('eventStartDate')
        end_raw = detail.get('eventEndDate')

        def norm_ymd(v):
            if not v: return None
            v = ''.join(ch for ch in str(v) if ch.isdigit())
            if len(v) >= 8:
                return f"{v[:4]}-{v[4:6]}-{v[6:8]}"
            return None

        start_date = norm_ymd(start_raw)
        end_date = norm_ymd(end_raw)

        # 이미지
        images = []
        for img in body.get('publicImage') or []:
            if img.get('imgPath'):
                images.append(img['imgPath'])
        if not images:
            for img in body.get('image') or []:
                if img.get('imgPath'):
                    images.append(img['imgPath'])

        # 장소
        addr1 = detail.get('addr1') or ''
        event_place = detail.get('eventPlace') or ''
        location = ' '.join(p for p in [addr1, event_place] if p) or '장소 미정'

        # 전화번호
        phone = detail.get('telNo1') or ''

        # 태그
        tag_raw = detail.get('tagName') or ''
        tags = [t.strip() for t in tag_raw.split('|') if t.strip()]

        print('[debug] raw image_paths from API:', images)

        return {
            'source_url': detail_url,
            'crawled_at': datetime.utcnow().isoformat(),

            'title': title,
            'summary': summary,
            'description': description,
            'start_date': start_date,
            'end_date': end_date,
            'location_name': location,
            'image_urls': images,
            'phone': phone,
            'tags': tags,
        }

    def resolve_visitkorea_image_url(self, img_path_or_url: str) -> Optional[str]:
        """
        VisitKorea API에서 내려오는 imgPath 또는 URL을 실제 다운로드 가능한 URL로 변환한다.
        - 이미 http로 시작하면 그대로 사용
        - 그렇지 않으면 VisitKorea CDN 이미지 URL 규칙에 맞게 변환
        """
        if not img_path_or_url:
            return None

        # 이미 완전한 URL인 경우 그대로 사용
        if img_path_or_url.startswith('http://') or img_path_or_url.startswith('https://'):
            return img_path_or_url

        # VisitKorea 프론트 스크립트 기준 CDN 이미지 URL 패턴:
        #   https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id={imgPath}
        cdn_url = f"https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id={img_path_or_url}"
        print('[resolve_visitkorea_image_url] imgPath =', img_path_or_url, '->', cdn_url)
        return cdn_url

    def download_and_save_image_with_event_id(self, remote_id_or_url: str, event_id: int) -> Optional[str]:
        """
        VisitKorea 이미지(식별자 또는 URL)를 다운로드해서
        backend/uploads/{event_id + 1}.확장자 형태로 저장하고,
        외부에서 접근 가능한 URL(UPLOAD_BASE_URL 기준)을 반환한다.
        """
        if not remote_id_or_url or not event_id:
            return None

        download_url = self.resolve_visitkorea_image_url(remote_id_or_url)
        if not download_url:
            return None

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (compatible; YourFlaskAppBot/1.0)',
            }
            print('[download_and_save_image_with_event_id] downloading:', download_url)
            resp = requests.get(download_url, headers=headers, stream=True, timeout=10)
            print('[download_and_save_image_with_event_id] status =', resp.status_code,
                  'content-type =', resp.headers.get('Content-Type'))
            resp.raise_for_status()
        except Exception as e:
            print('[download_and_save_image_with_event_id] download error:', e)
            return None

        content_type = resp.headers.get('Content-Type', '').split(';')[0].strip()
        # Content-Type이 이미지가 아닌 경우(예: text/html)에는 확장자를 강제로 .jpg로 설정
        if content_type.startswith('image/'):
            ext = mimetypes.guess_extension(content_type) or '.jpg'
        else:
            ext = '.jpg'

        # event_id + 1 기반 파일명 (예: event_id=62 -> 63.jpg)
        filename = f"{event_id + 1}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        try:
            with open(file_path, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        except Exception as e:
            print('[download_and_save_image_with_event_id] save error:', e)
            return None

        return f"{UPLOAD_BASE_URL}/{filename}"

    def parse_period(self, period_text: str) -> Tuple[Optional[str], Optional[str]]:
        """
        "2025.10.18~2025.12.25" 또는 "2025.10.18 ~ 2025.12.25" 형태를
        "YYYY-MM-DD" 튜플로 변환.
        """
        if not period_text or '~' not in period_text:
            return None, None

        start_str, end_str = [s.strip() for s in period_text.split('~', 1)]

        def normalize(s: str) -> str:
            # "2025.10.18" -> "2025-10-18"
            return s.replace('.', '-')

        return normalize(start_str), normalize(end_str)

    def get_or_create_tag(self, tag_name: str) -> Tag:
        """tags 테이블에서 존재하면 가져오고, 없으면 새로 만들고 flush 까지."""
        if not tag_name:
            return None

        # 공백 제거, 소문자 변환 같은 정규화 전략이 있으면 여기서 적용
        normalized = tag_name.strip()

        tag = Tag.query.filter_by(name=normalized).first()
        if tag:
            return tag

        tag = Tag(name=normalized)
        self.db.session.add(tag)
        self.db.session.flush()  # tag.id 확보
        return tag


    def create_event_tag_links(self, event: Event, tag_names: list[str]) -> None:
        """event_tags 매핑을 만들어주는 함수."""
        if not tag_names:
            return

        # 한 이벤트 안에서 중복 태그 방지
        unique_names = {name.strip() for name in tag_names if name.strip()}

        for name in unique_names:
            tag = self.get_or_create_tag(name)
            if not tag:
                continue

            # 이미 매핑이 있는지 확인 (UNIQUE 제약 걸어두면 안전망 한 번 더)
            exists = EventTag.query.filter_by(
                event_id=event.id,
                tag_id=tag.id,
            ).first()
            if exists:
                continue

            link = EventTag(event_id=event.id, tag_id=tag.id)
            self.db.session.add(link)
    # ------------------------------------------------------------------------
    # 3) 정제 + DB 저장
    # ------------------------------------------------------------------------

    def normalize_and_save_event(self, raw: Dict[str, Any], provider: str) -> Optional[Event]:
        """
        raw dict -> Event 모델로 변환 후 DB 저장.
        """
        title = raw.get('title') or '제목 미정 행사'

        # start_date / end_date 는 SQLAlchemy Date 타입이므로
        # 문자열이 아닌 Python date 객체로 변환해줘야 한다.
        raw_start = raw.get('start_date')
        raw_end = raw.get('end_date')

        def to_date(value) -> Optional[date]:
            """
            'YYYY-MM-DD' 문자열을 date 로 변환한다.
            변환에 실패하면 None 을 반환하고, 오늘 날짜로 강제 치환하지 않는다.
            """
            if isinstance(value, date):
                return value
            if isinstance(value, str) and value:
                try:
                    return datetime.strptime(value, '%Y-%m-%d').date()
                except ValueError:
                    return None
            return None

        start_date = to_date(raw_start)
        end_date = to_date(raw_end) if raw_end else start_date

        # 어떤 이유로든 날짜를 파싱하지 못했다면, 최소한 오늘 날짜로 채워넣고 싶다면
        if start_date is None:
            start_date = datetime.utcnow().date()
        if end_date is None:
            end_date = start_date

        location_name = raw.get('location_name') or '장소 미정'
        location = location_name

        phone = raw.get('phone') or ''
        organizer = '외부 사이트에서 가져옴'
        hosted_by = '외부 사이트에서 가져옴'

        description = raw.get('description') or ''
        # summary: description 의 앞부분을 잘라 간단 요약으로 사용
        summary = raw.get('summary')
        if not summary and description:
            flat = ' '.join(description.split())
            if len(flat) > 200:
                summary = flat[:197] + '...'
            else:
                summary = flat

        event = self.Event(
            title=title,
            summary=summary,
            description=description,
            start_date=start_date,
            end_date=end_date,
            location=location,
            organizer=organizer,
            hosted_by=hosted_by,
            host_id=1,
            phone=phone,
        )

        self.db.session.add(event)
        # event.id를 사용하기 위해 commit 대신 flush 먼저
        self.db.session.flush()

        # ✅ 이미지 다운로드 및 로컬 파일 저장 (event_id 기반 파일명)
        remote_image_ids = raw.get('image_urls') or []
        if remote_image_ids:
            main_image_id = remote_image_ids[0]  # 대표 이미지는 첫 번째 것만 사용
            image_url = self.download_and_save_image_with_event_id(main_image_id, event.id)
            if image_url:
                # Event.image_urls는 JSON(List[str]) 필드라고 가정
                existing_urls = event.image_urls or []
                if image_url not in existing_urls:
                    existing_urls.append(image_url)
                event.image_urls = existing_urls

        # ✅ 여기서 태그 매핑 처리
        tag_names = raw.get('tags') or []
        self.create_event_tag_links(event, tag_names)

        # 모든 변경사항 한 번에 커밋
        self.db.session.commit()

        return event