import { create } from 'zustand'
import * as newsApi from '../api/news'
import type { NewsPost } from '../modules/news/types'

interface NewsState {
  posts: NewsPost[]
  loading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
  publishPost: (content: string, campaign?: string) => Promise<void>
  addComment: (postId: string, content: string) => Promise<void>
  reset: () => void
}

function sortPosts(posts: NewsPost[]) {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export const useNewsStore = create<NewsState>((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const posts = await newsApi.fetchNewsPosts()
      set({ posts: sortPosts(posts), loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить новости',
      })
    }
  },

  publishPost: async (content, campaign) => {
    const post = await newsApi.createNewsPost(content, campaign)
    set((state) => ({ posts: sortPosts([post, ...state.posts]) }))
  },

  addComment: async (postId, content) => {
    const updated = await newsApi.addNewsComment(postId, content)
    set((state) => ({
      posts: sortPosts(state.posts.map((post) => (post.id === postId ? updated : post))),
    }))
  },

  reset: () => set({ posts: [], loading: false, error: null }),
}))
