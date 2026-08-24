"use client";

/** ── ИЗБРАННОЕ ──────────────────────────────────
 *  Список сохранённых через сердечко позиций.
 *  Пусто → CTA «К меню».
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useMemo } from "react";
import { KraftBackground } from "@/components/KraftBackground";
import { BottomNav } from "@/components/BottomNav";
import { ItemIcon } from "@/components/ItemIcon";
import { useMenu } from "@/lib/api";
import { useFavorites } from "@/stores/favorites-store";
import { useCart } from "@/stores/cart-store";
import { tap } from "@/lib/haptic";
import { useToast } from "@/components/Toast";
import type { MenuItem } from "@/lib/types";

export default function FavoritesPage() {
  const menuQ = useMenu();
  const favIds = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const add = useCart((s) => s.add);
  const toast = useToast();

  const items = useMemo(
    () => (menuQ.data ?? []).filter((m) => favIds.includes(m.id)),
    [menuQ.data, favIds]
  );

  const handleAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault(); e.stopPropagation();
    tap("light");
    add({
      item,
      size: item.customizable ? "350" : undefined,
      milk: item.customizable ? "regular" : undefined,
      extraShots: 0,
    });
    toast.show(`${item.name} — в корзине`, "success");
  };

  const handleUnfav = (e: React.MouseEvent, id: number, name: string) => {
    e.preventDefault(); e.stopPropagation();
    tap("light");
    toggle(id);
    toast.show(`${name} убрано из избранного`, "info");
  };

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
        <Link href="/profile" onClick={() => tap("light")}>
          <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
        </Link>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Избранное</div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px 20px 8px", position: "relative", zIndex: 2 }}>
        {items.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>♡</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#F5E6D3" }}>Пусто</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080", marginTop: 8, marginBottom: 22 }}>Тапни ♡ на любой карточке товара</div>
            <Link href="/main" onClick={() => tap("light")} style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, #E8A664, #D4AF37)", color: "#1A0F0A", borderRadius: 14, fontWeight: 700, textDecoration: "none" }}>
              К меню
            </Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} onClick={() => tap("light")} style={{ textDecoration: "none" }}>
              <div className="glass" style={{ borderRadius: 16, padding: "8px 12px 8px 8px", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 62, height: 62, flexShrink: 0, borderRadius: 12, background: "radial-gradient(circle at 40% 40%, rgba(58, 36, 21, 0.55), rgba(20, 10, 5, 0.4))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(232, 166, 100, 0.25), transparent 65%)", pointerEvents: "none" }}/>
                  <ItemIcon variant={item.icon} size={42} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#F5E6D3", fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12, color: "#A69080", marginTop: 3 }}>{item.price} ₽</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button type="button" onClick={(e) => handleUnfav(e, item.id, item.name)} style={{ width: 32, height: 32, borderRadius: "50%", background: "transparent", border: "1px solid rgba(232, 166, 100, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }} aria-label="Убрать из избранного">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E8A664" stroke="#E8A664" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <button type="button" onClick={(e) => handleAdd(e, item)} style={{ width: 32, height: 32, background: "linear-gradient(135deg, #E8A664, #D4AF37)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(232, 166, 100, 0.3)", border: "none", cursor: "pointer", padding: 0 }} aria-label="В корзину">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
