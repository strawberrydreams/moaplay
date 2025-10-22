// src/context/AuthModalContext.tsx (새 파일)
import React, { createContext, useContext } from 'react';

// 1. 컨텍스트가 제공할 함수들의 타입(모양)을 정의합니다.
interface IAuthModalContext {
  openLoginModal: () => void;
  openSignupModal: () => void;
  openSelectTagsModal: () => void;
  closeAllModals: () => void;
  switchToLogin: () => void;
  switchToSignUp: () => void;
  switchToSelectTags: () => void;
}

// 2. 컨텍스트를 생성합니다. (초기값은 null)
const AuthModalContext = createContext<IAuthModalContext | null>(null);

// 3. 다른 컴포넌트에서 쉽게 사용할 수 있도록 커스텀 훅(hook)을 만듭니다.
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal은 AuthModalProvider 안에서 사용해야 합니다.');
  }
  return context;
};

// 4. 컨텍스트 Provider를 export 합니다. (App.tsx에서 사용)
export default AuthModalContext;