import { createContext, useContext, useState, ReactNode } from 'react';
import { Employee } from '../lib/supabase';

type AuthContextType = {
  employee: Employee | null;
  login: (employee: Employee) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isCreator: () => boolean;
  isViewer: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);

  const login = (emp: Employee) => {
    setEmployee(emp);
    localStorage.setItem('employee', JSON.stringify(emp));
  };

  const logout = () => {
    setEmployee(null);
    localStorage.removeItem('employee');
  };

  const isAdmin = () => employee?.role === 'admin';
  const isCreator = () => employee?.role === 'creator';
  const isViewer = () => employee?.role === 'viewer';

  return (
    <AuthContext.Provider value={{ employee, login, logout, isAdmin, isCreator, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
