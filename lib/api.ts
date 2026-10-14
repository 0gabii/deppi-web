const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const TOKEN_KEY = "deppi.token";
const USER_KEY = "deppi.user";

export type SessionUser = {
  id: number | string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const storage = {
  getToken: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  getUser: (): SessionUser | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  },
  save: (token: string, user: SessionUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Chamado quando a API responde 401 (token ausente/expirado/revogado)
let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || body?.success === false) {
    // 401 em rota autenticada = sessão inválida. No login, 401 é "senha errada".
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, body?.error ?? "Erro ao comunicar com o servidor.");
  }
  return body.data as T;
}