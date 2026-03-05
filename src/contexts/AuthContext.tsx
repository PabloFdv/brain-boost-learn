import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  role: "admin" | "user" | null;
  name: string | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: "admin" | "user", name: string, token: string) => void;
  logout: () => void;
  adminKey: string | null;
  setAdminKey: (key: string | null) => void;
}

const STORAGE_KEY = "epistemologia_auth";
const ADMIN_KEY_STORAGE = "epistemologia_admin_key";
const USER_KEY_STORAGE = "epistemologia_user_key";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { isAuthenticated: false, role: null, name: null, token: null };
  });

  const [adminKey, setAdminKey] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_KEY_STORAGE);
  });

  // Persist auth to localStorage
  useEffect(() => {
    if (auth.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  useEffect(() => {
    if (adminKey) {
      localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    } else {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
    }
  }, [adminKey]);

  // Validate session on mount and periodically (check if key was blocked/deleted)
  const validateSession = useCallback(async () => {
    if (!auth.isAuthenticated) return;
    
    // Admin validates with stored admin key
    if (auth.role === "admin" && adminKey) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: adminKey }),
          }
        );
        if (!res.ok) {
          // Admin password changed or invalid — force logout
          logout();
        }
      } catch {
        // Network error — don't logout, just skip
      }
      return;
    }

    // User validates with stored user key  
    const userKey = localStorage.getItem(USER_KEY_STORAGE);
    if (auth.role === "user" && userKey) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: userKey }),
          }
        );
        if (!res.ok) {
          logout();
        }
      } catch {
        // Network error — keep session
      }
    }
  }, [auth.isAuthenticated, auth.role, adminKey]);

  useEffect(() => {
    validateSession();
    // Re-validate every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [validateSession]);

  const login = (role: "admin" | "user", name: string, token: string) => {
    setAuth({ isAuthenticated: true, role, name, token });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: null, name: null, token: null });
    setAdminKey(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    localStorage.removeItem(USER_KEY_STORAGE);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, adminKey, setAdminKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
