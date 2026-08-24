"use client";

/** ── ИСТОРИЯ ЗАКАЗОВ ────────────────────────────
 *  Все свои заказы из БД (RLS-фильтрация).
 *  Клик по строке → детали заказа.
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { KraftBackground } from "@/components/KraftBackground";
import { BottomNav } from "@/components/BottomNav";
import { useOrderHistory, type DbOrder, type DbOrderItem } from "@/lib/api";
import { tap } from "@/lib/haptic";

const STATUS_LABEL: Record<DbOrder["status"], string> = {
  accepted: "Принят",
  preparing: "Готовим",
  ready: "Готов",
  issued: "Выдан",
  cancelled: "Отменён",
};

const STATUS_COLOR: Record<DbOrder["status"], string> = {
  accepted: "#E8A664",
  preparing: "#E8A664",
  ready: "#D4AF37",
  issued: "#7A9670",
  cancelled: "#dc8290",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `Сегодня, ${time}`;
    if (isYesterday) return `Вчера, ${time}`;
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + ", " + time;
  } catch { return iso; }
}

export default function OrdersPage() {
  const q = useOrderHistory();
  const orders = q.data ?? [];

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
        <Link href="/profile" onClick={() => tap("light")}>
          <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
        </Link>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>История</div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px 20px 8px", position: "relative", zIndex: 2 }}>
        {q.isLoading && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#A69080", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            Загружаем...
          </div>
        )}

        {!q.isLoading && orders.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#F5E6D3" }}>Ещё не заказывали</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080", marginTop: 8, marginBottom: 22 }}>Ваш первый заказ покажется здесь</div>
            <Link href="/main" onClick={() => tap("light")} style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, #E8A664, #D4AF37)", color: "#1A0F0A", borderRadius: 14, fontWeight: 700, textDecoration: "none" }}>
              К меню
            </Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} onClick={() => tap("light")} style={{ textDecoration: "none" }}>
              <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#F5E6D3", fontWeight: 600 }}>{o.order_number}</div>
                    <div style={{ fontSize: 11, color: "#A69080", marginTop: 2 }}>{formatDate(o.created_at)}</div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 999, background: `${STATUS_COLOR[o.status]}20`, border: `1px solid ${STATUS_COLOR[o.status]}55` }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: STATUS_COLOR[o.status], fontWeight: 600 }}>{STATUS_LABEL[o.status]}</span>
                  </div>
                </div>

                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "#A69080", lineHeight: 1.3 }}>
                  {o.order_items?.slice(0, 3).map((i: DbOrderItem) => `${i.menu_item_name} ×${i.quantity}`).join(" · ")}
                  {o.order_items && o.order_items.length > 3 && ` · +${o.order_items.length - 3}`}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(166, 144, 128, 0.1)", paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: "#8B7768" }}>{o.method === "pickup" ? "Самовывоз" : "На месте"}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 18, color: "#E8A664", fontWeight: 700 }}>
                    {Number(o.total).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="orders" />
    </div>
  );
}
