/** ── Haptic feedback wrapper ────────────────
 *  Безопасные вызовы виброотклика TG WebApp.
 *  Тихо игнорирует всё вне Telegram.
 ─────────────────────────────────────────── */

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "error" | "success" | "warning";

function getWebApp() {
  if (typeof window === "undefined") return null;
  return (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: {
    impactOccurred: (s: ImpactStyle) => void;
    notificationOccurred: (t: NotificationType) => void;
    selectionChanged: () => void;
  } } } }).Telegram?.WebApp?.HapticFeedback ?? null;
}

/** Лёгкий отклик — на выбор опций, тапы кнопок */
export function tap(style: ImpactStyle = "light") {
  try { getWebApp()?.impactOccurred(style); } catch {}
}

/** Успех / ошибка / предупреждение */
export function notify(type: NotificationType) {
  try { getWebApp()?.notificationOccurred(type); } catch {}
}

/** Смена выбора (переключение табов) */
export function selectionChanged() {
  try { getWebApp()?.selectionChanged(); } catch {}
}
