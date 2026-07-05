import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface ProfileResponse {
  email: string
  message: string
}

export function HomePage() {
  const { user, session, isDevAuth } = useAuth()
  const [apiMessage, setApiMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!session || isDevAuth) return

      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data: ProfileResponse = await res.json()
          setApiMessage(data.message)
        }
      } catch {
        setApiMessage(null)
      }
    }

    fetchProfile()
  }, [session, isDevAuth])

  return (
    <div className="rounded-xl border border-dnd-border bg-dnd-card p-8">
      <h2 className="text-2xl font-semibold text-white">
        Welcome, {user?.email?.split('@')[0]}!
      </h2>
      <p className="mt-2 text-dnd-muted">
        Your portal for offline D&amp;D parties. More features coming soon.
      </p>

      {apiMessage && (
        <div className="mt-6 rounded-lg border border-dnd-gold/30 bg-dnd-gold/10 px-4 py-3 text-sm text-dnd-gold">
          Backend says: {apiMessage}
        </div>
      )}
    </div>
  )
}
