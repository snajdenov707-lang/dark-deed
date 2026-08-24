"use client";

/** ── КАРТОЧКА ТОВАРА ────────────────────────────
 *  - Реальный товар из [id] (getMenuItem)
 *  - Локальный state опций: size, milk, extraShots, quantity
 *  - Динамическая цена (lineUnitPrice)
 *  - «Заказать» → добавляет в корзину и переходит в /cart
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { KraftBackground } from "@/components/KraftBackground";
import { ItemIcon } from "@/components/ItemIcon";
import { getMenuItem } from "@/lib/menu";
import {
  useCart,
  lineUnitPrice,
  MILK_PRICE,
  MILK_LABEL,
  SIZE_LABEL,
  EXTRA_SHOT_PRICE,
  type MilkKind,
  type SizeKind,
} from "@/stores/cart-store";
import { tap, notify } from "@/lib/haptic";

const SIZES: SizeKind[] = ["250", "350", "450"];
const MILKS: MilkKind[] = ["regular", "oat", "almond", "lactose-free"];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const item = useMemo(() => getMenuItem(id), [id]);

  const [size, setSize] = useState<SizeKind>("350");
  const [milk, setMilk] = useState<MilkKind>("regular");
  const [extraShots, setExtraShots] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const add = useCart((s) => s.add);

  // Если товар не найден — предложим вернуться в меню
  if (!item) {
    return (
      <div style={{ width: "100%", minHeight: "100dvh", background: "#1A0F0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F5E6D3", fontStyle: "italic" }}>Позиция не найдена</div>
        <div style={{ fontSize: 13, color: "#A69080", fontFamily: "'Cormorant Garamond', serif" }}>id={params?.id}</div>
        <Link href="/main" style={{ padding: "12px 28px", background: "linear-gradient(135deg, #E8A664, #D4AF37)", color: "#1A0F0A", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>
          К меню
        </Link>
      </div>
    );
  }

  const customizable = item.customizable ?? false;
  const unit = lineUnitPrice({
    item,
    milk: customizable ? milk : undefined,
    extraShots: customizable ? extraShots : 0,
  });
  const total = unit * quantity;

  const handleAdd = () => {
    tap("medium");
    add(
      {
        item,
        size: customizable ? size : undefined,
        milk: customizable ? milk : undefined,
        extraShots: customizable ? extraShots : 0,
      },
      quantity
    );
    notify("success");
    router.push("/cart");
  };

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      {/* HEADER */}
      <div style={{ padding: "0 20px 0", paddingTop: "calc(var(--top-inset) + 22px)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 3 }}>
        <Link href="/main" onClick={() => tap("light")}>
          <div style={{ width: 44, height: 44, background: "rgba(44, 24, 16, 0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(232, 166, 100, 0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </div>
        </Link>
        <div className="microcaps" style={{ color: "#6B5A4C" }}>N°{String(item.id).padStart(2, "0")} · {item.category === "espresso" ? "ЭСПРЕССО-БАР" : item.category === "alternative" ? "АЛЬТЕРНАТИВА" : "ДЕСЕРТЫ"}</div>
        <div style={{ width: 44, height: 44, background: "rgba(44, 24, 16, 0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(232, 166, 100, 0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#E8A664" stroke="#E8A664" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>

      {/* HERO CARD */}
      <div style={{ padding: "8px 20px 0", position: "relative", zIndex: 2 }}>
        <div className="glass" style={{ background: "rgba(15, 8, 4, 0.55)", backdropFilter: "blur(10px)", borderRadius: 28, padding: "20px 16px 12px", position: "relative", overflow: "hidden", height: 260 }}>
          <div style={{ position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)", width: 160, height: 160, background: "radial-gradient(circle, rgba(232, 166, 100, 0.18) 0%, rgba(212, 175, 55, 0.04) 40%, transparent 60%)", pointerEvents: "none" }}/>

          <div style={{ position: "absolute", top: 10, left: 16, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 130, fontWeight: 900, color: "rgba(232, 166, 100, 0.08)", lineHeight: 0.7, letterSpacing: -6, pointerEvents: "none", userSelect: "none" }}>
            {String(item.id).padStart(2, "0")}
          </div>

          <div style={{ position: "absolute", top: 18, right: 18, background: "rgba(20, 9, 5, 0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(212, 175, 55, 0.35)", borderRadius: 999, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, zIndex: 3 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#D4AF37"><polygon points="12 2 15 9 22 9 17 14 19 22 12 17 5 22 7 14 2 9 9 9"/></svg>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "#D4AF37", fontWeight: 700 }}>9.7</span>
            <span className="microcaps" style={{ color: "#A69080", letterSpacing: 1.5, fontSize: 9 }}>248</span>
          </div>

          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <ItemIcon variant={item.icon} size={170} />
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div style={{ padding: "8px 28px 4px", textAlign: "left", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#F5E6D3", lineHeight: 1, letterSpacing: "-0.5px" }}>{item.name}</div>
            {item.subtitle && (
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, fontWeight: 400, color: "#E8A664", lineHeight: 1.1, marginTop: 2 }}>{item.subtitle}</div>
            )}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: 32, color: "#E8A664", lineHeight: 1 }}>
            {unit}<span style={{ fontSize: 15, color: "#A69080", fontStyle: "normal", fontWeight: 400 }}>₽</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080", marginTop: 8, lineHeight: 1.4 }}>
          {item.description}
        </div>
      </div>

      <div className="gold-line" style={{ margin: "14px 28px 0" }}/>

      {/* CUSTOMIZATION */}
      <div className="no-scrollbar" style={{ padding: "14px 24px 0", flex: 1, overflowY: "auto", overflowX: "hidden" }}>

        {customizable && (
          <>
            {/* Size */}
            <div style={{ marginBottom: 14 }}>
              <div className="microcaps" style={{ marginBottom: 10 }}>— Объём</div>
              <div style={{ display: "flex", gap: 8 }}>
                {SIZES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => { setSize(s); tap("light"); }}
                    className={s === size ? "opt-on" : "opt"}
                    style={{ flex: 1, textAlign: "center", cursor: "pointer" }}
                  >
                    {SIZE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Milk */}
            <div style={{ marginBottom: 10 }}>
              <div className="microcaps" style={{ marginBottom: 10 }}>— Молоко</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MILKS.map((m) => {
                  const p = MILK_PRICE[m];
                  return (
                    <button
                      type="button"
                      key={m}
                      onClick={() => { setMilk(m); tap("light"); }}
                      className={m === milk ? "opt-on" : "opt"}
                      style={{ cursor: "pointer" }}
                    >
                      {MILK_LABEL[m]}{p > 0 && (
                        <span style={{ opacity: m === milk ? 0.75 : 0.6, fontWeight: 500, fontSize: 11, marginLeft: 4 }}>
                          +{p}₽
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extra shots */}
            <div className="glass" style={{ marginTop: 8, borderRadius: 16, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#F5E6D3", fontWeight: 500 }}>Экстра шот</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12, color: "#A69080", marginTop: 2 }}>+{EXTRA_SHOT_PRICE} ₽ за шот</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button type="button" onClick={() => { setExtraShots(Math.max(0, extraShots - 1)); tap("light"); }} className="glass" style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A69080" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#E8A664", fontWeight: 700, minWidth: 16, textAlign: "center" }}>{extraShots}</span>
                <button type="button" onClick={() => { setExtraShots(extraShots + 1); tap("light"); }} style={{ width: 28, height: 28, background: "linear-gradient(135deg, #E8A664, #D4AF37)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(232, 166, 100, 0.3)", border: "none", cursor: "pointer" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
          </>
        )}

        {!customizable && (
          <div style={{ padding: "14px 4px", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080", textAlign: "center" }}>
            Готовое блюдо — без опций
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <div style={{ padding: "12px 20px 22px", display: "flex", gap: 10, alignItems: "center", background: "linear-gradient(180deg, transparent, #0A0503 50%)", position: "relative", zIndex: 2 }}>
        {/* Quantity control */}
        <div style={{ width: 100, height: 54, background: "rgba(44, 24, 16, 0.9)", border: "1px solid rgba(232, 166, 100, 0.35)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
          <button type="button" onClick={() => { setQuantity(Math.max(1, quantity - 1)); tap("light"); }} style={{ background: "transparent", border: "none", color: "#A69080", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>−</button>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, fontWeight: 700, color: "#F5E6D3", lineHeight: 1 }}>{quantity}</span>
          <button type="button" onClick={() => { setQuantity(quantity + 1); tap("light"); }} style={{ background: "transparent", border: "none", color: "#E8A664", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>+</button>
        </div>
        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAdd}
          style={{ flex: 1, height: 54, background: "linear-gradient(135deg, #E8A664, #D4AF37)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", boxShadow: "0 8px 24px rgba(232, 166, 100, 0.25)", border: "none", cursor: "pointer" }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span className="microcaps" style={{ color: "rgba(26, 15, 10, 0.6)", letterSpacing: 1.5, fontSize: 9 }}>В корзину</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#1A0F0A", lineHeight: 1 }}>Добавить</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, fontWeight: 700, color: "#1A0F0A" }}>{total} ₽</span>
        </button>
      </div>
    </div>
  );
}
