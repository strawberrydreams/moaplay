import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../styles/pages/GoogleLinkedSuccess.styles";

const GoogleLinkedSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <S.Container>
      <S.Title>구글 캘린더 연동이 완료되었습니다 🎉</S.Title>
      <S.Message>잠시 후 메인 페이지로 이동합니다...</S.Message>
    </S.Container>
  );
};

export default GoogleLinkedSuccess;
