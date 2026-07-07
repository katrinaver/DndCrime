import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { uploadFile } from '../api/uploads'
import { isProbablyImageUrl } from '../lib/media'
import { getProfileInitials } from '../modules/profile/utils'
import { useProfileStore } from '../store/profileStore'

function buildDefaults(email: string) {
  return {
    email,
    name: '',
    description: '',
    avatarFileName: '',
  }
}

export function ProfilePage() {
  const { user, isDevAuth } = useAuth()
  const profile = useProfileStore((s) => s.profile)
  const loading = useProfileStore((s) => s.loading)
  const error = useProfileStore((s) => s.error)
  const fetchProfile = useProfileStore((s) => s.fetchProfile)
  const saveProfile = useProfileStore((s) => s.saveProfile)

  const [profileSaved, setProfileSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    void fetchProfile(user.email ?? '')
  }, [user, fetchProfile])

  if (!user) {
    return null
  }

  const formProfile = profile ?? buildDefaults(user.email ?? '')

  function updateProfile<K extends keyof typeof formProfile>(key: K, value: (typeof formProfile)[K]) {
    setProfileSaved(false)
    useProfileStore.setState({
      profile: { ...formProfile, [key]: value },
    })
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveProfile(formProfile)
      setProfileSaved(true)
    } catch {
      // error in store
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setAvatarError(null)
    setUploadingAvatar(true)
    try {
      const { url } = await uploadFile(file, 'avatar')
      updateProfile('avatarFileName', url)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Не удалось загрузить аватар')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const initials = getProfileInitials(formProfile.name || user.email || '?')
  const avatarIsImage = isProbablyImageUrl(formProfile.avatarFileName)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Настройки профиля</h2>
        <p className="mt-1 text-sm text-dnd-muted">
          Данные аккаунта и настройки отображения
          {isDevAuth && ' · режим разработки'}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-6">
        <form onSubmit={handleProfileSubmit} className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Профиль
          </h3>

          {loading && !profile ? (
            <p className="mt-6 text-sm text-dnd-muted">Загрузка…</p>
          ) : (
            <>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dnd-gold/40 bg-dnd-dark text-2xl font-bold text-dnd-gold">
                    {avatarIsImage ? (
                      <img
                        src={formProfile.avatarFileName}
                        alt="Аватар профиля"
                        className="h-full w-full object-cover"
                      />
                    ) : formProfile.avatarFileName ? (
                      <span className="px-2 text-center text-xs font-normal text-dnd-muted">
                        {formProfile.avatarFileName}
                      </span>
                    ) : (
                      initials
                    )}
                  </div>
                  <label className="cursor-pointer text-sm text-dnd-gold hover:underline">
                    {uploadingAvatar ? 'Загрузка…' : 'Загрузить аватар'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingAvatar}
                      onChange={(e) => void handleAvatarSelect(e)}
                    />
                  </label>
                  {avatarError && <p className="text-center text-xs text-red-400">{avatarError}</p>}
                  {formProfile.avatarFileName && (
                    <button
                      type="button"
                      onClick={() => updateProfile('avatarFileName', '')}
                      className="text-xs text-dnd-muted hover:text-red-400"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <FormField
                    id="email"
                    label="Эл. почта"
                    type="email"
                    value={formProfile.email}
                    onChange={(v) => updateProfile('email', v)}
                    autoComplete="email"
                  />
                  <FormField
                    id="name"
                    label="Имя"
                    value={formProfile.name}
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
                      value={formProfile.description}
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
                <Button type="submit" className="!w-auto px-6" loading={saving}>
                  Сохранить профиль
                </Button>
              </div>
            </>
          )}
        </form>

        <section className="rounded-xl border border-dnd-border bg-dnd-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-dnd-muted">
            Авторизация
          </h3>
          <p className="mt-1 text-xs text-dnd-muted">
            {isDevAuth
              ? 'Сейчас включена локальная заглушка авторизации'
              : 'Вход выполняется через Google. Пароль DndCrime не хранит.'}
          </p>
        </section>
      </div>
    </div>
  )
}
