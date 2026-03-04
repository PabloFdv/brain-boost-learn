import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem("epistemologia_auth");
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return { isAuthenticated: false, role: null, name: null, token: null };
  });

  const [adminKey, setAdminKey] = useState<string | null>(() => {
    return sessionStorage.getItem("epistemologia_admin_key");
  });

  useEffect(() => {
    if (auth.isAuthenticated) {
      sessionStorage.setItem("epistemologia_auth", JSON.stringify(auth));
    } else {
      sessionStorage.removeItem("epistemologia_auth");
    }
  }, [auth]);

  useEffect(() => {
    if (adminKey) {
      sessionStorage.setItem("epistemologia_admin_key", adminKey);
    } else {
      sessionStorage.removeItem("epistemologia_admin_key");
    }
  }, [adminKey]);

  const login = (role: "admin" | "user", name: string, token: string) => {
    setAuth({ isAuthenticated: true, role, name, token });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: null, name: null, token: null });
    setAdminKey(null);
    sessionStorage.removeItem("epistemologia_auth");
    sessionStorage.removeItem("epistemologia_admin_key");
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
