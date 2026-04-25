import { ExternalLink, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import type { JobApplication, ApplicationStatus} from "../types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

interface ApplicationCardProps {
  application: JobApplication;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationCard({
  application,
  onEdit,
  onDelete,
  onStatusChange,
}: Readonly<ApplicationCardProps>) {
  const formattedDate = application.appliedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(application.appliedAt))
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-heading font-semibold text-base leading-snug truncate">
              {application.jobTitle}
            </div>
            <div className="text-sm text-muted-foreground truncate mt-0.5">
              {application.companyName}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={application.status}
              onValueChange={(val: ApplicationStatus) =>
                onStatusChange(application.id, val)
              }
            >
              <SelectTrigger className="h-6 px-2 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => onEdit(application)}
                >
                  Edit
                </DropdownMenuItem>
                {application.jobUrl && (
                  <DropdownMenuItem asChild>
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      View job posting
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() => onDelete(application.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {formattedDate && (
          <div className="text-xs text-muted-foreground">
            Applied on {formattedDate}
          </div>
        )}

        {application.resume && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            {application.resume.label ?? "Linked resume"}
          </div>
        )}

        {application.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {application.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
