"use client";

/** ── ОФОРМЛЕНИЕ ЗАКАЗА ──────────────────────────
 *  - Реальная сумма из корзины (с учётом промокода из URL)
 *  - state: method / payment / time
 *  - «Оплатить» → useCreateOrder → БД → /order-status
 *    (при провале — toast с ошибкой)
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { KraftBackground } from "@/components/KraftBackground";
import { useCart, selectSubtotal } from "@/stores/cart-store";
import { useCreateOrder } from "@/lib/api";
import { tap, notify } from "@/lib/haptic";
import { useToast } from "@/components/Toast";

type Method = "pickup" | "table";
type Payment = "sbp" | "card" | "bonus";

function CheckoutInner() {
  const router = useRouter();
  const search = useSearchParams();
  const promoCode = search?.get("promo") ?? undefined;
  const promoDiscount = Number(search?.get("discount") ?? 0) || 0;

  const subtotal = useCart(selectSubtotal);
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);

  const [method, setMethod] = useState<Method>("pickup");
  const [payment, setPayment] = useState<Payment>("sbp");
  const [time, setTime] = useState<string>("14:30");

  const createOrder = useCreateOrder();
  const toast = useToast();

  const timeOptions = ["Сейчас ~7 мин", "14:30", "15:00", "15:30"];
  const total = Math.max(0, subtotal - promoDiscount);

  const handlePay = async () => {
    if (lines.length === 0) return;
    tap("heavy");

    try {
      const order = await createOrder.mutateAsync({
        lines,
        subtotal,
        discount: promoDiscount,
        total,
        method,
        paymentMethod: payment,
        scheduledTime: time,
        promoCode,
      });
      notify("success");
      toast.show(`Заказ ${order.order_number} принят`, "success");
      clearCart();
      router.push("/order-status");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Fallback для не-авторизованного (открыто вне TG): сохраняем в sessionStorage
      if (msg.includes("not_authenticated")) {
        const fallback = {
          id: `#${Math.floor(100 + Math.random() * 900)}`,
          createdAt: new Date().toISOString(),
          lines, total, method, payment, time,
        };
        try { sessionStorage.setItem("dark-deed:last-order", JSON.stringify(fallback)); } catch {}
        toast.show("Заказ принят (демо-режим)", "success");
        clearCart();
        router.push("/order-status");
      } else {
        notify("error");
        toast.show(`Не удалось: ${msg.slice(0, 60)}`, "error");
      }
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      {/* HEADER */}
      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 2 }}>
        <Link href="/cart" onClick={() => tap("light")}>
          <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </div>
        </Link>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Оформление</div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "4px 20px", position: "relative", zIndex: 2 }}>

        {/* Method */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>Способ</div>
          <div style={{ display: "flex", gap: 10 }}>
            {(["pickup", "table"] as Method[]).map((m) => {
              const active = m === method;
              const label = m === "pickup" ? "Самовывоз" : "На месте";
              const hint = m === "pickup" ? "Без очереди у стойки" : "Стол по QR";
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); tap("light"); }}
                  style={{
                    flex: 1, cursor: "pointer",
                    background: active ? "linear-gradient(135deg, #2C1810 0%, #3A2415 100%)" : "#2C1810",
                    border: `1px solid ${active ? "#E8A664" : "transparent"}`,
                    borderRadius: 16, padding: 16,
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, textAlign: "left",
                  }}
                >
                  {m === "pickup" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8A664" : "#A69080"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 L3 6 L3 20 A2 2 0 0 0 5 22 L19 22 A2 2 0 0 0 21 20 L21 6 L18 2 Z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10 A4 4 0 0 1 8 10"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8A664" : "#A69080"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="8" width="18" height="12" rx="2"/>
                      <path d="M7 8 V4 A2 2 0 0 1 9 2 L15 2 A2 2 0 0 1 17 4 V8"/>
                    </svg>
                  )}
                  <div>
                    <div style={{ fontSize: 13, color: "#F5E6D3", fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 10, color: "#A69080", marginTop: 2 }}>{hint}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>Когда забирать</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {timeOptions.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => { setTime(t); tap("light"); }}
                style={{
                  flex: 1, padding: "10px 0", cursor: "pointer",
                  background: t === time ? "#E8A664" : "#2C1810",
                  borderRadius: 12, fontSize: 12,
                  color: t === time ? "#1A0F0A" : "#A69080",
                  fontWeight: t === time ? 600 : 400,
                  border: `1px solid ${t === time ? "#E8A664" : "rgba(166, 144, 128, 0.2)"}`,
                  textAlign: "center",
                }}
              >{t}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#7A9670", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A9670" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Пришлём пуш, когда будет готов
          </div>
        </div>

        {/* Payment */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>Оплата</div>

          {(["sbp", "card", "bonus"] as Payment[]).map((p) => {
            const active = payment === p;
            const label = p === "sbp" ? "СБП" : p === "card" ? "Карта •• 4271" : "Бонусами";
            const hint  = p === "sbp" ? "В один клик, комиссии нет" : p === "card" ? "Сохранённая" : "Списание до 30% от заказа";
            return (
              <button
                type="button"
                key={p}
                onClick={() => { setPayment(p); tap("light"); }}
                style={{
                  width: "100%", marginBottom: 8, cursor: "pointer",
                  background: active ? "linear-gradient(135deg, #2C1810 0%, #3A2415 100%)" : "#2C1810",
                  border: `1px solid ${active ? "#E8A664" : "transparent"}`,
                  borderRadius: 16, padding: 16,
                  display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                }}
              >
                <div style={{ width: 40, height: 40, background: active ? "rgba(232, 166, 100, 0.15)" : "#1A0F0A", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p === "sbp" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8A664" : "#A69080"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  )}
                  {p === "card" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8A664" : "#A69080"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/>
                    </svg>
                  )}
                  {p === "bonus" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 17 L5 22 L7 14 L2 9 L9 9 Z"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#F5E6D3", fontWeight: 600 }}>
                    {label}
                    {p === "bonus" && <span style={{ color: "#D4AF37" }}> 1 240 ☕</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#A69080", marginTop: 2 }}>{hint}</div>
                </div>
                <div style={{ width: 20, height: 20, border: `2px solid ${active ? "#E8A664" : "rgba(166, 144, 128, 0.4)"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <div style={{ width: 10, height: 10, background: "#E8A664", borderRadius: "50%" }}/>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div style={{ padding: "16px 20px", paddingBottom: "calc(var(--safe-bottom) + 24px)", background: "#2C1810", borderRadius: "24px 24px 0 0", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "#A69080" }}>К оплате</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#E8A664", fontWeight: 700 }}>
            {total.toLocaleString("ru-RU")} ₽
          </span>
        </div>
        <button
          type="button"
          onClick={handlePay}
          disabled={lines.length === 0 || createOrder.isPending}
          style={{
            width: "100%", height: 52,
            background: lines.length && !createOrder.isPending ? "#E8A664" : "#3A2415",
            borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: "none", cursor: lines.length && !createOrder.isPending ? "pointer" : "not-allowed",
          }}
        >
          {createOrder.isPending ? (
            <span style={{ fontSize: 15, fontWeight: 600, color: "#A69080" }}>Отправляем...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11 V7 A5 5 0 0 1 17 7 V11"/>
              </svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1A0F0A" }}>
                {payment === "sbp" ? "Оплатить через СБП" : payment === "card" ? "Оплатить картой" : "Оплатить бонусами"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#1A0F0A" }} />}>
      <CheckoutInner />
    </Suspense>
  );
}
