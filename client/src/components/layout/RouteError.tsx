import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/error-message";

export function RouteError({ error, reset }: Readonly<ErrorComponentProps>) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {getErrorMessage(error, "Unexpected error.")}
      </p>
      <div>
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
