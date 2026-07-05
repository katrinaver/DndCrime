import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back, adventurer">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-dnd-gold hover:text-dnd-gold-hover"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-dnd-muted">
        No account?{' '}
        <Link to="/register" className="font-medium text-dnd-gold hover:text-dnd-gold-hover">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
