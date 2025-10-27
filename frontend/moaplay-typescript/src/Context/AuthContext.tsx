import { createContext, useContext, useState, useEffect, type ReactNode, type SetStateAction,  } from "react";


interface AuthContextType {
  currentUser: any; // 실제 사용자 타입으로 바꾸는 것이 좋습니다 (예: User | null)
  login: (userData: any) => void; // userData 타입도 구체화
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  // 3. 컨텍스트 값이 undefined일 경우 에러 처리 (Provider 외부 사용 방지)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null); // currentUser 타입 구체화 권장

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try { // JSON.parse 오류 방지
        const userData = JSON.parse(storedUserData);
        setCurrentUser(userData);
        console.log('AuthProvider: 초기화 시 setCurrentUser 호출됨, user:', userData);
      } catch (error) {
        console.error("localStorage 사용자 데이터 파싱 오류:", error);
        localStorage.removeItem('user'); // 잘못된 데이터 제거
      }
    }
  }, []);

  // 4. login 함수의 userData 타입 수정
  const login = (userData: any) => { // SetStateAction<null> 대신 실제 데이터 타입 사용
    try { // JSON.stringify 오류 방지
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      // console.log('AuthProvider: setCurrentUser 호출됨, 새 user:', userData);
    } catch (error) {
      console.error("localStorage 사용자 데이터 저장 오류:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value: AuthContextType = { currentUser, login, logout }; // value 타입 명시

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};