interface Props {
  title: string
  children: React.ReactNode
}

export function ProfileSection({ title, children }: Readonly<Props>) {
  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-5.5">
      <h3 className="mb-4 text-[12px] font-bold uppercase tracking-[0.05em] text-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}
