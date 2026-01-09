import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Employee } from '../lib/supabase';

type User = {
  id: string;
  email?: string;
};

type AuthContextType = {
  employee: Employee | null;
  user: User | null;

  loginEmployee: (employee: Employee) => void;
  loginUser: (user: User) => void;

  logout: () => void;

  isAdmin: boolean;
  isCreator: boolean;
  isViewer: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [user, setUser] = useState<User | null>(null);

  /* -------------------- Restore session -------------------- */
  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    const storedUser = localStorage.getItem('user');

    if (storedEmployee) {
      setEmployee(JSON.parse(storedEmployee));
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* -------------------- Login -------------------- */
  const loginEmployee = (emp: Employee) => {
    setEmployee(emp);
    setUser(null);
    localStorage.setItem('employee', JSON.stringify(emp));
    localStorage.removeItem('user');
  };

  const loginUser = (usr: User) => {
    setUser(usr);
    setEmployee(null);
    localStorage.setItem('user', JSON.stringify(usr));
    localStorage.removeItem('employee');
  };

  /* -------------------- Logout -------------------- */
  const logout = () => {
    setEmployee(null);
    setUser(null);
    localStorage.removeItem('employee');
    localStorage.removeItem('user');
  };

  /* -------------------- Role helpers -------------------- */
  const isAdmin = employee?.role === 'admin';
  const isCreator = employee?.role === 'creator';
  const isViewer = employee?.role === 'viewer';

  return (
    <AuthContext.Provider
      value={{
        employee,
        user,
        loginEmployee,
        loginUser,
        logout,
        isAdmin,
        isCreator,
        isViewer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
