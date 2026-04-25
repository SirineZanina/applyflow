import { RouteError } from "@/components/layout/RouteError";
import { AutoApplyPage } from "@/features/automation/components/AutoApplyPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/auto-apply")({
  component: AutoApplyPage,
  errorComponent: RouteError,
});
