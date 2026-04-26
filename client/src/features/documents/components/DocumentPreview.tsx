import { Loader2 } from "lucide-react";
import { useDocument } from "../hooks";

export function DocumentPreview({ docId, format, viewUrl }: { docId: string; format: string; viewUrl: string | null }) {
  const { data: full, isLoading } = useDocument(docId)
  const isPdf = format === 'PDF' || viewUrl?.endsWith('.pdf')

  if (isPdf && viewUrl) {
    return (
      <iframe
        src={viewUrl}
        title="Document preview"
        className="h-full w-full rounded-lg border border-border"
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-muted/20">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (full?.content) {
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-4 text-[12px] leading-relaxed text-foreground">
        {full.content}
      </pre>
    )
  }

  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border">
      <p className="text-sm text-muted-foreground">No preview available</p>
    </div>
  )
}