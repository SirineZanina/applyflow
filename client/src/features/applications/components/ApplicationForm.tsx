import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResumes } from "@/features/resume/hooks";
import { applicationSchema, type ApplicationFormValues } from "../schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ApplicationFormValues) => void;
  initialValues?: Partial<ApplicationFormValues>;
  isPending?: boolean;
  mode?: "create" | "edit";
}

export function ApplicationForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
  isPending,
  mode = "create",
}: Readonly<ApplicationFormProps>) {
  const { data: resumes } = useResumes();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: initialValues?.companyName ?? "",
      jobTitle: initialValues?.jobTitle ?? "",
      jobUrl: initialValues?.jobUrl ?? "",
      resumeId: initialValues?.resumeId ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  const unlinkedResumeValue = "__no_resume__";

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Application" : "Edit Application"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companyName">Company *</Label>
            <Input
              id="companyName"
              {...register("companyName")}
              placeholder="Acme Corp"
              aria-invalid={!!errors.companyName}
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              {...register("jobTitle")}
              placeholder="Senior Software Engineer"
              aria-invalid={!!errors.jobTitle}
            />
            {errors.jobTitle && (
              <p className="text-xs text-destructive">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jobUrl">Job Posting URL</Label>
            <Input
              id="jobUrl"
              {...register("jobUrl")}
              type="url"
              placeholder="https://..."
            />
            {errors.jobUrl && (
              <p className="text-xs text-destructive">
                {errors.jobUrl.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resumeId">Linked Resume</Label>
            <Controller
              name="resumeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || unlinkedResumeValue}
                  onValueChange={(val) =>
                    field.onChange(
                      val === unlinkedResumeValue ? undefined : val,
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No resume linked" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={unlinkedResumeValue}>
                      No resume linked
                    </SelectItem>
                    {resumes?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label ?? "Untitled resume"}
                        {r.primary && " (primary)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Contacts, salary range, follow-up dates..."
              rows={4}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {mode === "create" ? "Add Application" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
