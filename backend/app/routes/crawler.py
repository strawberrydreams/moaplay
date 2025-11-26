from flask import Blueprint, request, jsonify
from app.models.crawler import Crawler

crawler_bp = Blueprint('crawler', __name__)

@crawler_bp.route('/', methods=['POST'])
def events_crawling():
    """
    프론트에서 오는 크롤링 요청을 처리하는 라우트.
    - 입력: JSON StartCrawlingPayload
    - 출력: { provider: str, created_count: int }
    """
    data = request.get_json(force=True) or {}

    # 필수 필드 검증 (프론트에서도 하지만 백엔드에서 한 번 더)
    required_fields = ['provider', 'date_from', 'date_to', 'page', 'limit']
    missing = [f for f in required_fields if f not in data or data[f] in (None, '', 0)]

    if missing:
        return jsonify({
            'message': f"필수 필드 누락: {', '.join(missing)}"
        }), 400

    try:
        crawler = Crawler()
        result = crawler.run_crawling_and_create_events(data)
        return jsonify({
            'provider': result['provider'],
            'created_count': result['created_count'],
        }), 201
    except Exception as e:
        print('[events_crawling] error:', e)
        return jsonify({'message': '크롤링 중 서버 오류가 발생했습니다.'}), 500