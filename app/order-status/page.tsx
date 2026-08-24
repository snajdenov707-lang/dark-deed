"use client";

/** ── СТАТУС ЗАКАЗА ──────────────────────────────
 *  - Читает последний оплаченный заказ из sessionStorage
 *  - При маунте — чистит корзину (заказ уже оплачен)
 *  - Пустое состояние если заказов нет
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { KraftBackground } from "@/components/KraftBackground";
import { useCart, lineTotal, MILK_LABEL, SIZE_LABEL, type CartLine } from "@/stores/cart-store";
import type { MenuItem } from "@/lib/types";

interface StoredOrder {
  id: string;
  createdAt: string;
  lines: CartLine[];
  total: number;
  method: "pickup" | "table";
  payment: "sbp" | "card" | "bonus";
  time: string;
}

const STEPS = [
  { key: "accepted",  label: "Принят"  },
  { key: "preparing", label: "Готовим" },
  { key: "ready",     label: "Готов"   },
  { key: "issued",    label: "Выдан"   },
];

function stepStatus(currentIdx: number, i: number): "done" | "active" | "pending" {
  if (i < currentIdx) return "done";
  if (i === currentIdx) return "active";
  return "pending";
}

function StepIcon({ status }: { status: string }) {
  if (status === "done") {
    return (
      <div style={{ width: 28, height: 28, background: "#7A9670", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div style={{ width: 32, height: 32, background: "#E8A664", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px rgba(232, 166, 100, 0.25)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width: 28, height: 28, background: "rgba(166, 144, 128, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A69080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 L3 6 L3 20 A2 2 0 0 0 5 22 L19 22 A2 2 0 0 0 21 20 L21 6 L18 2 Z"/>
      </svg>
    </div>
  );
}

function lineNote(item: MenuItem, line: CartLine) {
  const parts: string[] = [];
  if (line.size) parts.push(SIZE_LABEL[line.size]);
  if (line.milk) parts.push(MILK_LABEL[line.milk].toLowerCase());
  if (line.extraShots && line.extraShots > 0) parts.push(`+${line.extraShots} шот`);
  return parts.length ? parts.join(" · ") : item.description;
}

export default function OrderStatusPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const clear = useCart((s) => s.clear);

  // Читаем последний заказ + чистим корзину на маунте
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("dark-deed:last-order");
      if (raw) setOrder(JSON.parse(raw) as StoredOrder);
    } catch {}
    clear();
  }, [clear]);

  const createdTime = useMemo(() => {
    if (!order) return "";
    try {
      const d = new Date(order.createdAt);
      return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  }, [order]);

  // Пустое состояние — нет активного заказа
  if (!order) {
    return (
      <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
        <KraftBackground />
        <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Заказы</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32, textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#F5E6D3" }}>Активных заказов нет</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080" }}>Оформи заказ через меню</div>
          <Link href="/main" style={{ padding: "14px 32px", background: "linear-gradient(135deg, #E8A664, #D4AF37)", color: "#1A0F0A", borderRadius: 14, fontWeight: 700, textDecoration: "none" }}>
            К меню
          </Link>
        </div>
        <BottomNav active="orders" />
      </div>
    );
  }

  const currentStep = 1; // Готовим — статик, real-time добавим в Фазе C
  const total = order.total;
  const methodLabel = order.method === "pickup" ? "Самовывоз" : "На месте";
  const paymentLabel = order.payment === "sbp" ? "СБП" : order.payment === "card" ? "Картой" : "Бонусами";

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      {/* HEADER */}
      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5 }}>Заказ</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3", marginTop: 2 }}>
            {order.id} <span style={{ fontStyle: "italic", color: "#A69080", fontWeight: 400 }}>от {createdTime}</span>
          </div>
        </div>
        <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67 2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
      </div>

      {/* STATUS HERO */}
      <div style={{ margin: "4px 20px 20px", padding: "24px 20px", background: "linear-gradient(135deg, #2C1810 0%, #3A2415 100%)", borderRadius: 24, border: "1px solid rgba(232, 166, 100, 0.2)", position: "relative", overflow: "hidden", zIndex: 2 }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: "radial-gradient(circle, rgba(232, 166, 100, 0.2) 0%, transparent 65%)" }}/>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, position: "relative" }}>
          <div style={{ width: 64, height: 64, background: "rgba(232, 166, 100, 0.15)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M12 4 Q10 8 13 12 Q15 16 12 20" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
              <path d="M20 4 Q22 8 19 12 Q17 16 20 20" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
              <rect x="8" y="18" width="16" height="12" rx="2" fill="#E8A664"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F5E6D3", fontWeight: 600, lineHeight: 1.1 }}>Готовим...</div>
            <div style={{ fontSize: 12, color: "#A69080", marginTop: 4 }}>
              будет готов к <span style={{ color: "#E8A664", fontWeight: 600 }}>{order.time}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          {STEPS.map((step, i) => (
            <div key={step.key} style={{ display: "contents" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <StepIcon status={stepStatus(currentStep, i)} />
                <span style={{
                  fontSize: 10,
                  fontWeight: stepStatus(currentStep, i) === "active" ? 700 : 600,
                  color: stepStatus(currentStep, i) === "done" ? "#7A9670" : stepStatus(currentStep, i) === "active" ? "#E8A664" : "#A69080",
                }}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  height: 2, flex: 0.3, marginBottom: 20,
                  background: i < currentStep
                    ? (i === currentStep - 1 ? "linear-gradient(90deg, #7A9670 0%, #E8A664 100%)" : "#7A9670")
                    : "rgba(166, 144, 128, 0.25)",
                }}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PICKUP INFO */}
      <div style={{ padding: "0 20px", marginBottom: 16, position: "relative", zIndex: 2 }}>
        <div style={{ background: "#2C1810", borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 L3 6 L3 20 A2 2 0 0 0 5 22 L19 22 A2 2 0 0 0 21 20 L21 6 L18 2 Z"/>
            </svg>
            <div>
              <div style={{ fontSize: 13, color: "#F5E6D3", fontWeight: 500 }}>{methodLabel}</div>
              <div style={{ fontSize: 11, color: "#A69080", marginTop: 2 }}>ул. Ленина, 42 — «Тёмное дело»</div>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A69080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      {/* ITEMS */}
      <div className="no-scrollbar" style={{ padding: "0 20px", flex: 1, overflowY: "auto", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>В заказе</div>

        {order.lines.map((line, i) => (
          <div
            key={line.key}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0",
              borderBottom: i < order.lines.length - 1 ? "1px solid rgba(166, 144, 128, 0.12)" : "none",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, color: "#F5E6D3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {line.item.name}{line.item.subtitle && ` ${line.item.subtitle}`} × {line.quantity}
              </div>
              <div style={{ fontSize: 11, color: "#A69080", marginTop: 2 }}>{lineNote(line.item, line)}</div>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#E8A664", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
              {lineTotal(line)} ₽
            </span>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0 8px", borderTop: "1px solid rgba(166, 144, 128, 0.2)", marginTop: 8 }}>
          <span style={{ fontSize: 13, color: "#F5E6D3", fontWeight: 600 }}>Оплачено ({paymentLabel})</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F5E6D3", fontWeight: 700 }}>
            {total.toLocaleString("ru-RU")} ₽
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 12, color: "#A69080", textDecoration: "underline", cursor: "pointer" }}>Отменить заказ</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#2C1810", borderRadius: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontSize: 12, color: "#E8A664", fontWeight: 600 }}>Написать бариста</span>
        </div>
      </div>

      <BottomNav active="orders" />
    </div>
  );
}
