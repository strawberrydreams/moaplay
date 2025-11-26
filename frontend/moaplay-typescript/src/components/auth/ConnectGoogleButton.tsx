import React from "react";

const ConnectGoogleButton: React.FC = () => {
  const handleConnectGoogle = () => {
    // Vite에서 쓰는 API base URL 이용
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    window.location.href = `${base}/google/auth`;
  };

  return (
    <button onClick={handleConnectGoogle}>
      구글 캘린더 연동하기
    </button>
  );
};

export default ConnectGoogleButton;