import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await resetPassword(email)
    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="Password reset">
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-300">
            If an account exists for <strong className="text-white">{email}</strong>, you will
            receive a password reset link shortly.
          </p>
          <Link to="/login">
            <Button variant="secondary">Back to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link"
    >
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

        <Button type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-dnd-muted">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-dnd-gold hover:text-dnd-gold-hover">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
