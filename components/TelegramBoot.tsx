"use client";

/** ── TelegramBoot ───────────────────────────────
 *  Точка входа + авторизация:
 *   1. Инициализирует TG WebApp SDK
 *   2. Управляет BackButton (нативной)
 *   3. Читает initData → POST в edge tg-auth → получает Supabase session
 *   4. Блокирует UI загрузчиком пока не авторизуется
 *
 *  ?dev=1 в URL — обходит всё, рендерит детей сразу.
 ─────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase-browser";

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

function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("dev") === "1";
  } catch {
    return false;
  }
}

type BootStatus = "idle" | "authing" | "ready" | "error" | "no-telegram" | "dev";

// TG types (минимально)
interface TgWebApp {
  ready?: () => void;
  expand?: () => void;
  initData?: string;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  disableVerticalSwipes?: () => void;
  requestFullscreen?: () => void;
  BackButton?: {
    show?: () => void;
    hide?: () => void;
    onClick?: (cb: () => void) => void;
    offClick?: (cb: () => void) => void;
  };
}

function getTG(): TgWebApp | undefined {
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
}

export function TelegramBoot({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<BootStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ── Инициализация SDK + Авторизация ─────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (isDevMode()) {
        setStatus("dev");
        return;
      }

      const tg = getTG();
      if (!tg) {
        // За пределами телеги (обычный браузер) — рендерим без auth
        setStatus("no-telegram");
        return;
      }

      // Настройка SDK
      safeCall(() => tg.ready?.());
      safeCall(() => tg.expand?.());
      safeCall(() => tg.setHeaderColor?.("#1A0F0A"));
      safeCall(() => tg.setBackgroundColor?.("#1A0F0A"));
      safeCall(() => tg.disableVerticalSwipes?.());
      safeCall(() => tg.requestFullscreen?.());

      const initData = tg.initData;
      if (!initData) {
        // Открыто не через ссылку бота
        setStatus("no-telegram");
        return;
      }

      setStatus("authing");

      // POST в edge tg-auth
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !anonKey) throw new Error("supabase env missing");

        const res = await fetch(`${url}/functions/v1/tg-auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
          },
          body: JSON.stringify({ initData }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => `${res.status}`);
          throw new Error(`auth ${res.status}: ${errText.slice(0, 200)}`);
        }

        const data = await res.json();
        if (!data?.session?.access_token) throw new Error("no session in response");

        // Устанавливаем Supabase-сессию
        const sb = getSupabase();
        const { error } = await sb.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (error) throw new Error(`setSession: ${error.message}`);

        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("[TelegramBoot] auth failed:", err);
        if (!cancelled) {
          setErrorMsg(String(err instanceof Error ? err.message : err));
          setStatus("error");
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ── BackButton синхронизация ───────────────
  useEffect(() => {
    if (isDevMode()) return;
    const tg = getTG();
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

  // ── UI ─────────────────────────────────────
  if (status === "authing" || status === "idle") {
    return <BootScreen label="Открываем..." />;
  }
  if (status === "error") {
    return <BootScreen label="Не удалось войти" hint={errorMsg} error />;
  }

  // no-telegram / ready / dev — рендерим детей
  return <>{children}</>;
}

function BootScreen({ label, hint, error }: { label: string; hint?: string; error?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        background: "radial-gradient(ellipse at center top, #2C1810 0%, #1A0F0A 60%, #0F0805 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 32,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          color: "#F5E6D3",
        }}
      >
        DARK <span style={{ color: "#E8A664" }}>DEED</span>
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 15,
          color: error ? "#dc8290" : "#A69080",
        }}
      >
        {label}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: "#6B5A4C", maxWidth: 320, wordBreak: "break-word" }}>
          {hint}
        </div>
      )}
    </div>
  );
}
