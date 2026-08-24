"use client";

/** ── TelegramProvider ──────────────────────────
 *  1. Тихо инициализирует Telegram WebApp SDK (не крашится если API нет)
 *  2. Синхронизирует нативную BackButton с текущим роутом
 *  3. При `?dev=1` в URL — полный bypass (для теста в браузере)
 *
 *  ВАЖНО: никогда не блокирует рендер детей — SDK-звонки в try/catch
 *  и в отложенных effect'ах.
 ─────────────────────────────────────────────── */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Читаем ?dev=1 через window — useSearchParams в root layout ломает prerender */
function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("dev") === "1";
  } catch {
    return false;
  }
}

/** Куда возвращает нативная TG BackButton на каждом экране */
const BACK_ROUTES: Record<string, string> = {
  "/main":         "/",
  "/cart":         "/main",
  "/checkout":     "/cart",
  "/order-status": "/main",
};

function safeCall<T>(fn: () => T): T | undefined {
  try { return fn(); } catch { return undefined; }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // ── SDK инициализация (один раз) ───────────
  useEffect(() => {
    if (isDevMode()) return;

    const tg = (window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp as
      | undefined
      | {
          ready?: () => void;
          expand?: () => void;
          setHeaderColor?: (c: string) => void;
          setBackgroundColor?: (c: string) => void;
          disableVerticalSwipes?: () => void;
          requestFullscreen?: () => void;
        };

    if (!tg) return; // не в telegram — тихо выходим

    safeCall(() => tg.ready?.());
    safeCall(() => tg.expand?.());
    safeCall(() => tg.setHeaderColor?.("#1A0F0A"));
    safeCall(() => tg.setBackgroundColor?.("#1A0F0A"));
    safeCall(() => tg.disableVerticalSwipes?.());
    safeCall(() => tg.requestFullscreen?.());
  }, []);

  // ── BackButton синхронизация ───────────────
  useEffect(() => {
    if (isDevMode()) return;

    const tg = (window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp as
      | undefined
      | {
          BackButton?: {
            show?: () => void;
            hide?: () => void;
            onClick?: (cb: () => void) => void;
            offClick?: (cb: () => void) => void;
          };
        };

    const backBtn = tg?.BackButton;
    if (!backBtn) return;

    const target = pathname ? BACK_ROUTES[pathname] : undefined;
    const goBack = () => { if (target) router.push(target); };

    if (target && pathname !== "/") {
      safeCall(() => backBtn.show?.());
      safeCall(() => backBtn.onClick?.(goBack));
      return () => {
        safeCall(() => backBtn.offClick?.(goBack));
        safeCall(() => backBtn.hide?.());
      };
    }

    safeCall(() => backBtn.hide?.());
  }, [pathname, router]);

  return <>{children}</>;
}
