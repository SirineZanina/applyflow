import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        Route does not exist or moved.
      </p>
      <Button asChild>
        <Link to="/">Back to app</Link>
      </Button>
    </div>
  );
}
