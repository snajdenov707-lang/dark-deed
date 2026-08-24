"use client";

import Link from "next/link";
import { useCart, selectTotalCount } from "@/stores/cart-store";
import { tap } from "@/lib/haptic";

type Tab = "home" | "search" | "orders" | "profile";

interface BottomNavProps {
  active?: Tab;
}

/** Плавающая стеклянная нижняя навигация — реальные ссылки + бейдж корзины */
export function BottomNav({ active = "home" }: BottomNavProps) {
  const cartCount = useCart(selectTotalCount);

  const dot = (tab: Tab) =>
    active === tab ? (
      <div style={{ width: 4, height: 4, background: "#E8A664", borderRadius: "50%" }} />
    ) : (
      <div style={{ width: 4, height: 4 }} />
    );

  const iconColor = (tab: Tab) => (active === tab ? "#E8A664" : "#8B7768");

  return (
    <div style={{ margin: "10px 20px", marginBottom: "calc(var(--safe-bottom) + 20px)", position: "relative", zIndex: 3 }}>
      <div
        className="glass"
        style={{ borderRadius: 999, padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}
      >
        {/* Home */}
        <Link href="/main" onClick={() => tap("light")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor("home")} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12 L12 3 L21 12 L21 21 L15 21 L15 14 L9 14 L9 21 L3 21 Z"/>
          </svg>
          {dot("home")}
        </Link>

        {/* Search — реальная страница */}
        <Link href="/search" onClick={() => tap("light")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor("search")} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {dot("search")}
        </Link>

        {/* Orders — история заказов */}
        <Link href="/orders" onClick={() => tap("light")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor("orders")} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <line x1="9" y1="9"  x2="15" y2="9"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="12" y2="17"/>
          </svg>
          {dot("orders")}
        </Link>

        {/* Profile — реальная страница */}
        <Link href="/profile" onClick={() => tap("light")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor("profile")} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21 Q4 14 12 14 Q20 14 20 21"/>
          </svg>
          {dot("profile")}
        </Link>

        {/* Cart shortcut с бейджиком */}
        <Link href="/cart" onClick={() => tap("light")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 L3 6 L3 20 A2 2 0 0 0 5 22 L19 22 A2 2 0 0 0 21 20 L21 6 L18 2 Z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10 A4 4 0 0 1 8 10"/>
          </svg>
          {cartCount > 0 ? (
            <div style={{ position: "absolute", top: -6, right: -8, minWidth: 16, height: 16, padding: "0 4px", background: "#E8A664", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#1A0F0A", border: "1.5px solid #1A0F0A", lineHeight: 1 }}>
              {cartCount}
            </div>
          ) : (
            <div style={{ width: 4, height: 4 }} />
          )}
        </Link>
      </div>
    </div>
  );
}
