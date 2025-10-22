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

// 컨텍스트 임포트
import AuthModalContext from '../AuthModalContext';


const App: React.FC = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false); 
    const [isSelectTagsModalOpen, setisSelectTagsModalOpen] = useState(false);

    // 2. 함수 이름을 컨텍스트와 맞추면 더 좋습니다 (옵션)
    const openLoginModal = () => setIsLoginModalOpen(true);
    const openSignupModal = () => setIsSignupModalOpen(true);
    const openSelectTagsModal = () => setisSelectTagsModalOpen(true);

    const closeAllModals = () => {
        setIsLoginModalOpen(false);
        setIsSignupModalOpen(false);
        setisSelectTagsModalOpen(false);
    };
    
    const switchToSignUp = () => {
        setIsLoginModalOpen(false);
        openSignupModal();
    };
    
    const switchToLogin = () => {
        setIsSignupModalOpen(false);
        openLoginModal();
    };

    const switchToSelectTags = () => {
        setIsSignupModalOpen(false);
        openSelectTagsModal();
    }

    // 3. 컨텍스트에 담을 값(함수들)을 객체로 만듭니다.
    const modalContextValue = {
      openLoginModal,
      openSignupModal,
      openSelectTagsModal,
      closeAllModals,
      switchToLogin,
      switchToSignUp,
      switchToSelectTags
    };

    return (
      // 4. Router 안, <GlobalStyle> 뒤를 Provider로 감싸줍니다.
      <AuthModalContext.Provider value={modalContextValue}>
        <Router>
            <GlobalStyle /> 
            
            {/* Header는 이제 useAuthModal()을 사용할 수 있습니다. */}
            {/* <Header onLoginClick={openLoginModal} /> -> Header 내부에서 useAuthModal()로 변경 가능 */}
            <Header onLoginClick={openLoginModal} /> {/* 또는 기존 방식 유지 */}

            <main style={{ padding: '20px 40px', backgroundColor: '#f8f8f8' }}>
                <Routes>
                    {/* 5. MainPage는 이제 Context의 자식이 되었습니다. */}
                    <Route path="/" element={<MainPage />} /> 
                    <Route path="/events/:eventId" element={<EventDetail />} />
                    {/* ... (다른 라우트) ... */}
                </Routes>
            </main>

            {/* --- 모달 렌더링 (변경 없음) --- */}
            
            {/* 1. 로그인 모달 */}
            <Modal
                isOpen={isLoginModalOpen}
                onClose={closeAllModals} // 닫기 함수 연결
                title="로그인"
            >
                {/* 6. LoginForm의 onCloseModal prop 수정 */}
                <LoginForm onSwitchToSignUp={switchToSignUp} onCloseModal={closeAllModals} /> 
            </Modal>

            {/* 2. 회원가입 모달 */}
            <Modal
                isOpen={isSignupModalOpen}
                onClose={closeAllModals} // 닫기 함수 연결
                title="회원가입"
            >
                <SignupForm onSwitchToLogin={switchToLogin} onSwitchToSelectTags={switchToSelectTags} />
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
      </AuthModalContext.Provider>
    );
}

export default App;
