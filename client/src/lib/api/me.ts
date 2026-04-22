import type { AuthUser } from "@/types/auth";
import { BASE_URL } from "./config";

export async function fetchMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json() as Promise<AuthUser>;
}
