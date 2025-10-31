// frontend/hooks/useSignupFlow.ts
import { useState } from 'react';

type Step = 'signup' | 'tags';

export function useModal() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false); 
    const [isSelectTagsModalOpen, setisSelectTagsModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewDetailModalOpen, setReviewDetailModalOpen] = useState(false);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

    // 2. 함수 이름을 컨텍스트와 맞추면 더 좋습니다 (옵션)
    const openLoginModal = () => setIsLoginModalOpen(true);
    const openSignupModal = () => setIsSignupModalOpen(true);
    const openSelectTagsModal = () => setisSelectTagsModalOpen(true);
    const openReviewModal = () => setIsReviewModalOpen(true);
    const openReviewDetailModal = () => setReviewDetailModalOpen (true);
    const openDeleteAccountModal = () => setIsDeleteAccountModalOpen(true);

    const closeReviewModal = () => setIsReviewModalOpen(false);
    const closeReviewDetailModal = () => setReviewDetailModalOpen(false);
    const closeDeleteAccountModal = () => setIsDeleteAccountModalOpen(false);

    const closeAllModals = () => {
        setIsLoginModalOpen(false);
        setIsSignupModalOpen(false);
        setisSelectTagsModalOpen(false);
        setIsReviewModalOpen(false);
        setIsDeleteAccountModalOpen(false);
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
        isDeleteAccountModalOpen,
        openLoginModal,
        openSignupModal,
        openSelectTagsModal,
        openReviewModal,
        openReviewDetailModal,
        openDeleteAccountModal,
        closeAllModals,
        closeReviewModal,
        closeReviewDetailModal,
        closeDeleteAccountModal,
        loginToSignUp, 
        signUpToLogin, 
        signUpToTags,  };
}