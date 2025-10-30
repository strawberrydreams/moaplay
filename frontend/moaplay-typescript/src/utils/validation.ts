// 폼 유효성 검사를 처리하는 유틸 함수들의 모음
// 폼 유효성 검사를 처리하는 유틸 함수들의 모음
import type {ValidationResult, FieldError} from '../types/index';

// 이메일 주소 입력 형식을 검증하는 함수
export const validateEmail = (email: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!email.trim()) {
    errors.push({ field: 'email', message: '이메일을 입력해주세요.' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: '올바른 이메일 형식을 입력해주세요.' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 비밀번호 입력 형식을 검증하는 함수
export const validatePassword = (password: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요.' });
  } else {
    if (password.length < 8) {
      errors.push({ field: 'password', message: '비밀번호는 최소 8자 이상이어야 합니다.' });
    }
    
    if (password.length > 50) {
      errors.push({ field: 'password', message: '비밀번호는 50자 이하여야 합니다.' });
    }
    
    // 영문, 숫자, 특수문자 중 3가지 이상 포함
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteriaCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteriaCount < 3) {
      errors.push({ 
        field: 'password', 
        message: '문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.' 
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 비밀번호 확인 칸의 입력 형식을 검증하는 함수
export const validatePasswordConfirm = (
  password: string, 
  confirmPassword: string
): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: '비밀번호 확인을 입력해주세요.' });
  } else if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: '비밀번호가 일치하지 않습니다.' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 아이디 입력 형식을 검증하는 함수
export const validateUsername = (username: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!username.trim()) {
    errors.push({ field: 'username', message: '아이디를 입력해주세요.' });
  } else {
    if (username.length < 6 || username.length > 20) {
      errors.push({ field: 'username', message: '아이디는 6~20자 사이의 영문 소문자와 숫자만 사용 가능합니다.' });
    }
    
    // 영문 소문자와 숫자만 허용
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(username)) {
      errors.push({ 
        field: 'username', 
        message: '아이디는 영문 소문자와 숫자만 가능합니다.' 
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 이름 입력 형식을 검증하는 함수
export const validateRealName = (realName: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!realName.trim()) {
    errors.push({ field: 'realName', message: '실명을 입력해주세요.' });
  } else {
    if (realName.length < 2) {
      errors.push({ field: 'realName', message: '실명은 2자 이상이어야 합니다.' });
    }
    
    if (realName.length > 20) {
      errors.push({ field: 'realName', message: '실명은 20자 이하여야 합니다.' });
    }
    
    // 한글, 영문만 허용 (공백 포함)
    const nameRegex = /^[가-힣a-zA-Z\s]+$/;
    if (!nameRegex.test(realName)) {
      errors.push({ field: 'realName', message: '실명은 한글 또는 영문만 입력할 수 있습니다.' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 닉네임 검증
 * 
 * @param nickname 검증할 닉네임
 * @returns 유효성 검사 결과
 */
export const validateNickname = (nickname: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!nickname.trim()) {
    errors.push({ field: 'nickname', message: '닉네임을 입력해주세요.' });
  } else {
    if (nickname.length < 2 || nickname.length > 10) {
      errors.push({ field: 'nickname', message: '닉네임은 2~10자여야 합니다.' });
    }
    
    // 한글, 영문, 숫자만 허용
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!nicknameRegex.test(nickname)) {
      errors.push({ 
        field: 'nickname', 
        message: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.' 
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 전화번호 입력 형식을 검증하는 함수
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!phoneNumber.trim()) {
    errors.push({ field: 'phoneNumber', message: '휴대전화 번호를 입력해주세요.' });
  } else {
    // 하이픈 제거 후 검증
    const cleanPhone = phoneNumber.replace(/-/g, '');
    
    // 한국 휴대전화 번호 형식 (010, 011, 016, 017, 018, 019로 시작하는 11자리)
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push({ 
        field: 'phoneNumber', 
        message: '올바른 휴대전화 번호를 입력해주세요. (예: 010-1234-5678)' 
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 개별 태그 입력 형식을 검증하는 함수 (신규 행사 등록 페이지에서)
export const validateTag = (tag: string): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!tag.trim()) {
    errors.push({ field: 'tag', message: '빈 태그는 사용할 수 없습니다.' });
  } else if (tag.length > 20) {
    errors.push({ field: 'tag', message: '태그는 20자 이내로 작성해야 합니다.' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 선호 태그 선택 형식을 검증하는 함수 (회원가입에서)
export const validatePreferredTags = (
  tags: string[], 
  minCount: number = 3, 
  maxCount: number = 10
): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (tags.length < minCount) {
    errors.push({ 
      field: 'preferredTags', 
      message: `최소 ${minCount}개의 태그를 선택해주세요.` 
    });
  }
  
  if (tags.length > maxCount) {
    errors.push({ 
      field: 'preferredTags', 
      message: `최대 ${maxCount}개의 태그만 선택할 수 있습니다.` 
    });
  }
  
  // 각 태그의 길이 검증
  tags.forEach((tag) => {
    const tagValidation = validateTag(tag);
    errors.push(...tagValidation.errors);
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 전체 로그인 폼 입력 형식을 검증하는 함수
export const validateLoginForm = (
  username: string, 
  password: string
): ValidationResult => {
  const errors: FieldError[] = [];
  
  if (!username.trim()) {
    errors.push({ field: 'username', message: '아이디를 입력해주세요.' });
  }
  
  if (!password) {
    errors.push({ field: 'password', message: '비밀번호를 입력해주세요.' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 전체 회원가입 폼 입력 형식을 검증하는 함수
export const validateSignupForm = (formData: {
  realName: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const allErrors: FieldError[] = [];
  
  // 각 필드별 검증
  const realNameResult = validateRealName(formData.realName);
  const phoneResult = validatePhoneNumber(formData.phoneNumber);
  const emailResult = validateEmail(formData.email);
  const usernameResult = validateUsername(formData.username);
  const passwordResult = validatePassword(formData.password);
  const confirmPasswordResult = validatePasswordConfirm(formData.password, formData.confirmPassword);
  
  // 모든 에러 수집
  allErrors.push(
    ...realNameResult.errors,
    ...phoneResult.errors,
    ...emailResult.errors,
    ...usernameResult.errors,
    ...passwordResult.errors,
    ...confirmPasswordResult.errors
  );
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// 전체 프로필 수정 폼의 입력 형식을 검증하는 함수
export const validateProfileForm = (formData: {
  nickname: string;
  email: string;
  phone_number?: string;
}): ValidationResult => {
  const allErrors: FieldError[] = [];
  
  // 필수 필드 검증
  const nicknameResult = validateNickname(formData.nickname);
  const emailResult = validateEmail(formData.email);
  
  allErrors.push(...nicknameResult.errors, ...emailResult.errors);
  
  // 선택 필드 검증 (값이 있을 경우에만)
  if (formData.phone_number && formData.phone_number.trim()) {
    const phoneResult = validatePhoneNumber(formData.phone_number);
    allErrors.push(...phoneResult.errors);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// 전체 리뷰 폼 입력 형식을 검증하는 함수
export const validateReviewForm = (formData: {
  title: string;
  content: string;
  rating: number;
}): ValidationResult => {
  const errors: FieldError[] = [];
  
  // 제목 검증
  if (!formData.title.trim()) {
    errors.push({ field: 'title', message: '리뷰 제목을 입력해주세요.' });
  } else if (formData.title.length > 100) {
    errors.push({ field: 'title', message: '리뷰 제목은 100자 이하로 입력해주세요.' });
  }
  
  // 내용 검증
  if (!formData.content.trim()) {
    errors.push({ field: 'content', message: '리뷰 내용을 입력해주세요.' });
  } else if (formData.content.trim().length < 10) {
    errors.push({ field: 'content', message: '리뷰 내용은 최소 10자 이상 입력해주세요.' });
  } else if (formData.content.length > 1000) {
    errors.push({ field: 'content', message: '리뷰 내용은 1000자 이하로 입력해주세요.' });
  }
  
  // 평점 검증
  if (formData.rating < 1 || formData.rating > 5) {
    errors.push({ field: 'rating', message: '평점을 1~5 사이로 선택해주세요.' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 전체 행사 작성 폼 입력 형식을 검증하는 함수
export const validateEventForm = (formData: {
  title: string;
  summary?: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  phone: string;
  tags: string[];
  images?: File[];
  existingImages?: string[];
}): ValidationResult => {
  const errors: FieldError[] = [];
  
  // 제목 검증
  if (!formData.title.trim()) {
    errors.push({ field: 'title', message: '행사 제목을 입력해주세요.' });
  } else if (formData.title.length > 255) {
    errors.push({ field: 'title', message: '행사 제목은 255자 이하로 입력해주세요.' });
  }
  
  // 한 줄 소개 검증 (선택 사항)
  if (formData.summary && formData.summary.length > 500) {
    errors.push({ field: 'summary', message: '한 줄 소개는 500자 이하로 입력해주세요.' });
  }
  
  // 날짜 검증
  if (!formData.startDate) {
    errors.push({ field: 'startDate', message: '시작 날짜를 선택해주세요.' });
  }
  
  if (!formData.endDate) {
    errors.push({ field: 'endDate', message: '종료 날짜를 선택해주세요.' });
  }
  
  // 날짜 순서 검증
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (start > end) {
      errors.push({ field: 'endDate', message: '종료 날짜는 시작 날짜보다 늦어야 합니다.' });
    }
    
    // 과거 날짜 검증
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      errors.push({ field: 'startDate', message: '시작 날짜는 오늘 이후여야 합니다.' });
    }
  }
  
  // 장소 검증
  if (!formData.location.trim()) {
    errors.push({ field: 'location', message: '개최 주소를 입력해주세요.' });
  } else if (formData.location.length > 500) {
    errors.push({ field: 'location', message: '개최 주소는 500자 이하로 입력해주세요.' });
  }
  
  // 상세 설명 검증
  if (!formData.description.trim()) {
    errors.push({ field: 'description', message: '상세 설명을 입력해주세요.' });
  } else if (formData.description.trim().length < 20) {
    errors.push({ field: 'description', message: '상세 설명은 최소 20자 이상 입력해주세요.' });
  } else if (formData.description.length > 5000) {
    errors.push({ field: 'description', message: '상세 설명은 5000자 이하로 입력해주세요.' });
  }
  
  // 연락처 검증
  if (!formData.phone.trim()) {
    errors.push({ field: 'phone', message: '연락처(전화번호)를 입력해주세요.' });
  } else {
    // 전화번호 형식 검증 (하이픈 포함/미포함 모두 허용)
    const cleanPhone = formData.phone.replace(/-/g, '');
    const phoneRegex = /^0\d{1,2}\d{3,4}\d{4}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.push({ field: 'phone', message: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)' });
    }
  }
  
  // 태그 검증
  if (formData.tags.length === 0) {
    errors.push({ field: 'tags', message: '최소 1개의 태그를 선택해주세요.' });
  } else if (formData.tags.length > 10) {
    errors.push({ field: 'tags', message: '태그는 최대 10개까지 선택할 수 있습니다.' });
  }
  
  // 각 태그의 길이 검증
  formData.tags.forEach((tag) => {
    if (tag.length > 20) {
      errors.push({ 
        field: 'tags', 
        message: `태그는 20자 이내로 작성해야 합니다: "${tag}"` 
      });
    }
    if (tag.trim().length === 0) {
      errors.push({ 
        field: 'tags', 
        message: '빈 태그는 사용할 수 없습니다.' 
      });
    }
  });
  
  // 이미지 검증 (기존 이미지 + 새 이미지 합산)
  const existingImageCount = formData.existingImages?.length || 0;
  const newImageCount = formData.images?.length || 0;
  const totalImageCount = existingImageCount + newImageCount;
  
  if (totalImageCount > 5) {
    errors.push({ field: 'images', message: '이미지는 최대 5개까지 업로드할 수 있습니다.' });
  }
  
  // 최소 1개의 이미지 필요 (신규 작성 시)
  if (!formData.existingImages && totalImageCount === 0) {
    errors.push({ field: 'images', message: '최소 1개의 이미지를 업로드해주세요.' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};