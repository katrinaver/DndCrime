import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCalendarStore } from './calendarStore'
import { useCampaignStore } from './campaignStore'
import { useCharacterStore } from './characterStore'
import { useChatStore } from './chatStore'
import { useNewsStore } from './newsStore'
import { useNotificationStore } from './notificationStore'
import { useNotesStore } from './notesStore'
import { useProfileStore } from './profileStore'

/** Загружает данные с API после авторизации. */
export function useApiBootstrap() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      useCampaignStore.getState().reset()
      useCharacterStore.getState().reset()
      useCalendarStore.getState().reset()
      useNewsStore.getState().reset()
      useNotificationStore.getState().reset()
      useChatStore.getState().reset()
      useProfileStore.getState().reset()
      useNotesStore.getState().reset()
      return
    }

    void useCampaignStore.getState().fetchCampaigns()
    void useCharacterStore.getState().fetchCharacters()
    void useCalendarStore.getState().fetchEvents()
    void useNewsStore.getState().fetchPosts()
    void useNotificationStore.getState().refresh()
  }, [user, loading])
}
