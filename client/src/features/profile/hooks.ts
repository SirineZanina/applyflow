import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, upsertProfile } from "./api";
import type { ProfileInput } from "./schema";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/error-message";

export const profileKeys = {
  me: () => ["profile", "me"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: getProfile,
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileInput) => upsertProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.me(), updated);
      toast.success("Profile saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save profile."));
    },
  });
}
