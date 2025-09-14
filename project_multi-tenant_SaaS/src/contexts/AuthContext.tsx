import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { loginUser, registerUser, getCurrentUser, logoutUser as logout } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const currentAuth = getCurrentUser();
    if (currentAuth) {
      setUser(currentAuth.user);
      setToken(currentAuth.token);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginUser(email, password);
      if (result) {
        setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        });
        setToken(result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const result = await registerUser(name, email, password);
      if (result) {
        setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name
        });
        setToken(result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout: logoutUser,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};