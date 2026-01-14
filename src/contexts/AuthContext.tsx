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
  token: string | null;

  login: (user: AuthUser, sessionToken: string) => void;
  logout: () => Promise<void>;

  isAdmin: boolean;
  isCreator: boolean;
  isViewer: boolean;
  isNormalUser: boolean;
  isAuthenticated: boolean;

  // Helper to get auth headers for API calls
  getAuthHeaders: () => HeadersInit;
};

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /* ---------- Restore session ---------- */
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('session_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  /* ---------- Login ---------- */
  const login = (usr: AuthUser, sessionToken: string) => {
    setUser(usr);
    setToken(sessionToken);
    localStorage.setItem('auth_user', JSON.stringify(usr));
    localStorage.setItem('session_token', sessionToken);
  };

  /* ---------- Logout ---------- */
  const logout = async () => {
    // Call backend logout endpoint
    if (token) {
      try {
        await fetch('http://localhost:8000/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    // Clear local state and storage
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('session_token');
  };

  /* ---------- Helper to get auth headers ---------- */
  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  /* ---------- Role helpers ---------- */
  const isAdmin = user?.role_id === 1;
  const isCreator = user?.role_id === 2;
  const isViewer = user?.role_id === 3;
  const isNormalUser = user?.role_id === 4;
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin,
        isCreator,
        isViewer,
        isNormalUser,
        isAuthenticated,
        getAuthHeaders
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