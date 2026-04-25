import { RouteError } from "@/components/layout/RouteError";
import { TrackerPage } from "@/features/tracker/components/TrackerPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/tracker")({
  component: TrackerPage,
  errorComponent: RouteError,
});
