"use client";

/** ── QueryProvider ─────────────────────────────
 *  TanStack Query — кэш серверных данных.
 *  Единый инстанс на всё приложение.
 ─────────────────────────────────────────────── */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,           // 30 сек — не спамим API
            gcTime: 5 * 60_000,          // 5 мин в памяти
            refetchOnWindowFocus: false, // TG WebView теряет фокус часто
            retry: 1,
          },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
