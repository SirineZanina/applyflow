import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { login, logout, register } from "./api";
import { useAuthStore } from "@/stores/auth.store";
import type { SignInInput, SignUpInput } from "./schema";

export function useSignIn() {
  const { setSession } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignInInput) => login(data),
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      router.navigate({ to: "/dashboard" });
    },
  });
}

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignUpInput) => register(data),
    onSuccess: () => {
      router.navigate({ to: "/sign-in" });
    },
  });
}

export function useSignOut() {
  const { clear } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clear();
      router.navigate({ to: "/sign-in" });
    },
    onError: () => {
      clear();
      router.navigate({ to: "/sign-in" });
    },
  });
}
