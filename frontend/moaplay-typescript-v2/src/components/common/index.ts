/**
 * 공통 컴포넌트 내보내기
 * 
 * 공통으로 사용되는 컴포넌트들을 한 곳에서 내보내어
 * 다른 파일에서 쉽게 import할 수 있도록 합니다.
 */

export { Header } from './Header';
export { Footer } from './Footer';
export { Loading } from './Loading';
export { ErrorBoundary } from './ErrorBoundary';
export { PrivateRoute } from './PrivateRoute';
export { AdminRoute } from './AdminRoute';
export { FormInput } from './FormInput';
export { Button } from './Button';
export { SearchBar } from './SearchBar';
export { FavoriteButton } from './FavoriteButton';
export { FloatingActionButton } from './FloatingActionButton';
export { Pagination } from './Pagination';
export { ImageCarousel } from './ImageCarousel';
export { ProfilePopup } from './ProfilePopup';
export { VerifiedBadge } from './VerifiedBadge';

// 파일 업로드 컴포넌트들
export { ImageUploader } from './ImageUploader';
export { DocumentUploader } from './DocumentUploader';

// 이미지 모달
export { ImageModal } from './ImageModal';