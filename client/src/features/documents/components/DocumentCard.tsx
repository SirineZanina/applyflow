import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DisplayDocument } from '../types'
import { TYPE_META } from '../types'

interface Props {
  item: DisplayDocument
  app: { companyName: string; jobTitle: string } | null | undefined
  onClick: () => void
}

export function DocumentCard({ item, app, onClick }: Readonly<Props>) {
  const meta = TYPE_META[item.type]
  const Icon = meta.icon

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full flex-col items-start justify-start rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:bg-card hover:shadow-sm"
    >
      <div className="mb-3 flex w-full items-center justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.background} ${meta.color}`}>
          <Icon size={14} />
        </div>
        <Badge className={`h-5 rounded-md px-1.5 text-[10px] font-bold ${meta.background} ${meta.color}`}>
          {meta.label}
        </Badge>
      </div>
      <h3 className="line-clamp-1 text-sm font-bold text-foreground">{item.title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{item.format} · {item.sizeLabel}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Updated {item.updatedLabel}</p>
      {app ? (
        <p className="mt-2 line-clamp-1 text-[11px] font-semibold text-primary">
          {app.companyName} · {app.jobTitle}
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-muted-foreground">Not linked to an application</p>
      )}
    </Button>
  )
}
