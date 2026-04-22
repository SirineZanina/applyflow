import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/applications")({
  component: () => <div>Applications</div>,
});