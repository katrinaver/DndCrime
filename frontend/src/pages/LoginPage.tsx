import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

const googleScriptId = 'google-identity-services'

export function LoginPage() {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signInWithGoogleCredential } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/home'
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!googleClientId) {
      setError('Вход через Google не настроен. Укажите VITE_GOOGLE_CLIENT_ID.')
      return
    }

    let cancelled = false

    async function handleCredential(credential: string) {
      setError(null)
      setLoading(true)
      const result = await signInWithGoogleCredential(credential)
      setLoading(false)

      if (cancelled) return
      if (result.error) {
        setError(result.error)
        return
      }
      navigate(from, { replace: true })
    }

    function renderButton() {
      if (cancelled || !buttonRef.current || !window.google?.accounts.id) return

      buttonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (!response.credential) {
            setError('Google не вернул токен входа.')
            return
          }
          void handleCredential(response.credential)
        },
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: Math.min(buttonRef.current.offsetWidth || 320, 360),
        locale: 'ru',
      })
    }

    const existingScript = document.getElementById(googleScriptId) as HTMLScriptElement | null
    if (existingScript) {
      if (window.google?.accounts.id) {
        renderButton()
      } else {
        existingScript.addEventListener('load', renderButton, { once: true })
      }
      return () => {
        cancelled = true
        existingScript.removeEventListener('load', renderButton)
      }
    }

    const script = document.createElement('script')
    script.id = googleScriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderButton
    script.onerror = () => setError('Не удалось загрузить скрипт входа через Google.')
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [from, googleClientId, navigate, signInWithGoogleCredential])

  return (
    <AuthLayout title="Вход" subtitle="Используйте аккаунт Google">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div ref={buttonRef} className="min-h-11 w-full" />

        {loading && (
          <Button type="button" loading>
            Входим
          </Button>
        )}
      </div>
    </AuthLayout>
  )
}
