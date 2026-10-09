const API_URL = import.meta.env?.VITE_API_URL?.replace(/\/$/, '');
export const apiConfigured = Boolean(API_URL);

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function refreshAccessToken() {
  if (!API_URL) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = await response.json() as { data?: { accessToken?: string } };
        accessToken = body.data?.accessToken ?? null;
        return accessToken;
      })
      .catch(() => null)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function restoreSession() {
  return Boolean(await refreshAccessToken());
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  if (!API_URL) throw new Error('The CareerHub API is not configured for this preview.');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...options.headers }
  });
  const isAuthRequest = path.startsWith('/auth/');
  if (response.status === 401 && !retried && !isAuthRequest) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return api<T>(path, options, true);
    accessToken = null;
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null) as { data?: T; error?: { message?: string } } | null;
  if (!response.ok) throw new ApiRequestError(body?.error?.message ?? 'Request failed', response.status);
  return body?.data as T;
}
