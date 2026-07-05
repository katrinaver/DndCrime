import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Almost there!">
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-300">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/login">
            <Button variant="secondary">Back to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create account" subtitle="Join the party">
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat password"
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-dnd-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-dnd-gold hover:text-dnd-gold-hover">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
