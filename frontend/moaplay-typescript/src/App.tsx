import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header'; // Header
import Footer from './components/common/Footer'; // Footer
import Modal from './components/common/Modal'; // 👈 Modal 임포트
import LoginForm from './components/auth/LoginForm'; // 👈 LoginForm 임포트
import SignupForm from './components/auth/SignupForm'; // 추후 회원가입 폼을 여기에 임포트
import EventDetailPage from './pages/events/EventDetailPage';
import SelectTagsForm from './components/auth/SelectTagsForm';
import MainPage from './pages/MainPage';
import FAQPage from './pages/FAQPage';
import MyProfilePage from './pages/users/MyProfilePage';
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import EventCreatePage from "./pages/events/EventCreatePage";
import { EventUpdatePage } from "./pages/events/EventUpdatePage";
import OtherProfilePage from './pages/users/OtherProfilePage';
import PopularEventsPage from './pages/PopularEventsPage';
import RegionalEventsPage from './pages/RegionEventsPage';
import RecommendedEventsPage from './pages/RecommendEventsPage';
import MyReviewsPage from './pages/more/MyReviewsPage';
import MyFavoritesPage from './pages/more/MyFavoritesPage';
import MyEventsPage from './pages/more/MyEventsPage';
import UserReviewsPage from './pages/more/OtherReviewsPage';

// 전역 스타일 임포트 (Header.styles.js에서 정의했다면)
import { GlobalStyle } from './styles/components/Header.styles';

// Modal 제어 커스텀 Hook
import { useModal } from './hooks/useModal';
import { AuthProvider } from './contexts/AuthContext';
import  { NotificationsProvider } from './contexts/NotificationsContext';

const App: React.FC = () => {
    const {
        isLoginModalOpen,
        isSignupModalOpen,
        isSelectTagsModalOpen,
        openLoginModal,
        closeAllModals,
        loginToSignUp,
        signUpToLogin,
        signUpToTags,
    } = useModal();

    return (
        <AuthProvider>
            <NotificationsProvider>
                <Router>
                    <GlobalStyle />
                    <Header onLoginClick={openLoginModal} />
                    <main style={{padding: '1rem', backgroundColor: '#f8f8f8' }}>
                        <Routes>
                            <Route path='/' element={<MainPage />} />
                            <Route path='/events/:eventId' element={<EventDetailPage/>} />
                            <Route path='/events/new' element={<EventCreatePage/>}/>
                            <Route path='/events/:eventId/edit' element={<EventUpdatePage/>}/>
                            <Route path='/popular' element={<PopularEventsPage/>}/>
                            <Route path='/region' element={<RegionalEventsPage/>}/>
                            <Route path='/recommend' element={<RecommendedEventsPage/>}/>
                            <Route path='/mypage' element={<MyProfilePage/>}/>
                            <Route path="/mypage/reviews" element={<MyReviewsPage />} />
                            <Route path="/mypage/favorites" element={<MyFavoritesPage />} />
                            <Route path="/mypage/events" element={<MyEventsPage />} />
                            <Route path='/users/:userId' element={<OtherProfilePage/>}/>
                            <Route path='/users/reviews/:userId' element={<UserReviewsPage/>}/>
                            <Route path='/admin/dashboard' element={<AdminDashboardPage/>}/>
                            <Route path="/faq" element={<FAQPage />} />
                        </Routes>
                    </main>

                    {/* 1. 로그인 모달 */}
                    <Modal
                        isOpen={isLoginModalOpen}
                        onClose={closeAllModals} // 닫기 함수 연결
                        title="로그인"
                    >
                        {/* 6. LoginForm의 onCloseModal prop 수정 */}
                        <LoginForm onSwitchToSignUp={loginToSignUp} onCloseModal={closeAllModals} />
                    </Modal>

                    {/* 2. 회원가입 모달 */}
                    <Modal
                        isOpen={isSignupModalOpen}
                        onClose={closeAllModals} // 닫기 함수 연결
                        title="회원가입"
                    >
                        <SignupForm onSwitchToLogin={signUpToLogin} onGoTags={signUpToTags} />
                    </Modal>

                    {/* 3. 선호태그 모달 */}
                    <Modal
                        isOpen={isSelectTagsModalOpen}
                        onClose={closeAllModals} // 닫기 함수 연결
                        title=""
                    >
                        <SelectTagsForm onCloseModal={closeAllModals}/>
                    </Modal>

                    <Footer />
                </Router>
            </NotificationsProvider>
        </AuthProvider>
    );
}

export default App;
