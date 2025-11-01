from flask import Blueprint, request
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

upload_bp = Blueprint('upload', __name__)

# ==================== 설정 ====================

# 업로드 허용 확장자
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# 최대 파일 크기 (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

# 업로드 디렉토리 (환경변수 또는 기본값)
UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')

# 서버 URL (환경변수 또는 기본값)
SERVER_URL = os.environ.get('SERVER_URL', 'http://localhost:5000')


# ==================== Helper Functions ====================

# 허용된 확장자인지 확인
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# 파일 확장자 추출
def get_file_extension(filename):
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


# 고유한 파일명 생성 (UUID + 타임스탬프)
def generate_unique_filename(original_filename):
    ext = get_file_extension(original_filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    return f"{timestamp}_{unique_id}.{ext}"


# 단일 파일 처리
def process_single_file(file):
    filename = file.filename
    
    # 파일명이 비어있는지 확인
    if filename == '':
        return {
            "success": False,
            "error": {
                "error_code": "EMPTY_FILENAME",
                "message": "파일명이 비어있습니다."
            },
            "status_code": 400
        }
    
    # 허용된 확장자인지 확인
    if not allowed_file(filename):
        return {
            "success": False,
            "error": {
                "error_code": "INVALID_FILE_TYPE",
                "message": f"허용되지 않은 파일 형식입니다. 허용 형식: {', '.join(ALLOWED_EXTENSIONS)}"
            },
            "status_code": 400
        }
    
    # 파일 크기 확인
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return {
            "success": False,
            "error": {
                "error_code": "FILE_TOO_LARGE",
                "message": f"파일 크기가 너무 큽니다. 최대 크기: {MAX_FILE_SIZE // (1024*1024)}MB"
            },
            "status_code": 400
        }
    
    # 안전한 파일명으로 변환
    original_filename = secure_filename(filename)
    unique_filename = generate_unique_filename(original_filename)
    
    # 파일 저장
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    # URL 생성
    file_url = f"{SERVER_URL}/uploads/{unique_filename}"
    
    return {
        "success": True,
        "url": file_url,
        "filename": unique_filename,
        "original_filename": original_filename,
        "size": file_size
    }


### 이미지 업로드 API
### POST /api/upload/image
@upload_bp.route('/image', methods=['POST'])
@login_required
def upload_image():
    # 파일이 요청에 포함되어 있는지 확인
    if 'image' not in request.files and 'images' not in request.files:
        return {
            "error_code": "NO_FILE",
            "message": "업로드할 이미지가 없습니다."
        }, 400
    
    try:
        # 업로드 디렉토리 생성 (없으면)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # 다중 파일 업로드 처리
        if 'images' in request.files:
            files = request.files.getlist('images')
            uploaded_urls = []
            
            for file in files:
                if file and file.filename:
                    result = process_single_file(file)
                    if result['success']:
                        uploaded_urls.append(result['url'])
                    else:
                        return result['error'], result['status_code']
            
            if not uploaded_urls:
                return {
                    "error_code": "NO_VALID_FILE",
                    "message": "유효한 이미지가 없습니다."
                }, 400
            
            return {
                "urls": uploaded_urls,
                "count": len(uploaded_urls)
            }, 201
        
        # 단일 파일 업로드 처리
        else:
            file = request.files['image']
            
            if not file or not file.filename:
                return {
                    "error_code": "NO_FILE",
                    "message": "업로드할 이미지가 없습니다."
                }, 400
            
            result = process_single_file(file)
            if result['success']:
                return {
                    "url": result['url']
                }, 201
            else:
                return result['error'], result['status_code']
    
    except Exception as e:
        return {
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "이미지 업로드 중 오류가 발생했습니다."
        }, 500


<<<<<<< HEAD
### 이미지 제공 API
### GET /api/upload/uploads/<filename>
@upload_bp.route('/uploads/<filename>', methods=['GET'])
=======
def process_single_file(file):
    """단일 파일 처리"""
    filename = file.filename
    
    # 파일명이 비어있는지 확인
    if filename == '':
        return {
            "success": False,
            "error": {
                "error_code": "EMPTY_FILENAME",
                "message": "파일명이 비어있습니다."
            },
            "status_code": 400
        }
    
    # 허용된 확장자인지 확인
    if not allowed_file(filename):
        return {
            "success": False,
            "error": {
                "error_code": "INVALID_FILE_TYPE",
                "message": f"허용되지 않은 파일 형식입니다. 허용 형식: {', '.join(ALLOWED_EXTENSIONS)}"
            },
            "status_code": 400
        }
    
    # 파일 크기 확인
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return {
            "success": False,
            "error": {
                "error_code": "FILE_TOO_LARGE",
                "message": f"파일 크기가 너무 큽니다. 최대 크기: {MAX_FILE_SIZE // (1024*1024)}MB"
            },
            "status_code": 400
        }
    
    # 안전한 파일명으로 변환
    original_filename = secure_filename(filename)
    unique_filename = generate_unique_filename(original_filename)
    
    # 파일 저장
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    # URL 생성
    file_url = f"{SERVER_URL}/uploads/{unique_filename}"
    
    return {
        "success": True,
        "url": file_url,
        "filename": unique_filename,
        "original_filename": original_filename,
        "size": file_size
    }


# ==================== GET /uploads/<filename> - 이미지 제공 (선택적) ====================

@upload_bp.route('/<filename>', methods=['GET'])
>>>>>>> c18e99d736bae9483cadc84ce75f858c4b26ef75
def serve_image(filename):
    from flask import send_from_directory

    abs_folder = os.path.abspath(UPLOAD_FOLDER)
    full_path = os.path.join(abs_folder, filename)

    try:
        return send_from_directory(abs_folder, filename)
    except FileNotFoundError:
        return {
            "error_code": "FILE_NOT_FOUND",
            "message": "파일을 찾을 수 없습니다."
        }, 404