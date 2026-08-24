"use client";

/** ── ПОИСК ──────────────────────────────────────
 *  Реальный текстовый фильтр по имени/подзаголовку/описанию.
 *  Показывает подсказки: избранное + категории.
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useMemo, useState } from "react";
import { KraftBackground } from "@/components/KraftBackground";
import { BottomNav } from "@/components/BottomNav";
import { ItemIcon } from "@/components/ItemIcon";
import { useMenu } from "@/lib/api";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/menu";
import { useCart } from "@/stores/cart-store";
import { useFavorites } from "@/stores/favorites-store";
import { tap } from "@/lib/haptic";
import { useToast } from "@/components/Toast";
import type { MenuItem } from "@/lib/types";

function GoldPlus({ size = 28, onClick }: { size?: number; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #E8A664, #D4AF37)",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(232, 166, 100, 0.3)",
        flexShrink: 0, border: "none", cursor: "pointer", padding: 0,
      }}
    >
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none"
        stroke="#1A0F0A" strokeWidth="3" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  );
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е").trim();
}

export default function SearchPage() {
  const menuQ = useMenu();
  const [q, setQ] = useState("");
  const add = useCart((s) => s.add);
  const favIds = useFavorites((s) => s.ids);
  const toast = useToast();

  const results = useMemo(() => {
    const menu = menuQ.data ?? [];
    const query = normalize(q);
    if (!query) return [] as MenuItem[];
    return menu.filter((m) => {
      const hay = normalize([m.name, m.subtitle ?? "", m.description, CATEGORY_LABEL[m.category]].join(" "));
      return hay.includes(query);
    });
  }, [menuQ.data, q]);

  const favorites = useMemo(() =>
    (menuQ.data ?? []).filter((m) => favIds.includes(m.id))
  , [menuQ.data, favIds]);

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

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      {/* HEADER */}
      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
        <Link href="/main" onClick={() => tap("light")}>
          <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
        </Link>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Поиск</div>
      </div>

      {/* SEARCH INPUT */}
      <div style={{ padding: "8px 20px 12px", position: "relative", zIndex: 2 }}>
        <div className="glass" style={{ borderRadius: 999, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Раф, латте, круассан..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5E6D3", fontFamily: "'Manrope', sans-serif", fontSize: 14 }}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} style={{ background: "transparent", border: "none", color: "#A69080", cursor: "pointer", padding: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 20px 8px", position: "relative", zIndex: 2 }}>
        {q === "" ? (
          <>
            {/* Категории — быстрые фильтры */}
            <div style={{ marginBottom: 20 }}>
              <div className="microcaps" style={{ marginBottom: 12 }}>— Категории</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => { setQ(CATEGORY_LABEL[cat.key]); tap("light"); }}
                    className="opt"
                    style={{ cursor: "pointer" }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Избранное */}
            {favorites.length > 0 && (
              <div>
                <div className="microcaps" style={{ marginBottom: 12 }}>— Избранное</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {favorites.map((item) => (
                    <SearchRow key={item.id} item={item} onAdd={(e) => handleAdd(e, item)} />
                  ))}
                </div>
              </div>
            )}

            {favorites.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#A69080", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14 }}>
                Начни вводить или тапни категорию
              </div>
            )}
          </>
        ) : (
          <>
            <div className="microcaps" style={{ marginBottom: 12 }}>— Найдено: {results.length}</div>
            {results.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#A69080", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                Ничего не найдено по «{q}»
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.map((item) => (
                  <SearchRow key={item.id} item={item} onAdd={(e) => handleAdd(e, item)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  );
}

function SearchRow({ item, onAdd }: { item: MenuItem; onAdd: (e: React.MouseEvent) => void }) {
  return (
    <Link href={`/product/${item.id}`} onClick={() => tap("light")} style={{ textDecoration: "none" }}>
      <div className="glass" style={{ borderRadius: 16, padding: "8px 12px 8px 8px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 62, height: 62, flexShrink: 0, borderRadius: 12, background: "radial-gradient(circle at 40% 40%, rgba(58, 36, 21, 0.55), rgba(20, 10, 5, 0.4))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(232, 166, 100, 0.25), transparent 65%)", pointerEvents: "none" }}/>
          <ItemIcon variant={item.icon} size={42} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#F5E6D3", fontWeight: 600, lineHeight: 1 }}>{item.name}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12, color: "#A69080", marginTop: 3, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 18, color: "#E8A664", fontWeight: 700 }}>{item.price} ₽</span>
          <GoldPlus size={28} onClick={onAdd} />
        </div>
      </div>
    </Link>
  );
}
