import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';

export const api = axios.create({ baseURL });

// Cliente separado (sem interceptors) para o refresh, evitando loop.
const refreshClient = axios.create({ baseURL });

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS); },
  get refresh() { return localStorage.getItem(REFRESH); },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Refresh automático e transparente no 401 ----
let refreshing = false;
let fila: ((token: string | null) => void)[] = [];

function aguardaRefresh(): Promise<string | null> {
  return new Promise((resolve) => fila.push(resolve));
}
function resolveFila(token: string | null) {
  fila.forEach((cb) => cb(token));
  fila = [];
}

function redirecionaLogin() {
  tokenStore.clear();
  if (location.pathname !== '/login') location.href = '/login';
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Só tenta refresh em 401, uma vez por request, e se houver refresh token.
    if (status !== 401 || original._retry || !tokenStore.refresh) {
      if (status === 401) redirecionaLogin();
      return Promise.reject(error);
    }

    original._retry = true;

    // Se já há um refresh em andamento, espera ele terminar.
    if (refreshing) {
      const novo = await aguardaRefresh();
      if (!novo) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${novo}`;
      return api(original);
    }

    refreshing = true;
    try {
      const { data } = await refreshClient.post('/auth/refresh', {
        refreshToken: tokenStore.refresh,
      });
      tokenStore.set(data.accessToken, data.refreshToken);
      resolveFila(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (e) {
      resolveFila(null);
      redirecionaLogin();
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  },
);
