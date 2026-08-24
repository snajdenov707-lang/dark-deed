/** ── ItemIcon ──────────────────────────────────
 *  Единый SVG-компонент под все варианты меню.
 *  Дает консистентный визуал по всем 14 позициям.
 ─────────────────────────────────────────────── */

import type { IconVariant } from "@/lib/types";

export function ItemIcon({
  variant,
  size = 52,
}: {
  variant: IconVariant;
  size?: number;
}) {
  const h = size * (60 / 52);

  switch (variant) {
    // ─── Молочная (Латте) — тёплая бежевая пенка ──
    case "latte":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M22 4 Q19 14 24 22 Q29 30 24 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
          <path d="M34 2 Q37 12 32 20 Q28 28 34 36" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
          <path d="M44 4 Q47 14 42 22 Q38 30 42 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
          <path d="M14 42 L18 72 Q18 78 24 78 L40 78 Q46 78 46 72 L50 42 Z" fill="#4A2E1E"/>
          <ellipse cx="32" cy="42" rx="18" ry="3" fill="#8B5A3C"/>
          <ellipse cx="32" cy="41" rx="14" ry="2" fill="#D4B896"/>
        </svg>
      );

    // ─── Капучино — белая плотная пена ──
    case "cappuccino":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M20 4 Q17 14 22 22 Q27 30 22 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
          <path d="M32 2 Q35 12 30 20 Q26 28 32 36" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
          <path d="M44 4 Q47 14 42 22 Q38 30 42 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.75"/>
          <path d="M12 42 L16 72 Q16 78 22 78 L42 78 Q48 78 48 72 L52 42 Z" fill="#4A2E1E"/>
          <ellipse cx="32" cy="42" rx="20" ry="3.5" fill="#F5E6D3"/>
          <ellipse cx="32" cy="41" rx="15" ry="2" fill="#F5E6D3"/>
          <path d="M25 40 Q32 38 39 40" stroke="#8B5A3C" strokeWidth="0.5" fill="none" opacity="0.4"/>
        </svg>
      );

    // ─── Раф — сливочная поверхность с крапом какао ──
    case "raf":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M22 4 Q20 10 24 14 Q28 20 24 24" stroke="#E8A664" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
          <path d="M30 4 Q32 10 28 14 Q26 20 30 24" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
          <path d="M12 28 L16 72 Q16 76 22 76 L42 76 Q48 76 48 72 L52 28 Z" fill="#4A2E1E"/>
          <ellipse cx="32" cy="30" rx="20" ry="3.5" fill="#8B5A3C"/>
          <ellipse cx="32" cy="29" rx="16" ry="2" fill="#E8D4B8"/>
          <circle cx="26" cy="30" r="0.9" fill="#5A3520"/>
          <circle cx="36" cy="29" r="1.1" fill="#3A2214"/>
          <circle cx="32" cy="31" r="0.7" fill="#5A3520"/>
        </svg>
      );

    // ─── Флэт уайт — низкий стакан ──
    case "flat":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M22 4 Q20 10 24 14 Q28 20 24 24" stroke="#E8A664" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
          <path d="M30 4 Q32 10 28 14 Q26 20 30 24" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
          <rect x="14" y="30" width="36" height="42" rx="4" fill="#3A2214"/>
          <ellipse cx="32" cy="30" rx="18" ry="3.5" fill="#6B4020"/>
          <ellipse cx="32" cy="30" rx="14" ry="2.5" fill="#F5E6D3"/>
        </svg>
      );

    // ─── Американо — просто тёмный кофе ──
    case "americano":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M22 4 Q19 14 24 22 Q29 30 24 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <path d="M34 2 Q37 12 32 20 Q28 28 34 36" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <path d="M14 42 L18 72 Q18 78 24 78 L40 78 Q46 78 46 72 L50 42 Z" fill="#4A2E1E"/>
          <ellipse cx="32" cy="42" rx="18" ry="3" fill="#1F1108"/>
          <ellipse cx="32" cy="41" rx="14" ry="2" fill="#2A1810"/>
        </svg>
      );

    // ─── Эспрессо — маленькая чашка ──
    case "espresso":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M28 12 Q26 20 30 26 Q34 32 30 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <path d="M36 10 Q39 20 34 26 Q30 32 36 38" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
          <path d="M22 42 L24 62 Q24 68 30 68 L34 68 Q40 68 40 62 L42 42 Z" fill="#4A2E1E"/>
          <ellipse cx="32" cy="42" rx="10" ry="2.5" fill="#1F1108"/>
          <ellipse cx="32" cy="41" rx="7" ry="1.5" fill="#6B4020"/>
          <path d="M42 46 Q50 46 50 54 Q50 62 42 62" stroke="#3A2415" strokeWidth="2.5" fill="none"/>
        </svg>
      );

    // ─── Матча — зелёная ──
    case "matcha":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M22 4 Q19 14 24 22 Q29 30 24 38" stroke="#8FAE6A" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <path d="M34 2 Q37 12 32 20 Q28 28 34 36" stroke="#6FA859" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
          <path d="M14 42 L18 72 Q18 78 24 78 L40 78 Q46 78 46 72 L50 42 Z" fill="#3A4F2F"/>
          <ellipse cx="32" cy="42" rx="18" ry="3" fill="#6FA859"/>
          <ellipse cx="32" cy="41" rx="14" ry="2" fill="#A2C77E"/>
        </svg>
      );

    // ─── Какао — сливки шапкой ──
    case "cocoa":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M22 4 Q19 14 24 22 Q29 30 24 38" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
          <path d="M34 2 Q37 12 32 20 Q28 28 34 36" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.8"/>
          <path d="M14 42 L18 72 Q18 78 24 78 L40 78 Q46 78 46 72 L50 42 Z" fill="#4A2E1E"/>
          <path d="M14 44 Q20 38 28 42 Q36 36 44 42 Q50 38 50 44 L50 46 L14 46 Z" fill="#F5E6D3"/>
        </svg>
      );

    // ─── Альтернатива — колба V60/аэропресс ──
    case "alt":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <path d="M28 4 Q26 10 30 14" stroke="#E8A664" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
          <path d="M36 4 Q38 10 34 14" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
          {/* конус/фильтр */}
          <path d="M18 20 L32 52 L46 20 Z" fill="none" stroke="#E8A664" strokeWidth="1.5"/>
          <path d="M22 22 L32 44 L42 22" fill="#4A2E1E" opacity="0.6"/>
          {/* нижний сосуд */}
          <path d="M22 54 Q22 68 32 68 Q42 68 42 54 Z" fill="#3A2214"/>
          <ellipse cx="32" cy="54" rx="10" ry="2" fill="#5A3520"/>
        </svg>
      );

    // ─── Круассан ──
    case "croissant":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          <ellipse cx="32" cy="52" rx="26" ry="6" fill="#3A2415"/>
          <path d="M8 52 Q6 26 32 20 Q58 26 56 52 Z" fill="#8B5A3C"/>
          <path d="M14 42 Q32 32 50 42" stroke="#4A2E1E" strokeWidth="1.4" fill="none"/>
          <path d="M14 34 Q32 24 50 34" stroke="#4A2E1E" strokeWidth="1.4" fill="none"/>
          <ellipse cx="32" cy="22" rx="10" ry="2" fill="#4A2E1E"/>
        </svg>
      );

    // ─── Чизкейк / кусок торта ──
    case "cheesecake":
      return (
        <svg width={size} height={h} viewBox="0 0 64 80" fill="none">
          {/* треугольный кусок */}
          <path d="M14 60 L32 20 L50 60 Z" fill="#E8D4B8"/>
          <path d="M14 60 L32 20 L50 60 L46 66 L18 66 Z" fill="#8B5A3C"/>
          <path d="M18 60 L32 32 L46 60" stroke="#5A3520" strokeWidth="1" fill="none" opacity="0.5"/>
          <ellipse cx="32" cy="22" rx="4" ry="1.5" fill="#4A2E1E"/>
        </svg>
      );
  }
}
