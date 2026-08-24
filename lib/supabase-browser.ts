/** ── Supabase browser client (singleton) ──────
 *  Клиент для использования на клиенте (browser).
 *  Использует publishable key (безопасно попадает в бандл).
 *  Единственный инстанс — иначе TG WebView может создавать
 *  несколько параллельных соединений и терять сессию.
 ─────────────────────────────────────────────── */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** .trim() + strip кавычек — защита от «мусора» из env
 *  (PowerShell pipe в vercel env иногда добавляет кавычки/BOM/CR,
 *   а Headers/URLs роняют всё приложение при не-ASCII символе). */
const clean = (v?: string) => (v ?? "").trim().replace(/^["']|["']$/g, "");
const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_KEY = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // На билде — предупреждение, но не падаем: клиент может использоваться позже.
  // В runtime без ключей операции с БД просто вернут ошибки.
  if (typeof window !== "undefined") {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY не заданы. " +
      "Проверь .env.local и Vercel Environment Variables."
    );
  }
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL ?? "https://placeholder.supabase.co", SUPABASE_KEY ?? "placeholder-key", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // storageKey уникальный, чтобы не конфликтовать с другими Supabase-приложениями
      storageKey: "dark-deed:sb-auth",
    },
  });
  return _client;
}

/** Ре-экспорт для удобства: `import { supabase } from '@/lib/supabase-browser'` */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});
