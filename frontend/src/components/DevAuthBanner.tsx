import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEV_USER_EMAIL, isDevAuthStubEnabled } from '../lib/devAuth'

export function DevAuthBanner() {
  const { user, isDevAuth, enableDevAuth, disableDevAuth } = useAuth()
  const navigate = useNavigate()

  if (!isDevAuthStubEnabled()) return null

  async function handleLogin() {
    enableDevAuth()
    navigate('/')
  }

  async function handleLogout() {
    await disableDevAuth()
    navigate('/login')
  }

  return (
    <div className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm text-amber-100">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-500/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-200">
            Dev
          </span>
          <span>
            {isDevAuth
              ? `Заглушка: вы вошли как ${user?.email}`
              : 'Заглушка авторизации — Supabase не нужен'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDevAuth ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-amber-400/50 px-3 py-1 text-xs font-medium text-amber-100 transition hover:bg-amber-500/20"
            >
              Выйти из заглушки
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="rounded-md border border-amber-400/50 px-3 py-1 text-xs font-medium text-amber-100 transition hover:bg-amber-500/20"
            >
              Войти как {DEV_USER_EMAIL}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
