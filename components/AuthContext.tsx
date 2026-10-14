"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api, setUnauthorizedHandler, storage, SessionUser } from "@/lib/api";

type LoginResult = { token: string; user: SessionUser };

type AuthState = {
  user: SessionUser | null;
  ready: boolean; // false até ler a sessão do navegador
  login: (email: string, password: string) => Promise<SessionUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Lê o "exp" do JWT para descartar token já vencido sem precisar ir à API
function isExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return false; // se não conseguir ler, deixa a API decidir (401)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  // Ao abrir o site: recupera a sessão salva (só dá pra fazer no navegador)
  useEffect(() => {
    if (isExpired(storage.getToken())) {
      storage.clear();
    } else {
      setUser(storage.getUser());
    }
    setReady(true);
  }, []);

  // Qualquer 401 da API derruba a sessão -> o guard manda para /login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      storage.clear();
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    storage.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" }); // revoga o token no servidor
    } catch {
      // mesmo se falhar, encerra a sessão local
    }
    storage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}