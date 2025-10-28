/*
 * 애플리케이션 라우팅 설정
 * React Router로 모든 페이지 라우팅 정의
 * 인증 상태와 사용자 역할에 따라 페이지별 접근 제어
 * 성능 최적화를 위한 레이지 라우팅 적용
 */

import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LazyRoute } from './components/common/LazyRoute';
import { PrivateRoute } from './components/common';
import { AdminRoute } from './components/common';

// 메인 페이지는 즉시 로드 (첫 화면이므로)
import { HomePage } from './pages/HomePage';

// 나머지 페이지들은 지연 로딩 적용
// export 부분에서 이름 붙여서 내보낸 페이지
const MyFavoritesPage = lazy(() => import('./pages/MyFavoritesPage').then(module => ({ default: module.MyFavoritesPage })));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage').then(module => ({ default: module.SearchResultsPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage').then(module => ({ default: module.ForbiddenPage })));

// export 부분에서 이름 안 붙이고 그냥 내보낸 페이지
const RegionPage = lazy(() => import('./pages/RegionPage'));
const RecommendPage = lazy(() => import('./pages/RecommendPage'));
const PopularPage = lazy(() => import('./pages/PopularPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventCreatePage = lazy(() => import('./pages/EventCreatePage'));
const EventEditPage = lazy(() => import('./pages/EventEditPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const HostAuthPage = lazy(() => import('./pages/HostAuthPage'));
const MyReviewsPage = lazy(() => import('./pages/MyReviewsPage'));
const UserReviewsPage = lazy(() => import('./pages/UserReviewsPage'));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 홈페이지는 LazyRoute 적용 안 함 */}
      <Route path="/" element={<HomePage />} />
      
      {/* 로그인/회원가입은 모달로 표시되므로 홈페이지로 리다이렉트 */}
      <Route path="/login" element={<Navigate to="/" replace state={{ showLoginModal: true }} />} />
      <Route path="/signup" element={<Navigate to="/" replace state={{ showSignupModal: true }} />} />

      {/* 지역별 행사 페이지 (지역 필터) */}
      <Route 
        path="/region" 
        element={
          <LazyRoute>
            <RegionPage />
          </LazyRoute>
        } 
      />
      {/* 추천 행사 페이지 (해시태그 매칭) */}
      <Route 
        path="/recommend" 
        element={
          <LazyRoute>
            <RecommendPage />
          </LazyRoute>
        } 
      />
      {/* 인기 행사 페이지 (조회수) */}
      <Route 
        path="/popular" 
        element={
          <LazyRoute>
            <PopularPage />
          </LazyRoute>
        } 
      />
      {/* /events 라우트에 해당하는 페이지는 구현이 안 되어 있기 때문에 홈으로 리다이렉트 */}
      <Route path="/events" element={<Navigate to="/" replace />} />
      {/* 행사 상세 페이지 */}
      <Route 
        path="/events/:id" 
        element={
          <LazyRoute>
            <EventDetailPage />
          </LazyRoute>
        } 
      />
      {/* 검색 페이지 (Search API 없어서 작동 안 함) */}
      <Route 
        path="/search" 
        element={
          <LazyRoute>
            <SearchResultsPage />
          </LazyRoute>
        } 
      />
      {/* 다른 사용자 프로필 페이지 */}
      <Route 
        path="/users/:userId/profile" 
        element={
          <LazyRoute>
            <UserProfilePage />
          </LazyRoute>
        } 
      />
      {/* 다른 사용자 리뷰 더보기 페이지 */}
      <Route 
        path="/users/:userId/activities/reviews" 
        element={
          <LazyRoute>
            <UserReviewsPage />
          </LazyRoute>
        } 
      />
      
      {/* 403 Forbidden 페이지 */}
      <Route 
        path="/forbidden" 
        element={
          <LazyRoute>
            <ForbiddenPage />
          </LazyRoute>
        } 
      />
      
      {/* 인증이 필요한 페이지들은 PrivateRoute와 AdminRoute를 사용하여 지연 로딩 적용 */}
      {/* 신규 행사 게시물 등록 페이지 */}
      <Route
        path="/events/new"
        element={
          <PrivateRoute requiredRole="host">
            <LazyRoute>
              <EventCreatePage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 행사 게시물 수정 페이지 */}
      <Route
        path="/events/:id/edit"
        element={
          <PrivateRoute requiredRole="host">
            <LazyRoute>
              <EventEditPage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 내 프로필 페이지 (마이페이지) */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <LazyRoute>
              <MyProfilePage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 내 프로필 정보 수정 페이지 */}
      <Route
        path="/profile/edit"
        element={
          <PrivateRoute>
            <LazyRoute>
              <ProfileEditPage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 사용자 정보 수정 페이지 (관리자 전용) */}
      <Route
        path="/users/:userId/edit"
        element={
          <PrivateRoute requiredRole="admin">
            <LazyRoute>
              <ProfileEditPage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 행사 주최자 별도 인증 페이지 (현재는 사용 안 함) */}
      <Route
        path="/host-auth"
        element={
          <PrivateRoute>
            <LazyRoute>
              <HostAuthPage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 마이페이지 -> 내 찜 목록 더보기 페이지 */}
      <Route
        path="/activities/favorites"
        element={
          <PrivateRoute>
            <LazyRoute>
              <MyFavoritesPage />
            </LazyRoute>
          </PrivateRoute>
        }
      />
      {/* 마이페이지 -> 내 리뷰 목록 더보기 페이지 */}
      <Route
        path="/activities/reviews"
        element={
          <PrivateRoute>
            <LazyRoute>
              <MyReviewsPage />
            </LazyRoute>
          </PrivateRoute>
        }
      />

      {/* 관리자 대시보드 페이지 (관리자 전용) */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <LazyRoute>
              <AdminDashboardPage />
            </LazyRoute>
          </AdminRoute>
        }
      />
      
      {/* 404 페이지 (홈으로 리다이렉트) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};