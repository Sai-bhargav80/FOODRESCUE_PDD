'use client';

import { useState, useCallback } from 'react';

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  badges: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    // This will be called after successful API login
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }, []);

  return { user, isLoggedIn, login, logout, setUser };
};
