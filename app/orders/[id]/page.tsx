"use client";

/** ── ДЕТАЛИ ЗАКАЗА ──────────────────────────────
 *  - Полная детализация одного прошлого заказа
 *  - Кнопка «Повторить заказ» → добавляет всё в корзину
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { KraftBackground } from "@/components/KraftBackground";
import { useOrderById } from "@/lib/api";
import { useCart } from "@/stores/cart-store";
import { useMenu } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { tap, notify } from "@/lib/haptic";

const STATUS_LABEL: Record<string, string> = {
  accepted: "Принят",
  preparing: "Готовим",
  ready: "Готов",
  issued: "Выдан",
  cancelled: "Отменён",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params!.id[0] : undefined;
  const orderQ = useOrderById(id);
  const menuQ = useMenu();
  const add = useCart((s) => s.add);
  const toast = useToast();

  const order = orderQ.data;

  const handleReorder = () => {
    if (!order || !menuQ.data) return;
    tap("medium");
    let added = 0;
    for (const item of order.order_items ?? []) {
      const menuItem = menuQ.data.find((m) => m.id === item.menu_item_id);
      if (!menuItem) continue;
      add({
        item: menuItem,
        size: item.size ?? undefined,
        milk: item.milk ?? undefined,
        extraShots: item.extra_shots ?? 0,
      }, item.quantity);
      added += item.quantity;
    }
    notify("success");
    toast.show(`${added} позиций в корзине`, "success");
    router.push("/cart");
  };

  if (orderQ.isLoading) {
    return <div style={{ width: "100%", minHeight: "100dvh", background: "#1A0F0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A69080" }}>Загружаем...</div>;
  }

  if (!order) {
    return (
      <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#F5E6D3" }}>Заказ не найден</div>
        <Link href="/orders" style={{ padding: "12px 28px", background: "linear-gradient(135deg, #E8A664, #D4AF37)", color: "#1A0F0A", borderRadius: 14, fontWeight: 700, textDecoration: "none" }}>
          К истории
        </Link>
      </div>
    );
  }

  const created = new Date(order.created_at);
  const dateStr = created.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const timeStr = created.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "radial-gradient(ellipse at top, #241408 0%, #14090580 45%, #0A0503 100%)", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <KraftBackground />

      {/* HEADER */}
      <div style={{ padding: "0 20px 8px", paddingTop: "calc(var(--top-inset) + 20px)", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
        <Link href="/orders" onClick={() => tap("light")}>
          <div style={{ width: 44, height: 44, background: "#2C1810", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5E6D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
        </Link>
        <div>
          <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5 }}>Заказ</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>{order.order_number}</div>
        </div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 20px 8px", position: "relative", zIndex: 2 }}>

        <div className="glass" style={{ borderRadius: 16, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5 }}>Статус</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 18, color: "#F5E6D3", marginTop: 2 }}>{STATUS_LABEL[order.status]}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#A69080" }}>{dateStr}</div>
            <div style={{ fontSize: 13, color: "#F5E6D3", marginTop: 2 }}>{timeStr}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5, margin: "12px 4px 8px", fontWeight: 600 }}>Позиции</div>

        {order.order_items?.map((it, i, arr) => (
          <div key={it.id} style={{ padding: "12px 4px", borderBottom: i < arr.length - 1 ? "1px solid rgba(166, 144, 128, 0.12)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, color: "#F5E6D3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.menu_item_name} × {it.quantity}
              </div>
              <div style={{ fontSize: 11, color: "#A69080", marginTop: 2 }}>
                {[it.size, it.milk, it.extra_shots > 0 ? `+${it.extra_shots} шот` : null].filter(Boolean).join(" · ")}
              </div>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#E8A664", fontWeight: 600, marginLeft: 8 }}>
              {Number(it.total_price).toLocaleString("ru-RU")} ₽
            </span>
          </div>
        ))}

        {/* Totals */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(166, 144, 128, 0.2)" }}>
          {Number(order.subtotal) !== Number(order.total) && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#A69080", marginBottom: 4 }}>
              <span>Подытог</span>
              <span>{Number(order.subtotal).toLocaleString("ru-RU")} ₽</span>
            </div>
          )}
          {Number(order.discount) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7A9670", marginBottom: 4 }}>
              <span>Скидка {order.promo_code ? `(${order.promo_code})` : ""}</span>
              <span>−{Number(order.discount).toLocaleString("ru-RU")} ₽</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#F5E6D3", fontWeight: 600 }}>Итого</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#E8A664", fontWeight: 700 }}>
              {Number(order.total).toLocaleString("ru-RU")} ₽
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#A69080", marginTop: 4, textAlign: "right" }}>
            Оплачено · {order.payment_method === "sbp" ? "СБП" : order.payment_method === "card" ? "Картой" : "Бонусами"}
          </div>
          {order.bonus_earned > 0 && (
            <div style={{ fontSize: 11, color: "#D4AF37", marginTop: 4, textAlign: "right" }}>
              Начислено +{order.bonus_earned} ☕
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div style={{ padding: "16px 20px", paddingBottom: "calc(var(--safe-bottom) + 24px)", background: "#2C1810", borderRadius: "24px 24px 0 0", position: "relative", zIndex: 2 }}>
        <button
          type="button"
          onClick={handleReorder}
          disabled={!menuQ.data}
          style={{ width: "100%", height: 52, background: "linear-gradient(135deg, #E8A664, #D4AF37)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "none", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A0F0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1A0F0A" }}>Повторить заказ</span>
        </button>
      </div>
    </div>
  );
}
