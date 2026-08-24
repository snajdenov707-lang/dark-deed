"use client";

/** ── SPLASH SCREEN ──────────────────────────────
 *  Логотип DARK DEED на тёмном шоколадном фоне.
 *  Явная кнопка «Открыть меню» — без auto-redirect,
 *  чтобы юзер точно понял что app загрузился.
 ─────────────────────────────────────────────── */

import Link from "next/link";

export default function SplashPage() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        background: "radial-gradient(ellipse at center top, #2C1810 0%, #1A0F0A 60%, #0F0805 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Grain / warm glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(232, 166, 100, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.04) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Coffee bean decorations */}
      <svg
        width="390"
        height="844"
        viewBox="0 0 390 844"
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.08 }}
        aria-hidden
      >
        <ellipse cx="60"  cy="120" rx="14" ry="20" fill="#8B5A3C" transform="rotate(-25 60 120)"/>
        <path d="M60 100 Q60 140 60 140"   stroke="#3A2415" strokeWidth="1.5" fill="none" transform="rotate(-25 60 120)"/>
        <ellipse cx="320" cy="180" rx="12" ry="17" fill="#8B5A3C" transform="rotate(35 320 180)"/>
        <path d="M320 163 Q320 197 320 197" stroke="#3A2415" strokeWidth="1.5" fill="none" transform="rotate(35 320 180)"/>
        <ellipse cx="40"  cy="720" rx="14" ry="20" fill="#8B5A3C" transform="rotate(15 40 720)"/>
        <path d="M40 700 Q40 740 40 740"   stroke="#3A2415" strokeWidth="1.5" fill="none" transform="rotate(15 40 720)"/>
        <ellipse cx="340" cy="680" rx="12" ry="17" fill="#8B5A3C" transform="rotate(-40 340 680)"/>
        <path d="M340 663 Q340 697 340 697" stroke="#3A2415" strokeWidth="1.5" fill="none" transform="rotate(-40 340 680)"/>
        <ellipse cx="280" cy="80"  rx="10" ry="15" fill="#8B5A3C" transform="rotate(60 280 80)"/>
        <path d="M280 65 Q280 95 280 95"   stroke="#3A2415" strokeWidth="1.5" fill="none" transform="rotate(60 280 80)"/>
        <ellipse cx="100" cy="780" rx="10" ry="15" fill="#8B5A3C" transform="rotate(-55 100 780)"/>
        <path d="M100 765 Q100 795 100 795" stroke="#3A2415" strokeWidth="1.5" fill="none" transform="rotate(-55 100 780)"/>
        {/* Extra beans */}
        <ellipse cx="350" cy="500" rx="9"  ry="13" fill="#8B5A3C" transform="rotate(20 350 500)"/>
        <path d="M350 488 Q350 512 350 512" stroke="#3A2415" strokeWidth="1.2" fill="none" transform="rotate(20 350 500)"/>
        <ellipse cx="30"  cy="400" rx="11" ry="16" fill="#8B5A3C" transform="rotate(-30 30 400)"/>
        <path d="M30 385 Q30 415 30 415"   stroke="#3A2415" strokeWidth="1.2" fill="none" transform="rotate(-30 30 400)"/>
      </svg>

      {/* Logo mark + wordmark */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

        {/* Coffee cup SVG */}
        <svg width="80" height="80" viewBox="0 0 72 72" fill="none" aria-label="Логотип Dark Deed">
          {/* Steam */}
          <path d="M28 8 Q25 16 30 22 Q34 28 30 34"
            stroke="#E8A664" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          <path d="M36 6 Q39 14 34 20 Q30 26 36 32"
            stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>
          <path d="M44 8 Q47 16 42 22 Q38 28 44 34"
            stroke="#E8A664" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          {/* Cup silhouette */}
          <path d="M20 36 L20 54 Q20 66 36 66 Q52 66 52 54 L52 36 Z"
            fill="none" stroke="#E8A664" strokeWidth="1.8"/>
          <ellipse cx="36" cy="36" rx="16" ry="3.5"
            fill="none" stroke="#E8A664" strokeWidth="1.8"/>
          {/* Handle */}
          <path d="M52 44 Q62 44 62 54 Q62 64 52 64"
            stroke="#E8A664" strokeWidth="1.5" fill="none" opacity="0.6"/>
        </svg>

        {/* Wordmark */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "6px",
              color: "#F5E6D3",
              lineHeight: 1,
              textShadow: "0 0 40px rgba(245, 230, 211, 0.2)",
            }}
          >
            DARK
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "6px",
              color: "#E8A664",
              lineHeight: 1,
              marginTop: 4,
              textShadow: "0 0 30px rgba(232, 166, 100, 0.45)",
            }}
          >
            DEED
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: 14,
              color: "#A69080",
              marginTop: 16,
              letterSpacing: "3px",
            }}
          >
            — с 2022 —
          </div>
        </div>
      </div>

      {/* Loading strip + tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          width: "100%",
        }}
      >
        {/* Loading bar */}
        <div
          style={{
            width: 60,
            height: 2,
            background: "rgba(232, 166, 100, 0.2)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "40%",
              height: "100%",
              background: "#E8A664",
              borderRadius: 2,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#A69080",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          Свежая обжарка
        </div>
      </div>

      {/* CTA link (Phase A stub — navigates to /main) */}
      <Link
        href="/main"
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          width: "calc(100% - 48px)",
          height: 52,
          background: "linear-gradient(135deg, #E8A664, #D4AF37)",
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(232, 166, 100, 0.25)",
          textDecoration: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: 17,
            fontWeight: 700,
            color: "#1A0F0A",
          }}
        >
          Войти в тёмное дело
        </span>
      </Link>
    </div>
  );
}
