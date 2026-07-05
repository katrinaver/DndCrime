import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import {
  getProfileInitials,
  loadUserProfile,
  saveUserProfile,
  type UserProfile,
} from '../modules/profile/profileStorage'

function buildDefaults(email: string): UserProfile {
  return {
    email,
    name: '',
    description: '',
    avatarFileName: '',
  }
}

export function ProfilePage() {
  const { user, isDevAuth } = useAuth()
  const userId = user?.id ?? 'anonymous'

  const [profile, setProfile] = useState<UserProfile>(() =>
    buildDefaults(user?.email ?? ''),
  )
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const defaults = buildDefaults(user.email ?? '')
    const stored = loadUserProfile(userId, {
      ...defaults,
      name: (user.user_metadata?.name as string | undefined) ?? defaults.name,
    })
    setProfile(stored)
  }, [user, userId])

  function updateProfile<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfileSaved(false)
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function handleAvatarChange(fileName: string) {
    updateProfile('avatarFileName', fileName)
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveUserProfile(userId, profile)
    setProfileSaved(true)
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSaved(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Заполните все поля пароля')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Новый пароль — минимум 6 символов')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают')
      return
    }

    // Заглушка — позже через Supabase auth.updateUser
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaved(true)
  }

  if (!user) {
    return null
  }

  const initials = getProfileInitials(profile.name || user.email || '?')

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Настройки профиля</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Данные аккаунта и настройки отображения
          {isDevAuth && ' · режим разработки'}
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleProfileSubmit} className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Профиль
          </h3>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dnd-gold/40 bg-dnd-dark text-2xl font-bold text-dnd-gold">
                {profile.avatarFileName ? (
                  <span className="px-2 text-center text-xs font-normal text-dnd-muted">
                    {profile.avatarFileName}
                  </span>
                ) : (
                  initials
                )}
              </div>
              <label className="cursor-pointer text-sm text-dnd-gold hover:underline">
                Загрузить аватар
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0]?.name ?? '')}
                />
              </label>
              {profile.avatarFileName && (
                <button
                  type="button"
                  onClick={() => handleAvatarChange('')}
                  className="text-xs text-dnd-muted hover:text-red-400"
                >
                  Удалить
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <FormField
                id="email"
                label="Email"
                type="email"
                value={profile.email}
                onChange={(v) => updateProfile('email', v)}
                autoComplete="email"
              />
              <FormField
                id="name"
                label="Имя"
                value={profile.name}
                onChange={(v) => updateProfile('name', v)}
                placeholder="Как вас называть в группе?"
                autoComplete="name"
                required={false}
              />
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => updateProfile('description', e.target.value)}
                  placeholder="Расскажите о себе как об игроке..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-dnd-border bg-dnd-dark px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-dnd-purple focus:ring-1 focus:ring-dnd-purple"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            {profileSaved && (
              <span className="text-sm text-emerald-400">Профиль сохранён</span>
            )}
            <Button type="submit" className="!w-auto px-6">
              Сохранить профиль
            </Button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-xl border border-dnd-border bg-dnd-card p-6"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Смена пароля
          </h3>
          <p className="mt-1 text-xs text-dnd-muted">
            {isDevAuth
              ? 'В режиме разработки смена пароля — заглушка'
              : 'Новый пароль будет применён к аккаунту Supabase'}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FormField
              id="currentPassword"
              label="Текущий пароль"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <div className="hidden sm:block" />
            <FormField
              id="newPassword"
              label="Новый пароль"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <FormField
              id="confirmPassword"
              label="Подтверждение пароля"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>

          {passwordError && (
            <p className="mt-4 text-sm text-red-400">{passwordError}</p>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            {passwordSaved && (
              <span className="text-sm text-emerald-400">Пароль обновлён</span>
            )}
            <Button type="submit" variant="secondary" className="!w-auto px-6">
              Сменить пароль
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
