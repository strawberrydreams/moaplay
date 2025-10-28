/**
 * 푸터 컴포넌트
 * 
 * 애플리케이션의 하단 푸터를 제공합니다.
 * 회사 정보, 링크, 저작권 정보 등을 포함합니다.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logoImage from '../../assets/logo.png';

/**
 * 푸터 컴포넌트 Props 타입
 */
interface FooterProps {
  className?: string;
}

/**
 * 푸터 컴포넌트
 * 
 * 사이트 정보, 고객지원 링크, 약관 및 정책 링크를 제공합니다.
 */
export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer className={className}>
      <FooterContent>
        <FooterMain>
          {/* 회사 정보 */}
          <CompanyInfo>
            <LogoLink to="/">
              <FooterLogo src={logoImage} alt="Moaplay" />
            </LogoLink>
            <CompanyDescription>
              행사 정보 커뮤니티 플랫폼
            </CompanyDescription>
            <CompanyDescription>
              다양한 행사를 쉽게 찾고, 일정을 관리하며, 
              신뢰할 수 있는 정보를 공유하세요.
            </CompanyDescription>
            <ContactEmail href="mailto:contact@moaplay.com">
              📧 contact@moaplay.com
            </ContactEmail>
          </CompanyInfo>

          {/* 링크 섹션들 */}
          <FooterLinks>
            {/* 고객지원 */}
            <LinkSection>
              <LinkSectionTitle>고객지원</LinkSectionTitle>
              <LinkList>
                <LinkItem>
                  <FooterLink to="/contact">1대1 문의</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/faq">자주 묻는 질문</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/help">도움말</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/notice">공지사항</FooterLink>
                </LinkItem>
              </LinkList>
            </LinkSection>

            {/* 서비스 */}
            <LinkSection>
              <LinkSectionTitle>서비스</LinkSectionTitle>
              <LinkList>
                <LinkItem>
                  <FooterLink to="/">홈</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/host-auth">주최자 인증</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/region">지역별 행사</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/popular">인기 행사</FooterLink>
                </LinkItem>
              </LinkList>
            </LinkSection>

            {/* 약관 및 정책 */}
            <LinkSection>
              <LinkSectionTitle>약관 및 정책</LinkSectionTitle>
              <LinkList>
                <LinkItem>
                  <FooterLink to="/terms">이용약관</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/privacy">개인정보처리방침</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/community-guidelines">커뮤니티 가이드라인</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/cookie-policy">쿠키 정책</FooterLink>
                </LinkItem>
              </LinkList>
            </LinkSection>

            {/* 회사 정보 */}
            <LinkSection>
              <LinkSectionTitle>회사</LinkSectionTitle>
              <LinkList>
                <LinkItem>
                  <FooterLink to="/about">회사 소개</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/careers">채용 정보</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/press">보도자료</FooterLink>
                </LinkItem>
                <LinkItem>
                  <FooterLink to="/blog">블로그</FooterLink>
                </LinkItem>
              </LinkList>
            </LinkSection>
          </FooterLinks>
        </FooterMain>

        {/* 소셜 미디어 링크 */}
        <SocialSection>
          <SocialTitle>팔로우하기</SocialTitle>
          <SocialLinks>
            <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              Facebook
            </SocialLink>
            <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              Twitter
            </SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </SocialLink>
            <SocialLink href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              YouTube
            </SocialLink>
          </SocialLinks>
        </SocialSection>

        {/* 구분선 */}
        <FooterDivider />

        {/* 저작권 정보 */}
        <Copyright>
          <CopyrightText>
            © {currentYear} Moaplay. All rights reserved.
          </CopyrightText>
          <CopyrightLinks>
            <CopyrightLink to="/sitemap">사이트맵</CopyrightLink>
            <CopyrightLink to="/accessibility">접근성</CopyrightLink>
          </CopyrightLinks>
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

// 스타일 컴포넌트들
const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.light};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  }
`;

const FooterMain = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${({ theme }) => theme.spacing['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LogoLink = styled(Link)`
  display: inline-block;
  text-decoration: none;
`;

const FooterLogo = styled.img`
  height: 40px;
  width: auto;
  object-fit: contain;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 0.8;
  }
`;

const CompanyDescription = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: ${({ theme }) => theme.fonts.lineHeight.relaxed};
  margin: 0;
`;

const ContactEmail = styled.a`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fonts.size.md};
  transition: color ${({ theme }) => theme.transitions.fast};
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LinkSectionTitle = styled.h4`
  color: ${({ theme }) => theme.colors.light};
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  margin: 0;
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LinkItem = styled.li``;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SocialSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SocialTitle = styled.h4`
  color: ${({ theme }) => theme.colors.light};
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SocialLink = styled.a`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDark};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`;

const Copyright = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    text-align: center;
  }
`;

const CopyrightText = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  margin: 0;
`;

const CopyrightLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CopyrightLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;