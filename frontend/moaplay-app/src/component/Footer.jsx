import React from 'react';
// 스타일 파일 임포트 경로 확인 (Header와 동일하게 두 단계 상위 폴더로 이동)
import {
    StyledFooter,
    FooterContent,
    FooterSection,
    FooterTitle,
    FooterList,
    FooterBottom
} from '../styles/Footer.styles.js'; 

function Footer() {
    return (
        <StyledFooter>
            <FooterContent>
                {/* 1. 서비스 정보 */}
                <FooterSection>
                    <FooterTitle>MOAPLAY</FooterTitle>
                    <p>지역 이벤트 정보 플랫폼</p>
                    <p>대표: 홍길동</p>
                </FooterSection>

                {/* 2. 빠른 연결 */}
                <FooterSection>
                    <FooterTitle>바로가기</FooterTitle>
                    <FooterList>
                        <li><a href="/faq">자주 묻는 질문</a></li>
                        <li><a href="/contact">문의</a></li>
                        <li><a href="/sitemap">사이트맵</a></li>
                    </FooterList>
                </FooterSection>

                {/* 3. 법적 고지 */}
                <FooterSection>
                    <FooterTitle>법적 고지</FooterTitle>
                    <FooterList>
                        <li><a href="/terms">이용약관</a></li>
                        <li><a href="/privacy">개인정보처리방침</a></li>
                        <li><a href="/policy">운영 정책</a></li>
                    </FooterList>
                </FooterSection>
            </FooterContent>

            <FooterBottom>
                <p>사업자등록번호: 123-45-67890</p>
                <p>통신판매업신고: 제2025-서울강남-0000호</p>
                <p>&copy; {new Date().getFullYear()} Moaplay App. All rights reserved.</p>
            </FooterBottom>
        </StyledFooter>
    );
}

export default Footer;
