/** ── KraftBackground ────────────────────────────
 *  Крафт-бумажная текстура — САМЫЙ НИЖНИЙ слой.
 *  pointer-events: none — не мешает кликам.
 *  z-index: 0 — контент сверху всегда.
 *
 *  Уменьшенные alpha значения (было ~0.28 → сейчас ~0.14)
 *  чтобы текстура читалась только как фон, не давила на контент.
 ─────────────────────────────────────────────── */

export function KraftBackground() {
  return (
    <>
      {/* Мягкие цветные пятна (теплый крафт) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `
            radial-gradient(ellipse 300px 200px at 15% 15%, rgba(139,90,60,0.16), transparent 65%),
            radial-gradient(ellipse 250px 180px at 85% 30%, rgba(166,123,77,0.13), transparent 60%),
            radial-gradient(ellipse 280px 220px at 25% 55%, rgba(107,64,32,0.16), transparent 60%),
            radial-gradient(ellipse 260px 200px at 80% 75%, rgba(139,90,60,0.14), transparent 65%),
            radial-gradient(ellipse 220px 180px at 40% 90%, rgba(90,53,32,0.16),  transparent 60%)
          `,
        }}
      />

      {/* Волокна бумаги — тянутся на всю площадь */}
      <svg
        aria-hidden
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="paperFibers" patternUnits="userSpaceOnUse" width="160" height="160">
            <path d="M0,14 Q80,10 160,18"   stroke="#B8895A" strokeWidth="0.7" fill="none" opacity="0.35"/>
            <path d="M0,38 Q80,42 160,36"   stroke="#A67B4D" strokeWidth="0.6" fill="none" opacity="0.32"/>
            <path d="M0,60 Q80,56 160,64"   stroke="#8B5A3C" strokeWidth="0.7" fill="none" opacity="0.4"/>
            <path d="M0,86 Q80,90 160,82"   stroke="#B8895A" strokeWidth="0.55" fill="none" opacity="0.3"/>
            <path d="M0,108 Q80,104 160,112" stroke="#6B4020" strokeWidth="0.7" fill="none" opacity="0.42"/>
            <path d="M0,130 Q80,134 160,126" stroke="#A67B4D" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M0,148 Q80,144 160,152" stroke="#8B5A3C" strokeWidth="0.6" fill="none" opacity="0.35"/>
            <path d="M28,0 Q26,80 30,160"   stroke="#6B4020" strokeWidth="0.45" fill="none" opacity="0.28"/>
            <path d="M78,0 Q80,80 76,160"   stroke="#5A3520" strokeWidth="0.4" fill="none" opacity="0.25"/>
            <path d="M132,0 Q134,80 130,160" stroke="#6B4020" strokeWidth="0.45" fill="none" opacity="0.28"/>
            <circle cx="22"  cy="30"  r="1.0" fill="#D4B896" opacity="0.42"/>
            <circle cx="100" cy="52"  r="0.7" fill="#A67B4D" opacity="0.4"/>
            <circle cx="60"  cy="98"  r="1.1" fill="#B8895A" opacity="0.42"/>
            <circle cx="140" cy="28"  r="0.6" fill="#8B5A3C" opacity="0.35"/>
            <circle cx="48"  cy="140" r="0.9" fill="#A67B4D" opacity="0.4"/>
            <circle cx="115" cy="122" r="0.7" fill="#D4B896" opacity="0.38"/>
            <circle cx="88"  cy="22"  r="0.55" fill="#8B5A3C" opacity="0.35"/>
            <circle cx="35"  cy="72"  r="0.65" fill="#A67B4D" opacity="0.38"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paperFibers)"/>
        {/* Слабые заломы бумаги */}
        <path d="M-40,140 Q195,105 430,160" stroke="#000" strokeWidth="14" fill="none" opacity="0.22"/>
        <path d="M-40,340 Q195,375 430,315" stroke="#000" strokeWidth="10" fill="none" opacity="0.19"/>
        <path d="M-40,540 Q195,500 430,565" stroke="#000" strokeWidth="12" fill="none" opacity="0.21"/>
        <path d="M-40,720 Q195,750 430,695" stroke="#000" strokeWidth="10" fill="none" opacity="0.18"/>
        {/* Тёплые highlight-полоски */}
        <path d="M-40,128 Q195,93 430,148"  stroke="#D4B896" strokeWidth="1.2" fill="none" opacity="0.28"/>
        <path d="M-40,528 Q195,488 430,553" stroke="#D4B896" strokeWidth="1.1" fill="none" opacity="0.26"/>
        {/* Диагональ */}
        <path d="M-20,-20 Q195,420 410,864" stroke="#000"    strokeWidth="24" fill="none" opacity="0.10"/>
        <path d="M-30,-20 Q185,420 400,864" stroke="#B8895A" strokeWidth="1.0" fill="none" opacity="0.18"/>
      </svg>

      {/* Watermark DD — очень слабый */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 480,
          right: -80,
          fontFamily: "'Playfair Display', serif",
          fontSize: 260,
          fontWeight: 900,
          color: "rgba(232, 166, 100, 0.025)",
          lineHeight: 0.8,
          letterSpacing: -8,
          pointerEvents: "none",
          zIndex: 0,
          userSelect: "none",
        }}
      >
        DD
      </div>
    </>
  );
}
