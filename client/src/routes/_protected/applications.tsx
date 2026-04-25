import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/applications")({
  beforeLoad: () => {
    throw redirect({ to: "/tracker" });
  },
});
