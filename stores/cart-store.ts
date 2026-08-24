"use client";

/** ── CART STORE (Zustand) ───────────────────────
 *  Единственный источник правды для корзины.
 *  Автосохранение в localStorage — закрыл app, открыл,
 *  корзина на месте.
 ─────────────────────────────────────────────── */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MenuItem } from "@/lib/types";

export type MilkKind = "regular" | "oat" | "almond" | "lactose-free";
export type SizeKind = "250" | "350" | "450";

/** Цена доп. опций (одна точка правды) */
export const MILK_PRICE: Record<MilkKind, number> = {
  regular: 0,
  oat: 30,
  almond: 40,
  "lactose-free": 30,
};
export const MILK_LABEL: Record<MilkKind, string> = {
  regular: "Обычное",
  oat: "Овсяное",
  almond: "Миндальное",
  "lactose-free": "Безлактозное",
};
export const SIZE_LABEL: Record<SizeKind, string> = {
  "250": "250 мл",
  "350": "350 мл",
  "450": "450 мл",
};
export const EXTRA_SHOT_PRICE = 80;

export interface CartLine {
  /** id корзинной строки — уникальный, даже если один и тот же товар с разными опциями */
  key: string;
  item: MenuItem;
  quantity: number;
  size?: SizeKind;
  milk?: MilkKind;
  extraShots?: number;
}

interface CartState {
  lines: CartLine[];
  /** Добавить в корзину. Если такая же комбинация уже есть — увеличиваем quantity. */
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  /** Изменить количество на конкретной строке (0 = удалить) */
  setQuantity: (key: string, quantity: number) => void;
  /** Инкремент/декремент */
  inc: (key: string) => void;
  dec: (key: string) => void;
  /** Удалить строку */
  remove: (key: string) => void;
  /** Очистить всё */
  clear: () => void;
}

/** Стабильный ключ для группировки одинаковых конфигураций */
function makeKey(l: Omit<CartLine, "key" | "quantity">): string {
  return [l.item.id, l.size ?? "-", l.milk ?? "-", l.extraShots ?? 0].join("|");
}

/** Стоимость одной единицы (с учётом опций) */
export function lineUnitPrice(l: Pick<CartLine, "item" | "milk" | "extraShots">): number {
  return l.item.basePrice + (l.milk ? MILK_PRICE[l.milk] : 0) + (l.extraShots ?? 0) * EXTRA_SHOT_PRICE;
}

/** Итого по строке */
export function lineTotal(l: CartLine): number {
  return lineUnitPrice(l) * l.quantity;
}

/** Общее количество товаров в корзине (для бейджика в шапке) */
export function selectTotalCount(s: CartState): number {
  return s.lines.reduce((sum, l) => sum + l.quantity, 0);
}

/** Общий подытог по корзине */
export function selectSubtotal(s: CartState): number {
  return s.lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (line, quantity = 1) =>
        set((state) => {
          const key = makeKey(line);
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, key, quantity }] };
        }),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: quantity <= 0
            ? state.lines.filter((l) => l.key !== key)
            : state.lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
        })),

      inc: (key) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l)),
        })),

      dec: (key) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.key === key ? { ...l, quantity: l.quantity - 1 } : l))
            .filter((l) => l.quantity > 0),
        })),

      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "dark-deed:cart:v1",
      storage: createJSONStorage(() => localStorage),
      // Persist только сам массив, не методы
      partialize: (s) => ({ lines: s.lines }),
    }
  )
);
