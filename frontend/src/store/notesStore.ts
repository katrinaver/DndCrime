import { create } from 'zustand'
import * as notesApi from '../api/notes'

interface NotesState {
  content: string
  loading: boolean
  saving: boolean
  error: string | null
  fetchNotes: () => Promise<void>
  saveNotes: (content: string) => Promise<void>
  reset: () => void
}

export const useNotesStore = create<NotesState>((set) => ({
  content: '',
  loading: false,
  saving: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null })
    try {
      const note = await notesApi.fetchNote()
      set({ content: note.content, loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить заметки',
      })
    }
  },

  saveNotes: async (content) => {
    set({ saving: true, error: null })
    try {
      const note = await notesApi.updateNote(content)
      set({ content: note.content, saving: false })
    } catch (err) {
      set({
        saving: false,
        error: err instanceof Error ? err.message : 'Не удалось сохранить заметки',
      })
      throw err
    }
  },

  reset: () => set({ content: '', loading: false, saving: false, error: null }),
}))
