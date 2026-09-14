import { api, tokenStore } from "../../api/client";

export type Role = "ADMIN" | "OPERADOR";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const USER_KEY = "authUser";

function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function currentUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return currentUser()?.role === "ADMIN";
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  tokenStore.set(data.accessToken, data.refreshToken);
  saveUser(data.user);
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>("/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

/** Revoga o refresh token no servidor e limpa a sessão local. */
export async function logout(): Promise<void> {
  const refreshToken = tokenStore.refresh;
  try {
    if (refreshToken) await api.post("/auth/logout", { refreshToken });
  } catch {
    // ignora falha de rede no logout — limpa localmente de qualquer forma
  } finally {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(tokenStore.access);
}
