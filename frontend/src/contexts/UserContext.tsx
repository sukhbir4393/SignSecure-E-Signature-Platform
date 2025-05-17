import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import api from '../config/api';
import { AuthResponse, UserResponse } from '../types/api';

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth-token/', {
        username: email,
        password: password,
      });

      const { token } = response.data;
      
      // Get user details
      const userResponse = await api.get<UserResponse>('/users/me/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const user: User = {
        id: userResponse.data.id || '',
        email: userResponse.data.email || '',
        name: userResponse.data.name || '',
        role: (userResponse.data.role as 'user' | 'admin') || 'user',
        createdAt: userResponse.data.created_at || new Date().toISOString(),
      };

      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<UserResponse>('/users/', {
        name,
        email,
        password,
      });

      const user: User = {
        id: response.data.id || '',
        email: response.data.email || '',
        name: response.data.name || '',
        role: (response.data.role as 'user' | 'admin') || 'user',
        createdAt: response.data.created_at || new Date().toISOString(),
      };

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};