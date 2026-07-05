import { Link } from 'react-router-dom'

interface BackLinkProps {
  to?: string
  label?: string
}

export function BackLink({ to = '/characters', label = '← К списку персонажей' }: BackLinkProps) {
  return (
    <Link to={to} className="inline-block text-sm text-dnd-gold transition hover:text-dnd-gold-hover">
      {label}
    </Link>
  )
}
