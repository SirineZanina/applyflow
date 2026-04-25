import { RouteError } from "@/components/layout/RouteError";
import { JobsPage } from "@/features/jobs/components/JobsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/jobs")({
  component: JobsPage,
  errorComponent: RouteError,
});
