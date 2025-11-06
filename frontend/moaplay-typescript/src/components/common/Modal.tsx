import React from 'react';
import {
    ModalOverlay,
    ModalContent,
    CloseButton
} from '../../styles/components/Modal.styles'

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose} aria-label="Close modal">
                    &times;
                </CloseButton>
                {title.length > 0 ? (
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#333' }}>
                        {title}
                    </h3>
                ) : null} {/* 제목 없으면 h3 렌더링 안 함 (선택 사항) */}
                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

export default Modal;