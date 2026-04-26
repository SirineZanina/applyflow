import { Link } from '@tanstack/react-router'
import { Download, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { DisplayDocument } from '../types'
import { TYPE_META } from '../types'
import { DocumentPreview } from './DocumentPreview'

interface Props {
  doc: DisplayDocument | null
  app: { companyName: string; jobTitle: string } | null | undefined
  isDeletePending: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export function DocumentDrawer({ doc, app, isDeletePending, onClose, onDelete }: Readonly<Props>) {
  return (
    <Sheet open={doc !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-2xl"
        side="right"
      >
        {doc && (() => {
          const meta = TYPE_META[doc.type]
          const Icon = meta.icon

          return (
            <>
              <SheetHeader className="flex-row items-start gap-3 border-b border-border px-6 py-5 pr-14">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${meta.background} ${meta.color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-[14px] font-bold leading-snug">
                    {doc.title}
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    {doc.format} · {doc.sizeLabel} · Updated {doc.updatedLabel}
                  </p>
                  {app && doc.applicationId ? (
                    <Link
                      to="/tracker"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      onClick={onClose}
                    >
                      <ExternalLink size={10} />
                      {app.companyName} · {app.jobTitle}
                    </Link>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">Not linked to an application</p>
                  )}
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 p-6">
                <DocumentPreview
                  docId={doc.id}
                  format={doc.format}
                  viewUrl={doc.viewUrl}
                />
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  {doc.viewUrl ? (
                    <a
                      href={doc.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  ) : null}

                  {doc.source === 'document' ? (
                    <Button
                      variant="ghost"
                      className="h-8 gap-1.5 text-xs text-danger hover:bg-danger-light hover:text-danger"
                      onClick={() => onDelete(doc.id)}
                      disabled={isDeletePending}
                    >
                      <Trash2 size={12} />
                      Delete
                    </Button>
                  ) : (
                    <Link
                      to="/profile"
                      className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Manage Resume
                    </Link>
                  )}
                </div>

                {doc.applicationId ? (
                  <Link
                    to="/generator/$applicationId"
                    params={{ applicationId: doc.applicationId }}
                    className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                    onClick={onClose}
                  >
                    Open in Generator
                  </Link>
                ) : null}
              </div>
            </>
          )
        })()}
      </SheetContent>
    </Sheet>
  )
}
