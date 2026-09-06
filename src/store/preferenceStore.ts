import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface PreferenceState {
  favoriteIds: string[]
  recentIds: string[]
  toggleFavorite: (id: string) => boolean
  addRecentlyViewed: (id: string) => void
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      recentIds: [],
      toggleFavorite: (id) => {
        const saved = !get().favoriteIds.includes(id)
        set((state) => ({
          favoriteIds: saved
            ? [...state.favoriteIds, id]
            : state.favoriteIds.filter((entry) => entry !== id),
        }))
        return saved
      },
      addRecentlyViewed: (id) =>
        set((state) => ({
          recentIds: [
            id,
            ...state.recentIds.filter((entry) => entry !== id),
          ].slice(0, 6),
        })),
    }),
    {
      name: 'sajitap-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
