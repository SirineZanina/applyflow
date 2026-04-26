import { RouteError } from "@/components/layout/RouteError";
import { DocumentsPage } from "@/features/documents/components/DocumentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/documents")({
  validateSearch: (search: Record<string, unknown>) => ({
    type:
      typeof search.type === "string" &&
      ["all", "resume", "TAILORED_RESUME", "COVER_LETTER", "PORTFOLIO"].includes(search.type)
        ? (search.type as "all" | "resume" | "TAILORED_RESUME" | "COVER_LETTER" | "PORTFOLIO")
        : "all",
  }),
  component: DocumentsRouteComponent,
  errorComponent: RouteError,
});

function DocumentsRouteComponent() {
  const search = Route.useSearch();
  return <DocumentsPage initialFilter={search.type} />;
}
