/**
 * 에러 바운더리 컴포넌트
 * 
 * React 애플리케이션에서 발생하는 JavaScript 에러를 포착하고
 * 사용자에게 친화적인 에러 메시지를 표시합니다.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

/**
 * 에러 바운더리 Props 타입
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 에러 바운더리 State 타입
 */
interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * 에러 바운더리 컴포넌트
 * 
 * 하위 컴포넌트에서 발생하는 에러를 포착하여 애플리케이션이 크래시되는 것을 방지합니다.
 * 개발 환경에서는 상세한 에러 정보를, 프로덕션에서는 간단한 에러 메시지를 표시합니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * 에러가 발생했을 때 state를 업데이트합니다.
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 에러 정보를 로깅하고 에러 리포팅 서비스에 전송합니다.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // 프로덕션 환경에서는 에러 리포팅 서비스에 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: 에러 리포팅 서비스 연동 (예: Sentry)
      // reportError(error, errorInfo);
    }
  }

  /**
   * 페이지를 새로고침하여 에러 상태를 초기화합니다.
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * 에러 상태를 초기화하고 다시 시도합니다.
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI 렌더링
      return (
        <ErrorContainer>
          <ErrorContent>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>문제가 발생했습니다</ErrorTitle>
            <ErrorMessage>
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </ErrorMessage>
            
            <ButtonGroup>
              <RetryButton onClick={this.handleRetry}>
                다시 시도
              </RetryButton>
              <ReloadButton onClick={this.handleReload}>
                페이지 새로고침
              </ReloadButton>
            </ButtonGroup>

            {/* 개발 환경에서만 상세 에러 정보 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <DetailsTitle>개발자 정보:</DetailsTitle>
                <ErrorStack>
                  <strong>Error:</strong> {this.state.error.message}
                </ErrorStack>
                {this.state.errorInfo && (
                  <ErrorStack>
                    <strong>Component Stack:</strong>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </ErrorStack>
                )}
              </ErrorDetails>
            )}
          </ErrorContent>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// 스타일 컴포넌트들 - theme 접근 시 안전한 fallback 제공
const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  background-color: ${({ theme }) => theme?.colors?.backgroundLight || '#f8f9fa'};
`;

const ErrorContent = styled.div`
  max-width: 500px;
  text-align: center;
  background: white;
  padding: ${({ theme }) => theme?.spacing?.['2xl'] || '3rem'};
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '0.5rem'};
  box-shadow: ${({ theme }) => theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const ErrorTitle = styled.h1`
  color: ${({ theme }) => theme?.colors?.danger || '#dc3545'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
  font-size: ${({ theme }) => theme?.fonts?.size?.['2xl'] || '1.5rem'};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme?.colors?.textSecondary || '#6c757d'};
  margin-bottom: ${({ theme }) => theme?.spacing?.xl || '2rem'};
  line-height: ${({ theme }) => theme?.fonts?.lineHeight?.relaxed || 1.75};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const Button = styled.button`
  padding: ${({ theme }) => `${theme?.spacing?.sm || '0.5rem'} ${theme?.spacing?.lg || '1.5rem'}`};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '0.375rem'};
  font-weight: ${({ theme }) => theme?.fonts?.weight?.medium || 500};
  transition: all ${({ theme }) => theme?.transitions?.fast || '0.15s ease-in-out'};
  cursor: pointer;
`;

const RetryButton = styled(Button)`
  background-color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
  color: white;
  border: none;

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.primaryHover || '#0056b3'};
  }
`;

const ReloadButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#6c757d'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#dee2e6'};

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.backgroundLight || '#f8f9fa'};
  }
`;

const ErrorDetails = styled.div`
  text-align: left;
  background-color: ${({ theme }) => theme?.colors?.backgroundLight || '#f8f9fa'};
  padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '0.375rem'};
  margin-top: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const DetailsTitle = styled.h3`
  color: ${({ theme }) => theme?.colors?.textPrimary || '#212529'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  font-size: ${({ theme }) => theme?.fonts?.size?.md || '1rem'};
`;

const ErrorStack = styled.div`
  font-family: ${({ theme }) => theme?.fonts?.mono || "'Fira Code', 'Monaco', monospace"};
  font-size: ${({ theme }) => theme?.fonts?.size?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.textSecondary || '#6c757d'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  
  pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
`;