interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-8">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-dnd-muted">{description}</p>
    </div>
  )
}
