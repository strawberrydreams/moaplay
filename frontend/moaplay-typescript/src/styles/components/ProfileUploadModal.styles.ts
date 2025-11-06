// src/styles/ProfileUploadModal.styles.ts

import styled from 'styled-components';
import { FaCamera } from 'react-icons/fa';


export const Container = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 24px 0px;
  background: #ffffff;
  border-radius: 12px;
  text-align: center;
  font-family: 'Pretendard', sans-serif;
  color: #333;
`;

export const UploadIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); // 어두운 반투명 배경
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const PreviewCircle = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #f4f4f4;
  overflow: hidden;
  cursor: pointer;

  &:hover ${UploadIcon} {
    opacity: 1;
    visibility: visible;
  }
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const HiddenInput = styled.input.attrs({ type: 'file' })`
  display: none;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

export const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 0.95rem;
  border: 1px solid #ccc;
  background: #fff;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #f9f9f9;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const UploadButton = styled.button`
  padding: 10px 20px;
  font-size: 0.95rem;
  border: none;
  background: #7a5af8;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  &:hover {
    background: #6650d4;
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
`;
