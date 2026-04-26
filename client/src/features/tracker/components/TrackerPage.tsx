import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bolt, ArrowUpDown } from 'lucide-react'
import {
  useApplications,
  useCreateApplication,
  useDeleteApplication,
  usePatchApplicationStatus,
  useUpdateApplication,
} from '@/features/applications/hooks'
import { ApplicationForm } from '@/features/applications/components/ApplicationForm'
import type { ApplicationStatus, JobApplication } from '@/features/applications/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { NEXT_STEP_MAX } from '@/lib/validation/constants'

const BOARD_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEWING',
  'OFFER',
  'REJECTED',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  INTERVIEWING: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const STATUS_CLASSES: Record<ApplicationStatus, { text: string; bg: string; border: string }> = {
  SAVED: {
    text: 'text-muted-foreground',
    bg: 'bg-border',
    border: 'border-border',
  },
  APPLIED: {
    text: 'text-primary',
    bg: 'bg-primary-light',
    border: 'border-primary',
  },
  INTERVIEWING: {
    text: 'text-warning',
    bg: 'bg-warning-light',
    border: 'border-warning',
  },
  OFFER: {
    text: 'text-success',
    bg: 'bg-success-light',
    border: 'border-success',
  },
  REJECTED: {
    text: 'text-danger',
    bg: 'bg-danger-light',
    border: 'border-danger',
  },
  WITHDRAWN: {
    text: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
}

type SortKey = 'company' | 'title' | 'status' | 'match' | 'date'

function companyMonogram(companyName: string) {
  return companyName
    .split(/\s+/)
    .map((token) => token[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDatetime(value: string | null) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleString()
}

export function TrackerPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<JobApplication | null>(null)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'date',
    dir: 'desc',
  })

  const { data, isLoading } = useApplications({ page: 0, size: 100 })
  const createMutation = useCreateApplication()
  const updateMutation = useUpdateApplication()
  const patchStatusMutation = usePatchApplicationStatus()
  const deleteMutation = useDeleteApplication()

  const applications = useMemo(() => data?.content ?? [], [data?.content])

  const kanbanStatuses = useMemo(() => {
    if (applications.some((application) => application.status === 'WITHDRAWN')) {
      return [...BOARD_STATUSES, 'WITHDRAWN'] as ApplicationStatus[]
    }
    return BOARD_STATUSES
  }, [applications])

  const grouped = useMemo(
    () =>
      kanbanStatuses.reduce<Record<ApplicationStatus, JobApplication[]>>((acc, status) => {
        acc[status] = applications.filter((application) => application.status === status)
        return acc
      }, {} as Record<ApplicationStatus, JobApplication[]>),
    [applications, kanbanStatuses],
  )

  const sortedRows = useMemo(() => {
    const items = [...applications]
    const direction = sort.dir === 'asc' ? 1 : -1

    items.sort((left, right) => {
      if (sort.key === 'company') {
        return direction * left.companyName.localeCompare(right.companyName)
      }
      if (sort.key === 'title') {
        return direction * left.jobTitle.localeCompare(right.jobTitle)
      }
      if (sort.key === 'status') {
        return direction * left.status.localeCompare(right.status)
      }
      if (sort.key === 'match') {
        return direction * ((left.matchScore ?? 0) - (right.matchScore ?? 0))
      }
      return (
        direction *
        (new Date(left.nextStepAt ?? left.createdDate).getTime() -
          new Date(right.nextStepAt ?? right.createdDate).getTime())
      )
    })

    return items
  }, [applications, sort])

  function toggleSort(key: SortKey) {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  function saveMetadata(application: JobApplication, nextStep: string, nextStepAt: string) {
    updateMutation.mutate({
      id: application.id,
      data: {
        nextStep,
        nextStepAt: nextStepAt || null,
      },
    })
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-foreground">
            Application Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applications.length} applications tracked · Drag cards to update status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-border p-0.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setView('kanban')}
              className={`h-auto rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-transparent ${
                view === 'kanban'
                  ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-muted-foreground'
              }`}
            >
              Kanban
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setView('table')}
              className={`h-auto rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-transparent ${
                view === 'table'
                  ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-muted-foreground'
              }`}
            >
              Table
            </Button>
          </div>
          <Button className="h-8 text-xs font-bold" onClick={() => setFormOpen(true)}>
            Add Application
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : view === 'kanban' ? (
        <section className="overflow-x-auto pb-1">
          <div className="flex gap-3">
            {kanbanStatuses.map((status) => {
              const items = grouped[status] ?? []
              const statusStyle = STATUS_CLASSES[status]
              const dragActive = dragOverStatus === status

              return (
                <article
                  key={status}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOverStatus(status)
                  }}
                  onDragLeave={() => setDragOverStatus(null)}
                  onDrop={() => {
                    if (!draggedId) return
                    patchStatusMutation.mutate({ id: draggedId, status })
                    setDraggedId(null)
                    setDragOverStatus(null)
                  }}
                  className={`min-h-[440px] w-[220px] shrink-0 rounded-xl border bg-card p-3 transition-colors ${
                    dragActive
                      ? `${statusStyle.border} ${statusStyle.bg}`
                      : 'border-border'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${statusStyle.bg} ${statusStyle.border} border`}
                    />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.05em] text-foreground">
                      {STATUS_LABELS[status]}
                    </h2>
                    <span
                      className={`ml-auto rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((application) => (
                      <article
                        key={application.id}
                        draggable
                        onDragStart={() => setDraggedId(application.id)}
                        className={`rounded-[9px] border border-border bg-card p-3 text-left ${
                          draggedId === application.id ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-primary-light text-[10px] font-bold text-primary">
                            {companyMonogram(application.companyName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-foreground">
                              {application.companyName}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {application.jobTitle}
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                          {(application.matchScore ?? 0) > 0
                            ? `${application.matchScore}% match`
                            : 'Match pending'}
                        </p>

                        {application.nextStep ? (
                          <p
                            className={`mt-1.5 inline-flex rounded-[5px] px-2 py-0.5 text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {application.nextStep}
                          </p>
                        ) : null}

                        {application.aiPrepared ? (
                          <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                            <Bolt size={10} fill="currentColor" />
                            Auto-Applied
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                {[
                  { key: 'company' as const, label: 'Company' },
                  { key: 'title' as const, label: 'Role' },
                  { key: 'status' as const, label: 'Status' },
                  { key: 'match' as const, label: 'Match' },
                  { key: 'date' as const, label: 'Applied' },
                ].map((column) => (
                  <th key={column.key} className="px-3.5 py-2.5 text-left">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toggleSort(column.key)}
                      className="h-auto p-0 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground hover:bg-transparent"
                    >
                      {column.label}
                      <ArrowUpDown size={11} />
                    </Button>
                  </th>
                ))}
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Next Step
                </th>
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((application, index) => (
                <tr
                  key={application.id}
                  className={`border-b border-border align-top ${index % 2 === 1 ? 'bg-background' : ''}`}
                >
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-primary-light text-[10px] font-bold text-primary">
                        {companyMonogram(application.companyName)}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {application.companyName}
                      </span>
                      {application.aiPrepared ? (
                        <Bolt size={12} className="text-primary" fill="currentColor" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-sm text-muted-foreground">{application.jobTitle}</td>
                  <td className="px-3.5 py-3">
                    <select
                      value={application.status}
                      onChange={(event) =>
                        patchStatusMutation.mutate({
                          id: application.id,
                          status: event.target.value as ApplicationStatus,
                        })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {Object.keys(STATUS_LABELS).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status as ApplicationStatus]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3.5 py-3 text-sm font-bold text-primary">
                    {application.matchScore ?? 0}%
                  </td>
                  <td className="px-3.5 py-3 text-xs text-muted-foreground">
                    {formatDatetime(application.nextStepAt)}
                  </td>
                  <td className="px-3.5 py-3">
                    <Input
                      defaultValue={application.nextStep ?? ''}
                      onBlur={(event) =>
                        saveMetadata(
                          application,
                          event.target.value.slice(0, NEXT_STEP_MAX),
                          application.nextStepAt?.slice(0, 16) ?? '',
                        )
                      }
                      maxLength={NEXT_STEP_MAX}
                      placeholder="Review before submit"
                      className="h-8 w-full text-xs"
                    />
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setEditTarget(application)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          navigate({
                            to: '/generator/$applicationId',
                            params: { applicationId: application.id },
                          })
                        }
                      >
                        Generator
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-danger"
                        onClick={() => {
                          if (confirm('Delete this application?')) {
                            deleteMutation.mutate(application.id)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <ApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(values) => createMutation.mutate(values, { onSuccess: () => setFormOpen(false) })}
        isPending={createMutation.isPending}
      />

      <ApplicationForm
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        initialValues={
          editTarget
            ? {
                companyName: editTarget.companyName,
                jobTitle: editTarget.jobTitle,
                jobUrl: editTarget.jobUrl ?? '',
                resumeId: editTarget.resume?.id,
                notes: editTarget.notes ?? '',
              }
            : undefined
        }
        onSubmit={(values) => {
          if (!editTarget) return
          updateMutation.mutate(
            { id: editTarget.id, data: values },
            { onSuccess: () => setEditTarget(null) },
          )
        }}
        isPending={updateMutation.isPending}
        mode="edit"
      />
    </div>
  )
}
