import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { login, logout, register } from "./api";
import { useAuthStore } from "@/stores/auth.store";
import type { SignInInput, SignUpInput } from "./schema";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/error-message";

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
      toast.success("Account created. Sign in to continue.");
      router.navigate({ to: "/sign-in" });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Sign up failed."));
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
      toast.success("Signed out");
      router.navigate({ to: "/sign-in" });
    },
    onError: () => {
      toast.error("Sign out failed");
      clear();
      router.navigate({ to: "/sign-in" });
    },
  });
}
