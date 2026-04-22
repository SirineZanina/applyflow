import { apiFetch } from "@/lib/api/client";
import type { SignInInput, SignUpInput } from "./schema";
import type { AuthUser } from "@/types/auth";
import { fetchMe } from "@/lib/api/me";

interface AuthTokens {
  access_token: string;
  token_type: string;
}

export async function login(
  data: SignInInput,
): Promise<{ token: string; user: AuthUser }> {
  const tokens = await apiFetch<AuthTokens>("/api/v1/auth/authenticate", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const user = await fetchMe(tokens.access_token);
  if (!user) throw new Error("Failed to fetch user after login");
  return { token: tokens.access_token, user };
}

export async function register(data: SignUpInput): Promise<void> {
  await apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", {
    method: "POST",
  });
}
