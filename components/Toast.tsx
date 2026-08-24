"use client";

/** ── Simple toast ───────────────────────────────
 *  Мини-контекст-провайдер + хук useToast().
 *  Показывает уведомления снизу экрана.
 ─────────────────────────────────────────────── */

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "info" | "success" | "error";
interface ToastItem { id: number; text: string; kind: ToastKind }

interface Ctx {
  show: (text: string, kind?: ToastKind) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((text: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)",
          transform: "translateX(-50%)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {items.map((t) => {
          const bg =
            t.kind === "success" ? "linear-gradient(135deg, #E8A664, #D4AF37)" :
            t.kind === "error"   ? "linear-gradient(135deg, #dc8290, #a63244)" :
                                    "rgba(20, 10, 5, 0.92)";
          const color = t.kind === "info" ? "#F5E6D3" : "#1A0F0A";
          return (
            <div
              key={t.id}
              style={{
                background: bg,
                color,
                padding: "12px 20px",
                borderRadius: 999,
                fontFamily: "'Manrope', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                maxWidth: "80vw",
                textAlign: "center",
                animation: "toastIn 220ms ease-out",
              }}
            >
              {t.text}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

export function useToast(): Ctx {
  const c = useContext(ToastCtx);
  if (!c) {
    // Fallback вне провайдера
    return { show: (t) => console.log("[toast]", t) };
  }
  return c;
}
