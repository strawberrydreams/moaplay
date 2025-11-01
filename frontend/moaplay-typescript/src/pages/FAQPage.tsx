import React, { useState } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Pretendard', sans-serif;
  color: #333;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
`;

const AccordionItem = styled.div`
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const QuestionButton = styled.button<{ isOpen: boolean }>`
  all: unset;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  width: 100%;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  background: #ffffffff;

  &::after {
    content: '${props => (props.isOpen ? '−' : '+')}';
    font-size: 1.5rem;
    font-weight: bold;
    color: #888;
    transition: transform 0.3s;
  }
`;

const Answer = styled.div<{ isOpen: boolean }>`
  padding: ${props => (props.isOpen ? '16px 24px' : '0 24px')};
  font-size: 0.95rem;
  color: #555;
  max-height: ${props => (props.isOpen ? '500px' : '0')};
  opacity: ${props => (props.isOpen ? '1' : '0')};
  transform: ${props => (props.isOpen ? 'scaleY(1)' : 'scaleY(0.95)')};
  transform-origin: top;
  transition: all 0.3s ease;
`;

interface FAQ {
  question: string;
  answer: string;
}

const faqList: FAQ[] = [
  { question: '회원가입은 어떻게 하나요?', answer: '상단 메뉴에서 회원가입 버튼을 클릭하고 정보를 입력하면 가입이 완료됩니다.' },
  { question: '비밀번호를 잊어버렸어요.', answer: '로그인 화면의 비밀번호 찾기를 통해 이메일로 초기화 링크를 받을 수 있습니다.' },
  { question: '내 정보를 수정하고 싶어요.', answer: '마이페이지에서 닉네임, 이메일 등 정보를 수정할 수 있습니다.' },
  { question: '프로필 이미지를 바꾸려면 어떻게 하나요?', answer: '마이페이지 상단의 프로필 사진을 클릭하면 새 이미지를 업로드할 수 있습니다.' },
  { question: '리뷰는 어디서 작성하나요?', answer: '마이페이지에서 참여한 행사 항목에서 리뷰를 작성할 수 있습니다.' },
  { question: '찜한 행사는 어디서 볼 수 있나요?', answer: '마이페이지의 찜한 행사 탭에서 확인할 수 있습니다.' },
  { question: '선호 태그는 어디서 설정하나요?', answer: '회원가입 후 첫 방문 시 또는 마이페이지에서 수정 가능합니다.' },
  { question: '이미지가 보이지 않아요.', answer: '이미지 경로가 잘못되었거나, 서버에 이미지가 없을 수 있습니다. 새로고침해보세요.' },
  { question: '문의사항은 어디로?', answer: '사이트 하단의 메일로 문의 부탁드립니다.' },
  { question: '행사 주최자 신청은 어디로?', answer: '사이트 하단의 메일로 문의 부탁드립니다.' }
];

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <PageContainer>
      <Heading>자주 묻는 질문</Heading>
      {faqList.map((item, index) => (
        <AccordionItem key={index}>
          <QuestionButton
            onClick={() => toggleOpen(index)}
            isOpen={openIndex === index}
          >
            {item.question}
          </QuestionButton>
          <Answer isOpen={openIndex === index}>{item.answer}</Answer>
        </AccordionItem>
      ))}
    </PageContainer>
  );
};

export default FAQPage;
