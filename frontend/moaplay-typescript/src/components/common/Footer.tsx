import React from 'react';
import {
    StyledFooter,
    FooterContent,
    FooterSection,
    FooterTitle,
    FooterList,
    FooterBottom,
} from '../../styles/components/Footer.styles.ts';

const Footer: React.FC = () => {
    return (
        <StyledFooter>
            <FooterContent>
                {/* 1. 서비스 정보 */}
                <FooterSection>
                    <FooterTitle>MOAPLAY</FooterTitle>
                    <p>지역 이벤트 정보 플랫폼</p>
                    <p>대표: 홍길동</p>
                    <p>문의: Moaplay@gamil.com</p>
                </FooterSection>

                {/* 2. 빠른 연결 */}
                <FooterSection>
                    <FooterTitle>바로가기</FooterTitle>
                    <FooterList>
                        <li><a href="/faq">자주 묻는 질문</a></li>
                        {/* href="/sitemap" */}
                        <li><a>사이트맵</a></li>
                    </FooterList>
                </FooterSection>

                {/* 3. 법적 고지 */}
                <FooterSection>
                    <FooterTitle>법적 고지</FooterTitle>
                    <FooterList>
                        {/* href="/terms" */}
                        <li><a>이용약관</a></li>
                        {/* href="/privacy" */}
                        <li><a>개인정보처리방침</a></li>
                        {/* href="/policy" */}
                        <li><a>운영 정책</a></li>
                    </FooterList>
                </FooterSection>
            </FooterContent>

            <FooterBottom>
                <p>&copy; {new Date().getFullYear()} Moaplay App. All rights reserved.</p>
            </FooterBottom>
        </StyledFooter>
    );
};

export default Footer;
