"use client";

/** ── ГЛАВНАЯ / МЕНЮ ─────────────────────────────
 *  Данные из Supabase (useMenu), fallback на локальный MENU.
 *  Все кнопки живые: промо → toast, «всё меню →» → скролл,
 *  вкладки категорий переключают, +/− корзины реальный.
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { KraftBackground } from "@/components/KraftBackground";
import { BottomNav } from "@/components/BottomNav";
import { ItemIcon } from "@/components/ItemIcon";
import { CATEGORIES } from "@/lib/menu";
import { useMenu } from "@/lib/api";
import { useCart, selectTotalCount } from "@/stores/cart-store";
import { tap } from "@/lib/haptic";
import { useToast } from "@/components/Toast";
import type { MenuItem, Category } from "@/lib/types";

function GoldPlus({ size = 38, onClick }: { size?: number; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #E8A664, #D4AF37)",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 6px 20px rgba(232, 166, 100, 0.35)",
        flexShrink: 0, border: "none", cursor: "pointer", padding: 0,
      }}
      aria-label="Добавить в корзину"
    >
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none"
        stroke="#1A0F0A" strokeWidth="3" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5"  y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  );
}

const PROMO_INFO: Record<string, { text: string; kind: "info" | "success" }> = {
  happy:   { text: "Happy Hours: −20% на всё после 21:00 применится автоматически", kind: "success" },
  bonus:   { text: "+50 бонусов начислим после первого оплаченного заказа", kind: "success" },
};

export default function MainPage() {
  const [activeCat, setActiveCat] = useState<Category>("espresso");
  const cartCount = useCart(selectTotalCount);
  const addToCart = useCart((s) => s.add);
  const menuList = useMenu();
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const items = useMemo(
    () => (menuList.data ?? []).filter((m) => m.category === activeCat),
    [menuList.data, activeCat]
  );
  const featured = useMemo(() => items.find((m) => m.featured) ?? items[0], [items]);
  const rest = useMemo(() => items.filter((m) => m.id !== featured?.id), [items, featured]);

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    tap("light");
    addToCart({
      item,
      size: item.customizable ? "350" : undefined,
      milk: item.customizable ? "regular" : undefined,
      extraShots: 0,
    });
    toast.show(`${item.name} — в корзине`, "success");
  };

  const scrollToMenu = () => {
    tap("light");
    menuScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)",
        display: "flex", flexDirection: "column",
        position: "relative", overflowX: "hidden",
      }}
    >
      <KraftBackground />

      {/* ── HEADER ─────────────────────────────── */}
      <div style={{ padding: "0 24px 8px", paddingTop: "calc(var(--top-inset) + 26px)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
        <div>
          <div className="microcaps" style={{ color: "#6B5A4C" }}>— {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })}</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 400, lineHeight: 1.05, marginTop: 6 }}>
            <span className="glow-cream">Доброе</span>{" "}
            <span className="glow-gold" style={{ fontStyle: "italic" }}>утро,</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, lineHeight: 1.05, fontStyle: "italic" }}>
            <span className="glow-cream">Гость</span>
          </div>
        </div>

        <Link href="/cart" onClick={() => tap("light")} style={{ position: "relative" }}>
          <div style={{ width: 46, height: 46, background: "rgba(44, 24, 16, 0.85)", border: "1px solid rgba(232, 166, 100, 0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 L3 6 L3 20 A2 2 0 0 0 5 22 L19 22 A2 2 0 0 0 21 20 L21 6 L18 2 Z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10 A4 4 0 0 1 8 10"/>
            </svg>
          </div>
          {cartCount > 0 && (
            <div style={{ position: "absolute", top: -3, right: -3, minWidth: 20, height: 20, padding: "0 5px", background: "#E8A664", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 700, color: "#1A0F0A", border: "2px solid #14090580", lineHeight: 1 }}>
              {cartCount}
            </div>
          )}
        </Link>
      </div>

      {/* ── PROMO CAROUSEL ─────────────────────── */}
      <div className="no-scrollbar" style={{ paddingLeft: 24, marginTop: 20, overflowX: "auto", overflowY: "hidden", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", gap: 12, paddingRight: 24 }}>

          <button
            type="button"
            onClick={() => { tap("light"); toast.show(PROMO_INFO.happy.text, PROMO_INFO.happy.kind); }}
            style={{ minWidth: 300, padding: "18px 20px", background: "linear-gradient(120deg, #2C1810 0%, #3D2515 45%, #1F1108 100%)", borderRadius: 6, border: "1px solid rgba(212, 175, 55, 0.4)", position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer" }}
          >
            <svg width="90" height="100" viewBox="0 0 90 100" style={{ position: "absolute", right: -8, top: -8, opacity: 0.35 }}>
              <path d="M20 80 Q16 60 25 45 Q34 30 25 15" stroke="#E8A664" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <path d="M45 90 Q40 68 50 52 Q60 36 50 20" stroke="#D4AF37" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <path d="M70 82 Q66 62 76 47 Q86 32 76 17" stroke="#E8A664" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
            <div style={{ position: "relative" }}>
              <div className="microcaps" style={{ color: "#D4AF37" }}>— HAPPY HOURS</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, fontStyle: "italic", color: "#F5E6D3", lineHeight: 1, marginTop: 6 }}>−20%</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: "italic", color: "#A69080", marginTop: 6 }}>на всё тёмное после 21:00</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { tap("light"); toast.show(PROMO_INFO.bonus.text, PROMO_INFO.bonus.kind); }}
            style={{ minWidth: 300, padding: "18px 20px", background: "linear-gradient(120deg, #2C1810 0%, #3D2515 45%, #1F1108 100%)", borderRadius: 6, border: "1px solid rgba(212, 175, 55, 0.25)", position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer" }}
          >
            <svg width="80" height="90" viewBox="0 0 80 90" style={{ position: "absolute", right: -4, top: -4, opacity: 0.3 }}>
              <polygon points="40 12 46 30 66 30 51 42 57 60 40 50 23 60 29 42 14 30 34 30" fill="none" stroke="#D4AF37" strokeWidth="1"/>
            </svg>
            <div style={{ position: "relative" }}>
              <div className="microcaps" style={{ color: "#D4AF37" }}>— ПРИВЕТСТВИЕ</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, fontStyle: "italic", color: "#F5E6D3", lineHeight: 1, marginTop: 6 }}>+50 ☕</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: "italic", color: "#A69080", marginTop: 6 }}>бонусов за первый заказ</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── CATEGORY TABS ──────────────────────── */}
      <div style={{ padding: "16px 24px 0", display: "flex", alignItems: "baseline", gap: 22, position: "relative", zIndex: 2 }}>
        {CATEGORIES.map((cat) => {
          const active = cat.key === activeCat;
          return (
            <button
              type="button"
              key={cat.key}
              onClick={() => { setActiveCat(cat.key); tap("light"); }}
              style={{
                fontFamily: "'Playfair Display', serif", fontSize: 24, fontStyle: "italic",
                fontWeight: active ? 700 : 400,
                color: active ? "#F5E6D3" : "#A69080",
                textShadow: active ? "0 0 20px rgba(232, 166, 100, 0.5), 0 0 4px rgba(232, 166, 100, 0.3)" : undefined,
                background: "transparent", border: "none", padding: 0, cursor: "pointer", position: "relative",
              }}
            >
              {cat.label}
              {active && <div style={{ height: 2, background: "#E8A664", marginTop: 2, width: 32 }}/>}
            </button>
          );
        })}
      </div>

      {/* ── SECTION LABEL ──────────────────────── */}
      <div style={{ padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div className="microcaps">— Хит категории</div>
        <button type="button" onClick={scrollToMenu} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "#E8A664", textShadow: "0 0 12px rgba(232, 166, 100, 0.35)" }}>
          {items.length} {items.length === 1 ? "позиция" : items.length < 5 ? "позиции" : "позиций"} →
        </button>
      </div>

      {/* ── SCROLLABLE MENU ──────────────────── */}
      <div
        ref={menuScrollRef}
        className="no-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "0 24px 8px", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 10 }}
      >
        {menuList.isLoading && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#A69080", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            Загружаем меню...
          </div>
        )}

        {featured && (
          <Link ref={featuredRef as unknown as React.RefObject<HTMLAnchorElement>} href={`/product/${featured.id}`} onClick={() => tap("light")} style={{ textDecoration: "none" }}>
            <div className="glass" style={{ borderRadius: 24, padding: 18, display: "flex", gap: 4, position: "relative", overflow: "hidden", marginBottom: 6 }}>
              <div style={{ position: "absolute", left: -20, top: -20, width: 180, height: 180, background: "radial-gradient(circle, rgba(232, 166, 100, 0.28) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%)", pointerEvents: "none" }}/>

              <div style={{ width: 130, height: 150, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ItemIcon variant={featured.icon} size={100} />
              </div>

              <div style={{ flex: 1, padding: "4px 4px 4px 8px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                <div>
                  <div className="microcaps" style={{ color: "#D4AF37" }}>N°{String(featured.id).padStart(2, "0")} · РЕКОМЕНДУЕМ</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3", lineHeight: 1.05, marginTop: 8 }}>{featured.name}</div>
                  {featured.subtitle && (
                    <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 18, fontWeight: 400, color: "#E8A664", lineHeight: 1, marginTop: 2 }}>{featured.subtitle}</div>
                  )}
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "#A69080", marginTop: 8, lineHeight: 1.3 }}>{featured.description}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 26, fontWeight: 700, color: "#E8A664" }}>
                    {featured.price}<span style={{ fontSize: 14, color: "#A69080", fontStyle: "normal" }}> ₽</span>
                  </div>
                  <GoldPlus size={38} onClick={(e) => handleQuickAdd(e, featured)} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {rest.map((item) => (
          <Link href={`/product/${item.id}`} key={item.id} onClick={() => tap("light")} style={{ textDecoration: "none" }}>
            <div className="glass" style={{ borderRadius: 16, padding: "8px 12px 8px 8px", display: "flex", gap: 12, alignItems: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ width: 62, height: 62, flexShrink: 0, borderRadius: 12, background: "radial-gradient(circle at 40% 40%, rgba(58, 36, 21, 0.55), rgba(20, 10, 5, 0.4))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(232, 166, 100, 0.25), transparent 65%)", pointerEvents: "none" }}/>
                <ItemIcon variant={item.icon} size={42} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="microcaps" style={{ fontSize: "8.5px", letterSpacing: 2, opacity: 0.7 }}>N°{String(item.id).padStart(2, "0")}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#F5E6D3", fontWeight: 600, lineHeight: 1 }}>{item.name}</span>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12, color: "#A69080", marginTop: 3, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 18, color: "#E8A664", fontWeight: 700 }}>{item.price} ₽</span>
                <GoldPlus size={28} onClick={(e) => handleQuickAdd(e, item)} />
              </div>
            </div>
          </Link>
        ))}

        {!menuList.isLoading && items.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#A69080", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            В этой категории пока пусто
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
