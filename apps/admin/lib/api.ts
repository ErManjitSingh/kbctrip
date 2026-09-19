type ApiEnvelope<T> = { data: T; meta?: unknown };

const BASE_URL =
  process.env.NEXT_PUBLIC_KBC_BOOKING_API_URL ??
  process.env.KBC_BOOKING_API_URL ??
  'http://localhost:4000/api';

const TOKEN_KEY = 'kbc_trip_ops_token';

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (token: string): void => {
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  window.localStorage.removeItem(TOKEN_KEY);
};

export const apiBaseUrl = () => BASE_URL;

export const mediaOrigin = () => BASE_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (src: string | null | undefined): string | null => {
  if (!src) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  if (src.startsWith('/')) return `${mediaOrigin()}${src}`;
  return `${mediaOrigin()}/${src}`;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    ...init,
  });

  if (response.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
    clearToken();
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (errorBody.message) {
        message = Array.isArray(errorBody.message) ? errorBody.message.join(', ') : errorBody.message;
      }
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  const body = (await response.json()) as ApiEnvelope<T>;
  return body.data;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, payload: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(payload) }),
  patch: <T>(path: string, payload: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(payload) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export const tripWebUrl = () =>
  process.env.NEXT_PUBLIC_TRIP_WEB_URL ?? 'http://localhost:3002';
