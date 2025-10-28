// frontend/hooks/useSignupFlow.ts
import { useState } from 'react';
import type { RegisterPayload } from '../service/userApi';

type Step = 'signup' | 'tags';

export function useModal() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false); 
    const [isSelectTagsModalOpen, setisSelectTagsModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewDetailModalOpen, setReviewDetailModalOpen] = useState(false);

    // 2. 함수 이름을 컨텍스트와 맞추면 더 좋습니다 (옵션)
    const openLoginModal = () => setIsLoginModalOpen(true);
    const openSignupModal = () => setIsSignupModalOpen(true);
    const openSelectTagsModal = () => setisSelectTagsModalOpen(true);
    const openReviewModal = () => setIsReviewModalOpen(true);
    const openReviewDetailModal = () => setReviewDetailModalOpen (true);

    const closeReviewModal = () => setIsReviewModalOpen(false);
    const closeReviewDetailModal = () => setReviewDetailModalOpen(false);

    const closeAllModals = () => {
        setIsLoginModalOpen(false);
        setIsSignupModalOpen(false);
        setisSelectTagsModalOpen(false);
        setIsReviewModalOpen(false);
    };
    
    const loginToSignUp = () => {
        setIsLoginModalOpen(false);
        openSignupModal();
    };
    
    const signUpToLogin = () => {
        setIsSignupModalOpen(false);
        openLoginModal();
    };

    const signUpToTags = () => {
        setIsSignupModalOpen(false);
        openSelectTagsModal();
    }

    return { 
        setReviewDetailModalOpen,
        isLoginModalOpen,
        isSignupModalOpen,
        isSelectTagsModalOpen,
        isReviewModalOpen,
        isReviewDetailModalOpen,
        openLoginModal,
        openSignupModal,
        openSelectTagsModal,
        openReviewModal,
        openReviewDetailModal,
        closeAllModals,
        closeReviewModal,
        closeReviewDetailModal,
        loginToSignUp, 
        signUpToLogin, 
        signUpToTags,  };
}