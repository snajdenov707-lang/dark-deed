import type { NextConfig } from "next";

/**
 * Next.js config for Dark Deed Telegram Mini App.
 *
 * IMPORTANT:
 * - `Cache-Control: no-store` на всём сайте — Telegram WebView агрессивно
 *   кэширует, и старые версии живут в сессии пока юзер не пересоздаст чат.
 *   С no-store каждый рефреш подтягивает свежий деплой.
 * - `X-Frame-Options: SAMEORIGIN` УБИРАЕМ — Telegram открывает нас в iframe.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // TG сам открывает нас во фрейме — не блокируем
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
    ];
  },
};

export default nextConfig;
