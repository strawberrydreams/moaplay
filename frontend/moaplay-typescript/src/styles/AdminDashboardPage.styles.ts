import styled from "styled-components";

export const PageContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
`;

export const MainContent = styled.main`
    flex: 1;
    width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 32px 20px;

    @media (max-width: 768px) {
        width: 100%;
        padding: 16px 12px;
    }
`;

export const DashboardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
`;

export const DashboardTitle = styled.h1`
    margin: 0;
    color: #111827;
    font-size: 30px;
    font-weight: 700;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

export const RefreshButton = styled.button`
    padding: 12px 16px;
    background-color: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.15s ease-in-out;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);

    &:hover {
        background-color: #1e40af;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    }

    &:active {
        transform: translateY(0);
    }
`;

export const StatsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 24px 0;
`;

export const StatItem = styled.div`
    background: #ffffff;
    width: 100%;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 88px; /* 가로로 긴 카드 느낌 */
    transition: box-shadow 0.15s ease-in-out, transform 0.15s ease-in-out;

    &:hover { box-shadow: 0 12px 28px rgba(0,0,0,0.12); transform: translateY(-2px); }
    &:active { transform: translateY(0); }
`;

export const StatTitle = styled.div`
    color: #6b7280;
    font-size: 15px;
    letter-spacing: 0.3px;
`;

export const StatValue = styled.div`
    color: #111827;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.1;
`;
export const ErrorMessage = styled.div`
    text-align: center;
    padding: 48px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);

    h2 {
        color: #dc2626;
        margin-bottom: 16px;
        font-size: 24px;
    }

    p {
        color: #6b7280;
        margin-bottom: 20px;
        font-size: 16px;
    }
`;

export const RetryButton = styled.button`
    padding: 12px 20px;
    background-color: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.15s ease-in-out;

    &:hover {
        background-color: #1e40af;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    }

    &:active {
        transform: translateY(0);
    }
`;