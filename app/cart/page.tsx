"use client";

/** ── КОРЗИНА ────────────────────────────────────
 *  - Читает реальные позиции из useCart
 *  - Кнопки +/− работают (inc/dec/remove при 0)
 *  - «Очистить» — очищает всю корзину
 *  - Если пусто — заглушка + кнопка «К меню»
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useState } from "react";
import { KraftBackground } from "@/components/KraftBackground";
import { ItemIcon } from "@/components/ItemIcon";
import { useValidatePromo } from "@/lib/api";
import { useToast } from "@/components/Toast";
import {
  useCart,
  selectSubtotal,
  lineTotal,
  MILK_LABEL,
  SIZE_LABEL,
} from "@/stores/cart-store";
import { tap, notify } from "@/lib/haptic";

/** Формирование подстрочника "350 мл · овсяное · 1 экстра шот" */
function lineNote(line: {
  size?: "250" | "350" | "450";
  milk?: "regular" | "oat" | "almond" | "lactose-free";
  extraShots?: number;
}) {
  const parts: string[] = [];
  if (line.size) parts.push(SIZE_LABEL[line.size]);
  if (line.milk) parts.push(MILK_LABEL[line.milk].toLowerCase());
  if (line.extraShots && line.extraShots > 0) {
    const s = line.extraShots > 1 ? `${line.extraShots} экстра шота` : "1 экстра шот";
    parts.push(s);
  }
  return parts.join(" · ");
}

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const validate = useValidatePromo();
  const toast = useToast();

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    tap("light");
    try {
      const res = await validate.mutateAsync({ code, subtotal });
      if (res.valid) {
        setAppliedPromo({ code: res.code ?? code, discount: res.discountAmount });
        notify("success");
        toast.show(`Промокод «${res.code}» применён: −${res.discountAmount} ₽`, "success");
        setPromoInput("");
      } else {
        notify("error");
        toast.show(res.reason ?? "Промокод не действует", "error");
      }
    } catch (err) {
      toast.show("Ошибка проверки промокода", "error");
    }
  };

  const discount = appliedPromo?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const bonus = Math.round(total * 0.035);

  // ── Пустая корзина ──
  if (lines.length === 0) {
    return (
      <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
        <KraftBackground />
        <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 2 }}>
          <Link href="/main" onClick={() => tap("light")}>
            <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
          </Link>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Корзина</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32, textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(232, 166, 100, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(232, 166, 100, 0.2)" }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 L3 6 L3 20 A2 2 0 0 0 5 22 L19 22 A2 2 0 0 0 21 20 L21 6 L18 2 Z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10 A4 4 0 0 1 8 10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#F5E6D3", fontWeight: 600 }}>Пусто</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080", marginTop: 6 }}>Выбери что-нибудь тёмное</div>
          </div>
          <Link href="/main" style={{ padding: "14px 32px", background: "linear-gradient(135deg, #E8A664, #D4AF37)", color: "#1A0F0A", borderRadius: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 18px rgba(232, 166, 100, 0.3)" }}>
            К меню
          </Link>
        </div>
      </div>
    );
  }

  const totalCount = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      {/* HEADER */}
      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/main" onClick={() => tap("light")}>
            <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
          </Link>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Корзина</div>
            <div style={{ fontSize: 12, color: "#A69080", marginTop: 2 }}>
              {totalCount} {totalCount === 1 ? "позиция" : totalCount < 5 ? "позиции" : "позиций"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { clear(); notify("warning"); }}
          style={{ fontSize: 12, color: "#A69080", textDecoration: "underline", background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
        >
          Очистить
        </button>
      </div>

      {/* ITEMS */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "4px 20px", position: "relative", zIndex: 2 }}>
        {lines.map((line) => (
          <div
            key={line.key}
            style={{ background: "#2C1810", borderRadius: 20, padding: 14, display: "flex", gap: 14, marginBottom: 12 }}
          >
            <div style={{ width: 72, height: 72, borderRadius: 14, background: "linear-gradient(180deg, #3A2415, #2C1810)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ItemIcon variant={line.item.icon} size={52} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#F5E6D3", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {line.item.name}{line.item.subtitle && ` ${line.item.subtitle}`}
                </div>
                {lineNote(line) && (
                  <div style={{ fontSize: 11, color: "#A69080", marginTop: 3 }}>{lineNote(line)}</div>
                )}
                {!lineNote(line) && (
                  <div style={{ fontSize: 11, color: "#A69080", marginTop: 3 }}>{line.item.description}</div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#E8A664", fontWeight: 700 }}>
                  {lineTotal(line)} ₽
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => { dec(line.key); tap("light"); }}
                    style={{ width: 26, height: 26, background: "#1A0F0A", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label="Уменьшить"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A69080" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#F5E6D3", fontWeight: 600, minWidth: 14, textAlign: "center" }}>{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => { inc(line.key); tap("light"); }}
                    style={{ width: 26, height: 26, background: "#E8A664", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", padding: 0 }}
                    aria-label="Увеличить"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Promo — рабочий */}
        {appliedPromo ? (
          <div style={{ background: "#2C1810", border: "1px solid rgba(232, 166, 100, 0.4)", borderRadius: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><line x1="12" y1="22" x2="12" y2="7"/>
              </svg>
              <div>
                <div style={{ fontSize: 13, color: "#F5E6D3", fontWeight: 600 }}>{appliedPromo.code}</div>
                <div style={{ fontSize: 11, color: "#7A9670" }}>−{appliedPromo.discount} ₽</div>
              </div>
            </div>
            <button type="button" onClick={() => { setAppliedPromo(null); tap("light"); }} style={{ background: "transparent", border: "none", color: "#A69080", fontSize: 12, cursor: "pointer" }}>Убрать</button>
          </div>
        ) : (
          <div style={{ background: "#2C1810", borderRadius: 16, padding: "10px 12px 10px 16px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><line x1="12" y1="22" x2="12" y2="7"/>
            </svg>
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") handleApplyPromo(); }}
              placeholder="Промокод"
              autoCapitalize="characters"
              spellCheck={false}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5E6D3", fontFamily: "'Manrope', sans-serif", fontSize: 13, padding: "4px 0" }}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoInput.trim() || validate.isPending}
              style={{
                padding: "8px 14px", borderRadius: 10,
                background: promoInput.trim() ? "linear-gradient(135deg, #E8A664, #D4AF37)" : "#3A2415",
                color: promoInput.trim() ? "#1A0F0A" : "#6B5A4C",
                fontSize: 12, fontWeight: 600, border: "none",
                cursor: promoInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              {validate.isPending ? "..." : "Применить"}
            </button>
          </div>
        )}

        {/* Bonus hint */}
        <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A69080" }}>
          <span>После покупки начислим</span>
          <span style={{ color: "#D4AF37", fontWeight: 600 }}>+{bonus} ☕</span>
        </div>
      </div>

      {/* SUMMARY + CTA */}
      <div style={{ padding: "16px 20px", paddingBottom: "calc(var(--safe-bottom) + 24px)", background: "#2C1810", borderRadius: "24px 24px 0 0", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#A69080" }}>
          <span>Подытог</span>
          <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#7A9670" }}>
            <span>Скидка ({appliedPromo?.code})</span>
            <span>−{discount.toLocaleString("ru-RU")} ₽</span>
          </div>
        )}
        <div style={{ height: 1, background: "rgba(166, 144, 128, 0.15)", marginBottom: 14 }}/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#F5E6D3", fontWeight: 600 }}>Итого</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#E8A664", fontWeight: 700 }}>
            {total.toLocaleString("ru-RU")} ₽
          </span>
        </div>
        <Link
          href={`/checkout${appliedPromo ? `?promo=${encodeURIComponent(appliedPromo.code)}&discount=${appliedPromo.discount}` : ""}`}
          onClick={() => tap("medium")}
          style={{ display: "flex", height: 52, background: "#E8A664", borderRadius: 16, alignItems: "center", justifyContent: "center", textDecoration: "none" }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1A0F0A" }}>Оформить заказ</span>
        </Link>
      </div>
    </div>
  );
}
