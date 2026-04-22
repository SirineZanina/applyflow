import { getAuthState } from "@/stores/auth.store";
import type { ApiError } from "@/types/api";
import { HttpError } from "@/types/api";
import { fetchMe } from "./me";
import { BASE_URL } from "./config";

let isRefreshing = false;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;

  try {
    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!refreshRes.ok) return false;

    const { access_token } = (await refreshRes.json()) as {
      access_token: string;
    };

    const existingUser = getAuthState().user;
    const user = existingUser ?? (await fetchMe(access_token));
    if (!user) return false;

    getAuthState().setSession(access_token, user);
    return true;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = getAuthState();
  const headers = new Headers(options.headers);

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const init: RequestInit = { ...options, headers, credentials: "include" };
  const res = await fetch(`${BASE_URL}${path}`, init);

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const { accessToken: newToken } = getAuthState();
      if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
      const retry = await fetch(`${BASE_URL}${path}`, { ...init, headers });
      if (retry.status === 401) {
        getAuthState().clear();
        throw new HttpError(401, {
          code: "UNAUTHORIZED",
          message: "Session expired.",
        });
      }
      return handleResponse<T>(retry);
    }
    getAuthState().clear();
    throw new HttpError(401, {
      code: "UNAUTHORIZED",
      message: "Session expired.",
    });
  }

  return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({
    code: "UNKNOWN",
    message: "Unexpected error.",
  }));
  if (!res.ok) throw new HttpError(res.status, body as ApiError);
  return body as T;
}
