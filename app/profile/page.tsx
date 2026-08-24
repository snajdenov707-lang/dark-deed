"use client";

/** ── ПРОФИЛЬ ────────────────────────────────────
 *  - TG данные (аватар + имя из user_metadata)
 *  - Уровень (Bronze/Silver/Gold) по кол-ву заказов
 *  - Бонусы, потрачено, любимая категория
 *  - Ссылки на историю, избранное, поддержку
 ─────────────────────────────────────────────── */

import Link from "next/link";
import { KraftBackground } from "@/components/KraftBackground";
import { BottomNav } from "@/components/BottomNav";
import { useTgProfile, useUserStats } from "@/lib/api";
import { useFavorites, selectFavCount } from "@/stores/favorites-store";
import { CATEGORY_LABEL } from "@/lib/menu";
import { tap } from "@/lib/haptic";
import { useToast } from "@/components/Toast";
import type { Category } from "@/lib/types";

function tierByOrders(n: number): { name: string; color: string; next?: string; toNext?: number } {
  if (n < 5)  return { name: "Гость",   color: "#8B7768", next: "Bronze",  toNext: 5 - n  };
  if (n < 15) return { name: "Bronze",  color: "#CD7F32", next: "Silver",  toNext: 15 - n };
  if (n < 50) return { name: "Silver",  color: "#C0C0C0", next: "Gold",    toNext: 50 - n };
  return                { name: "Gold",    color: "#E8A664" };
}

export default function ProfilePage() {
  const profile = useTgProfile();
  const stats = useUserStats();
  const favCount = useFavorites(selectFavCount);
  const clearFav = useFavorites((s) => s.clear);
  const toast = useToast();

  const first = profile.data?.first_name ?? "Гость";
  const last = profile.data?.last_name ?? "";
  const username = profile.data?.username;
  const photoUrl = profile.data?.photo_url;
  const initials = (first[0] ?? "?") + (last[0] ?? "");

  const tier = tierByOrders(stats.data?.orders_count ?? 0);
  const bonus = stats.data?.bonus_balance ?? 0;
  const spent = stats.data?.total_spent ?? 0;
  const favCat = stats.data?.favorite_category as Category | null;

  const handleShare = () => {
    tap("light");
    const url = "https://t.me/Dark_Deed_Test_Bot";
    const text = `Тёмное дело — кофейня с крафтом и золотом. Открой мини-апп: ${url}`;
    const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void; switchInlineQuery?: (q: string, chatTypes?: string[]) => void } } }).Telegram?.WebApp;
    if (tg?.switchInlineQuery) {
      tg.switchInlineQuery(text, ["users", "groups"]);
    } else if (navigator.share) {
      navigator.share({ text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => toast.show("Ссылка скопирована", "success"));
    }
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
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5E6D3" }}>Профиль</div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 20px 8px", position: "relative", zIndex: 2 }}>

        {/* USER CARD */}
        <div className="glass" style={{ borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 180, background: "radial-gradient(circle, rgba(232, 166, 100, 0.22) 0%, transparent 65%)", pointerEvents: "none" }}/>

          {/* Avatar */}
          <div style={{ position: "relative", zIndex: 2 }}>
            {photoUrl ? (
              <img src={photoUrl} alt="" width={88} height={88} style={{ borderRadius: "50%", border: `2px solid ${tier.color}`, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: "50%", border: `2px solid ${tier.color}`, background: "linear-gradient(135deg, #3A2415, #2C1810)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 32, fontWeight: 700, color: "#E8A664" }}>
                {initials}
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#F5E6D3" }}>{first} {last}</div>
            {username && (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: "#A69080", marginTop: 2 }}>@{username}</div>
            )}
          </div>

          {/* Tier badge */}
          <div style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(20, 10, 5, 0.7)", border: `1px solid ${tier.color}55`, display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: tier.color, boxShadow: `0 0 12px ${tier.color}` }}/>
            <span className="microcaps" style={{ color: tier.color }}>{tier.name}</span>
            {tier.toNext !== undefined && (
              <span style={{ fontSize: 10, color: "#A69080", letterSpacing: 1 }}>· ещё {tier.toNext} до {tier.next}</span>
            )}
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          <StatCard label="Бонусы" value={`${bonus}`} suffix="☕" accent />
          <StatCard label="Заказов" value={`${stats.data?.orders_count ?? 0}`} />
          <StatCard label="Потрачено" value={`${spent.toLocaleString("ru-RU")}`} suffix="₽" />
        </div>

        {favCat && (
          <div className="glass" style={{ borderRadius: 16, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5 }}>Любимое</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 18, color: "#F5E6D3", marginTop: 2 }}>{CATEGORY_LABEL[favCat]}</div>
            </div>
            <div style={{ fontSize: 24 }}>❤</div>
          </div>
        )}

        {/* MENU LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ProfileRow icon="orders" label="История заказов" hint={`${stats.data?.orders_count ?? 0} шт.`} href="/orders" />
          <ProfileRow icon="heart"  label="Избранное"       hint={`${favCount} шт.`}                       href="/favorites" />
          <ProfileRow icon="share"  label="Поделиться ботом" onClick={handleShare} />
          <ProfileRow icon="chat"   label="Написать в поддержку" onClick={() => {
            tap("light");
            const url = "https://t.me/Dark_Deed_Test_Bot";
            const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } }).Telegram?.WebApp;
            if (tg?.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank");
          }} />

          {favCount > 0 && (
            <button
              type="button"
              onClick={() => { clearFav(); tap("light"); toast.show("Избранное очищено", "info"); }}
              style={{ background: "transparent", border: "none", color: "#8B7768", fontSize: 12, textDecoration: "underline", padding: "16px 0 4px", cursor: "pointer" }}
            >
              Очистить избранное
            </button>
          )}
        </div>

        <div style={{ padding: "24px 0 8px", textAlign: "center", fontSize: 10, color: "#6B5A4C", letterSpacing: 2 }}>
          DARK DEED · v0.2
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

function StatCard({ label, value, suffix, accent }: { label: string; value: string; suffix?: string; accent?: boolean }) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#A69080", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, fontWeight: 700, color: accent ? "#E8A664" : "#F5E6D3" }}>
        {value}{suffix && <span style={{ fontSize: 12, color: "#A69080", fontWeight: 400, marginLeft: 2 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, hint, href, onClick }: {
  icon: "orders" | "heart" | "share" | "chat";
  label: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(232, 166, 100, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon === "orders" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
          </svg>
        )}
        {icon === "heart" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#E8A664" stroke="#E8A664" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        )}
        {icon === "share" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        )}
        {icon === "chat" && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A664" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#F5E6D3", fontWeight: 500 }}>{label}</div>
      </div>
      {hint && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: "#A69080" }}>{hint}</div>}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A69080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  );

  if (href) {
    return <Link href={href} onClick={() => tap("light")} style={{ textDecoration: "none" }}>{body}</Link>;
  }
  return (
    <button type="button" onClick={onClick} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
      {body}
    </button>
  );
}
