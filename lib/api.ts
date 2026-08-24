"use client";

/** ── API layer ──────────────────────────────────
 *  React Query hooks для работы с Supabase.
 *   - useMenu()         — 14 позиций из БД (fallback: локальный MENU)
 *   - useCreateOrder()  — insert в orders + order_items
 *   - useActiveOrder()  — последний свой заказ (не выданный)
 *   - useCancelOrder()  — статус → cancelled
 *   - useValidatePromo() — проверка кода
 ─────────────────────────────────────────────── */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./supabase-browser";
import { MENU as LOCAL_MENU } from "./menu";
import type { MenuItem, Category, IconVariant } from "./types";
import type { CartLine, MilkKind, SizeKind } from "@/stores/cart-store";
import { lineUnitPrice } from "@/stores/cart-store";

// ── MENU ────────────────────────────────────
interface DbMenuItem {
  id: number;
  name: string;
  subtitle: string | null;
  description: string;
  price: string; // numeric приходит строкой
  base_price: string;
  category: Category;
  icon: string;
  featured: boolean;
  customizable: boolean;
  position: number;
}

function mapMenuRow(r: DbMenuItem): MenuItem {
  return {
    id: r.id,
    name: r.name,
    subtitle: r.subtitle ?? undefined,
    description: r.description,
    price: Number(r.price),
    basePrice: Number(r.base_price),
    category: r.category,
    icon: r.icon as IconVariant,
    featured: r.featured,
    customizable: r.customizable,
  };
}

export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async (): Promise<MenuItem[]> => {
      const { data, error } = await getSupabase()
        .from("menu_items")
        .select("id,name,subtitle,description,price,base_price,category,icon,featured,customizable,position")
        .eq("is_active", true)
        .order("category")
        .order("position");
      if (error) {
        console.warn("[useMenu] falling back to local MENU:", error.message);
        return LOCAL_MENU;
      }
      return (data as unknown as DbMenuItem[]).map(mapMenuRow);
    },
    staleTime: 60_000, // меню редко меняется
  });
}

// ── ORDERS ──────────────────────────────────
export interface CreateOrderInput {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  method: "pickup" | "table";
  paymentMethod: "sbp" | "card" | "bonus";
  scheduledTime?: string;
  comment?: string;
  promoCode?: string;
  bonusUsed?: number;
}

export interface DbOrder {
  id: string;
  order_number: string;
  subtotal: string;
  discount: string;
  total: string;
  method: "pickup" | "table";
  payment_method: "sbp" | "card" | "bonus";
  scheduled_time: string | null;
  comment: string | null;
  status: "accepted" | "preparing" | "ready" | "issued" | "cancelled";
  promo_code: string | null;
  bonus_used: number;
  bonus_earned: number;
  created_at: string;
  order_items?: DbOrderItem[];
}

export interface DbOrderItem {
  id: string;
  menu_item_id: number;
  menu_item_name: string;
  quantity: number;
  size: SizeKind | null;
  milk: MilkKind | null;
  extra_shots: number;
  unit_price: string;
  total_price: string;
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<DbOrder> => {
      const sb = getSupabase();
      const { data: userData } = await sb.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error("not_authenticated");

      // RPC для номера заказа (или атомарный insert с RETURNING)
      const { data: numRow, error: numErr } = await sb
        .rpc("next_order_number")
        .single();
      if (numErr) throw numErr;
      const orderNumber = numRow as unknown as string;

      // 1. Вставляем order
      const bonusEarned = Math.round(input.total * 0.035);
      const { data: order, error: orderErr } = await sb
        .from("orders")
        .insert({
          user_id: userId,
          order_number: orderNumber,
          subtotal: input.subtotal,
          discount: input.discount,
          total: input.total,
          method: input.method,
          payment_method: input.paymentMethod,
          scheduled_time: input.scheduledTime ?? null,
          comment: input.comment ?? null,
          promo_code: input.promoCode ?? null,
          bonus_used: input.bonusUsed ?? 0,
          bonus_earned: bonusEarned,
          status: "accepted",
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // 2. Вставляем order_items
      const items = input.lines.map((l) => ({
        order_id: order.id,
        menu_item_id: l.item.id,
        menu_item_name: l.item.name + (l.item.subtitle ? ` ${l.item.subtitle}` : ""),
        quantity: l.quantity,
        size: l.size ?? null,
        milk: l.milk ?? null,
        extra_shots: l.extraShots ?? 0,
        unit_price: lineUnitPrice(l),
        total_price: lineUnitPrice(l) * l.quantity,
      }));
      const { error: itemsErr } = await sb.from("order_items").insert(items);
      if (itemsErr) throw itemsErr;

      qc.invalidateQueries({ queryKey: ["active-order"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      return order as DbOrder;
    },
  });
}

export function useActiveOrder() {
  return useQuery({
    queryKey: ["active-order"],
    queryFn: async (): Promise<(DbOrder & { order_items: DbOrderItem[] }) | null> => {
      const sb = getSupabase();
      const { data: userData } = await sb.auth.getUser();
      if (!userData?.user?.id) return null;

      const { data, error } = await sb
        .from("orders")
        .select("*, order_items(*)")
        .in("status", ["accepted", "preparing", "ready"])
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as (DbOrder & { order_items: DbOrderItem[] }) | undefined) ?? null;
    },
    // Опрос каждые 10 сек — чтобы статус обновлялся сам
    refetchInterval: 10_000,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await getSupabase()
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["active-order"] });
    },
  });
}

// ── PROMO ───────────────────────────────────
export interface PromoValidation {
  valid: boolean;
  discountAmount: number;
  reason?: string;
  code?: string;
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }): Promise<PromoValidation> => {
      const { data, error } = await getSupabase()
        .from("promo_codes")
        .select("code, discount_type, discount_value, expires_at, is_active, max_uses, used_count")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (error) return { valid: false, discountAmount: 0, reason: error.message };
      if (!data) return { valid: false, discountAmount: 0, reason: "Промокод не найден" };
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, discountAmount: 0, reason: "Промокод истёк" };
      }
      if (data.max_uses != null && data.used_count >= data.max_uses) {
        return { valid: false, discountAmount: 0, reason: "Лимит использований исчерпан" };
      }
      const discountAmount = data.discount_type === "percent"
        ? Math.round(subtotal * Number(data.discount_value) / 100)
        : Number(data.discount_value);
      return { valid: true, discountAmount, code: data.code };
    },
  });
}
