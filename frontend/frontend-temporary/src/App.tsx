import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import EventDetail from './pages/events/EventDetail';
import { GlobalStyle } from './styles/Header.styles';

const App: React.FC = () => {
    return (
        <Router>
            <GlobalStyle />
            <Header />
            <main style={{ padding: '20px 40px', backgroundColor: '#f8f8f8', minHeight: 'calc(100vh - 100px)' }}>
                <Routes>
                    <Route path="/" element={<div>홈 페이지 내용 (이벤트 캘린더 & 목록)</div>} />
                    <Route path="/region" element={<div>지역별 이벤트</div>} />
                    <Route path="/recommend" element={<div>추천 이벤트</div>} />
                    <Route path="/popular" element={<div>인기 이벤트</div>} />
                    {/* 다른 페이지 라우트들 */}
                    <Route path="*" element={<div>404 페이지 - 존재하지 않는 페이지입니다.</div>} />
                    {/* 이벤트 상세 페이지 라우트 추가 */}
                    <Route path="/events/:id" element={<EventDetail />} />
                </Routes>
            </main>
            <Footer />
        </Router>
    );
};

export default App;
