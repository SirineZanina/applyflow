import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/resumes")({
  beforeLoad: () => {
    throw redirect({ to: "/documents", search: { type: "resume" } });
  },
});
