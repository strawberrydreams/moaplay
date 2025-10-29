import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Header 컴포넌트 경로 확인!
import Modal from './components/common/Modal'; // 👈 Modal 임포트
import LoginForm from './components/auth/LoginForm'; // 👈 LoginForm 임포트
import SignupForm from './components/auth/SignupForm'; // 추후 회원가입 폼을 여기에 임포트
import EventDetail from './pages/events/EventDetail'; 
import SelectTagsForm from './components/auth/SelectTagsForm';
import MainPage from './pages/MainPage';
// import Footer from './components/layout/Footer'; // Footer도 필요하다면

// 전역 스타일 임포트 (Header.styles.js에서 정의했다면)
import { GlobalStyle } from './styles/Header.styles';
import Footer from './components/Footer';

// Modal 제어 커스텀 Hook
import { useModal } from './hooks/useModal';
import { AuthProvider } from './context/AuthContext';
import PopularEventsPage from './pages/PopularEventsPage';
import RegionalEventsPage from './pages/RegionPage';
import RecommendedEventsPage from './pages/RecommendPage';
import MyPage from './pages/Mypage';


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
        <Router>
            <GlobalStyle /> 
            <Header onLoginClick={openLoginModal} />
            <main style={{backgroundColor: '#f8f8f8' }}>
                <Routes>
                    <Route path="/" element={<MainPage />} /> 
                    <Route path="/events/:eventId" element={<EventDetail/>} />
                    <Route path='/popular' element={<PopularEventsPage/>}/>
                    <Route path='/region' element={<RegionalEventsPage/>}/>
                    <Route path='/recommend' element={<RecommendedEventsPage/>}/>
                    <Route path='/mypage' element={<MyPage/>}/>
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
                title="선호태그 선택"
            >
                <SelectTagsForm onCloseModal={closeAllModals}/>
            </Modal>

            <Footer />
        </Router>
        </AuthProvider>
    );
}

export default App;
