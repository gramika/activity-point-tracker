import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem('userInfo');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);
  
  const login = (data) => {
    setUserInfo(data);
  };
  
  const logout = () => {
    setUserInfo(null);
  };
  
  return (
    <AuthContext.Provider value={{ userInfo, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};