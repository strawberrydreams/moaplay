import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Header 컴포넌트 경로 확인!
import Modal from './components/common/Modal'; // 👈 Modal 임포트
import LoginForm from './components/auth/LoginForm'; // 👈 LoginForm 임포트
import SignupForm from './components/auth/SignupForm'; // 추후 회원가입 폼을 여기에 임포트
import EventDetail from './pages/events/EventDetail'; 
import SelectTagsForm from './components/auth/SelectTagsForm';
// import Footer from './components/layout/Footer'; // Footer도 필요하다면

// 전역 스타일 임포트 (Header.styles.js에서 정의했다면)
import { GlobalStyle } from './styles/Header.styles';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';


const App: React.FC = () => {
    // 🚀 모달 상태 관리
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    // 🚀 회원가입 모달 상태 추가
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false); 
    const [isSelectTagsModalOpen, setisSelectTagsModalOpen] = useState(false);

    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsLoginModalOpen(false);
    };

    const handleCloseSelectTagsModal = () => {
        setisSelectTagsModalOpen(false);
    };

    const handleCloseSignupModal = () => {
        setIsSignupModalOpen(false);
    };

    const handleSwitchToSelectTags = () => {
        setIsSignupModalOpen(false)
        setisSelectTagsModalOpen(true);
    }

    // 🚀 로그인 -> 회원가입 모달 전환 함수
    const handleSwitchToSignUp = () => {
        setIsLoginModalOpen(false); // 로그인 모달 닫기
        setIsSignupModalOpen(true); // 회원가입 모달 열기
    };
    
    // 🚀 회원가입 -> 로그인 모달 전환 함수 (옵션: 추후 필요 시)
    const handleSwitchToLogin = () => {
        setIsSignupModalOpen(false); 
        setIsLoginModalOpen(true);
    };
    

    return (
        <Router>
            <GlobalStyle /> 
            
            {/* Header에 모달 열기 함수를 prop으로 전달 */}
            <Header onLoginClick={handleLoginClick} />

            <main style={{ padding: '20px 40px', backgroundColor: '#f8f8f8' }}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/events/:eventId" element={<EventDetail />} />
                    <Route path="/region" element={<div>지역별 이벤트</div>} />
                    <Route path="/recommend" element={<div>추천 이벤트</div>} />
                    <Route path="/popular" element={<div>인기 이벤트</div>} />
                    {/* 다른 페이지 라우트들 */}
                </Routes>
            </main>

            {/* <Footer /> */}
            
            {/* 1. 로그인 모달 렌더링 */}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={handleCloseModal}
                title="로그인"
            >
                {/* 🚀 LoginForm에 전환 함수 prop 전달 */}
                <LoginForm onSwitchToSignUp={handleSwitchToSignUp} onCloseModal={function (): void {
                    throw new Error('Function not implemented.');
                } } /> 
            </Modal>

            {/* 2. 회원가입 모달 렌더링 (현재는 Placeholder) */}
            <Modal
                isOpen={isSignupModalOpen}
                onClose={handleCloseSignupModal}
                title="회원가입"
            >
                <SignupForm onSwitchToLogin={handleSwitchToLogin} onSwitchToSelectTags={handleSwitchToSelectTags} />
            </Modal>

            <Modal 
                isOpen={isSelectTagsModalOpen}
                onClose={handleCloseSelectTagsModal}
                title="선호태그 선택"

            >
                <SelectTagsForm onCloseModal={handleCloseSelectTagsModal}/>
            </Modal>

            <Footer />
        </Router>
    );
}

export default App;
