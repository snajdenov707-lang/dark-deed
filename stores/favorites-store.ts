"use client";

/** ── FAVORITES (Zustand + localStorage) ─────────
 *  Избранное меню — тап-сердечко на карточке.
 *  Локально, без БД (пока — можно потом мигрировать в user_favorites).
 ─────────────────────────────────────────────── */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FavState {
  ids: number[];
  toggle: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "dark-deed:favorites:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ids: s.ids }),
    }
  )
);

export const selectFavCount = (s: FavState) => s.ids.length;
