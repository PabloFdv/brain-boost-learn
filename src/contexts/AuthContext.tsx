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
    // Multi-layer persistence: localStorage + sessionStorage
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { isAuthenticated: false, role: null, name: null, token: null };
  });

  const [adminKey, setAdminKey] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_KEY_STORAGE);
  });

  // Persist auth to BOTH localStorage and sessionStorage for infinite persistence
  useEffect(() => {
    if (auth.isAuthenticated) {
      const data = JSON.stringify(auth);
      localStorage.setItem(STORAGE_KEY, data);
      sessionStorage.setItem(STORAGE_KEY, data);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  useEffect(() => {
    if (adminKey) {
      localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
    } else {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
    }
  }, [adminKey]);

  // Listen for storage events (other tabs) to sync auth state
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try { setAuth(JSON.parse(e.newValue)); } catch {}
        } else {
          setAuth({ isAuthenticated: false, role: null, name: null, token: null });
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Keep session alive - re-validate periodically but DON'T force logout on network errors
  const validateSession = useCallback(async () => {
    if (!auth.isAuthenticated) return;
    
    if (auth.role === "admin" && adminKey) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: adminKey }) }
        );
        // Only logout if explicitly denied (403), not on network errors
        if (res.status === 403) logout();
      } catch { /* network error - keep session */ }
      return;
    }

    // For users, just keep the session - keys are persistent now
    // No need to validate since keys allow re-login
  }, [auth.isAuthenticated, auth.role, adminKey]);

  useEffect(() => {
    validateSession();
    const interval = setInterval(validateSession, 10 * 60 * 1000); // every 10 min
    return () => clearInterval(interval);
  }, [validateSession]);

  const login = (role: "admin" | "user", name: string, token: string) => {
    setAuth({ isAuthenticated: true, role, name, token });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: null, name: null, token: null });
    setAdminKey(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
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
