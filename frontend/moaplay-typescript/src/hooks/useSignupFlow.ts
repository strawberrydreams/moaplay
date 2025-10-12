// frontend/hooks/useSignupFlow.ts
import { useState } from 'react';
import type { RegisterPayload } from '../service/authApi';

type Step = 'signup' | 'tags';

export function useSignupFlow() {
    const [isOpen, setOpen] = useState(false);
    const [step, setStep] = useState<Step>('signup');
    const [signupData, setSignupData] = useState<RegisterPayload | null>(null);

    const open = () => { setOpen(true); setStep('signup'); setSignupData(null); };
    const close = () => { setOpen(false); setStep('signup'); setSignupData(null); };

    const goTags = (data: RegisterPayload) => { setSignupData(data); setStep('tags'); };
    const backToSignup = () => setStep('signup');

    return { isOpen, open, close, step, signupData, goTags, backToSignup };
}