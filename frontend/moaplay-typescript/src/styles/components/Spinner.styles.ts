import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
  color: #666;
  font-family: 'Pretendard', sans-serif;

  .spinner {
    width: 45px;
    height: 45px;
    border: 4px solid #ddd;
    border-top-color: #7a5af8;
    border-radius: 50%;
    animation: ${spin} 0.9s linear infinite;
    margin-bottom: 16px;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #777;
  }

  @media (max-width: 480px) {
    .spinner {
      width: 35px;
      height: 35px;
      border-width: 3px;
    }
    p {
      font-size: 0.85rem;
    }
  }
`;
