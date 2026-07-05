import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-dnd-gold">
              DndCrime
            </h1>
          </Link>
          <p className="mt-1 text-sm text-dnd-muted">Portal for offline parties</p>
        </div>

        <div className="rounded-xl border border-dnd-border bg-dnd-card p-8 shadow-2xl">
          <h2 className="mb-1 text-xl font-semibold text-white">{title}</h2>
          {subtitle && <p className="mb-6 text-sm text-dnd-muted">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </div>
  )
}
