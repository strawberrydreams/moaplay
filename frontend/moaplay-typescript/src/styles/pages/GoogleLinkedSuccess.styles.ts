// GoogleLinkedSuccess.styles.ts
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Container = styled.div`
  max-width: 480px;
  margin: 120px auto;
  padding: 40px 32px;

  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.08);

  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  font-family: "Noto Sans KR", sans-serif;
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

export const Message = styled.p`
  font-size: 1rem;
  color: #666;
  margin-top: 6px;
`;
