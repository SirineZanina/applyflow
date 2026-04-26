import { RouteError } from "@/components/layout/RouteError";
import { GeneratorPage } from "@/features/generator/components/GeneratorPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/generator/$applicationId")({
  component: GeneratorRouteComponent,
  errorComponent: RouteError,
});

function GeneratorRouteComponent() {
  const { applicationId } = Route.useParams();
  return <GeneratorPage applicationId={applicationId} />;
}
