import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CalendarProvider } from '../modules/calendar'
import { CampaignProvider } from '../modules/campaigns'
import { MiniCalendarWidget } from '../modules/calendar/MiniCalendarWidget'
import { Button } from './ui/Button'

const navItems = [
  { to: '/campaigns', label: 'Мои кампании' },
  { to: '/characters', label: 'Мои персонажи' },
  { to: '/calendar', label: 'Календарь' },
  { to: '/profile', label: 'Настройки профиля' },
  { to: '/news', label: 'Новости' },
  { to: '/notes', label: 'Заметки' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-dnd-purple/20 text-dnd-purple-hover'
      : 'text-dnd-muted hover:bg-dnd-border/50 hover:text-white',
  ].join(' ')
}

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loggingOut, setLoggingOut] = useState(false)
  const showMiniCalendar = location.pathname !== '/calendar'

  async function handleLogout() {
    setLoggingOut(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <CampaignProvider>
      <CalendarProvider>
        <div className="min-h-screen">
        <header className="border-b border-dnd-border bg-dnd-card">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="shrink-0 text-xl font-bold text-dnd-gold">
                DndCrime
              </NavLink>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-dnd-muted md:inline">{user?.email}</span>
                <Button
                  variant="secondary"
                  className="!w-auto"
                  loading={loggingOut}
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </div>
            </div>

            <nav className="mt-4 flex flex-wrap gap-1 border-t border-dnd-border pt-4">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8">
          {showMiniCalendar && (
            <div className="mb-6 lg:hidden">
              <MiniCalendarWidget />
            </div>
          )}

          <div className="flex gap-8">
            <main className="min-w-0 flex-1">
              <Outlet />
            </main>

            {showMiniCalendar && (
              <aside className="hidden w-56 shrink-0 lg:block xl:w-64">
                <MiniCalendarWidget />
              </aside>
            )}
          </div>
        </div>
      </div>
      </CalendarProvider>
    </CampaignProvider>
  )
}
