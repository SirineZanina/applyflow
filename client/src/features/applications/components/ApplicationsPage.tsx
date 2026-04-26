import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { useApplications, useCreateApplication, useUpdateApplication, usePatchApplicationStatus, useDeleteApplication } from "../hooks";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationCard } from "./ApplicationCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplicationStatus, JobApplication } from "../types";

const STATUS_FILTERS: { label: string; value: ApplicationStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Saved", value: "SAVED" },
  { label: "Applied", value: "APPLIED" },
  { label: "Interviewing", value: "INTERVIEWING" },
  { label: "Offer", value: "OFFER" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {["filter-1", "filter-2", "filter-3", "filter-4", "filter-5", "filter-6"].map((key) => (
          <Skeleton key={key} className="h-7 w-20 rounded-md" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<JobApplication | null>(null);

  const { data, isLoading } = useApplications({
    page,
    size: 20,
    status: filter === "ALL" ? undefined : filter,
  });

  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const patchStatus = usePatchApplicationStatus();
  const deleteApp = useDeleteApplication();

  const applications = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleCreate = (values: Parameters<typeof createApp.mutateAsync>[0]) => {
    createApp.mutateAsync(values).then(() => setFormOpen(false));
  };

  const handleEdit = (values: Parameters<typeof updateApp.mutateAsync>[0]) => {
    updateApp.mutateAsync(values).then(() => setEditTarget(null));
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this application? This cannot be undone.")) {
      deleteApp.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    patchStatus.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Applications</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add Application
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(({ label, value }) => (
              <Button
                key={value}
                variant="ghost"
                onClick={() => {
                  setFilter(value);
                  setPage(0);
                }}
                className={`h-auto rounded-md px-3 py-1 text-sm font-medium transition-colors hover:bg-transparent ${
                  filter === value
                    ? "bg-primary text-primary-foreground hover:bg-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
                {value !== "ALL" && data?.content && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({data.content.filter((a) => a.status === value).length})
                  </span>
                )}
              </Button>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Briefcase className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {filter === "ALL" ? "No applications yet" : `No ${filter.toLowerCase()} applications`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "ALL"
                    ? "Track your job applications here. Click Add Application to get started."
                    : "Try a different filter or add a new application."}
                </p>
              </div>
              {filter === "ALL" && (
                <Button onClick={() => setFormOpen(true)} size="sm">
                  <Plus className="size-4" />
                  Add your first application
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onEdit={setEditTarget}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages} ({totalElements} total)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isPending={createApp.isPending}
        mode="create"
      />

      <ApplicationForm
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSubmit={(values) =>
          editTarget && handleEdit({ id: editTarget.id, data: values })
        }
        initialValues={
          editTarget
            ? {
                companyName: editTarget.companyName,
                jobTitle: editTarget.jobTitle,
                jobUrl: editTarget.jobUrl ?? "",
                resumeId: editTarget.resume?.id,
                notes: editTarget.notes ?? "",
              }
            : undefined
        }
        isPending={updateApp.isPending}
        mode="edit"
      />
    </div>
  );
}
