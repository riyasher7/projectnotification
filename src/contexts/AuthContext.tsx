import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';

/* ===================== TYPES ===================== */

// Matches `users` table
export type AuthUser = {
  user_id: string;
  email: string;
  name?: string;
  role_id: number; // 1=Admin, 2=Creator, 3=Viewer, 4=User
};

type AuthContextType = {
  user: AuthUser | null;

  login: (user: AuthUser) => void;
  logout: () => void;

  isAdmin: boolean;
  isCreator: boolean;
  isViewer: boolean;
  isNormalUser: boolean;
};

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  /* ---------- Restore session ---------- */
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* ---------- Login ---------- */
  const login = (usr: AuthUser) => {
    setUser(usr);
    localStorage.setItem('auth_user', JSON.stringify(usr));
  };

  /* ---------- Logout ---------- */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  /* ---------- Role helpers ---------- */
  const isAdmin = user?.role_id === 1;
  const isCreator = user?.role_id === 2;
  const isViewer = user?.role_id === 3;
  const isNormalUser = user?.role_id === 4;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isCreator,
        isViewer,
        isNormalUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ===================== HOOK ===================== */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

