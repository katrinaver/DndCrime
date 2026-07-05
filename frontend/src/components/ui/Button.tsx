import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

const variants = {
  primary:
    'bg-dnd-purple text-white hover:bg-dnd-purple-hover focus:ring-dnd-purple disabled:opacity-50',
  secondary:
    'border border-dnd-border bg-dnd-card text-gray-200 hover:border-dnd-gold hover:text-dnd-gold',
  ghost: 'text-dnd-muted hover:text-white',
}

export function Button({
  variant = 'primary',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dnd-dark disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}
