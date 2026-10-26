import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; dailyBudget?: number; weeklyBudget?: number; university?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nutribudget_token'));
  const [loading, setLoading] = useState(true);

  // Helper for auth headers
  const getHeaders = (currToken?: string | null) => {
    const t = currToken || token || localStorage.getItem('nutribudget_token');
    return {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // If no user session found, attempt demo login automatically so the app is immediately alive and testable!
        await demoLoginSilently();
      }
    } catch (err) {
      console.warn('Auth check error, falling back to demo login:', err);
      await demoLoginSilently();
    } finally {
      setLoading(false);
    }
  };

  const demoLoginSilently = async () => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('nutribudget_token', data.token);
      }
    } catch (e) {
      console.error('Silent demo login failed:', e);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nutribudget_token', data.token);
  };

  const register = async (userData: { name: string; email: string; password: string; dailyBudget?: number; weeklyBudget?: number; university?: string }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nutribudget_token', data.token);
  };

  const demoLogin = async () => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Demo login failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nutribudget_token', data.token);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (e) {
      console.error('Logout request error:', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('nutribudget_token');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    setUser(data.user);
  };

  const resetDemoData = async () => {
    const res = await fetch('/api/auth/reset-demo', {
      method: 'POST',
      headers: getHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset demo data');
    }

    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
